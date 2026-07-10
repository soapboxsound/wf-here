const IGNORED_PLACE_TYPES = new Set(["point_of_interest", "establishment"]);

export function generateSessionToken() {
  return crypto.randomUUID();
}

export async function autocomplete(input, sessionToken) {
  const params = new URLSearchParams({
    action: "autocomplete",
    input,
    sessionToken
  });
  const response = await fetch(`/api/places?${params}`);
  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return [];
  }

  return data.predictions || [];
}

export async function getPlaceDetails(placeId, sessionToken) {
  const params = new URLSearchParams({
    action: "details",
    placeId,
    sessionToken
  });
  const response = await fetch(`/api/places?${params}`);
  const data = await response.json();

  if (data.status !== "OK" || !data.result) {
    throw new Error(data.error_message || "Unable to load place details");
  }

  const result = data.result;
  const placeType =
    (result.types || []).find((type) => !IGNORED_PLACE_TYPES.has(type)) || "other";
  const photos = result.photos || [];
  const photoReferences = photos.slice(0, 5).map((photo) => photo.photo_reference);
  const photoAttribution = stripPhotoAttribution(photos[0]?.html_attributions?.[0] || "");

  return {
    placeId,
    name: result.name || "",
    address: result.formatted_address || "",
    lat: result.geometry?.location?.lat ?? 0,
    lng: result.geometry?.location?.lng ?? 0,
    hours: result.opening_hours?.weekday_text?.join("\n") || null,
    isOpenNow: result.opening_hours?.open_now ?? null,
    photoReference: photoReferences[0] || null,
    photoReferences,
    photoAttribution,
    placeType,
    phone: result.formatted_phone_number || null,
    website: result.website || null
  };
}

function stripPhotoAttribution(html = "") {
  return html.replace(/<[^>]+>/g, "").trim();
}

export function getListingGooglePhotoRefs(listing = {}) {
  if (Array.isArray(listing.googlePhotoRefs) && listing.googlePhotoRefs.length) {
    return listing.googlePhotoRefs;
  }

  if (listing.googlePhotoRef) {
    return [listing.googlePhotoRef];
  }

  return [];
}

export function getListingPhotoUrls(listing = {}) {
  if (Array.isArray(listing.photos) && listing.photos.length) {
    return listing.photos;
  }

  return getListingGooglePhotoRefs(listing).map(getPhotoUrl);
}

export function getListingPhotoAttribution(listing = {}) {
  if (Array.isArray(listing.photos) && listing.photos.length) {
    return "";
  }

  return listing.googlePhotoAttribution || "";
}

export function usesGooglePhotos(listing = {}) {
  return !listing.photos?.length && getListingGooglePhotoRefs(listing).length > 0;
}

export function getPhotoUrl(photoReference) {
  const params = new URLSearchParams({
    action: "photo",
    photoReference
  });
  return `/api/places?${params}`;
}

export function debounce(fn, delay = 300) {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}
