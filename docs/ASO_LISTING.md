# App Store listing

The teardown of the 1.0 listing and what changes in 1.1. Exact copy for every
localization is in **`ASO_LOCALIZATIONS.md`**, generated and length-checked by
`node scripts/aso-localizations.mjs` from `scripts/aso/listings.mjs`. Edit the `.mjs`,
regenerate, paste from the generated file. Research behind the Canadian listing is in
`aso.md`.

Voice rules from `AGENTS.md` apply here too. No exclamation marks; the generator
refuses them.

## 1. Funnel

App Store Connect, Sep 1 – Nov 19 2026 (live since Sep 1). Downloads are App Store
Connect's total downloads by source.

| Period | Impressions | Page views | Downloads | Of which search | Trials | Paid |
|---|---:|---:|---:|---:|---:|---:|
| Sep 1 – Oct 7 (launch) | 233 | 33 | 8 | 2 (4 from the web) | 1 (Sep 4) | 1 (Sep 11, $17) |
| Oct 8 – Oct 14 (spike) | 692 | 54 | 3 | 2 | 0 | 0 |
| **Oct 21 – Nov 19 (last 30 days)** | **964** | **50** | **15** | **15** | **0** | **0** |
| All | 2,051 | 141 | 30 | 21 | 1 | 1 |

Last 30 days, stage by stage:

| Stage | Rate | Rough healthy range | Reads as |
|---|---:|---|---|
| Impression → page view | 5.2% | 5–10% from search | Bottom of the range. The icon, name and first three screenshots decide this. |
| Impression → download | 1.6% | | Most downloads come straight from the search result, without a page view. |
| Download → trial | 0 of 22 since Oct 8 | 1–5% paid | Too few downloads to tell. At a healthy 3%, 22 downloads predicts 0.7 subscribers, so zero is noise, not a finding. |

Weekly downloads since Oct 15: 4, 1, 2, 4, 8, all from search. The rise lines up with
November rifle openers, which is the seasonality this app should expect.

**Diagnosis: traffic, not conversion.** Fifteen downloads a month cannot produce revenue
at any conversion rate. At a healthy 5% paid, that is under one subscriber a month. Every
lever that matters is upstream of the paywall:

1. **Search is the whole business right now.** Every download in the last 30 days came
   from App Store search. Impressions grew 5× after Oct 8 and stayed up, about 32 a day
   against 6 before, as the app started ranking ("hunting tags" #3). Ranking is the main
   lever and ratings drive it, so the 1.1 review prompt is the most important change in
   this release.
2. **Tap-through is at the floor of the range.** The icon and first three screenshots
   (§6, §7) are the next lever. Test an alternate icon with Product Page Optimization once
   there is enough traffic to read it.
3. **The Oct 9 spike did not convert**: 231 impressions and 48 page views, 2 downloads,
   none from a web referrer. Whatever sent those visitors, the page lost them. A product
   page with no ratings and six screenshots is the likely cause. Check App Analytics →
   Sources for page views on Oct 9 before planning another post.
4. **Web and Reddit have not been a channel.** Five web-referrer downloads in total, four
   of them in launch week.
5. **Timing.** Draws are the main paid feature, and Western draw applications open
   January to April. Ship 1.1 before then so the ratings, the trial button and the honest
   paywall are live when the people who need draws arrive. Switch the promo text to the
   draw-season version (§8) in the first week of January.

The one paying customer so far started a trial on Sep 4 and was charged on Sep 11,
exactly seven days later, so the trial-to-paid path works end to end in production. With
one data point, that is all it shows.

## 2. Metadata (U.S.)

| Field | 1.0 (live) | 1.1 |
|---|---|---|
| Name | Hunting Tags & License Tracker | unchanged |
| Subtitle | Hunt Regs, Seasons & Journal | Hunt Regs & Season Planner |
| Keywords | regulations,fishing,elk,duck,turkey,deer,moose,bear,permit,draw,preference,points,calendar,harvest | elk,deer,turkey,duck,moose,bear,draw,points,permit,journal,harvest,calendar,reminder,waterfowl,log |

The reasoning per field is in `ASO_LOCALIZATIONS.md`. In short:

- **Name stays.** It ranks for its own phrase, "hunting tags" and "hunting license".
- **Subtitle aims at "hunting season".** Traffic 41, and the top 20 is mostly games with
  one real utility in the top three. It keeps "hunt regs" and forms "hunting planner".
- **"journal" moves to the keyword field**, where it still pairs with "hunt" and
  "hunting" across fields. "log" adds "hunting log" (difficulty 11).
- **Dropped:** "regulations" and "preference" (unsearched on their own), "fishing"
  (difficulty 88, owned by state agency apps).

## 3. Localizations

Live today: **en-US** and **en-CA**. 1.1 adds es-MX and, once checked, fr-CA.

| Locale | Why |
|---|---|
| **es-MX** (new) | The U.S. store also indexes Spanish (Mexico). Real Spanish name and subtitle for Spanish-language iPhones; English long-tail words (pheasant, bow, whitetail, muzzleloader) in its keyword field. Applyra measures no Spanish hunting search volume in the U.S., so treat this as a free bonus. |
| **en-CA** (live) | Canada has its own search behaviour, documented in `aso.md`. Indexed fields stay as they are; the description and promo text are rewritten to lead with the journal, say "already licensed", spell licence the Canadian way and label each plan. |
| **fr-CA** (new, draft) | Canada also searches French (Canada). "permis de chasse" is traffic 25 / difficulty 25. **Draft: needs a Québécois speaker before it ships.** |

All three say plainly that the app's interface is in English, where relevant, and name
the tabs by their English labels.

## 4. Description: what was wrong with 1.0

Checked line by line against the code.

| 1.0 said | The code | 1.1 |
|---|---|---|
| Hard line breaks mid-sentence ("deadline and⏎expiry") | Pasted from wrapped Markdown | Unwrapped; paste from the generated file only |
| Paid features unlabelled (guideline 2.3.2) | Draws, calendar, PDF/image recap and more than one person are gated | Grouped under FREE ON EVERY PLAN / OUTDOORSMAN / FAMILY |
| "Outdoorsman ... adds ... export" | Data export is free; recap export is paid | "PDF or a shareable image" |
| "Family adds ... trip readiness" | Trips are not gated; readiness for more than one person needs Family | "Trip readiness for everyone going" |
| No mention of the trial | 7-day trial on both annual products | Stated, for new subscribers |
| Dropped "export all of it to a file" | Export is free and works | Restored |

## 5. In-app: what was wrong with the paywall

| Found | Pattern | Fix in 1.1 |
|---|---|---|
| Outdoorsman sold "Reminders" and "Every state and province" | Selling what Free already has | Lists only what the tier adds; says what Free keeps |
| No trial shown anywhere | Trial configured, never mentioned | "Try Outdoorsman Free · 7 days free, then $19.99 a year", eligible accounts only, with renewal terms |
| Restore dismissed the sheet whatever it found | Silent outcome | Says "Nothing to restore" and stays open |
| Settings → Restore Purchases gave no feedback | Same | Alert with the outcome |
| Prices that failed to load were a dead end | No fallback | Try Again |
| Customer-info listener attached before RevenueCat was configured | Silently dropped listener | Attach after configure; refresh on every return to foreground |
| The license/tag paywall appeared on Save, after typing | Hidden limit | "2 of 3 in use" shown on the form |
| No review prompt at all | Nothing to rate | Asks after the third save (license, dates, draw, journal entry), at most every 120 days |

## 6. Icon

The 1.0 icon combines four ideas: a leather wallet, a stack of cards, antlers and a
shield with a tree. It is textured and dark-on-dark, and at 29 pt it is a brown smudge,
especially in dark mode. "Wallet" is also the one thing the product says it is not.

Two flat tag candidates were tried and rejected: any tag with a string loop and a
grommet reads as a retail price tag. The brief below is for an image generator.

**What it has to do**

- One idea, readable at 29 pt on light and dark.
- Say "hunting" and "the paperwork side of it" without a wallet, a price tag, a gun or
  camo.
- Stand apart from the row it sits in: state agency apps (seals, fish and deer
  silhouettes), map apps (topo lines) and journals (deer heads).

**Prompt**

```text
App icon for an iPhone app that keeps a hunter's tags, licenses, season dates and
hunt journal organized. Square 1024x1024, full-bleed, no rounded corners, no text,
no letters, no numbers.

Subject: a single bold shed antler (one antler, not a pair), drawn as a clean flat
graphic mark with 4 to 5 tines. Exactly one tine ends in a small solid blaze-orange
circle, like a marked date on a calendar. That orange dot is the only accent.

Style: flat vector, solid fills, no outlines, no gradients, no texture, no shadows,
no 3D, no photorealism. Modern Apple-style icon, geometric and calm, closer to an
Apple system app icon than a sporting-goods logo.

Colour: deep spruce green background (#1E3A2F). Antler in warm bone white
(#EDE8DC). One blaze-orange dot (#F26B1D). Nothing else.

Composition: antler centred, filling about 60% of the canvas, slight diagonal lean,
generous empty space around it. Must stay recognisable shrunk to 58 pixels.

Avoid: price tags, string, grommets, wallets, cards, deer heads, full racks, guns,
crosshairs, camouflage, flags, maps, topo lines, badges, shields, mountains, sunsets,
text.
```

**Variants to generate alongside it**

- Same prompt, background `#F26B1D` and the dot spruce: the bright alternate for Product
  Page Optimization.
- Replace the subject with: *"a single vertical game tag seen straight on, a narrow
  rectangle with a row of small date boxes along one edge, one box punched out as a
  solid orange square; no string, no hole, no loop"*. A real state game tag is notched on
  the date of harvest, which is the opposite of a shop tag.

**Before choosing**

Shrink each result to 58 px on white and on black. Reject anything that turns into a
blob or needs the orange dot explained. For iOS 26, keep the mark and the background as
separate layers (ask for the mark alone on a transparent background too) so it can go
into Icon Composer. Then the app icon, the splash icon and the Android adaptive
foreground can be regenerated from it.

## 7. Screenshots

iPhone only (`supportsTablet: false`), so 6.9" at **1290×2796** is the only required set;
there is no iPad set to make. Eight frames, built from real UI pulled out of simulator
captures. The story is in `scripts/screenshots/frames.mjs`:

1. **Never miss a deadline**: Today's Needs Attention and Coming Up
2. **Every tag, one season**: a season's dates, licenses and regulation link
3. **Draws and points, tracked**: the draw section
4. **Trip readiness, checked**
5. **Your season, one page**: the recap (the one full screen)
6. **The blank days count**: the journal
7. **Everyone's tags, together**: Family
8. **No account. No server**: Your Data

The first three show in search results and carry the pitch on their own.

To make them: in the iPhone 17 Pro Max simulator, Settings → Development → Load Demo
Data, save captures named as in `frames.mjs` to `screenshots/raw/`, then run
`node scripts/screenshots/compose.cjs` on a Mac. The crop rectangles are first guesses
for a 1320×2868 capture; adjust them once against real captures. Upload the frames in
file order. `screenshots/` is gitignored.

## 8. Promo text calendar

Promo text changes without review. It is in `ASO_LOCALIZATIONS.md` for every locale,
with these seasonal swaps for the U.S.:

- **Draw season, Jan–Apr:** "Application deadlines you cannot get back. Track draws,
  preference points, tags and licenses across every state you hunt, with reminders 30, 7
  and 1 days out." (Draws are Outdoorsman, and the trial covers someone deciding in
  March.)
- **Opener season, Aug–Oct:** "Opening day is closer than you think. Season dates, tags,
  licenses and hunt regs in one place, with a reminder a week out and a nudge to reread
  the regulations."
