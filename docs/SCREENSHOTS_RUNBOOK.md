# Screenshots runbook — 1.1

For a Claude Code session on the Mac, in this repo, with Xcode installed. It produces
the eight iPhone 6.9" screenshots (1290×2796) that Phase 4 of `ASC_RUNBOOK.md`
uploads. The story, headlines and crops live in `scripts/screenshots/frames.mjs`; the
reasoning is in `ASO_LISTING.md` §7.

## Instructions for Claude Code

- You run the commands and edit `frames.mjs`. The human taps through the simulator; at
  each capture step, tell them exactly which screen to open, wait for "ready", then
  capture.
- Look at every capture before using it (read the PNG). Reject any with an error toast, a
  keyboard, a half-finished scroll, or a status bar that is not 9:41 with full battery.
- Do not commit anything under `screenshots/`; it is gitignored on purpose.
- Finish with the review checklist at the end, filled in, and the eight files listed.

## 1. Simulator

```bash
npm ci
npx eas-cli env:pull development --path .env.local --non-interactive
```

The second command writes `EXPO_PUBLIC_REVENUECAT_IOS_KEY` to `.env.local` (gitignored).
Without it the app logs an error that shows up as a toast at the bottom of every screen.

Use the largest current iPhone simulator; its screenshots must be 1320 pixels wide (the
iPhone 17 Pro Max is 1320×2868). If it is not installed, create it:

```bash
xcrun simctl create "iPhone 17 Pro Max" com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro-Max
```

If the only 6.9" simulator available is wider or narrower, set `CAPTURE` in `frames.mjs`
to its size and scale every crop by the width ratio.

```bash
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8   # CocoaPods fails on Homebrew Ruby without it
npx expo run:ios --device "iPhone 17 Pro Max"
```

This is a development build, which is what makes Settings → Development → Load Demo
Data available. If `expo run:ios` rewrites the `ios`/`android` scripts in `package.json`,
do not commit that.

Then fix the simulator's appearance:

```bash
xcrun simctl ui booted appearance light
xcrun simctl status_bar booted override --time "9:41" --batteryState charged --batteryLevel 100 --cellularMode active --cellularBars 4 --wifiBars 3
```

## 2. Data

1. Human: Today → person icon → Settings → Development → **Load Demo Data**.
2. Cover photo for the recap. The demo household has no photos, and frame 5 is the one
   full screen, so it needs a real one: a harvest or a hunting landscape the human took,
   landscape orientation. Never a stock photo.

   ```bash
   xcrun simctl addmedia booted /path/to/photo.jpg
   ```

   Human: Seasons → chart icon (top left) → **Choose Cover Photo** → pick it.

The demo dates are relative to today, so the household always reads the same: Jim's
license expires 16 days out, two days before Opening Weekend ends (trip shows 1 of 3 not
ready); the Arizona elk draw is due in 6 days with 4 points; the rifle opener is 18 days
out; six hunts this season, one harvest.

## 3. Captures

Capture each with:

```bash
mkdir -p screenshots/raw
xcrun simctl io booted screenshot screenshots/raw/<file>
```

| File | Where the human goes | What must be visible |
|---|---|---|
| `today.png` | Today tab, scrolled to the top | Needs Attention (Jim's license, the deer tags) and Coming Up (draw due in 6 days, rifle opener, Opening Weekend) |
| `season.png` | Seasons → Upcoming → **California Deer** | Dates, Licenses & Tags, and the Regulations row reading "Reviewed 9 days ago" |
| `season-draw.png` | Seasons → Upcoming → **Arizona Elk**, scrolled so the Draw section is fully on screen | Applied, deadline, results date, Preference points 4 |
| `trip.png` | Family → **Opening Weekend** | 1 of 3 not ready, and Jim's line saying his license expires before the trip ends |
| `recap.png` | Seasons → chart icon | The cover photo and the first row of stats |
| `journal.png` | Journal tab | Several entries, including ones marked No harvest |
| `family.png` | Family tab | Ray, Ethan and Jim with their statuses |
| `settings.png` | Today → person icon, scrolled to **Your Data** | Export and Import, with the footer |

## 4. Crops

The rectangles in `frames.mjs` are first guesses. For each frame:

1. Read the capture and find the top and bottom pixel rows of each section named in that
   frame's `cards`. Include the section header and the rounded group, and stop before the
   next section's header. Keep `x: 0, w: 1320`.
2. Update `y` and `h` in `frames.mjs`.
3. Render: `node scripts/screenshots/compose.cjs` (or `... compose.cjs 03` for one frame).
   Drawing is done by `scripts/screenshots/render.swift` through `xcrun swift`; nothing
   to install.
4. Read the output and check the card shows exactly that section: nothing clipped and no
   half rows.

The stacked cards for one frame should fill roughly the top two thirds of the frame
below the headline. If they are much shorter, include one more row of context in the
crop rather than leaving an empty orange field.

## 5. Review checklist

Shrink each output to 230 px wide (the size in search results) and check:

| # | Check | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Headline readable at 230 px | | | | | | | | |
| 2 | The card shows the claim in the headline | | | | | | | | |
| 3 | No clipped or half rows | | | | | | | | |
| 4 | No toast, keyboard or dev UI | | | | | | | | |
| 5 | Plan label on 03, 04 and 07 only | | | | | | | | |
| 6 | 1290×2796, PNG | | | | | | | | |

Frames 01–03 must work on their own: they are the only three shown in search results.

## 6. Finish

```bash
xcrun simctl status_bar booted clear
```

Hand the eight files in `screenshots/out/` (01 to 08, in that order) to Phase 4 of
`ASC_RUNBOOK.md`.
