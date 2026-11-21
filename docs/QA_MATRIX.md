# Device QA matrix — 1.1

Everything here needs a real build on a real iPhone. Expo Go cannot load the native
modules this app uses (RevenueCat, StoreKit review, SQLite, Calendar), and the cloud
session that wrote 1.1 had neither a simulator nor a device. Unit tests cover the logic
(`npm test`); this covers what only the device can prove.

Build: `eas build --profile preview --platform ios`, then TestFlight. Version is 1.1.0
because 1.1 adds a native module (expo-store-review); with `runtimeVersion: appVersion`
that keeps OTA updates for 1.0 binaries from reaching code that needs it.

Mark each cell ✓, ✗ (with a note) or n/a.

## Accounts

| ID | Setup |
|---|---|
| **N** | Fresh install, sandbox Apple Account that has never subscribed (trial-eligible) |
| **U** | Sandbox account that has already used the trial |
| **P** | Sandbox account with an active Outdoorsman subscription |
| **F** | Sandbox account with an active Family subscription |

Grandfathered and previously purchased phones already have Pro and will hide the free
experience; test the paywall on N and U, never on your own phone.

## Paywall and purchases

| # | Check | N | U | P | F |
|---|---|---|---|---|---|
| 1 | Settings → See What's Included opens the Outdoorsman paywall | | | n/a | n/a |
| 2 | Primary button reads "Try Outdoorsman Free" / "7 days free, then $19.99 a year" | | n/a | n/a | n/a |
| 3 | Trial terms sentence appears under the buttons and names the real price | | n/a | n/a | n/a |
| 4 | With the trial used, the button reads "Outdoorsman" / "$19.99 a year", with no "free" anywhere | n/a | | n/a | n/a |
| 5 | Feature list has no reminders, states or journal; the Free line is shown | | | | |
| 6 | Airplane mode, open the paywall: Try Again appears; reconnect, tap it, prices load | | | | |
| 7 | Buy Outdoorsman: sheet closes, Settings shows Outdoorsman, draws unlock | | | n/a | n/a |
| 8 | Family paywall (add a 2nd person) shows only the Family product | | | | n/a |
| 9 | Restore on an account with nothing: "Nothing to restore" message, sheet stays open | | | n/a | n/a |
| 10 | Restore on P/F: sheet closes, tier correct | n/a | n/a | | |
| 11 | Settings → Restore Purchases shows an alert with the outcome | | | | |
| 12 | Let the sandbox trial lapse (renewal is accelerated in sandbox) with the app backgrounded; bring it forward: tier drops to Free without a relaunch | | n/a | n/a | n/a |
| 13 | Cancel in Settings → Apple Account, return to the app: tier updates on foreground | n/a | n/a | | |
| 14 | Terms of Use and Privacy Policy links open | | | | |

## Gates (free tier)

| # | Check | ✓ |
|---|---|---|
| 15 | New License or Tag sheet footer shows "0 of 3 in use", then 1, then 2 |  |
| 16 | At 3 active, footer says all 3 are in use; Add opens the paywall with the reason |  |
| 17 | An expired credential does not count toward the 3 |  |
| 18 | Add Draw opens the Outdoorsman paywall; an existing draw stays visible |  |
| 19 | Recap → Share as PDF / Image opens the paywall |  |
| 20 | Calendar toggle opens the paywall |  |
| 21 | Downgrade from P: everything entered is still there; nothing deleted |  |

## Review prompt

| # | Check | ✓ |
|---|---|---|
| 22 | In a **development build** (Apple always shows the prompt there; TestFlight never does; the App Store throttles it): fresh install, add a license, add dates, log a day. The system rating prompt appears about 0.7 s after the third sheet closes |  |
| 23 | Further saves the same day do not prompt again |  |
| 24 | Hitting a paywall does not count as an accomplishment |  |

## Regional defaults

| # | Check | ✓ |
|---|---|---|
| 25 | Region set to United States, fresh install: New Season opens on California |  |
| 26 | Region set to Canada, fresh install: New Season opens on Ontario |  |
| 27 | After adding a Colorado season, the next New Season opens on Colorado |  |
| 28 | Ontario season + trip: readiness says "No licence or tag on file" |  |
| 29 | Colorado season + trip: readiness says "No license or tag on file" |  |

## Core flow (unchanged, regression)

| # | Check | ✓ |
|---|---|---|
| 30 | Welcome shows once on first launch |  |
| 31 | Add season → add dates → Today shows the opener countdown |  |
| 32 | Reminders toggle asks for permission once and shows the scheduled count |  |
| 33 | Regulation link opens in the in-app browser; swipe → Reviewed updates the line |  |
| 34 | Log a hunt with no harvest; it appears in the journal and the recap counts it |  |
| 35 | Export, delete the app, reinstall, Import: everything is back |  |
| 36 | No white flash behind navigation bar buttons on tab switches (AGENTS.md) |  |

## App Store Connect

- [ ] Paste metadata for en-US and en-CA (description and promo only; its name, subtitle and keywords stay) from `ASO_LOCALIZATIONS.md`; add es-MX
- [ ] fr-CA only after a Québécois speaker has checked it
- [ ] Upload iPhone 6.9" screenshots in story order (`scripts/screenshots`)
- [ ] Confirm both annual products have the 7-day free trial introductory offer
- [ ] IAP display names read "Outdoorsman" and "Family" (the paywall no longer shows the
      product title, but the purchase sheet does)
- [ ] App Privacy unchanged: on-device data only; RevenueCat purchase data as already declared
- [ ] Review notes: the trial, and that the review prompt uses the system API
