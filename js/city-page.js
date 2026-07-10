import { getListings } from "/js/db.js";
import { getListingPhotoUrls } from "/js/places.js";

function slugifyNeighborhood(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatType(type = "") {
  return type.replace(/-/g, " ");
}

function formatWifiQuality(listing) {
  if (listing.wifiSpeed === "fast" || listing.wifiSpeed === "blazing") {
    return { label: "great wifi", color: "var(--color-wifi-great)" };
  }

  if (listing.wifiSpeed === "poor" || listing.wifiSpeed === "slow") {
    return { label: "poor wifi", color: "var(--color-wifi-poor)" };
  }

  return { label: "decent wifi", color: "var(--color-wifi-decent)" };
}

function deriveAttributes(listing) {
  const attributes = [];

  if (listing.wifiSpeed === "fast" || listing.wifiSpeed === "blazing") {
    attributes.push("fast wifi");
  }

  if (listing.outlets === "plenty") {
    attributes.push("outlets");
  }

  if (listing.noiseLevel) {
    attributes.push(listing.noiseLevel.replace(/-/g, " "));
  }

  return attributes.slice(0, 3);
}

function sortListings(listings = []) {
  return [...listings].sort((a, b) => {
    if (Boolean(b.featured) !== Boolean(a.featured)) {
      return Number(b.featured) - Number(a.featured);
    }

    return (a.name || "").localeCompare(b.name || "");
  });
}

function countByNeighborhood(listings, neighborhoods) {
  const counts = Object.fromEntries(neighborhoods.map((n) => [n.slug, 0]));

  listings.forEach((listing) => {
    const slug = slugifyNeighborhood(listing.neighborhood || "");
    if (Object.prototype.hasOwnProperty.call(counts, slug)) {
      counts[slug] += 1;
    }
  });

  return counts;
}

function renderNeighborhoodCards(container, neighborhoods, counts, explorePath) {
  container.innerHTML = neighborhoods
    .map((neighborhood) => {
      const count = counts[neighborhood.slug] || 0;
      const countLabel = `${count} spot${count === 1 ? "" : "s"}`;

      return `
        <a class="neighborhood-card" href="${explorePath}?neighborhood=${neighborhood.slug}">
          <span class="neighborhood-card-name">${neighborhood.name}</span>
          <span class="neighborhood-card-desc">${neighborhood.description}</span>
          <span class="neighborhood-card-count">${countLabel}</span>
        </a>
      `;
    })
    .join("");
}

function renderHorizontalCard(listing) {
  const wifi = formatWifiQuality(listing);
  const attributes = deriveAttributes(listing)
    .map((attribute) => `<span class="chip">${attribute}</span>`)
    .join("");
  const photoUrls = getListingPhotoUrls(listing);
  const photoStyle = photoUrls[0]
    ? `style="background-image: url('${photoUrls[0]}'); background-size: cover; background-position: center;"`
    : "";

  return `
    <a class="city-spot-card" href="/place?slug=${encodeURIComponent(listing.slug)}">
      <div class="city-spot-card-image" ${photoStyle}></div>
      <div class="city-spot-card-body">
        <div>
          <p class="city-spot-card-name">${listing.name}</p>
          <p class="city-spot-card-meta">${formatType(listing.type)} · ${listing.neighborhood}</p>
        </div>
        <div class="city-spot-card-chips">${attributes}</div>
        <div class="spot-wifi" style="color: ${wifi.color};">
          <span class="spot-wifi-dot"></span>
          <span>${wifi.label}</span>
        </div>
        <span class="city-spot-card-link">View spot →</span>
      </div>
    </a>
  `;
}

export async function initCityPage(config) {
  const featuredList = document.getElementById("cityFeaturedList");
  const neighborhoodGrid = document.getElementById("neighborhoodGrid");

  try {
    const listings = await getListings(config.citySlug);
    const counts = countByNeighborhood(listings, config.neighborhoods);
    renderNeighborhoodCards(neighborhoodGrid, config.neighborhoods, counts, config.explorePath);

    if (!listings.length) {
      featuredList.innerHTML = `
        <div class="city-listings-empty">
          <p>${config.emptyListingsMessage}</p>
          <a href="/submit">${config.emptyListingsCta}</a>
        </div>
      `;
      return;
    }

    const topPicks = sortListings(listings).slice(0, 3);
    featuredList.innerHTML = topPicks.map(renderHorizontalCard).join("");
  } catch (error) {
    console.error(`Failed to load ${config.citySlug} listings`, error);
    featuredList.innerHTML = `<p class="city-listings-empty">Unable to load spots right now.</p>`;
  }
}
