# WF-Here — Airtable Schema Setup Guide

## Overview
Airtable is the database and admin panel for WF-Here. All listings, submissions, and featured flags live here. You manage approvals, edits, and featured status directly in Airtable.

Create a new Airtable base called: **WF-Here**

---

## Table 1 — Listings

This is your main table. Every approved workspace is a row.

| Field Name | Field Type | Options / Notes |
|---|---|---|
| Name | Single line text | Place name — primary field |
| Slug | Single line text | URL-safe ID e.g. "ludlow-coffee-supply". No spaces, lowercase, hyphens only. |
| City | Single select | New York · Los Angeles |
| Type | Single select | Café · Library · Hotel lobby · Co-working · Park / outdoor · Other |
| Address | Single line text | Full street address |
| Neighborhood | Single line text | e.g. Lower East Side |
| Latitude | Number | Decimal, 6 decimal places |
| Longitude | Number | Decimal, 6 decimal places |
| Status | Single select | 🟡 Pending · ✅ Approved · ❌ Rejected · 🔒 Unpublished |
| Featured | Checkbox | Checked = black pin on map |
| Featured since | Date | When featured status started |
| Wifi network name | Single line text | Network SSID |
| Wifi password | Single line text | Hidden from public — only shown to logged-in users |
| Wifi speed | Single select | 🐢 Slow · 🐇 Decent · ⚡ Fast · 🚀 Blazing |
| Wifi speed (Mbps) | Number | Actual speed test result if known |
| Noise level | Single select | 🤫 Library quiet · 💬 Moderate · 🔊 Lively · 📢 Loud |
| Power outlets | Single select | None · Some · Plenty |
| Food & drinks | Single select | None · Coffee only · Coffee + food · Full menu · BYOF |
| Seating types | Multiple select | Tables · Bar seating · Couches · Outdoor · Standing |
| Hours | Single line text | e.g. 7am–6pm daily · 24hrs |
| Cost to sit | Single select | Free · Buy something · Paid / membership |
| Bathroom | Checkbox | Has accessible bathroom? |
| Bathroom code | Single line text | Tap to reveal on site — e.g. 4281 |
| Bathroom notes | Single line text | e.g. "Single stall, very clean, key at counter" |
| Vibe tags | Multiple select | neighborhood gem · laptop friendly · good music · not too crowded · natural light · regulars crowd · window seats · outdoor space · dog friendly · great coffee · large space · quiet corners |
| Photos | Attachment | Up to 5 photos, JPG or PNG |
| Submitted by | Email | Submitter's email address |
| Submitter name | Single line text | Optional |
| Removal requested | Checkbox | Flag for admin review |
| Removal reason | Long text | Reason provided by requester |
| Admin notes | Long text | Internal use only — never shown publicly |
| Created | Created time | Auto-populated |
| Last modified | Last modified time | Auto-populated |

---

## Table 2 — Submissions Queue

Incoming submissions from the website before review. Make creates a row here when someone submits a spot.

| Field Name | Field Type | Notes |
|---|---|---|
| Name | Single line text | Submitted place name |
| City | Single select | New York · Los Angeles |
| Type | Single select | Same options as Listings |
| Address | Single line text | |
| Neighborhood | Single line text | Best guess from submitter |
| Attributes | Multiple select | What they selected on the form |
| Wifi network | Single line text | |
| Wifi password | Single line text | |
| Wifi speed | Single select | |
| Noise level | Single select | |
| Outlets | Single select | |
| Food | Single select | |
| Bathroom available | Checkbox | |
| Bathroom code | Single line text | |
| Bathroom notes | Single line text | |
| Notes | Long text | "Anything else worth knowing?" field |
| Photos | Attachment | Uploaded photos |
| Submitter email | Email | For notification when approved |
| Submitter name | Single line text | |
| Status | Single select | 🆕 New · 👀 Reviewing · ✅ Approved · ❌ Rejected |
| Submitted at | Created time | Auto |

**Workflow:** When you change Status to ✅ Approved → Make automation creates a row in the Listings table with Status = ✅ Approved and emails the submitter.

---

## Table 3 — Featured Businesses

Track which businesses are paying for featured placement.

| Field Name | Field Type | Notes |
|---|---|---|
| Business name | Single line text | |
| Contact name | Single line text | |
| Contact email | Email | |
| Phone | Phone | |
| Listing | Link to Listings | Link to their row in Listings table |
| Plan | Single select | Monthly · Annual |
| Rate | Currency | $ amount |
| Start date | Date | |
| Renewal date | Date | |
| Status | Single select | Active · Paused · Cancelled |
| Stripe customer ID | Single line text | For payment tracking |
| Notes | Long text | |

---

## Table 4 — Removal Requests

Track businesses that have requested removal.

| Field Name | Field Type | Notes |
|---|---|---|
| Business name | Single line text | |
| Contact name | Single line text | |
| Contact email | Email | |
| Listing | Link to Listings | Which listing they want removed |
| Reason | Long text | Why they want removal |
| Status | Single select | 🆕 New · 👀 Reviewing · ✅ Resolved · ❌ Denied |
| Submitted at | Created time | |
| Admin notes | Long text | |

---

## Airtable Views to Create

### Listings table views
1. **All approved** — filter: Status = Approved, sorted by Created desc
2. **NYC spots** — filter: Status = Approved + City = New York
3. **LA spots** — filter: Status = Approved + City = Los Angeles
4. **Featured spots** — filter: Featured = checked
5. **Pending review** — filter: Status = Pending (your daily review queue)
6. **Removal requested** — filter: Removal requested = checked

### Submissions table views
1. **New submissions** — filter: Status = New, sorted by Submitted at desc
2. **Reviewing** — filter: Status = Reviewing

---

## API Access

To connect Airtable to your website (Cursor brief 10), you'll need:
1. Your **Airtable API key** — found in Account > API
2. Your **Base ID** — found in the API docs for your base (starts with `app`)
3. Your **Table names** — exactly as named above

Store these as environment variables in Vercel — never hardcode them in your HTML/JS files.
