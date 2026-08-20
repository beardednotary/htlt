# Pricing and tiers

Annual pricing, because the product revolves around the hunting year. A hunter who
renews in August is renewing for the season, not for a month of software.

| | Free | Outdoorsman | Family |
|---|---:|---:|---:|
| **Price** | $0 | **$19.99 / year** | **$34.99 / year** |
| People | 1 | 1 | 6 |
| Active licenses, tags, permits | 3 | Unlimited | Unlimited |
| Hunts, trips, journal entries | Unlimited | Unlimited | Unlimited |
| Harvest and catch history | ✓ | ✓ | ✓ |
| Deadline reminders | Basic | ✓ | ✓ |
| Photos | Limited | Unlimited | Unlimited |
| Weapons and gear | 3 | Unlimited | Unlimited |
| Multiple states or provinces | — | ✓ | ✓ |
| Draw applications, preference points | — | ✓ | ✓ |
| PDF season and lifetime reports | — | ✓ | ✓ |
| Cloud backup | — | ✓ | ✓ |
| Family trip readiness | — | — | ✓ |
| Shared family history | — | — | ✓ |

An earlier draft priced these at $14.99 and $29.99. They moved up because the buyer
is a multi-state hunter with real money already committed to tags and travel, and
because the Family tier solves a problem people currently pay consultants for.

## The rule that governs the whole structure

**The journal is never paywalled.** Not the entry count, not the harvests, not the
history. That is the data we want accumulating, and it is what makes the app hard
to leave in year three.

Paywall the paperwork that piles up once someone is serious — the fourth tag, the
second state, the person who is not you — because those appear exactly when the app
has already proved itself. Paywalling "log another fish" converts far worse and
costs us the retention data.

## What the code enforces today

`src/purchases/limits.ts` is the only place gates live. Currently three:

| Gate | Free allows | Unlocks with |
|---|---|---|
| Active licenses, tags, permits | 3 | Outdoorsman |
| People | 1 | Family |
| PDF export of a recap | — | Outdoorsman |

Expired credentials do not count against the limit. They are history, not clutter,
and charging someone because last year's tag is still on file would be indefensible.

Not yet enforced, listed above but unbuilt or ungated: photo limits, gear limits
(gear has no UI yet), multi-state, draw applications, and cloud backup (does not
exist). Reminders are currently unlimited on every tier.

## RevenueCat configuration

The dashboard must match these identifiers exactly — they are the contract with
`src/purchases/purchases.ts`:

- Entitlements: **`outdoorsman`**, **`family`**
- Both attached to annual products in App Store Connect
- Both in the **current** offering
- Public SDK key in `.env` as `EXPO_PUBLIC_REVENUECAT_IOS_KEY`

The paywall reads prices from RevenueCat rather than hardcoding them, so a price
change is a dashboard change and never a build.
