# WF-Here — Site Architecture

## Product Overview
Map-based directory for finding great public workspaces. Users discover spots via a map or list view, filter by attributes, view place detail pages, and submit new spots. Hybrid curation model — community submits, admin approves.

**Launch cities:** New York City first, then Los Angeles.
**No membership tier.** Free to use, login required only for wifi passwords and saving spots.

---

## Page Map

### Core Experience
| Page | URL | Purpose |
|---|---|---|
| Homepage | `/` | Hero with city selector, map preview, how it works, submit CTA |
| Map / Explore | `/explore/[city]` | Full-screen map with sidebar list, filters, pin popups |
| Place Detail | `/place/[slug]` | Individual spot — photos, attributes, wifi, bathroom, reviews |
| City Pages | `/new-york` · `/los-angeles` | SEO landing pages, editorial intro, top picks |
| Submit a Spot | `/submit` | Multi-step public submission form |

### User Accounts
| Page | URL | Purpose |
|---|---|---|
| Sign up / Login | `/login` | Email or Google SSO |
| Profile / Saved | `/profile` | Saved spots, reviews written, submission history |

### Monetization
| Page | URL | Purpose |
|---|---|---|
| For Businesses | `/for-businesses` | Featured listing pitch, verified badge, lead form, removal request |

### Admin
| Page | URL | Purpose |
|---|---|---|
| Review Queue | `/admin/queue` | Approve, reject, or edit submitted spots |
| Listings Manager | `/admin/listings` | Full database — edit, feature, unpublish any spot |

---

## Key User Flows

### Finding a spot
Homepage → Search city → Map/Explore → Filter → Place detail → Save / Get directions

### Submitting a spot
Submit page → Fill 4-step form → Admin review → Published → Submitter notified by email

### Business getting featured
For businesses page → Lead form → Jeff onboards manually → Featured black pin goes live

### Business removal request
Place detail sidebar ("Is this your business? Request removal") → Simple form → Email to Jeff

---

## Build Phases

### Phase 1 — NYC Launch (build first)
- Homepage
- Map / explore page (NYC)
- Place detail page
- Submit a spot form
- Admin review queue
- Hand-curate 30–50 NYC spots before going live

### Phase 2 — Accounts + LA
- User login / sign up
- Save spots
- User reviews
- LA city page and listings
- Turn on featured listings revenue

### Phase 3 — Growth
- Affiliate links
- Tasteful ads
- City SEO pages optimized
- Anonymized data strategy
- Decide next city based on submission volume

---

## Data Model (Airtable)

### Listings table
| Field | Type | Notes |
|---|---|---|
| Name | Text | Place name |
| Slug | Text | URL-safe unique ID |
| City | Single select | New York · Los Angeles |
| Type | Single select | Café · Library · Hotel lobby · Co-working · Park · Other |
| Address | Text | Full street address |
| Neighborhood | Text | e.g. Lower East Side |
| Lat / Lng | Number | For map pin placement |
| Status | Single select | Pending · Approved · Rejected · Unpublished |
| Featured | Checkbox | Black pin on map |
| Wifi network | Text | Network name |
| Wifi password | Text | Hidden from non-logged-in users |
| Wifi speed | Single select | Slow · Decent · Fast · Blazing |
| Noise level | Single select | Library quiet · Moderate · Lively · Loud |
| Outlets | Single select | None · Some · Plenty |
| Food | Single select | None · Coffee only · Coffee + food · Full menu |
| Hours | Text | e.g. 7am–6pm daily |
| Cost to sit | Single select | Free · Buy something · Paid |
| Bathroom | Checkbox | Has bathroom? |
| Bathroom code | Text | Tap to reveal on detail page |
| Bathroom notes | Text | e.g. "Single stall, very clean" |
| Vibe tags | Multi select | Curated list |
| Photos | Attachments | Up to 5 |
| Submitted by | Email | Submitter email |
| Removal requested | Checkbox | Flagged for review |
| Created | Date | Auto |
| Notes | Long text | Internal admin notes |

---

## Monetization

| Stream | Mechanism | Status |
|---|---|---|
| Featured listings | Businesses pay to be a black pin with priority placement | Phase 2 |
| Affiliate links | Coffee gear, laptop accessories on place detail pages | Phase 3 |
| Tasteful ads | Non-intrusive, relevant only | Phase 3 |
| Anonymized data | Aggregate workspace trends for commercial real estate, HR tools | Phase 3 |
