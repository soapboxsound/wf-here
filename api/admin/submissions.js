const { requireAdmin, parseJsonBody } = require("../_lib/admin-auth");
const { getFirestore, serializeDoc } = require("../_lib/firebase-admin");

async function listSubmissions(req, res) {
  const status = String(req.query.status || "pending");
  const db = getFirestore();
  const snapshot = await db.collection("submissions").where("status", "==", status).get();

  const submissions = snapshot.docs
    .map(serializeDoc)
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));

  return res.status(200).json({ submissions });
}

async function approveSubmission(body, res) {
  const id = String(body.id || "").trim();
  const listing = body.listing;

  if (!id || !listing || typeof listing !== "object") {
    return res.status(400).json({ error: "Provide id and listing" });
  }

  const slug = String(listing.slug || "").trim();
  if (!slug) {
    return res.status(400).json({ error: "Listing slug is required" });
  }

  const db = getFirestore();
  const submissionRef = db.collection("submissions").doc(id);
  const submissionSnap = await submissionRef.get();

  if (!submissionSnap.exists) {
    return res.status(404).json({ error: "Submission not found" });
  }

  const payload = { ...listing };
  delete payload.id;

  const listingRef = db.collection("listings").doc(slug);
  await listingRef.set(payload, { merge: true });
  await submissionRef.update({
    status: "approved",
    slug
  });

  return res.status(200).json({
    ok: true,
    listing: serializeDoc(await listingRef.get()),
    submission: serializeDoc(await submissionRef.get())
  });
}

async function rejectSubmission(body, res) {
  const id = String(body.id || "").trim();
  if (!id) {
    return res.status(400).json({ error: "Provide id" });
  }

  const db = getFirestore();
  const submissionRef = db.collection("submissions").doc(id);
  const submissionSnap = await submissionRef.get();

  if (!submissionSnap.exists) {
    return res.status(404).json({ error: "Submission not found" });
  }

  await submissionRef.update({ status: "rejected" });
  return res.status(200).json({
    ok: true,
    submission: serializeDoc(await submissionRef.get())
  });
}

module.exports = async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) {
      return;
    }

    if (req.method === "GET") {
      return await listSubmissions(req, res);
    }

    if (req.method === "POST") {
      const body = parseJsonBody(req);
      const action = String(body.action || "").toLowerCase();

      if (action === "approve") {
        return await approveSubmission(body, res);
      }

      if (action === "reject") {
        return await rejectSubmission(body, res);
      }

      return res.status(400).json({ error: "action must be approve or reject" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("admin/submissions failed", error);
    return res.status(500).json({ error: error.message || "Admin submissions failed" });
  }
};
