const fetch = require("node-fetch");

const BATCH_LIMIT = 50;
const BATCH_CONCURRENCY = 10;

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

async function findPlaceFromText(name, lat, lng, apiKey) {
  const fields = "place_id,business_status,name";
  const bias =
    lat && lng
      ? `&locationbias=circle:500@${encodeURIComponent(lat)},${encodeURIComponent(lng)}`
      : "";
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name)}&inputtype=textquery&fields=${fields}&key=${apiKey}${bias}`;
  const response = await fetch(url);
  const data = await response.json();
  const candidate = data.candidates?.[0];

  return {
    businessStatus: candidate?.business_status || "UNKNOWN",
    placeId: candidate?.place_id || "",
    matchedName: candidate?.name || ""
  };
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

module.exports = async (req, res) => {
  const { action, input, placeId, sessionToken, photoReference } = req.query;
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  if (action === "findplacebatch") {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST for batch status checks." });
    }

    let places = [];

    try {
      places = parseBatchBody(req);
    } catch (error) {
      return res.status(400).json({ error: "Invalid request body." });
    }

    if (!Array.isArray(places) || !places.length) {
      return res.status(400).json({ error: "Provide an array of places to check." });
    }

    if (places.length > BATCH_LIMIT) {
      return res.status(400).json({ error: `Batch limit is ${BATCH_LIMIT} places per request.` });
    }

    try {
      const results = await mapPool(places, BATCH_CONCURRENCY, (place) =>
        findPlaceFromText(place.name, place.lat, place.lng, API_KEY)
      );

      return res.status(200).json({ results });
    } catch (error) {
      console.error("Batch findplace failed", error);
      return res.status(500).json({ error: "Batch status check failed." });
    }
  }

  if (action === "autocomplete") {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=establishment&key=${API_KEY}&sessiontoken=${sessionToken}`;
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  }

  if (action === "details") {
    const fields = "name,formatted_address,geometry,opening_hours,photos,types,price_level,formatted_phone_number,website,business_status";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}&sessiontoken=${sessionToken}`;
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  }

  if (action === "findplace") {
    const { lat, lng } = req.query;
    const result = await findPlaceFromText(input, lat, lng, API_KEY);
    return res.status(200).json({
      status: "OK",
      candidates: result.placeId
        ? [
            {
              place_id: result.placeId,
              business_status: result.businessStatus,
              name: result.matchedName
            }
          ]
        : []
    });
  }

  if (action === "photo") {
    const maxWidth = 400;
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
    const response = await fetch(photoUrl);
    const buffer = await response.buffer();
    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(buffer);
  }

  return res.status(400).json({ error: "Unknown action" });
};
