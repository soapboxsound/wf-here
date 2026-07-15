const fetch = require("node-fetch");

const KML_NS = "http://www.opengis.net/kml/2.2";

function extractMid(input = "") {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  if (!trimmed.includes("http")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return url.searchParams.get("mid") || "";
  } catch (error) {
    const match = trimmed.match(/mid=([^&]+)/);
    return match ? match[1] : "";
  }
}

function decodeXml(text = "") {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim();
}

function extractTag(block, tag) {
  const cdataMatch = block.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
  if (cdataMatch) {
    return decodeXml(cdataMatch[1]);
  }

  const plainMatch = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return plainMatch ? decodeXml(plainMatch[1]) : "";
}

function parseKml(kml = "") {
  const mapNameMatch = kml.match(/<Document>\s*<name>([^<]+)<\/name>/);
  const mapName = mapNameMatch ? decodeXml(mapNameMatch[1]) : "Imported map";
  const places = [];
  const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
  let match = placemarkRegex.exec(kml);

  while (match) {
    const block = match[1];
    const name = extractTag(block, "name");
    const description = extractTag(block, "description");
    const coordinatesMatch = block.match(/<coordinates>\s*([^<]+)\s*<\/coordinates>/);

    if (name && coordinatesMatch) {
      const [lng, lat] = coordinatesMatch[1].trim().split(",").map(Number);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        places.push({ name, description, lat, lng });
      }
    }

    match = placemarkRegex.exec(kml);
  }

  return { mapName, places };
}

module.exports = async (req, res) => {
  const mid = extractMid(req.query.mid || req.query.url || "");

  if (!mid) {
    return res.status(400).json({ error: "Missing map id. Paste a Google My Maps URL or mid value." });
  }

  try {
    const kmlUrl = `https://www.google.com/maps/d/kml?mid=${encodeURIComponent(mid)}&forcekml=1`;
    const response = await fetch(kmlUrl);

    if (!response.ok) {
      return res.status(502).json({ error: "Could not download the map. Make sure it is public." });
    }

    const kml = await response.text();
    const parsed = parseKml(kml);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("KML import failed", error);
    return res.status(500).json({ error: "Failed to parse map data." });
  }
};
