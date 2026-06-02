const admin = require("firebase-admin");

let app;
let cachedProjectId;

function getFirestore() {
  if (!app) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set.");
    }

    let credentials;
    const trimmed = raw.trim();
    try {
      credentials = JSON.parse(trimmed);
    } catch {
      if (trimmed.startsWith("[")) {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT_JSON must be a JSON object starting with {, not an array [."
        );
      }
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.");
    }

    app = admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    cachedProjectId = credentials.project_id;
  }
  return admin.firestore();
}

function getProjectId() {
  // Ensure initialization happens so we can read cachedProjectId
  getFirestore();
  return cachedProjectId || null;
}

async function getPackage(type) {
  const db = getFirestore();

  // First try the id as-is.
  const doc = await db.collection("packages").doc(type).get();
  if (doc.exists) return doc.data();

  // Then try trimming whitespace (common when IDs were created with a leading space).
  const trimmedType = typeof type === "string" ? type.trim() : type;
  if (trimmedType && trimmedType !== type) {
    const docTrimmed = await db.collection("packages").doc(trimmedType).get();
    if (docTrimmed.exists) return docTrimmed.data();
  }

  return null;
}

module.exports = { getPackage, getProjectId };

