import { db } from "/js/firebase.js";
// Production note: wifi passwords should eventually live in a separate Firestore
// collection with security rules that only allow reads by authenticated users.
import {
  addDoc,
  collection,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const SCORE_MAP = {
  signal: { great: 10, decent: 6, poor: 2 },
  volume: { quiet: 10, moderate: 6, loud: 2 },
  power: { plenty: 10, some: 6, none: 2 },
  vibe: {
    "laptop friendly": 9,
    "good energy": 8,
    "hidden gem": 9,
    "great coffee": 7,
    "neighborhood spot": 8,
    "open and airy": 8,
    "quiet corners": 9,
    "24hr access": 10,
    "outdoor space": 7,
    "dog friendly": 7
  }
};

export const SIGNAL_OPTIONS = ["great", "decent", "poor"];
export const VOLUME_OPTIONS = ["quiet", "moderate", "loud"];
export const POWER_OPTIONS = ["plenty", "some", "none"];
export const VIBE_OPTIONS = Object.keys(SCORE_MAP.vibe);

function withId(documentSnapshot) {
  return {
    id: documentSnapshot.id,
    ...documentSnapshot.data()
  };
}

function sortByName(listings) {
  return listings.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

function dedupeBySlug(listings) {
  const seen = new Map();

  listings.forEach((listing) => {
    const key = listing.slug || listing.id;
    if (!seen.has(key)) {
      seen.set(key, listing);
    }
  });

  return Array.from(seen.values());
}

function ratingNumericScore(rating = {}) {
  const signal = SCORE_MAP.signal[rating.signal] ?? 0;
  const volume = SCORE_MAP.volume[rating.volume] ?? 0;
  const power = SCORE_MAP.power[rating.power] ?? 0;
  const vibe = SCORE_MAP.vibe[rating.vibe] ?? 0;

  return signal * 0.35 + volume * 0.3 + power * 0.25 + vibe * 0.1;
}

function averageUserScore(userRatings = []) {
  if (!userRatings.length) {
    return 0;
  }

  const total = userRatings.reduce((sum, rating) => sum + ratingNumericScore(rating), 0);
  return total / userRatings.length;
}

export function getWfScoreLabel(score = 0) {
  if (score >= 9) {
    return "Elite";
  }

  if (score >= 8) {
    return "Highly workable";
  }

  if (score >= 7) {
    return "Solid";
  }

  if (score >= 5) {
    return "Depends";
  }

  return "Proceed with caution";
}

export function calculateWfScore(adminRating = {}, userRatings = []) {
  const ratings = Array.isArray(userRatings) ? userRatings : [];
  const adminScore = ratingNumericScore(adminRating);
  const count = ratings.length;
  let wfScore = adminScore;

  if (count >= 20) {
    wfScore = adminScore * 0.1 + averageUserScore(ratings) * 0.9;
  } else if (count >= 5) {
    wfScore = adminScore * 0.3 + averageUserScore(ratings) * 0.7;
  }

  const rounded = Math.round(wfScore * 10) / 10;

  return {
    wfScore: rounded,
    wfScoreLabel: getWfScoreLabel(rounded)
  };
}

export async function getUserRating(listingId, userId) {
  if (!listingId || !userId) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "listings", listingId));

  if (!snapshot.exists()) {
    return null;
  }

  const listing = snapshot.data();
  const userRatings = Array.isArray(listing.userRatings) ? listing.userRatings : [];
  return userRatings.find((rating) => rating.userId === userId) || null;
}

export async function addUserRating(listingId, userId, rating) {
  if (!listingId || !userId) {
    throw new Error("listingId and userId are required");
  }

  const listingRef = doc(db, "listings", listingId);
  const snapshot = await getDoc(listingRef);

  if (!snapshot.exists()) {
    throw new Error("Listing not found");
  }

  const listing = snapshot.data();
  const adminRating = listing.adminRating || {};
  const userRatings = Array.isArray(listing.userRatings) ? [...listing.userRatings] : [];
  const nextRating = {
    userId,
    signal: rating.signal,
    volume: rating.volume,
    power: rating.power,
    vibe: rating.vibe,
    createdAt: new Date().toISOString()
  };

  const existingIndex = userRatings.findIndex((entry) => entry.userId === userId);

  if (existingIndex >= 0) {
    userRatings[existingIndex] = {
      ...userRatings[existingIndex],
      ...nextRating
    };
  } else {
    userRatings.push(nextRating);
  }

  const { wfScore, wfScoreLabel } = calculateWfScore(adminRating, userRatings);

  await updateDoc(listingRef, {
    userRatings,
    wfScore,
    wfScoreLabel,
    reviewCount: userRatings.length
  });

  return wfScore;
}

export async function getListings(city) {
  const constraints = [where("status", "==", "approved")];

  if (city) {
    constraints.push(where("city", "==", city));
  }

  const listingsQuery = query(collection(db, "listings"), ...constraints);
  const snapshot = await getDocs(listingsQuery);

  return sortByName(dedupeBySlug(snapshot.docs.map(withId)));
}

export async function getAdminListings() {
  const snapshot = await getDocs(collection(db, "listings"));
  const listings = sortByName(
    dedupeBySlug(snapshot.docs.map(withId)).filter((listing) => listing.status !== "deleted")
  );

  return listings.sort((a, b) => {
    if (Boolean(b.featured) !== Boolean(a.featured)) {
      return Number(b.featured) - Number(a.featured);
    }

    return (a.name || "").localeCompare(b.name || "");
  });
}

export async function updateListing(listingId, data) {
  return updateDoc(doc(db, "listings", listingId), data);
}

export async function deleteListing(listingId) {
  const listingRef = doc(db, "listings", listingId);

  try {
    await deleteDoc(listingRef);
    return { method: "hard" };
  } catch (error) {
    // Firestore rules often allow updates but block hard deletes.
    // Soft-delete keeps admin cleanup working until an admin API exists.
    const permissionDenied =
      error?.code === "permission-denied" ||
      /permission|insufficient/i.test(String(error?.message || ""));

    if (!permissionDenied) {
      throw error;
    }

    await updateDoc(listingRef, {
      status: "deleted",
      deletedAt: new Date().toISOString()
    });

    return { method: "soft" };
  }
}

export async function getListing(slug) {
  if (!slug) {
    return null;
  }

  const listingQuery = query(collection(db, "listings"), where("slug", "==", slug));
  const snapshot = await getDocs(listingQuery);

  if (snapshot.empty) {
    return null;
  }

  const listing = withId(snapshot.docs[0]);
  return listing.status === "approved" ? listing : null;
}

export async function submitSpot(spotData) {
  return addDoc(collection(db, "submissions"), {
    ...spotData,
    status: "pending",
    createdAt: new Date()
  });
}

export async function getFeaturedListings(city) {
  const constraints = [where("status", "==", "approved"), where("featured", "==", true)];

  if (city) {
    constraints.push(where("city", "==", city));
  }

  const featuredQuery = query(collection(db, "listings"), ...constraints);
  const snapshot = await getDocs(featuredQuery);

  return sortByName(dedupeBySlug(snapshot.docs.map(withId)));
}

export async function isSpotSaved(userId, spotSlug) {
  const savedQuery = query(
    collection(db, "savedSpots"),
    where("userId", "==", userId),
    where("spotSlug", "==", spotSlug)
  );
  const snapshot = await getDocs(savedQuery);
  return !snapshot.empty;
}

export async function saveSpot(userId, spot) {
  const alreadySaved = await isSpotSaved(userId, spot.slug);

  if (alreadySaved) {
    return null;
  }

  return addDoc(collection(db, "savedSpots"), {
    userId,
    spotSlug: spot.slug,
    spotName: spot.name,
    savedAt: new Date()
  });
}

export async function unsaveSpot(userId, spotSlug) {
  const savedQuery = query(
    collection(db, "savedSpots"),
    where("userId", "==", userId),
    where("spotSlug", "==", spotSlug)
  );
  const snapshot = await getDocs(savedQuery);

  await Promise.all(
    snapshot.docs.map((documentSnapshot) =>
      deleteDoc(doc(db, "savedSpots", documentSnapshot.id))
    )
  );
}

export async function getSavedSpots(userId) {
  const savedQuery = query(collection(db, "savedSpots"), where("userId", "==", userId));
  const snapshot = await getDocs(savedQuery);

  return snapshot.docs
    .map(withId)
    .sort((a, b) => {
      const aTime = a.savedAt?.toMillis?.() ?? 0;
      const bTime = b.savedAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
}

export async function submitFeaturedLead(leadData) {
  return addDoc(collection(db, "featuredLeads"), {
    ...leadData,
    status: "new",
    createdAt: new Date()
  });
}

export async function submitRemovalRequest(requestData) {
  return addDoc(collection(db, "removalRequests"), {
    ...requestData,
    status: "new",
    createdAt: new Date()
  });
}

export { doc, getDoc, updateDoc };
