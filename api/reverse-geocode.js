const fetch = require("node-fetch");

const BATCH_LIMIT = 40;
const BATCH_CONCURRENCY = 8;

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runWorker())
  );

  return results;
}

function parseBatchBody(req) {
  if (!req.body) {
    return [];
  }

  if (Array.isArray(req.body)) {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  if (Array.isArray(req.body.places)) {
    return req.body.places;
  }

  return [];
}

function pickContextName(context = [], typePrefix) {
  const match = context.find((item) => String(item.id || "").startsWith(typePrefix));
  return match?.text || "";
}

async function reverseGeocodeGoogle(lat, lng, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK" || !data.results?.length) {
    return { neighborhood: "", address: "", borough: "" };
  }

  const result = data.results[0];
  const components = result.address_components || [];

  const get = (...types) => {
    const match = components.find((component) =>
      types.some((type) => component.types.includes(type))
    );
    return match?.long_name || "";
  };

  return {
    neighborhood: get("neighborhood", "sublocality", "sublocality_level_1") || get("locality"),
    borough: get("sublocality_level_1", "political"),
    address: result.formatted_address || ""
  };
}

async function reverseGeocodeMapbox(lat, lng, token) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(lng)},${encodeURIComponent(lat)}.json?types=neighborhood,locality,place,address&limit=5&access_token=${token}`;
  const response = await fetch(url);
  const data = await response.json();
  const features = data.features || [];

  const neighborhoodFeature = features.find((feature) =>
    (feature.place_type || []).includes("neighborhood")
  );
  const addressFeature = features.find((feature) =>
    (feature.place_type || []).includes("address")
  );
  const localityFeature = features.find((feature) =>
    (feature.place_type || []).includes("locality")
  );

  const context = neighborhoodFeature?.context || addressFeature?.context || [];

  return {
    neighborhood:
      neighborhoodFeature?.text ||
      pickContextName(context, "neighborhood") ||
      localityFeature?.text ||
      pickContextName(context, "locality") ||
      "",
    borough: pickContextName(context, "locality") || pickContextName(context, "place") || "",
    address: addressFeature?.place_name || neighborhoodFeature?.place_name || ""
  };
}

async function reverseGeocode(lat, lng, { googleKey, mapboxToken }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { neighborhood: "", address: "", borough: "" };
  }

  if (googleKey) {
    try {
      const googleResult = await reverseGeocodeGoogle(lat, lng, googleKey);
      if (googleResult.neighborhood || googleResult.address) {
        return googleResult;
      }
    } catch (error) {
      console.warn("Google reverse geocode failed", error);
    }
  }

  if (mapboxToken) {
    return reverseGeocodeMapbox(lat, lng, mapboxToken);
  }

  return { neighborhood: "", address: "", borough: "" };
}

module.exports = async (req, res) => {
  const googleKey = process.env.GOOGLE_PLACES_API_KEY || "";
  const mapboxToken = process.env.VITE_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || "";

  if (!googleKey && !mapboxToken) {
    return res.status(500).json({ error: "No geocoding API key configured." });
  }

  if (req.method === "POST") {
    let places = [];

    try {
      places = parseBatchBody(req);
    } catch (error) {
      return res.status(400).json({ error: "Invalid request body." });
    }

    if (!Array.isArray(places) || !places.length) {
      return res.status(400).json({ error: "Provide an array of places with lat/lng." });
    }

    if (places.length > BATCH_LIMIT) {
      return res.status(400).json({ error: `Batch limit is ${BATCH_LIMIT} places per request.` });
    }

    try {
      const results = await mapPool(places, BATCH_CONCURRENCY, (place) =>
        reverseGeocode(Number(place.lat), Number(place.lng), { googleKey, mapboxToken })
      );

      return res.status(200).json({ results });
    } catch (error) {
      console.error("Batch reverse geocode failed", error);
      return res.status(500).json({ error: "Batch reverse geocode failed." });
    }
  }

  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: "Provide lat and lng query params." });
  }

  try {
    const result = await reverseGeocode(lat, lng, { googleKey, mapboxToken });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Reverse geocode failed", error);
    return res.status(500).json({ error: "Reverse geocode failed." });
  }
};
