const { requireAdmin, parseJsonBody, getAdminEmails } = require("../_lib/admin-auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    parseJsonBody(req);
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return res.status(500).json({
      error:
        "FIREBASE_SERVICE_ACCOUNT is not configured. Add the Firebase service account JSON to Vercel env."
    });
  }

  if (!getAdminEmails().length && !process.env.ADMIN_PASSWORD) {
    return res.status(500).json({
      error: "Set ADMIN_EMAIL (your Google email) on Vercel to enable admin access"
    });
  }

  if (!(await requireAdmin(req, res))) {
    return;
  }

  return res.status(200).json({
    ok: true,
    method: req.adminAuth?.method || "unknown",
    email: req.adminAuth?.email || null
  });
};
