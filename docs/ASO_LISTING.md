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

Live today: **en-US** and **en-CA**. 1.1 adds es-MX and fr-CA.

| Locale | Why |
|---|---|
| **es-MX** (new) | The U.S. store also indexes Spanish (Mexico). Real Spanish name and subtitle for Spanish-language iPhones; English long-tail words (pheasant, bow, whitetail, muzzleloader) in its keyword field. Applyra measures no Spanish hunting search volume in the U.S., so treat this as a free bonus. |
| **en-CA** (live) | Canada has its own search behaviour, documented in `aso.md`. Indexed fields stay as they are; the description and promo text are rewritten to lead with the journal, say "already licensed", spell licence the Canadian way and label each plan. |
| **fr-CA** (new) | Canada also searches French (Canada). "permis de chasse" is traffic 25 / difficulty 25. Uses Québec terms (chevreuil, orignal, coupon, tirage, pourvoirie). Not checked by a native speaker; shipped in 1.1 by the owner's choice. Fix any term a Québécois speaker flags in `listings.mjs`. |

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

**1.1 icon:** one cream license card with a single bold olive antler printed on it, on
blaze orange. It keeps the warmth of 1.0 and drops the wallet, the card stack and the
shield. At 29 pt it is still a card with an antler on it, on light and on dark.

**Why orange leads.** Every download in the last 30 days came from App Store search,
and impression → page view sits at the floor of the healthy range, so the icon's job is
to win the glance in a results list. On a white results page the orange stands out where
the spruce version reads as one more dark square. Blaze orange says hunting to hunters
without camo, a flag or an animal head, and 30 downloads is no brand equity to protect.
This was a judgement call, not a measurement: competitor icons could not be fetched to
compare, and the traffic is too low for a Product Page Optimization test.

Both versions were generated from the prompt below, the orange one with the background
changed to `#F26B1D`. `assets/icon-source.png` is the 1254 px orange original;
`assets/icon.png` (1024, RGB, no alpha), `favicon.png` and the three Android adaptive
layers (background `#F66310`) are derived from it. The Android layers were previously
Expo's template defaults. The spruce version is kept as `assets/icon-alt-green.png`. The
in-app accent stays green: orange on white is about 3:1, too weak to mark a control as
tappable.

What did not work, so it is not tried again:

- Flat tags with a string and grommet read as retail price tags.
- A flat antler with an orange dot on one tine read as Rudolph's nose, and the dot became
  a stray speck at 58 px.
- A game-tag stub with date boxes read as a ticket. Nothing said hunting.
- Flat, minimal styling in general felt generic next to the warmth chosen for 1.0.

```text
App icon for an iPhone app that keeps a hunter's tags, licenses, season dates and
hunt journal organized. Square 1024x1024, full-bleed, no rounded corners, no text,
no letters, no numbers.

Subject: ONE hunting license card, nothing else. A cream, heavy-paper card, slightly
rotated (about 8 degrees), filling about 70% of the canvas. Printed large in the
centre of the card is a single bold antler mark in deep olive green, simple enough
to read at a glance. A thin border inset around the card edge, like an official
permit. The card's corners are slightly rounded.

Style: the warmth and material of a premium iOS icon, kept simple. Soft, even
lighting from above, a gentle drop shadow under the card so it lifts off the
background, a faint paper grain on the card. Clean shapes, no clutter, no fine
detail that would vanish at small sizes. Not flat clip art, not photorealistic.

Colour: deep spruce green background (#293B39). Card in warm cream (#EFE6D2).
Antler and border in deep olive (#3A3F2E). No other colours.

Avoid: wallets, leather, pouches, stacks of cards, more than one card, shields,
badges, trees, deer heads, full racks, guns, crosshairs, camouflage, flags, maps,
mountains, string, holes, price tags, text, numbers.
```

For a Product Page Optimization test later, the spruce version is the alternate: same
object, only the colour changes, which is the variable worth testing.

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
