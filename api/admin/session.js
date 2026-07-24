const { parseJsonBody, timingSafeEqualString, getProvidedPassword } = require("../_lib/admin-auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) {
    return res.status(500).json({ error: "ADMIN_PASSWORD is not configured on the server" });
  }

  let body = {};
  try {
    body = parseJsonBody(req);
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const provided = body.password || getProvidedPassword(req);
  if (!provided || !timingSafeEqualString(provided, expected)) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  // Confirm Admin SDK credentials are present before sending the user into admin UI.
  if (!process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return res.status(500).json({
      error:
        "FIREBASE_SERVICE_ACCOUNT is not configured. Add the Firebase service account JSON to Vercel env."
    });
  }

  return res.status(200).json({ ok: true });
};
