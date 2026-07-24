const {
  fetchApprovedListings,
  buildSitemapXml
} = require("../scripts/seo-lib.js");

module.exports = async (req, res) => {
  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId) {
      return res.status(500).send("Firebase project not configured");
    }

    const listings = await fetchApprovedListings(projectId);
    const xml = buildSitemapXml(listings);

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).send(xml);
  } catch (error) {
    console.error("sitemap api failed", error);
    return res.status(500).send("Could not generate sitemap");
  }
};
