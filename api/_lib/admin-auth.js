const crypto = require("crypto");
const { getAdminApp } = require("./firebase-admin");

function timingSafeEqualString(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

function getAdminEmails() {
  const fromList = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const single = String(process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();

  if (single && !fromList.includes(single)) {
    fromList.push(single);
  }

  return fromList;
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || "";
  const value = Array.isArray(header) ? header[0] : header;

  if (!value || typeof value !== "string") {
    return "";
  }

  if (value.toLowerCase().startsWith("bearer ")) {
    return value.slice(7).trim();
  }

  return "";
}

function getProvidedPassword(req) {
  const header = req.headers["x-admin-password"];
  if (header) {
    return Array.isArray(header) ? header[0] : header;
  }

  if (req.body && typeof req.body === "object" && req.body.password) {
    return String(req.body.password);
  }

  return "";
}

function parseJsonBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  return req.body;
}

async function requireAdmin(req, res) {
  const emails = getAdminEmails();
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const providedPassword = getProvidedPassword(req);

  // Optional emergency fallback while migrating to Google login.
  if (
    expectedPassword &&
    providedPassword &&
    timingSafeEqualString(providedPassword, expectedPassword)
  ) {
    req.adminAuth = { method: "password" };
    return true;
  }

  if (!emails.length) {
    res.status(500).json({
      error: "ADMIN_EMAIL or ADMIN_EMAILS is not configured on the server"
    });
    return false;
  }

  const token = getBearerToken(req) || (req.body && req.body.idToken) || "";

  if (!token) {
    res.status(401).json({ error: "Sign in with Google to access admin" });
    return false;
  }

  try {
    const decoded = await getAdminApp().auth().verifyIdToken(token);
    const email = String(decoded.email || "").toLowerCase();

    if (!email || !emails.includes(email)) {
      res.status(403).json({
        error: "This Google account is not authorized for admin access"
      });
      return false;
    }

    req.adminAuth = {
      method: "google",
      email,
      uid: decoded.uid
    };
    return true;
  } catch (error) {
    console.error("Admin token verification failed", error?.message || error);
    res.status(401).json({ error: "Invalid or expired sign-in. Try again." });
    return false;
  }
}

module.exports = {
  requireAdmin,
  parseJsonBody,
  getProvidedPassword,
  getAdminEmails,
  getBearerToken,
  timingSafeEqualString
};
