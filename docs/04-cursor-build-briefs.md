# WF-Here — Cursor Build Briefs

## How to use these briefs
1. Work through them in order — each brief builds on the last
2. Start every Cursor session with this context line:
   > "We are building WF-Here, a map-based workspace finder. The design system is already set up in tokens.css. Do not change any existing files unless I ask."
3. Paste one brief at a time
4. QA in browser before moving to the next brief
5. Describe problems visually ("the logo is too big") not technically

---

# PHASE 1 — FOUNDATION

---

## Brief 1 — Project Setup + Design Tokens

Create a new web project for WF-Here (wf-here.com) — a map-based directory for finding great public workspaces. Set up the project structure and global design system.

TECH STACK
- HTML / CSS / Vanilla JS to start (no framework needed for phase 1)
- We will add Mapbox, Airtable API, and Memberstack in later phases
- Folder structure:
  /index.html
  /explore/index.html
  /place/index.html
  /submit/index.html
  /css/tokens.css
  /css/global.css
  /css/components.css
  /js/main.js
  /assets/

DESIGN TOKENS
Create /css/tokens.css with these exact values as CSS custom properties:

/* Colors */
--color-ink: #111111;
--color-ink-secondary: #444444;
--color-ink-tertiary: #666666;
--color-ink-muted: #999999;
--color-ink-faint: #CCCCCC;
--color-border: #DDDDD8;
--color-surface: #F8F8F6;
--color-surface-raised: #FFFFFF;
--color-surface-sunken: #F0EFEB;
--color-pin: #E8281A;
--color-wifi-great: #27A56B;
--color-wifi-decent: #BA7517;
--color-wifi-poor: #E8281A;
--color-featured: #111111;

/* Typography */
--font-sans: SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
--font-mono: SF Mono, ui-monospace, monospace;

/* Font sizes */
--text-xs: 10px;
--text-sm: 12px;
--text-base: 14px;
--text-md: 16px;
--text-lg: 20px;
--text-xl: 28px;
--text-2xl: 36px;
--text-3xl: 48px;

/* Font weights */
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;

/* Spacing (8px base grid) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;

/* Border radius */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-full: 9999px;

/* Borders */
--border-hairline: 0.5px solid var(--color-border);

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.10);

/* Layout */
--nav-height: 52px;
--nav-height-mobile: 40px;
--bottom-nav-height: 44px;

GLOBAL STYLES
Create /css/global.css:
- CSS reset (box-sizing border-box, no default margins/padding)
- Base body: background var(--color-surface), color var(--color-ink), font var(--font-sans), font-size var(--text-base), line-height 1.5
- Letter spacing: -0.01em on all text globally
- Links: no underline by default, color inherit
- Headings: font-weight var(--weight-light), letter-spacing -0.03em
- ::selection: background #111, color #F8F8F6
- Scrollbar: thin, color var(--color-border), track transparent

LOGO ASSETS
Reference logo files from /assets/ as:
<img src="/assets/logo-primary.svg" alt="wf—here" height="28">

WHAT TO DELIVER
1. Full folder structure created
2. /css/tokens.css with all custom properties
3. /css/global.css with base styles
4. /css/components.css (empty, ready)
5. /js/main.js (empty, ready)
6. Each HTML file with boilerplate: DOCTYPE, correct meta tags, viewport, favicon, CSS linked, title set
7. Confirm every page loads without errors

---

## Brief 2 — Nav Component (Desktop + Mobile)

Using the existing tokens.css and global.css, build the nav component for WF-Here. Add it to all HTML pages.

DESKTOP NAV
Height: var(--nav-height) = 52px
Background: var(--color-surface) = #F8F8F6
Border bottom: var(--border-hairline)
Padding: 0 2rem
Layout: flex, align-items center, justify-content space-between

Left side:
- Logo: <img src="/assets/logo-primary.svg" height="28" alt="wf—here">
- Clicking logo goes to /

Right side (nav links):
- "explore" → /explore/new-york
- "submit a spot" → /submit
- "for businesses" → /for-businesses
- "sign in" button → /login

Nav link styles:
- Font size: var(--text-sm) = 12px
- Color: var(--color-ink-tertiary) = #666666
- No underline, hover color: var(--color-ink)

Sign in button styles:
- Background: var(--color-ink) = #111111
- Color: var(--color-surface) = #F8F8F6
- Padding: 6px 14px
- Border radius: var(--radius-md) = 6px
- Font size: var(--text-sm)

MOBILE NAV (below 768px)
Height: var(--nav-height-mobile) = 40px
Left: secondary logo mark <img src="/assets/logo-secondary.svg" height="24">
Right: hamburger menu icon (simple 3-line, opens a slide-down or overlay menu)
Hide desktop nav links on mobile

BOTTOM NAV BAR (mobile only)
Height: var(--bottom-nav-height) = 44px
Position: fixed, bottom 0, full width
Background: var(--color-surface)
Border top: var(--border-hairline)
5 items evenly spaced:
1. Home (icon: house) → /
2. Explore (icon: map) → /explore/new-york
3. Submit (icon: circle-plus, color: var(--color-pin) = #E8281A, size: 24px) → /submit
4. Saved (icon: heart) → /profile
5. Profile (icon: user) → /profile

Active state: icon color var(--color-pin), label color var(--color-ink)
Inactive state: icon + label color var(--color-ink-faint) = #CCCCCC
Label font size: 9px

Use Tabler Icons via CDN:
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css">

WHAT TO DELIVER
1. Nav HTML component added to all pages
2. Desktop nav fully styled
3. Mobile nav with hamburger (basic toggle, no animation needed yet)
4. Bottom nav bar on mobile only
5. Active state on current page (add class "active" to correct nav item per page)
6. QA at both 1440px desktop and 390px mobile width

---

## Brief 3 — Map Pin Component

Create reusable SVG map pin components for WF-Here. These will be used on the map page and in mockups.

There are two pin types:
1. Standard pin — color: var(--color-pin) = #E8281A
2. Featured pin — color: var(--color-ink) = #111111 (for businesses that pay for featured placement)

PIN SVG PATH
Use this exact SVG path for both pin types (it is the real logo pin shape):
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 7C0 3.13401 3.13401 0 7 0C10.866 0 14 3.13401 14 7C14 8.48601 13.519 9.85901 12.702 10.976L7 22L1.29799 10.976C0.480995 9.85901 0 8.48601 0 7ZM7 10C8.65685 10 10 8.65685 10 7C10 5.34315 8.65685 4 7 4C5.34315 4 4 5.34315 4 7C4 8.65685 5.34315 10 7 10Z" fill="FILL_COLOR"/>

Create these as:
1. A CSS class .pin-standard and .pin-featured
2. A JS function createPin(type, lat, lng, name) that returns the SVG element
3. Three sizes: large (22px tall), medium (16px tall), small (12px tall)

PIN LABEL
Optional label below the pin (shown on hover or for featured pins):
- Background: #fff for standard, #111 for featured
- Color: #111 for standard, #F8F8F6 for featured
- Font size: 10px
- Padding: 2px 7px
- Border radius: var(--radius-sm)
- Border: var(--border-hairline) for standard, none for featured

WHAT TO DELIVER
1. Pin SVG components in /js/pins.js
2. Pin CSS in /css/components.css
3. A simple test page or section showing both pin types at all three sizes on a gray background
4. createPin() function exported and ready for use in the map brief

---

## Brief 4 — Spot Card Component

Build the spot card component used in the sidebar list view on the explore page.

CARD STRUCTURE
Background: var(--color-surface-raised) = #FFFFFF
Border: var(--border-hairline)
Border radius: var(--radius-xl) = 12px
Padding: 12px
Display: flex, flex-direction column, gap: 7px
Cursor: pointer
Hover state: border-color #AAAAAA (slightly darker)
Active/selected state: border 1.5px solid var(--color-ink)

CARD ANATOMY (top to bottom)

Row 1 — Name + Save
- Left: spot name (font-size: 13px, font-weight: var(--weight-medium), color: var(--color-ink), letter-spacing: -0.2px)
- Left below name: spot type · neighborhood (font-size: 11px, color: var(--color-ink-muted))
- Right: heart icon for save (unfilled = unsaved, filled red = saved)
- If featured: show "featured" badge next to name (font-size: 10px, background: var(--color-ink), color: var(--color-surface), padding: 2px 7px, border-radius: var(--radius-sm))

Row 2 — Attribute chips
- Small chips showing key attributes: "fast wifi", "outlets", "quiet", "food", etc.
- Font size: 10px, padding: 2px 8px, border-radius: var(--radius-full)
- Background: var(--color-surface), border: var(--border-hairline), color: var(--color-ink-secondary)

Row 3 — Wifi + Hours
- Left: wifi quality dot + label
  - Great: dot color #27A56B, label "great wifi" color #27A56B
  - Decent: dot color #BA7517, label "decent wifi" color #BA7517
  - Poor: dot color #E8281A, label "poor wifi" color #E8281A
  - Dot size: 7px diameter, border-radius 50%
- Right: hours e.g. "open until 6pm" or "open 24hrs" (font-size: 11px, color: var(--color-ink-muted))

CARD STATES
1. Default
2. Hover (darker border)
3. Active/selected (thick dark border — used when pin is clicked on map)
4. Featured variant (show featured badge)
5. Saved variant (heart filled red)

USAGE
Create as a JS function:
createSpotCard(spot) where spot is an object with:
{ name, type, neighborhood, attributes[], wifiQuality, hours, featured, saved }

Export from /js/components.js

WHAT TO DELIVER
1. Spot card HTML/CSS in /css/components.css
2. createSpotCard() function in /js/components.js
3. Demo section showing: default card, featured card, saved card, active card, all five states

---

## Brief 5 — Filter Chips Component

Build the filter chip component used across the explore page and submit form.

CHIP ANATOMY
Default state:
- Background: var(--color-surface-raised) = #FFFFFF
- Border: var(--border-hairline)
- Border radius: var(--radius-full) = 9999px (pill shape)
- Padding: 6px 14px
- Font size: var(--text-sm) = 12px
- Color: var(--color-ink-secondary) = #444444
- Cursor: pointer

Active/on state:
- Background: var(--color-ink) = #111111
- Color: var(--color-surface) = #F8F8F6
- Border color: var(--color-ink)

Hover state (default only):
- Background: var(--color-surface-sunken) = #F0EFEB

FILTER SETS
Create these pre-defined chip groups:

Explore page filters (single OR multi-select, "all" resets others):
- all, fast wifi, quiet, food, outlets, open late, free, open now

Noise level (single select):
- library quiet, moderate, lively, loud

Cost to sit (single select):
- completely free, buy something, paid / membership

Attributes (multi-select, used in submit form):
- fast wifi, outlets everywhere, quiet, good food, good coffee, open late, outdoor seating, natural light, free to sit, laptop friendly, bathroom available

Wifi speed (single select, color-coded):
- slow (red when active), decent (amber when active), fast (green when active), blazing (green when active)

BEHAVIOR
- Clicking a chip toggles it on/off (multi-select groups)
- Single-select groups deselect others on click
- "all" chip: when clicked, deselects all others; if any other chip is selected, deselect "all"
- Chips fire a custom event: chipToggle with { group, value, active }

WHAT TO DELIVER
1. Chip CSS in /css/components.css
2. Chip JS in /js/components.js — createChipGroup(group, options, multiSelect) function
3. Demo section showing all chip groups in all states

---

# PHASE 2 — CORE PAGES

---

## Brief 6 — Homepage

Build the WF-Here homepage at /index.html using existing tokens, global styles, nav component, and pin component.

SECTIONS (top to bottom):

1. NAV — use existing nav component

2. HERO
Max width: 640px, centered, padding: 5rem 2rem 3.5rem
- Eyebrow: "New York · Los Angeles" — font-size: 11px, weight: medium, uppercase, letter-spacing: 0.1em, color: var(--color-ink-muted)
- H1: "Your office is" + line break + "out there." — "out there." in weight medium, rest in weight light, font-size: 52px, letter-spacing: -2.5px, line-height: 1.05
- Sub: "Find cafés, libraries, lobbies, and hidden spots with great wifi, good food, and the right vibe." — font-size: 16px, color: var(--color-ink-tertiary), line-height: 1.65, max-width: 400px, centered
- City picker: white card, hairline border, border-radius 10px, overflow hidden, max-width 380px, centered:
  - "New York" button (flex:1, padding 14px, font-size 15px, weight light)
  - Hairline divider
  - "Los Angeles" button (same)
  - Red "explore" button with small pin SVG icon (background: var(--color-pin), color: #fff, padding: 0 20px)
  - Clicking either city button or explore sets city and goes to /explore/[city]
- Note: "30+ curated spots in New York · LA coming soon" — font-size: 12px, color: var(--color-ink-faint)

3. MAP PREVIEW
Max width: 860px, centered, padding: 0 2rem 4rem
- Mapbox map embed, height: 320px, border-radius: var(--radius-xl), overflow hidden, hairline border
- Show a static preview map of NYC centered on Manhattan
- Filter bar overlay (top of map): filter chips — all, wifi, food, quiet, open late
- Spot count overlay (top right): "42 spots" pill
- 3–4 sample pins on the map (use createPin())
- One popup showing "Ludlow Coffee Supply" with attributes and "view spot" CTA

4. HOW IT WORKS
Max width: 780px, centered, padding: 3rem 2rem
- Eyebrow: "how it works"
- Title: "Find your spot in three steps."
- 3-column grid:
  01 / Pick your city — "New York or LA to start. Every spot hand-curated — no junk, no spam listings."
  02 / Filter your needs — "Wifi speed, noise level, food, power outlets, hours. Set it and find the right fit."
  03 / Get to work — "Check the vibe, get directions. Then go settle in."
- Step number: font-size 11px, weight medium, color var(--color-pin), letter-spacing 0.04em
- Step title: font-size 15px, weight medium, letter-spacing -0.3px
- Step desc: font-size 13px, color var(--color-ink-tertiary), line-height 1.65

5. SUBMIT CTA BAND
Margin: 0 2rem 4rem, background: var(--color-ink) = #111, border-radius: var(--radius-xl), padding: 2.5rem
Flex row, space-between, wrap:
- Left: "Know a spot worth sharing?" (22px, weight light) + "Submit it. If it passes the vibe check, it goes on the map." (13px, color #666)
- Right: "submit a spot ↗" button (background: var(--color-pin), color: #fff, padding: 11px 22px, border-radius: var(--radius-md))

6. FOOTER
Border top: var(--border-hairline), padding: 1.25rem 2rem, flex space-between
- Left: logo (muted gray wordmark)
- Right: explore · submit a spot · for businesses · about (12px, color var(--color-ink-faint))

RESPONSIVE
On mobile (below 768px):
- Hero title: 32px
- City picker: full width
- Map: height 200px
- How it works: single column
- CTA band: stacked

WHAT TO DELIVER
Complete, styled, responsive homepage that matches the mockup.

---

## Brief 7 — Map / Explore Page

Build the WF-Here explore page at /explore/index.html. This is the core product screen.

LAYOUT
Full viewport height. No scroll on outer container.
Two-column layout: sidebar (320px fixed left) + map (flex 1 right)

NAV MODIFICATIONS FOR EXPLORE
- Replace full logo with secondary mark on mobile
- Add city toggle (NYC / LA pill switcher) in center of nav
- Add search input in nav: "Search spots, neighborhoods…" placeholder

SIDEBAR
Width: 320px, flex-shrink 0, border-right: var(--border-hairline), background: var(--color-surface), overflow hidden, flex column

Filter row (top of sidebar, flex-shrink 0):
- Filter chips: all, fast wifi, quiet, food, outlets, open late, free
- Padding: 10px 14px, border-bottom: var(--border-hairline)
- Horizontally scrollable on overflow

Results header:
- "42 spots in New York" — font-size 12px, color var(--color-ink-muted)
- "best match" sort dropdown — font-size 12px, color var(--color-ink)
- Padding: 10px 14px 6px

Spot list (flex 1, overflow-y auto):
- Scrollable list of spot cards using createSpotCard()
- 4px padding top, 10px padding sides and bottom, 6px gap between cards
- Show 6 sample spots (use realistic NYC spot names and data)
- First spot in "active" state (Ludlow Coffee Supply)

MAP AREA
Flex 1, position relative, overflow hidden
- Mapbox map fills entire area
- Custom map style: monochrome, warm off-white base (#E8E5DF for land, #C8C4BC for roads, #D8D4CC for buildings, #CEDAD9 for water)
- Pins: use createPin() for standard (red) and featured (black)
- Show 5–6 sample pins on Manhattan
- Featured pin at The Ace Hotel Midtown area (black pin)
- Standard pins scattered across LES, Williamsburg, Nolita, Midtown

MAP OVERLAYS
Top left: map/list toggle (map active by default)
Top right: +/- zoom controls + current location button

POPUP (on pin click)
Position: absolute, bottom 20px, left 50% transform translateX(-50%)
White card, hairline border, border-radius 12px, padding 14px 16px, width 240px:
- Spot name (14px, medium)
- Spot type (11px, muted)
- Attribute chips (small)
- Footer row: wifi quality dot + "great wifi · open until 6pm" + "view spot" button (black, small)

INTERACTIONS
- Click pin → show popup, highlight corresponding sidebar card
- Click sidebar card → fly map to that location, show popup
- Filter chips → filter sidebar list (client-side filter on sample data)
- Map/list toggle → on "list" show full-screen list, hide map

RESPONSIVE
On mobile:
- Hide sidebar entirely
- Map fills full screen
- Filter chips scroll horizontally above map
- Popup at bottom of screen
- Bottom nav replaces sidebar nav

WHAT TO DELIVER
Complete explore page with Mapbox map, sidebar, sample data, and all interactions working.

---

## Brief 8 — Place Detail Page

Build the place detail page at /place/index.html.

LAYOUT
Standard page layout with nav + scrollable content.

NAV MODIFICATIONS
- Back arrow + "New York" text on left (goes back to /explore/new-york)
- "share" text link on right

HERO PHOTO GRID
Two-column grid, height 260px, no gap:
- Left: main photo (large, placeholder gray with camera icon)
- Right: 2×2 grid of thumbnail photos (4 smaller placeholders)
- "8 photos" count badge: bottom right of right column, dark semi-transparent pill

MAIN CONTENT
Max width: 860px, centered, padding: 2rem
Two-column grid: main content (1fr) + sticky sidebar (300px)

MAIN COLUMN

Spot header:
- Type · Neighborhood (12px, muted)
- H1: spot name (32px, weight light, letter-spacing -1px)
- Meta row: wifi quality dot + label · "open now" (green) · "closes 6pm" (muted) · "free to sit" (muted)

Details section:
- Title: "The details" (13px, medium)
- 4-column auto-fit grid of attribute cards (min 140px):
  Each card: white bg, hairline border, border-radius lg, padding 10px 12px
  - Label: 10px, uppercase, muted, letter-spacing 0.06em
  - Value: 13px, medium, ink (green for positive values)
  Cards: Wifi speed, Noise level, Power outlets, Food & drinks, Seating, Cost to sit, Hours, Bathrooms

Wifi section:
- Title: "Wifi"
- White card with hairline border, border-radius 10px:
  - Header row: green dot + network name (left) · speed rating (right) · bottom: hairline divider
  - Body row: "Password" label · locked state (lock icon + "sign in to reveal") · or revealed password in monospace
  - Login nudge bar at bottom (background surface, border-top hairline): "Create a free account to see wifi passwords" + "sign in ↗" button

Bathroom section:
- Title: "Bathroom"
- White card:
  - Header: door icon + "Single · gender neutral" + "keypad code required" · "reveal code" button (right)
  - Revealed state: 4-digit code in large monospace + copy button + "codes change — verify on arrival" disclaimer in small muted text

Vibe tags section:
- Title: "The vibe"
- Pill tags: "neighborhood gem", "laptop friendly", "good music", "not too crowded", "natural light", "regulars crowd"

Reviews section:
- Title: "Reviews" + count (right)
- Review cards: avatar initials + name + date / review text / attribute tags
- "Write a review — sign in first" input row at bottom

Removal link:
- At very bottom: "Is this your business? Request removal ↗" — 11px, muted, centered

SIDEBAR (sticky)
Action card (white, border-radius xl, padding 1.25rem):
- "save this spot" button (full width, black bg, heart icon)
- "get directions" button (full width, outline)
- Hairline divider
- Detail rows: Address · Neighborhood · Type · Price range

Map thumbnail:
- 120px tall, border-radius lg, clickable
- Simplified map showing pin at spot location

Submitted by line:
- "submitted by the community · verified by wf—here" — 11px, muted, centered

RESPONSIVE
On mobile:
- Photo grid: single hero image, tap to see all
- Two columns collapse to single column
- Sidebar moves below main content
- Save + directions become fixed bottom action bar

WHAT TO DELIVER
Complete place detail page with all sections, wifi gate (show locked state), bathroom reveal (working tap-to-reveal), and sticky sidebar.

---

## Brief 9 — Submit a Spot Page

Build the submit a spot page at /submit/index.html.

LAYOUT
Standard page with nav. Single column, max-width 580px, centered, padding: 2.5rem 2rem 4rem.

HEADER
- Eyebrow: "submit a spot" — 11px, uppercase, muted
- H1: "Know somewhere" + line break + "worth working from?" — 36px, weight light, letter-spacing -1.5px
- Sub: "Tell us about it. If it passes the vibe check it goes on the map — and you get the credit." — 14px, muted, line-height 1.6

PROGRESS BAR
4 steps, flex row with lines between:
- Step circles: 24px diameter. Active: red bg, white number. Done: black bg, white number. Todo: surface-sunken bg, hairline border, faint number.
- Step labels below circle: 12px. Active: ink, medium. Todo: muted.
- Steps: 1 the place · 2 the details · 3 wifi + access · 4 photos

STEP 1 — THE PLACE (shown by default)

Fields:
- Name of the place (text input, placeholder: "e.g. Ludlow Coffee Supply")
- City (select: New York / Los Angeles) + Type of place (select: Café / Library / Hotel lobby / Co-working / Park / Other) — two columns
- Address (text input with Google Places autocomplete placeholder: "Start typing to search…")

Attribute chips (multi-select):
fast wifi · outlets everywhere · quiet · good food · good coffee · open late · outdoor seating · natural light · free to sit · laptop friendly

Noise level chips (single-select):
library quiet · moderate · lively · loud

Cost to sit chips (single-select):
completely free · buy something · paid / membership

STEP 3 — WIFI + ACCESS (shown after step 2)

Wifi card (white, hairline border, border-radius 10px):
- Network name row: label + text input
- Password row: label + text input (placeholder: "Leave blank if open network")
- Speed row: label + speed chips (slow / decent / fast / blazing)

Bathroom card (white, hairline border, border-radius 10px):
- Available? (yes/no chips)
- Code / key? (text input, placeholder: "e.g. 4281 or 'ask at counter'")
- Notes (text input, placeholder: "e.g. single stall, very clean")

STEP 4 — PHOTOS

Upload zone:
- Dashed border, border-radius xl, padding 2rem, centered
- Camera icon (28px, faint)
- "Tap to add photos" (13px, muted)
- "JPG or PNG · up to 5 photos · 10MB each" (11px, very muted)

Optional notes textarea:
- Label: "Anything else worth knowing?"
- Hint: "Optional — but the good stuff lives here."
- Placeholder: "e.g. 'Gets crowded after 10am. Best seats are at the back by the window. They don't mind if you stay all day.'"

SUBMIT BUTTON
Full width, red bg, padding 14px, border-radius 10px, 15px font:
- Small white pin SVG icon + "submit this spot"

Note below button:
"Every submission is reviewed before it goes live. We'll let you know when yours is on the map." — 11px, muted, centered, line-height 1.6

MULTI-STEP BEHAVIOR
- Show step 1 fields by default
- "Next" button advances to next step, updates progress bar
- Back arrow on mobile goes to previous step
- On desktop, all steps visible and scrollable (no hiding)
- On mobile, show one step at a time

WHAT TO DELIVER
Complete submit page with working multi-step behavior on mobile, all fields, chip groups, wifi section, bathroom section, photo upload zone, and submit button.

---

# PHASE 3 — ACCOUNTS + DATA

## Brief 10 — Airtable Schema + API Connection
(To be written when Phase 2 pages are complete)

## Brief 11 — Auth + User Accounts
(To be written when Airtable is connected)

## Brief 12 — Wifi Password Gate
(To be written after auth is implemented)

## Brief 13 — Make Automation Flows
(To be written after Airtable + auth are complete)

---

# PHASE 4 — REVENUE + LAUNCH

## Brief 14 — For Businesses Page
(To be written when Phase 3 is complete)

## Brief 15 — City SEO Pages
(To be written when listings are live)

## Brief 16 — Pre-Launch Checklist
(To be written when all pages are complete)
