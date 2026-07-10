# WF-Here — Tech Stack

## Build Approach
**Code-assisted with Cursor.** Cursor writes all code from detailed briefs. Jeff directs as creative director, QAs output in browser, and gives visual feedback. No code written from scratch.

---

## Full Stack

| Layer | Tool | Purpose |
|---|---|---|
| Frontend | HTML / CSS / Vanilla JS via Cursor | Pages, components, interactions |
| Hosting | Vercel | Free tier, auto-deploys from GitHub |
| Version control | GitHub | Code repository |
| Database | Airtable | All listings, submissions, user data |
| Map | Mapbox | Custom-styled map, pins, popups |
| Auth | Memberstack | User accounts, login gate for wifi passwords |
| Forms | Typeform | Submit a spot form (feeds into Airtable) |
| Automation | Make (formerly Integromat) | Connects all services |
| Payments | Stripe | Featured listing invoices (Phase 2) |
| Analytics | Plausible | Privacy-friendly, no cookie banner needed |
| Email | Loops | Submission confirmations, account emails |

---

## Monthly Cost at Launch

| Tool | Cost |
|---|---|
| Vercel | Free |
| GitHub | Free |
| Airtable | Free to start |
| Mapbox | Free (under 50k loads/mo) |
| Memberstack | $29/mo |
| Typeform | Free to start |
| Make | Free to start |
| Plausible | $9/mo |
| Loops | Free to start |
| **Total** | **~$38/mo to start** |

---

## Key Integrations

### Submission flow (Make automation)
Typeform submit → Airtable new row (status: Pending) → Email Jeff "new spot to review"

### Approval flow (Make automation)
Jeff changes Airtable status to "Approved" → Vercel rebuild triggered → Spot goes live → Email submitter "your spot is on the map"

### Featured listing flow (Make automation)
Stripe payment confirmed → Airtable featured flag → true → Pin becomes black on map

### Wifi password gate
Memberstack checks auth state → if logged in, Airtable API returns wifi password → displayed in UI → if not logged in, shows "sign in to reveal" nudge

---

## Mobile / App Strategy

**Phase 1:** PWA (Progressive Web App)
- Webflow site is installable on iOS and Android home screen
- Works like a native app — full screen, icon, offline capable
- Zero extra cost — built into the site

**Phase 2:** Median.co wrapper
- Wraps the existing site in a real native iOS/Android shell
- Gets you into the App Store without rebuilding anything
- Cost: ~$49/mo + $99/yr Apple Developer account

**Never:** Native app development without a dev team — not worth the complexity at this stage.

---

## Folder Structure

```
wf-here/
├── index.html              (homepage)
├── explore/
│   └── index.html          (map / explore page)
├── place/
│   └── index.html          (place detail template)
├── submit/
│   └── index.html          (submit a spot)
├── login/
│   └── index.html          (sign up / login)
├── profile/
│   └── index.html          (user profile + saved)
├── for-businesses/
│   └── index.html          (business pitch page)
├── new-york/
│   └── index.html          (NYC SEO page)
├── los-angeles/
│   └── index.html          (LA SEO page)
├── admin/
│   ├── queue/index.html    (review queue)
│   └── listings/index.html (listings manager)
├── css/
│   ├── tokens.css          (design tokens — load first)
│   ├── global.css          (base styles, reset, typography)
│   └── components.css      (shared components)
├── js/
│   └── main.js             (shared JS)
└── assets/
    ├── logo-primary.svg
    ├── logo-primary-dark.svg
    ├── logo-secondary.svg
    ├── favicon.png
    └── app-icon.png
```

---

## Cursor Working Rules

1. One brief at a time. Confirm it works before moving to the next.
2. Always start each Cursor session with: *"We are building WF-Here, a map-based workspace finder. The design system is already set up in tokens.css. Do not change any existing files unless I ask."*
3. Describe problems visually, not technically. "The nav logo is too large" not "the CSS is wrong."
4. Never let Cursor change tokens.css without explicit permission.
5. After each brief, open in browser and QA against the mockups before proceeding.
