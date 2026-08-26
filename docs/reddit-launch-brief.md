# Reddit launch brief — Hunting Tags & License Tracker

A context document for a conversation about launch posts. It carries the facts, the
constraints, and the things that are genuinely hard about posting this to Reddit. It is
not a draft post and does not contain one on purpose — the point is to argue about the
angle first.

Status: submitted to the App Store, in review as of 26 August 2026. iPhone only, 1.0.

---

## 1. The product in one paragraph

An iPhone app for the paperwork side of hunting: tags, licenses, permits, season dates,
regulation links, draw applications and preference points, plus a hunt journal and a
season recap. It is organized around **seasons** — one species, one place, one year
(*California Deer, 2026*) — and everything else hangs off that. Local-first: no account,
no server, works with no signal. Free tier is genuinely usable; two paid annual tiers.

The elevator version, in the app's own voice: *every tag, license and deadline for every
state you hunt, in one place.*

## 2. The one thing that makes it defensible on Reddit

**It refuses to be a regulations database.**

It never tells you a season is open. It never tells you what the bag limit is. It stores
the official agency link, your own notes, your PDF, and the date you last read it — and
points you back at the agency.

This matters more on Reddit than anywhere else, because the hunting subs contain people
who have been cited, or nearly cited, because an app or a website had a stale date. Every
competing product's headline feature is the thing this one deliberately will not do. That
is either the most interesting thing about the post or the thing that makes people say
"so it does nothing" — which is exactly the argument worth having before posting.

Related and equally load-bearing: **stored license images are reference copies, not valid
electronic licenses.** Say it before someone else does.

## 3. What it deliberately is not

Worth having in front of you, because Reddit will ask about every one of these and the
answer "not doing that" is stronger than a roadmap promise:

Maps · GPS tracking · waypoints · weather · solunar tables · draw-odds math ·
automatic regulation databases · social feeds · public profiles · trail cameras ·
AI species identification · ballistics · gun-safe inventory.

It is not a mapping app (that's onX/HuntStand/GoHunt territory and it is not competing
there), not a government license wallet, and not a regulations service.

## 4. Features, ordered by how much a hunter actually cares

1. **Draw deadlines you cannot get back.** Applications move through planning → applied →
   drawn → tag purchased. Preference points tracked year over year. Reminders at 30, 7
   and 1 days out.
2. **Trip readiness.** A trip checks every person going against *the trip's own dates* —
   so a license that lapses the day before the opener surfaces on a Tuesday instead of in
   a parking lot four hours from home.
3. **One license, many seasons.** A state hunting license points at deer, turkey, upland
   and waterfowl at once. Tags, permits and validations stay separate, because they are.
4. **Regulation links with a last-reviewed date**, and a nudge two weeks before the opener.
5. **A journal that keeps the blank days.** Days with nothing taken are recorded with the
   same weight as harvests. Photos included.
6. **Season recap** — days afield, harvests, states, methods, who you went with, firsts.
   Exportable as PDF or shareable as an image.
7. **All 50 states, federal stamps, and Canada**, using the wording each jurisdiction uses
   (an Ontario record says "Licence"; a California one says "License").

## 5. Pricing — handle this directly, not defensively

| | Free | Outdoorsman | Family |
|---|---:|---:|---:|
| Price | $0 | $19.99/yr | $34.99/yr |
| People | 1 | 1 | 6 |
| Active licenses/tags/permits | 3 | Unlimited | Unlimited |
| Journal, photos, harvests | Unlimited | Unlimited | Unlimited |
| Deadline reminders | ✓ | ✓ | ✓ |
| Multiple states | ✓ | ✓ | ✓ |
| Export your data | ✓ | ✓ | ✓ |
| Draws & preference points | — | ✓ | ✓ |
| PDF reports | — | ✓ | ✓ |
| Calendar sync | — | ✓ | ✓ |
| Trip readiness | — | — | ✓ |

Three decisions that are worth stating out loud in a post, because they pre-empt the
obvious cynicism:

- **The journal is never paywalled.** Not entries, not photos, not harvests, not history.
- **Reminders are free.** Someone missing a real deadline because they didn't pay is an
  actual harm, not a growth lever.
- **Export is free on every tier.** No hostage-taking.

Reddit is hostile to subscriptions and will find the price whatever you do. Leading with
it reads as confidence; burying it reads as exactly what they expect. Annual (not monthly)
is defensible here — the product revolves around the hunting year.

## 6. Privacy — a genuine asset, not a talking point

No account. No sign-up. No server. No ads. No analytics on your records. Everything is on
the device and rides along in the iPhone backup, and you can export all of it to a file
whenever you want. Works with no signal, which matters because that is where hunting
happens.

Location is used only if you choose to tag a harvest's coordinates. No background location.
No tracking. There are no waypoints in the data model at all — a deliberate architectural
boundary, not a setting.

## 7. Voice — applies to the posts too

The app's voice is **a knowledgeable peer. Not a brand, not a butler, never a coach.**
A launch post that breaks this will read as marketing even if the product doesn't.

- **State, don't sell.** No exclamation marks. Anywhere.
- **Be unsentimental about failure.** "3 of 7 hunts ended without a harvest" carries the
  same weight as the harvest count.
- **The user knows more than the app does.** Never assert a season is open.
- **No hunting-culture register.** No camo, no flags, no "get after it." The app earns
  trust by being useful, not by signalling membership. This is a big one for Reddit — the
  subs can smell a marketer cosplaying as a hunter from orbit.

## 8. The Reddit problem, stated honestly

**Nearly every hunting subreddit bans or heavily restricts self-promotion.** Some have
explicit no-app-promotion rules after being flooded. Assume the default is *no* and treat
any post as needing either mod permission or a genuinely non-promotional framing.

Before posting anywhere: read that specific sub's rules and sidebar, check whether it has
a self-promo or "Sunday/weekly" thread, and consider messaging the mods first. Mod
permission in advance converts a removal into a welcome. Do not skip this — a removal plus
a shadowban costs you the sub permanently, and there are not many of them.

Candidate communities, roughly by fit — **all rules to be verified individually**:

- **Species/method subs** — r/elkhunting, r/bowhunting, r/Waterfowl, r/turkeyhunting.
  Narrower but far more receptive if the angle matches their actual pain (draws for elk,
  stamps and validations for waterfowl).
- **r/Hunting** — biggest, strictest, highest risk. Probably not first.
- **Western/draw-focused communities** — the draw deadline story lands hardest here, and
  these are people who already spend real money on the problem.
- **State-specific subs** (r/Colorado, r/Arizona hunting threads and their dedicated
  hunting subs) — small, but the multi-state pain is native.
- **Builder subs** — r/SideProject, r/iOSProgramming, r/indiehackers. Self-promo is
  *welcome* here, but the audience is developers, not hunters. Different post entirely:
  the story is SwiftUI-through-Expo, local-first, no accounts. Low conversion, zero risk,
  useful for feedback.

## 9. Angles worth arguing about

Each of these is a genuinely different post, and they are not compatible with each other.

1. **The refusal.** "I built a hunting app that deliberately doesn't tell you the
   regulations." Leads with the most contrarian true thing. Risk: reads as a gimmick.
2. **The parking lot.** Open on the specific failure — someone drives four hours and a
   license lapsed two days ago. Concrete, universally recognized, product falls out of it
   naturally. Probably the strongest for hunting subs.
3. **The blank days.** "Most days you don't kill anything, and every hunting app pretends
   otherwise." The most emotionally distinctive thing about the product and the least
   commercial. Best fit for a journal-leaning audience.
4. **The draw deadline.** Sharpest, most urgent, most obviously worth money. Seasonal —
   really a January–April post, not an August one.
5. **The builder story.** For the dev subs only.
6. **Ask, don't tell.** Post a question about how people currently track this, participate
   honestly, mention the app only if asked. Slowest, safest, and the only one that works
   in a sub that bans promotion.

## 10. Timing

It is late August. Archery deer opens across a lot of the country within days, and rifle
seasons follow through the fall. The *opener* framing is live right now; the *draw
deadline* framing is not and won't be until January. Whatever gets posted should probably
use the fact that people are packing this week.

## 11. The gap only you can fill

**Why did you build this?** Nothing in this document answers that, and on Reddit it is the
single highest-leverage fact. A real story — the tag you nearly lost, the family member
whose license you keep track of, the four-hour drive that went wrong, the reason "Jim,
hunting since 1963" is in the demo data — is worth more than every feature above combined.

Related and worth deciding before drafting anything:

- How much do you hunt, where, and how long have you been doing it? Credibility on these
  subs is not optional and is checked hard.
- Are you a hunter who codes, or a developer who hunts? Both are fine; being vague is not.
- Is the DahVio studio connection something you lead with or leave out?
- Do you want feedback, downloads, or both? They pull toward different posts.

## 12. Facts to keep straight

- **iPhone only.** No iPad app, no Android. It runs on iPad in compatibility mode.
- **In review**, not live. Do not post until it is approved and the link works.
- Built with Expo and real SwiftUI components — genuinely native controls, not a
  web wrapper. Relevant only in dev subs.
- U.S. and Canada, all 50 states and the provinces. No French localization yet.
- No cloud sync, and that is a deliberate choice, not a missing feature. Data lives on the
  device and exports to a file.
