const fetch = require("node-fetch");

const TO = process.env.CONTACT_EMAIL || "jeff@spbx.io";
const FROM = process.env.FROM_EMAIL || "WF-Here <onboarding@resend.dev>";

function readField(value, max) {
  return String(value || "").trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};

  if (readField(body.company, 200)) {
    return res.status(200).json({ ok: true });
  }

  const name = readField(body.name, 80);
  const email = readField(body.email, 120);
  const message = readField(body.message, 2000);

  if (!name || !isEmail(email) || message.length < 2) {
    return res.status(400).json({ error: "Add your name, a valid email, and a message." });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set.");
    return res.status(503).json({ error: "Messages can’t be sent right now. Try again later." });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `wf—here note from ${name.replace(/[\r\n]+/g, " ")}`,
      text: `${message}\n\n— ${name}\n${email}`
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Contact email failed", response.status, detail.slice(0, 300));
    return res.status(502).json({ error: "Couldn’t send that. Try again in a moment." });
  }

  return res.status(200).json({ ok: true });
};
