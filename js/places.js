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

  return {
    placeId,
    name: result.name || "",
    address: result.formatted_address || "",
    lat: result.geometry?.location?.lat ?? 0,
    lng: result.geometry?.location?.lng ?? 0,
    hours: result.opening_hours?.weekday_text?.join("\n") || null,
    isOpenNow: result.opening_hours?.open_now ?? null,
    photoReference: result.photos?.[0]?.photo_reference || null,
    placeType,
    phone: result.formatted_phone_number || null,
    website: result.website || null
  };
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
