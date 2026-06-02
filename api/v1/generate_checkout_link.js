const { getPackage } = require("../_lib/firebase");
const { parsePriceToCents, createCheckout } = require("../_lib/yoco");

const PACKAGE_LABELS = {
  shack_stack: "Three nights - The Shack",
  book_an_entire_week: "A week at The Shack",
  long_weekend_at_the_Cottage: "Three nights - The Cottage",
  entire_week_at_the_cottage: "Seven nights - The Cottage",
  book_an_4hr_shoot: "4 hour shoot",
  camping_long_weekend: "Camping long weekend",
  outSeason: "Month by month",
  reception: "Host a reception",
  "24h_window": "24 hour window",
  ReserveOpportunity: "Reserve an opportunity",
};

function getType(req) {
  const body = req.body || {};
  return body.type || req.query?.type || null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ status: false, data: "Method not allowed" });
  }

  const type = getType(req);
  if (!type || typeof type !== "string") {
    return res.status(400).json({
      status: false,
      data: "Error Occured : Type required",
    });
  }

  try {
    const pkg = await getPackage(type);
    if (!pkg) {
      return res.status(404).json({
        status: false,
        data: `No package found for type: ${type}`,
      });
    }

    const amountInCents = parsePriceToCents(pkg);
    const description =
      pkg.description || pkg.name || pkg.title || PACKAGE_LABELS[type] || type;

    const redirectUrl = await createCheckout({
      amountInCents,
      description,
      metadata: { packageType: type },
    });

    return res.status(200).json({ status: true, data: { redirectUrl } });
  } catch (err) {
    console.error("generate_checkout_link:", err);
    return res
      .status(500)
      .json({ status: false, data: err.message || "Checkout could not be created" });
  }
};

