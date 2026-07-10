# WF-Here — Cursor Working Guide

## The Mental Model
You are the creative director. Cursor is your developer.
Your job: give clear briefs, QA the output against the mockups, give visual feedback.
Cursor's job: write all the code.
You never need to understand the code — you need to understand whether it matches the design.

---

## Before Every Cursor Session

Paste this context line at the start of every new Cursor conversation:

> "We are building WF-Here, a map-based workspace finder. The design system is already set up in /css/tokens.css. Do not change any existing files unless I explicitly ask you to. Always reference tokens.css values rather than hardcoding colors, fonts, or spacing."

This stops Cursor from going rogue and rewriting things you already built.

---

## The Golden Rules

**1. One brief at a time.**
Never paste two briefs in one message. Do brief 1, confirm it works, then do brief 2. Rushing creates compounding errors that are hard to untangle.

**2. Always QA in the browser before moving on.**
Open the file in Chrome. Resize to mobile (390px) and desktop (1440px). Compare against the mockups. If something looks wrong, fix it before proceeding.

**3. Describe problems visually, not technically.**
❌ "The CSS is broken"
✅ "The nav logo is too large — it should be 28px tall and vertically centered in the 52px nav bar"

❌ "The component isn't working"
✅ "When I click a filter chip it should turn black with white text, but nothing is happening"

**4. Never let Cursor touch tokens.css without permission.**
If Cursor suggests editing tokens.css, say "No — add what you need as a new custom property at the bottom of tokens.css, don't change existing values."

**5. Save and commit to GitHub after every successful brief.**
Don't build 3 briefs and then commit. If something breaks, you want to roll back one brief, not three.

---

## How to QA Each Brief

### Visual checks
- [ ] Does it match the mockup at desktop width (1440px)?
- [ ] Does it match the mockup at mobile width (390px)?
- [ ] Are the colors correct? (Compare to tokens.css)
- [ ] Is the typography right? (Light weight for headlines, correct sizes)
- [ ] Is spacing consistent? (8px grid — things should sit at 8/12/16/24/32px intervals)
- [ ] Are borders hairline (0.5px) not heavy (1px or 2px)?
- [ ] Does the red pin color (#E8281A) appear only on pins and CTAs?

### Interaction checks
- [ ] Do hover states work?
- [ ] Do click states work?
- [ ] Does anything break when you resize the window?
- [ ] Are there console errors? (Right-click → Inspect → Console tab — no red errors)

### Mobile-specific checks
- [ ] Is the bottom nav visible and correctly positioned?
- [ ] Are touch targets at least 44px tall?
- [ ] Does text remain readable (no horizontal scroll)?
- [ ] Does the logo switch from full wordmark to secondary mark?

---

## Common Cursor Feedback Phrases

When something is too big:
> "The [element] is too large. Reduce it to [size]px."

When spacing is off:
> "There's too much space between [A] and [B]. Reduce the gap to [X]px."

When colors are wrong:
> "The background should be #F8F8F6 (var(--color-surface)), not white."

When font weight is wrong:
> "The heading should be font-weight 300 (light), not bold."

When something doesn't respond to clicks:
> "Clicking [element] does nothing. It should [expected behavior]."

When mobile layout breaks:
> "On mobile (390px width), [describe what's wrong]. It should [describe correct behavior]."

When Cursor adds something you didn't ask for:
> "Remove [whatever it added]. I didn't ask for that. Only build exactly what's in the brief."

---

## Build Order (Do Not Skip Steps)

### Phase 1 — Foundation
1. Project setup + design tokens ← START HERE
2. Nav component (desktop + mobile)
3. Map pin component
4. Spot card component
5. Filter chips component

### Phase 2 — Core Pages
6. Homepage
7. Map / explore page
8. Place detail page
9. Submit a spot page

### Phase 3 — Accounts + Data
10. Airtable schema + API connection
11. Auth + user accounts (Memberstack)
12. Wifi password gate
13. Make automation flows

### Phase 4 — Revenue + Launch
14. For businesses page
15. City SEO pages (NYC + LA)
16. Pre-launch checklist

---

## Vercel Deployment

After Brief 1, set up Vercel:
1. Push your project to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. Deploy (Vercel auto-detects static HTML)
4. Your site will be live at a vercel.app URL immediately
5. Later: add wf-here.com as a custom domain in Vercel settings

After every brief, push to GitHub → Vercel auto-deploys. You always have a live preview URL to share or test on your phone.

---

## Environment Variables (for Phase 3)

Never put API keys in your code files. Store them in Vercel:
- Vercel Dashboard → Your Project → Settings → Environment Variables

Keys you'll need later:
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `MAPBOX_TOKEN`
- `MEMBERSTACK_PUBLIC_KEY`

---

## When You're Stuck

**Cursor gives you something completely wrong:**
Start a new Cursor conversation. Paste the context line. Paste the brief again. Sometimes a fresh context works better than trying to fix a bad output.

**Something worked then broke after the next brief:**
This means a new file overwrote something. Tell Cursor: "Brief [X] broke [Y]. Show me what changed and revert only that change."

**You don't know if it's right:**
Take a screenshot. Compare it side-by-side with the mockup HTML file. If the visual match is close, it's right. Don't chase pixel-perfect at this stage — get the structure right first.

**Cursor keeps ignoring your instructions:**
Break the brief into smaller pieces. Instead of pasting the whole brief, paste just one section at a time.
