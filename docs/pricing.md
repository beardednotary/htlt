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
| Deadline reminders | ✓ | ✓ | ✓ |
| Photos | Unlimited | Unlimited | Unlimited |
| Multiple states or provinces | ✓ | ✓ | ✓ |
| Draw applications, preference points | — | ✓ | ✓ |
| PDF season and lifetime reports | — | ✓ | ✓ |
| Export your data | ✓ | ✓ | ✓ |
| Calendar sync | — | ✓ | ✓ |
| Family trip readiness | — | — | ✓ |
| Shared family history | — | — | ✓ |

Four things the original research put behind a paywall are deliberately free now:

- **Reminders.** The failure mode is someone missing a real deadline because they
  did not pay. That is a one-star review and an actual harm, and free reminders
  demonstrate the product better than any screenshot.
- **Photos.** They are part of the log, and the log is never paywalled. They also
  feed Season Recap, which is what makes the app hard to leave.
- **Multiple states.** Redundant: a multi-state hunter passes three active
  credentials on their second state, so the credential limit already catches them.
  An explicit gate would make Free feel broken rather than limited.
- **Cloud backup.** Replaced with **Export your data**, free on every tier. The app
  is local-first and its records already ride along in the user's iPhone backup;
  a real sync service means accounts, a server, conflict resolution and a privacy
  story, and it is not worth that before there are customers asking for it.

Gear limits are gone from the table because gear is not in v1 at all.

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
| Draw applications and preference points | — | Outdoorsman |
| PDF export of a recap | — | Outdoorsman |
| People | 1 | Family |

Expired credentials do not count against the limit. They are history, not clutter,
and charging someone because last year's tag is still on file would be indefensible.

Still to build before either paid tier is honest:

- **Trips and trip readiness.** Family's headline value — who is ready and who is
  not — needs trips, which do not exist yet. Participants currently attach to
  seasons. Until that ships, Family delivers little more than "add another person"
  and is not worth $34.99.
- **Calendar sync.** Listed on both paid tiers, needs `expo-calendar` and a build.
  One-way only, into a calendar the app creates, rebuilt from records the same way
  reminders are.
- **Export your data.** Free on every tier, and the honest answer to "am I going
  to lose all this".

## RevenueCat configuration

The dashboard must match these identifiers exactly — they are the contract with
`src/purchases/purchases.ts`:

- Entitlements: **`outdoorsman`**, **`family`**
- Both attached to annual products in App Store Connect
- Both in the **current** offering
- Public SDK key in `.env` as `EXPO_PUBLIC_REVENUECAT_IOS_KEY`

The paywall reads prices from RevenueCat rather than hardcoding them, so a price
change is a dashboard change and never a build.
