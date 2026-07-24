const admin = require("firebase-admin");

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || "";
  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT must be valid JSON");
  }
}

function getAdminApp() {
  if (admin.apps.length) {
    return admin.app();
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const serviceAccount = parseServiceAccount();

  if (serviceAccount) {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId
    });
  }

  if (!projectId) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT (JSON) or VITE_FIREBASE_PROJECT_ID for Admin SDK"
    );
  }

  // Local / CI fallback when Application Default Credentials are available.
  return admin.initializeApp({ projectId });
}

function getFirestore() {
  return getAdminApp().firestore();
}

function serializeValue(value) {
  if (value == null) {
    return value;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, serializeValue(nested)])
    );
  }

  return value;
}

function serializeDoc(docSnap) {
  return {
    id: docSnap.id,
    ...serializeValue(docSnap.data() || {})
  };
}

module.exports = {
  getAdminApp,
  getFirestore,
  serializeDoc,
  serializeValue
};
