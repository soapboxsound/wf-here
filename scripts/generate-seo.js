const fs = require("fs");
const path = require("path");

const {
  SITE_URL,
  CITY_LABELS,
  fetchApprovedListings,
  escapeHtml,
  escapeAttr,
  formatType,
  placeUrl,
  listingDescription,
  buildLocalBusinessJsonLd,
  buildSitemapXml
} = require("./seo-lib.js");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const env = {};

  fs.readFileSync(filePath, "utf8").split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex);
    let value = trimmed.slice(separatorIndex + 1);

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  });

  return env;
}

const rootDir = path.join(__dirname, "..");
const fileEnv = {
  ...loadEnvFile(path.join(rootDir, ".env")),
  ...loadEnvFile(path.join(rootDir, ".env.local"))
};

function getEnv(key) {
  return process.env[key] || fileEnv[key] || "";
}

function injectHead(html, listing) {
  const title = `${listing.name} · wf—here`;
  const description = listingDescription(listing);
  const canonical = placeUrl(listing.slug);
  const city = CITY_LABELS[listing.city] || listing.city || "";
  const ogImage = `${SITE_URL}/assets/favicon.png`;
  const jsonLd = JSON.stringify(buildLocalBusinessJsonLd(listing));

  const metaBlock = `
  <meta name="description" content="${escapeAttr(description)}">
  <link rel="canonical" id="placeCanonical" href="${escapeAttr(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:url" content="${escapeAttr(canonical)}">
  <meta property="og:image" content="${escapeAttr(ogImage)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeAttr(title)}">
  <meta name="twitter:description" content="${escapeAttr(description)}">
  <script type="application/ld+json">${jsonLd}</script>`;

  let next = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  next = next.replace(/<meta name="description"[^>]*>\s*/gi, "");
  next = next.replace(/<link rel="canonical"[^>]*>\s*/gi, "");
  next = next.replace(/<meta property="og:[^"]+"[^>]*>\s*/gi, "");
  next = next.replace(/<meta name="twitter:[^"]+"[^>]*>\s*/gi, "");
  next = next.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, "");

  next = next.replace(/<\/title>/i, `</title>${metaBlock}`);

  // Soft signal for crawlers/debugging
  next = next.replace(
    /<html([^>]*)>/i,
    `<html$1 data-place-slug="${escapeAttr(listing.slug)}" data-place-city="${escapeAttr(listing.city || "")}">`
  );

  return { html: next, city };
}

function fillPlaceContent(html, listing) {
  const cityLabel = CITY_LABELS[listing.city] || listing.city || "New York";
  const typeLabel = formatType(listing.type || "workspace");
  const locationLine = `${typeLabel.toLowerCase()} · ${listing.neighborhood || "—"}, ${cityLabel}`;

  let next = html;
  next = next.replace(
    /(<p class="spot-location-line"[^>]*>)[\s\S]*?(<\/p>)/i,
    `$1${escapeHtml(locationLine)}$2`
  );
  next = next.replace(
    /(<h1 class="place-title"[^>]*>)[\s\S]*?(<\/h1>)/i,
    `$1${escapeHtml(listing.name)}$2`
  );
  next = next.replace(
    /(<span class="action-detail-value" id="sidebarAddress">)[\s\S]*?(<\/span>)/i,
    `$1${escapeHtml(listing.address || "—")}$2`
  );
  next = next.replace(
    /(<span class="action-detail-value" id="sidebarNeighborhood">)[\s\S]*?(<\/span>)/i,
    `$1${escapeHtml(listing.neighborhood || "—")}$2`
  );
  next = next.replace(
    /(<span class="action-detail-value" id="sidebarType">)[\s\S]*?(<\/span>)/i,
    `$1${escapeHtml(typeLabel)}$2`
  );
  next = next.replace(
    /(<p class="attr-value"[^>]*id="detailHours">)[\s\S]*?(<\/p>)/i,
    `$1${escapeHtml(listing.hours || "—")}$2`
  );

  // Prefer path-based slug resolution by baking a hint the client already supports via pathname.
  return next;
}

async function main() {
  const projectId = getEnv("VITE_FIREBASE_PROJECT_ID");
  const publicDir = path.join(rootDir, "public");

  if (!fs.existsSync(publicDir)) {
    throw new Error("public/ missing — generate-seo runs after the static copy step");
  }

  const targetRoot = publicDir;
  const templatePath = path.join(targetRoot, "place", "index.html");

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Place template not found at ${templatePath}`);
  }

  console.log(`Fetching approved listings from Firestore (${projectId})...`);
  const listings = await fetchApprovedListings(projectId);
  console.log(`Found ${listings.length} approved listings`);

  const sitemap = buildSitemapXml(listings);
  const sitemapTargets = [
    path.join(rootDir, "sitemap.xml"),
    path.join(targetRoot, "sitemap.xml")
  ];

  [...new Set(sitemapTargets)].forEach((filePath) => {
    fs.writeFileSync(filePath, sitemap);
    console.log(`Wrote ${filePath}`);
  });

  const template = fs.readFileSync(templatePath, "utf8");
  let written = 0;

  listings.forEach((listing) => {
    const slug = String(listing.slug).trim();
    if (!slug || slug.includes("/") || slug.includes("..")) {
      return;
    }

    const { html: withHead } = injectHead(template, listing);
    const pageHtml = fillPlaceContent(withHead, listing);
    const outDir = path.join(targetRoot, "place", slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), pageHtml);
    written += 1;
  });

  console.log(`Prerendered ${written} place pages into ${path.join(targetRoot, "place")}`);
}

main().catch((error) => {
  console.error("SEO generation failed:", error.message || error);
  process.exitCode = 1;
});
