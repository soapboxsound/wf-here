const { requireAdmin, parseJsonBody } = require("../_lib/admin-auth");
const { getFirestore, serializeDoc } = require("../_lib/firebase-admin");

function sortListings(listings) {
  return listings.sort((a, b) => {
    if (Boolean(b.featured) !== Boolean(a.featured)) {
      return Number(b.featured) - Number(a.featured);
    }
    return (a.name || "").localeCompare(b.name || "");
  });
}

async function listListings(res) {
  const db = getFirestore();
  const snapshot = await db.collection("listings").get();
  const listings = sortListings(
    snapshot.docs
      .map(serializeDoc)
      .filter((listing) => listing.status !== "deleted")
  );
  return res.status(200).json({ listings });
}

async function upsertListings(req, res) {
  const body = parseJsonBody(req);
  const items = Array.isArray(body.listings)
    ? body.listings
    : body.listing
      ? [body.listing]
      : [];

  if (!items.length) {
    return res.status(400).json({ error: "Provide listing or listings[]" });
  }

  const db = getFirestore();
  const saved = [];

  for (const listing of items) {
    if (!listing || typeof listing !== "object") {
      continue;
    }

    const slug = String(listing.slug || "").trim();
    if (!slug) {
      return res.status(400).json({ error: "Each listing needs a slug" });
    }

    const payload = { ...listing };
    delete payload.id;

    const ref = db.collection("listings").doc(slug);
    await ref.set(payload, { merge: Boolean(body.merge) });
    const snap = await ref.get();
    saved.push(serializeDoc(snap));
  }

  return res.status(200).json({ listings: saved, count: saved.length });
}

async function updateListing(req, res) {
  const body = parseJsonBody(req);
  const id = String(body.id || req.query.id || "").trim();
  const updates = body.updates && typeof body.updates === "object" ? body.updates : null;

  if (!id || !updates) {
    return res.status(400).json({ error: "Provide id and updates" });
  }

  const clean = { ...updates };
  delete clean.id;

  const db = getFirestore();
  const ref = db.collection("listings").doc(id);
  const existing = await ref.get();

  if (!existing.exists) {
    return res.status(404).json({ error: "Listing not found" });
  }

  await ref.update(clean);
  const snap = await ref.get();
  return res.status(200).json({ listing: serializeDoc(snap) });
}

async function deleteListing(req, res) {
  const id = String(req.query.id || parseJsonBody(req).id || "").trim();
  if (!id) {
    return res.status(400).json({ error: "Provide id" });
  }

  const db = getFirestore();
  const ref = db.collection("listings").doc(id);
  const existing = await ref.get();

  if (!existing.exists) {
    return res.status(404).json({ error: "Listing not found" });
  }

  try {
    await ref.delete();
    return res.status(200).json({ ok: true, method: "hard", id });
  } catch (error) {
    await ref.update({
      status: "deleted",
      deletedAt: new Date().toISOString()
    });
    return res.status(200).json({ ok: true, method: "soft", id });
  }
}

module.exports = async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) {
      return;
    }

    if (req.method === "GET") {
      return await listListings(res);
    }

    if (req.method === "POST") {
      return await upsertListings(req, res);
    }

    if (req.method === "PATCH") {
      return await updateListing(req, res);
    }

    if (req.method === "DELETE") {
      return await deleteListing(req, res);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("admin/listings failed", error);
    return res.status(500).json({ error: error.message || "Admin listings failed" });
  }
};
