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
  const listings = sortByName(dedupeBySlug(snapshot.docs.map(withId)));

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
