import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "/js/firebase.js";

const sampleListings = [
  {
    name: "Ludlow Coffee Supply",
    slug: "ludlow-coffee-supply",
    city: "new-york",
    type: "cafe",
    address: "154 Ludlow St, New York, NY 10002",
    neighborhood: "Lower East Side",
    lat: 40.7213,
    lng: -73.9882,
    status: "approved",
    featured: false,
    wifiNetwork: "LudlowCoffee_Guest",
    wifiPassword: "ludlow2024",
    wifiSpeed: "fast",
    wifiMbps: 85,
    noiseLevel: "quiet",
    outlets: "plenty",
    food: "coffee-and-food",
    seating: ["tables", "bar"],
    hours: "7am - 6pm daily",
    costToSit: "buy-something",
    bathroom: true,
    bathroomCode: "4281",
    bathroomNotes: "Single stall, very clean",
    vibeTags: ["neighborhood gem", "laptop friendly", "natural light", "not too crowded"],
    photos: [],
    submittedBy: "admin"
  },
  {
    name: "The Ace Hotel Lobby",
    slug: "ace-hotel-lobby",
    city: "new-york",
    type: "hotel-lobby",
    address: "20 W 29th St, New York, NY 10001",
    neighborhood: "Midtown",
    lat: 40.7454,
    lng: -73.9893,
    status: "approved",
    featured: true,
    wifiNetwork: "AceHotel_Public",
    wifiPassword: "acenyc2024",
    wifiSpeed: "fast",
    wifiMbps: 120,
    noiseLevel: "moderate",
    outlets: "plenty",
    food: "full-menu",
    seating: ["tables", "couches"],
    hours: "Open 24hrs",
    costToSit: "buy-something",
    bathroom: true,
    bathroomCode: "",
    bathroomNotes: "Multiple stalls, ask staff for access",
    vibeTags: ["great coffee", "large space", "good music", "open late"],
    photos: [],
    submittedBy: "admin"
  },
  {
    name: "NY Public Library - Rose Reading Room",
    slug: "nypl-rose-reading-room",
    city: "new-york",
    type: "library",
    address: "476 5th Ave, New York, NY 10018",
    neighborhood: "Midtown",
    lat: 40.753,
    lng: -73.9822,
    status: "approved",
    featured: false,
    wifiNetwork: "NYPL_WiFi",
    wifiPassword: "",
    wifiSpeed: "decent",
    wifiMbps: 30,
    noiseLevel: "library-quiet",
    outlets: "some",
    food: "none",
    seating: ["tables"],
    hours: "Mon-Sat 10am - 8pm, Sun 1pm - 5pm",
    costToSit: "free",
    bathroom: true,
    bathroomCode: "",
    bathroomNotes: "Available on multiple floors",
    vibeTags: ["free", "very quiet", "natural light", "laptop friendly"],
    photos: [],
    submittedBy: "admin"
  },
  {
    name: "Blank Street Coffee",
    slug: "blank-street-coffee-williamsburg",
    city: "new-york",
    type: "cafe",
    address: "284 N 7th St, Brooklyn, NY 11211",
    neighborhood: "Williamsburg",
    lat: 40.7183,
    lng: -73.9573,
    status: "approved",
    featured: false,
    wifiNetwork: "BlankStreet_Guest",
    wifiPassword: "blank2024",
    wifiSpeed: "fast",
    wifiMbps: 95,
    noiseLevel: "moderate",
    outlets: "plenty",
    food: "coffee-and-food",
    seating: ["tables", "bar"],
    hours: "7am - 7pm daily",
    costToSit: "buy-something",
    bathroom: true,
    bathroomCode: "7734",
    bathroomNotes: "Single stall, key at counter",
    vibeTags: ["laptop friendly", "good coffee", "neighborhood gem"],
    photos: [],
    submittedBy: "admin"
  },
  {
    name: "McNally Jackson Books",
    slug: "mcnally-jackson-nolita",
    city: "new-york",
    type: "bookstore-cafe",
    address: "52 Prince St, New York, NY 10012",
    neighborhood: "Nolita",
    lat: 40.7237,
    lng: -73.9964,
    status: "approved",
    featured: false,
    wifiNetwork: "McNallyJackson",
    wifiPassword: "books2024",
    wifiSpeed: "decent",
    wifiMbps: 40,
    noiseLevel: "quiet",
    outlets: "some",
    food: "coffee-and-food",
    seating: ["tables"],
    hours: "10am - 10pm daily",
    costToSit: "buy-something",
    bathroom: true,
    bathroomCode: "",
    bathroomNotes: "Ask at the register",
    vibeTags: ["quiet corners", "neighborhood gem", "laptop friendly", "good coffee"],
    photos: [],
    submittedBy: "admin"
  }
];

// Seed: import('/js/seed.js').then((m) => m.seedDatabase())
// Dedupe: import('/js/seed.js').then((m) => m.dedupeListings())
export async function dedupeListings() {
  const snapshot = await getDocs(collection(db, "listings"));
  const bySlug = new Map();

  snapshot.docs.forEach((documentSnapshot) => {
    const listing = { id: documentSnapshot.id, ...documentSnapshot.data() };
    const slug = listing.slug;

    if (!slug) {
      return;
    }

    if (!bySlug.has(slug)) {
      bySlug.set(slug, []);
    }

    bySlug.get(slug).push(documentSnapshot);
  });

  let removed = 0;

  for (const [slug, documents] of bySlug) {
    if (documents.length <= 1) {
      continue;
    }

    const keep =
      documents.find((documentSnapshot) => documentSnapshot.id === slug) || documents[0];

    for (const documentSnapshot of documents) {
      if (documentSnapshot.id === keep.id) {
        continue;
      }

      await deleteDoc(doc(db, "listings", documentSnapshot.id));
      removed += 1;
      console.log(`Removed duplicate: ${slug} (${documentSnapshot.id})`);
    }
  }

  console.log(`Done. Removed ${removed} duplicate listing(s).`);
}

export async function seedDatabase() {
  for (const listing of sampleListings) {
    const docRef = doc(db, "listings", listing.slug);
    await setDoc(docRef, listing);
    console.log(`Seeded listing: ${listing.name} (${listing.slug})`);
  }
}
