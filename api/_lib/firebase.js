const admin = require("firebase-admin");

let app;

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
  }
  return admin.firestore();
}

async function getPackage(type) {
  const doc = await getFirestore().collection("packages").doc(type).get();
  if (!doc.exists) return null;
  return doc.data();
}

module.exports = { getPackage };

