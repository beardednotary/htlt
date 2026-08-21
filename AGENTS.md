# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Hunting Tags & License Tracker

**Hunting Tags & License Tracker** — *Hunt Regs, Seasons & Journal*

The personal-admin app for hunters: tags, licenses, regulation links, season dates, draws,
methods of take, hunts and family history. It is **not** a map/scouting app, not another hunt
journal, not a regulations database, and not a government license wallet.

Stack: Expo SDK 57 + TypeScript, Expo Router native stack, `NativeTabs` for primary navigation,
real SwiftUI components via `@expo/ui/swift-ui`.

## Design rules

These are not preferences. Every screen ships against them.

1. iOS first.
2. System font only.
3. SF Symbols only for UI icons.
4. Native Stack everywhere.
5. NativeTabs for primary navigation.
6. Native sheets, not handmade modals.
7. SwiftUI/Expo UI for forms and controls wherever practical.
8. System semantic colors and Dynamic Type.
9. No gradients.
10. No floating action button.
11. No custom toggle switches/pickers/date controls.
12. No card around something merely because it's information.
13. Use whitespace, separators and typography for hierarchy.
14. Brand primarily through icon, photography, accent color and voice.
15. Every screen must survive: "Would Apple build it this way?"

No NativeWind, Tamagui, Gluestack or similar for the main UI — we want as little abstraction
as possible between this code and iOS.

**The one exception:** the Season Recap / lifetime-history screens and harvest detail pages are
ours to design. App chrome stays Apple; the memories belong to the product.

Adding is a top-right `+` with a native menu, contextual to the tab. Never a FAB.

## Voice

A knowledgeable peer. Not a brand, not a butler, and never a coach.

- **State, do not sell.** No exclamation marks anywhere in the app. "Nothing to check
  yet", never "You're all set!"
- **Be unsentimental about failure.** "3 of 7 hunts ended without a harvest" carries the
  same weight as the harvest count. An app that only counts successes is a scoreboard;
  counting the blank days is what makes it a record — and what makes it trustworthy
  when it does report something good.
- **The user knows more than the app does.** We never assert that a season is open. We
  report what they entered and point them at the agency.
- **Plain, not clipped.** "The day still happened" over "activities are retained".
- **Warmer on the memory surfaces** — Season Recap, harvest detail — but never sappy.
  Weight, not sentiment: the difference between "Ethan's first trout" and "What a
  special day!"
- **No hunting-culture register.** No camo, no flags, no "get after it". Utility first;
  the app earns trust by being useful, not by signalling membership.

## Spelling

Fixed UI copy — empty states, section footers, settings, alerts — uses **US spelling**:
`license`, not `licence`. The U.S. is the primary market.

The only place the Canadian spelling appears is `src/data/vocabulary.ts`, which picks the
word from the record's own jurisdiction: an Ontario season reads "Licence", a California one
reads "License". That is per-record labelling, not localization of the app's chrome. Do not
mix the two — a screen that says "Licence" in a heading and "licenses" in its footer is a
bug, not a nuance.

## Structure

Four native tabs — **Today · Seasons · Journal · Family**. Settings lives behind a person button
in the top-right, not a fifth tab. The app is organized around **Seasons**; everything else hangs
off them.

The data model is locked — see `src/model/types.ts`. Read it before adding a record type.

## Pricing

Free, Outdoorsman ($19.99/yr) and Family ($34.99/yr) — see `docs/pricing.md`. Gates live
only in `src/purchases/limits.ts`. **The journal is never paywalled on any tier.**

## Product boundaries

- We never become the source of truth for regulations. Store the official agency link, the user's
  notes and PDF, and when they last reviewed it. Always tell them to verify with the agency.
- Uploaded license images are reference copies, not valid electronic licenses.
- Out of scope: maps, GPS tracking, weather, solunar, draw-odds math, automatic regulation
  databases, social feeds, public profiles, trail cameras, AI identification, ballistics,
  gun-safe inventory.
