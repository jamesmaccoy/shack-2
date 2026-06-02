const admin = require("firebase-admin");

let app;

function getFirestore() {
  if (!app) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON is not set. Download a new key from Firebase Console → Project settings → Service accounts."
      );
    }
    let credentials;
    const trimmed = raw.trim();
    try {
      credentials = JSON.parse(trimmed);
    } catch {
      if (trimmed.startsWith("[")) {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT_JSON must be a JSON object starting with {, not an array [. Paste the downloaded service account file as one line."
        );
      }
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON (single-line object from Firebase Console)."
      );
    }
    if (credentials.project_id && credentials.project_id !== "shack-30405") {
      console.warn(
        `Firebase project_id is "${credentials.project_id}"; frontend uses shack-30405.`
      );
    }
    app = admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  }
  return admin.firestore();
}

async function getPackage(type) {
  const doc = await getFirestore().collection("packages").doc(type).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data();
}

module.exports = { getPackage };
