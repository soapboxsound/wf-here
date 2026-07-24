const fetch = require("node-fetch");

const SITE_URL = process.env.SITE_URL || "https://wf-here.com";

const CITY_LABELS = {
  "new-york": "New York",
  "los-angeles": "Los Angeles"
};

function decodeFirestoreValue(value) {
  if (value == null || typeof value !== "object") {
    return null;
  }

  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("geoPointValue" in value) {
    return {
      lat: value.geoPointValue.latitude,
      lng: value.geoPointValue.longitude
    };
  }

  if ("arrayValue" in value) {
    const values = value.arrayValue.values || [];
    return values.map(decodeFirestoreValue);
  }

  if ("mapValue" in value) {
    const fields = value.mapValue.fields || {};
    return Object.fromEntries(
      Object.entries(fields).map(([key, nested]) => [key, decodeFirestoreValue(nested)])
    );
  }

  return null;
}

function firestoreDocToListing(doc) {
  if (!doc?.fields) {
    return null;
  }

  const listing = Object.fromEntries(
    Object.entries(doc.fields).map(([key, value]) => [key, decodeFirestoreValue(value)])
  );

  const id = String(doc.name || "").split("/").pop();
  return { id, ...listing };
}

async function fetchApprovedListings(projectId) {
  if (!projectId) {
    throw new Error("Missing Firebase project id");
  }

  const listings = [];
  const pageSize = 300;
  let offset = 0;

  for (;;) {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
        projectId
      )}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "listings" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "status" },
                op: "EQUAL",
                value: { stringValue: "approved" }
              }
            },
            limit: pageSize,
            offset
          }
        })
      }
    );

    const rows = await response.json();

    if (!response.ok) {
      throw new Error(rows.error?.message || `Firestore query failed (${response.status})`);
    }

    let batchCount = 0;

    (Array.isArray(rows) ? rows : []).forEach((row) => {
      if (!row.document) {
        return;
      }

      const listing = firestoreDocToListing(row.document);
      if (listing && listing.slug && listing.name) {
        listings.push(listing);
        batchCount += 1;
      }
    });

    if (batchCount < pageSize) {
      break;
    }

    offset += pageSize;
  }

  return listings.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value = "") {
  return escapeHtml(value).replace(/\n/g, " ");
}

function formatType(type = "") {
  return type.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function placePath(slug) {
  return `/place/${encodeURIComponent(slug)}`;
}

function placeUrl(slug) {
  return `${SITE_URL}${placePath(slug)}`;
}

function listingDescription(listing) {
  const type = formatType(listing.type || "workspace").toLowerCase();
  const city = CITY_LABELS[listing.city] || listing.city || "the city";
  const neighborhood = listing.neighborhood?.trim();
  const score =
    Number(listing.wfScore) > 0
      ? ` WF Score ${Number(listing.wfScore).toFixed(1)}.`
      : "";

  if (neighborhood) {
    return `${listing.name} — a ${type} in ${neighborhood}, ${city} for remote work.${score} Wifi, power, and vibe details on wf—here.`;
  }

  return `${listing.name} — a ${type} in ${city} for remote work.${score} Wifi, power, and vibe details on wf—here.`;
}

function buildLocalBusinessJsonLd(listing) {
  const city = CITY_LABELS[listing.city] || listing.city || "";
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    url: placeUrl(listing.slug),
    description: listingDescription(listing)
  };

  if (listing.address) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.neighborhood || city,
      addressRegion: listing.city === "los-angeles" ? "CA" : "NY",
      addressCountry: "US"
    };
  }

  if (listing.lat && listing.lng) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: Number(listing.lat),
      longitude: Number(listing.lng)
    };
  }

  if (listing.hours) {
    data.openingHours = String(listing.hours).split(/\n/).map((line) => line.trim()).filter(Boolean);
  }

  if (Number(listing.wfScore) > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(listing.wfScore).toFixed(1),
      bestRating: "10",
      worstRating: "0",
      ratingCount: Math.max(1, Number(listing.reviewCount) || 1)
    };
  }

  return data;
}

function buildSitemapXml(listings) {
  const staticUrls = [
    { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${SITE_URL}/new-york`, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE_URL}/los-angeles`, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE_URL}/explore/new-york`, changefreq: "daily", priority: "0.8" },
    { loc: `${SITE_URL}/explore/los-angeles`, changefreq: "daily", priority: "0.8" },
    { loc: `${SITE_URL}/submit`, changefreq: "monthly", priority: "0.5" },
    { loc: `${SITE_URL}/for-businesses`, changefreq: "monthly", priority: "0.5" }
  ];

  const placeUrls = listings.map((listing) => ({
    loc: placeUrl(listing.slug),
    changefreq: "weekly",
    priority: "0.7"
  }));

  const urls = [...staticUrls, ...placeUrls]
    .map(
      (entry) => `  <url>
    <loc>${escapeHtml(entry.loc)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

module.exports = {
  SITE_URL,
  CITY_LABELS,
  fetchApprovedListings,
  escapeHtml,
  escapeAttr,
  formatType,
  placePath,
  placeUrl,
  listingDescription,
  buildLocalBusinessJsonLd,
  buildSitemapXml
};
