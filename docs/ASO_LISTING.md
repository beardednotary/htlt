# App Store listing

The teardown of the 1.0 listing and what changes in 1.1. Exact copy for every
localization is in **`ASO_LOCALIZATIONS.md`**, generated and length-checked by
`node scripts/aso-localizations.mjs` from `scripts/aso/listings.mjs`. Edit the `.mjs`,
regenerate, paste from the generated file. Research behind the Canadian listing is in
`aso.md`.

Voice rules from `AGENTS.md` apply here too. No exclamation marks; the generator
refuses them.

## 1. Funnel (pending numbers)

The diagnosis needs App Store Connect numbers this repo cannot see: impressions, product
page views, first-time downloads and trial-to-paid for the last 30 days, plus Sources.
Until those arrive, here is what the store data alone says (Applyra, Nov 2026):

| Signal | Value | Reads as |
|---|---|---|
| Ratings in the U.S. | none | Every page view converts worse. Fixed in 1.1 with a review prompt people actually reach. |
| Screenshots | 6 of 10 | Four empty slots. Applyra counts this against appeal. |
| Days since update | 78 | Freshness is part of appeal. 1.1 resets it. |
| Localizations | 1 | One storefront in a two-language country, and no Spanish slot. |
| ASO health | 49 (coverage 90, targeting 37, appeal 36) | The text is fine; appeal is the hole. |
| "hunting tags" | rank 3 | Winnable, and won. |
| "hunting license" | rank 33 | Traffic 25, difficulty 15. Should climb with ratings. |
| "hunt regs" | unranked | Traffic 43, difficulty 14. The best ratio in the market, still unranked. |

What-if, from Applyra's own model: the same text with ten screenshots, a fresh update,
three localizations and a 4.8 rating from ten people takes the listing from **49 to 67**.
The rewrite of the text alone moves it **0**. This app's listing problem is appeal, not
keywords. Hunting search volume is small (most terms sit at traffic 8–43), so do not
expect ASO alone to move installs much. The review prompt and the screenshots are where
1.1 earns its keep.

Fill this in when the numbers arrive:

| Stage | Last 30 days | Rate | Rough healthy range |
|---|---|---|---|
| Impressions | | | grows with rank |
| Product page views | | | 5–10% of search impressions |
| First-time downloads | | | 25–40% of page views |
| Trial starts | | | |
| Paid (day 35) | | | 1–5% of downloads |

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

## 3. New localizations

| Locale | Why |
|---|---|
| **es-MX** | The U.S. store also indexes Spanish (Mexico). Real Spanish name and subtitle for Spanish-language iPhones; English long-tail words (pheasant, bow, whitetail, muzzleloader) in its keyword field. Applyra measures no Spanish hunting search volume in the U.S., so treat this as a free bonus. |
| **en-CA** | Canada has its own search behaviour, documented in `aso.md`. The listing leads with the journal and says "already licensed". |
| **fr-CA** | Canada also searches French (Canada). "permis de chasse" is traffic 25 / difficulty 25. **Draft: needs a Québécois speaker before it ships.** |

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

Two flat candidates are in `assets/icon-candidates/`, each one idea, the tag:

- **A, `tag.png`:** blaze-orange tag on spruce. Keeps the existing green family and the
  app's accent.
- **B, `tag-check.png`:** white tag with a check on blaze orange. Brightest in a search
  row full of greens, browns and camo. Keep it as the Product Page Optimization
  alternate.

`comparison.png` shows both at 60, 40 and 29 pt on light and dark next to the current
icon. Both are 1024×1024 RGB with no alpha. Blaze orange is the safety colour, not a
camo or flag motif, so it stays inside the voice rules. Pick one and the app icon, splash
icon and Android adaptive foreground get regenerated from its SVG. They have not been
swapped yet.

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
