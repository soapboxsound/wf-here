const crypto = require("crypto");

function timingSafeEqualString(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
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

function requireAdmin(req, res) {
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected) {
    res.status(500).json({
      error: "ADMIN_PASSWORD is not configured on the server"
    });
    return false;
  }

  const provided = getProvidedPassword(req);

  if (!provided || !timingSafeEqualString(provided, expected)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
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

module.exports = {
  requireAdmin,
  parseJsonBody,
  getProvidedPassword,
  timingSafeEqualString
};
