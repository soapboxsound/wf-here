const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const { action, input, placeId, sessionToken, photoReference } = req.query;
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
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
    const fields = "place_id,business_status,name";
    const bias =
      lat && lng
        ? `&locationbias=circle:500@${encodeURIComponent(lat)},${encodeURIComponent(lng)}`
        : "";
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(input)}&inputtype=textquery&fields=${fields}&key=${API_KEY}${bias}`;
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
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
