/**
 * The eight App Store frames: their story, headlines and where each card is cut from.
 *
 * Read by compose.cjs. The reasoning is in docs/ASO_LISTING.md §7 and the capture
 * steps in docs/SCREENSHOTS_RUNBOOK.md. Crops are in pixels of a 1320×2868 capture
 * (iPhone 17 Pro Max). Each `cards` entry is one section of the screen: its header
 * and its rounded group, and nothing of the next section. A card can name its own
 * `source` capture, for a section that only fits on screen once scrolled.
 * `xcrun swift scripts/screenshots/bands.swift <capture>` prints where each group is.
 *
 * Voice rules from AGENTS.md apply: no exclamation marks, US spelling, state it.
 */

export const CANVAS = { width: 1290, height: 2796 };
export const CAPTURE = { width: 1320, height: 2868 };

export const STYLE = {
  /** Blaze orange, the icon's background. */
  background: '#F26B1D',
  /** Near-black reads at 230 px on orange; white on this orange is about 3:1. */
  ink: '#1B130D',
  subInk: '#3A2414',
  planBackground: '#1B130D',
  planInk: '#F7EBDD',
};

export const FRAMES = [
  {
    out: '01-deadlines.png',
    source: 'today.png',
    headline: 'Never miss\na deadline',
    sub: 'Openers, expiries and draws, ahead of time.',
    cards: [
      // The first three rows: an expiring license and the trip that is not ready.
      { name: 'Needs Attention', x: 0, y: 510, w: 1320, h: 740 },
      { name: 'Coming Up', source: 'today-coming.png', x: 0, y: 1100, w: 1320, h: 1190 },
    ],
  },
  {
    out: '02-season.png',
    source: 'season.png',
    headline: 'Every tag,\none season',
    sub: 'Dates, licenses and the official regulation link.',
    cards: [
      { name: 'Dates', x: 0, y: 765, w: 1320, h: 575 },
      // Every holder's license and tag; stops before the Add row.
      { name: 'Licenses & Tags', x: 0, y: 1400, w: 1320, h: 1145 },
      // The agency link and "Reviewed 9 days ago"; stops before the Add row.
      { name: 'Regulations', source: 'season-regs.png', x: 0, y: 985, w: 1320, h: 400 },
    ],
  },
  {
    out: '03-draws.png',
    source: 'season-draw.png',
    plan: 'Outdoorsman',
    headline: 'Draws and points,\ntracked',
    sub: 'Deadlines, results dates and preference points.',
    cards: [
      { name: 'Season', x: 0, y: 420, w: 1320, h: 290 },
      // Status, deadline, results date and points; stops before Edit Draw.
      { name: 'Draw', x: 0, y: 1735, w: 1320, h: 713 },
      // And the reminder it produces on Today.
      { name: 'Coming Up', source: 'today-coming.png', x: 0, y: 1100, w: 1320, h: 312 },
    ],
  },
  {
    out: '04-trip.png',
    source: 'trip.png',
    plan: 'Family',
    headline: 'Trip readiness,\nchecked',
    sub: 'Every license checked against the trip’s own dates.',
    cards: [
      { name: 'Trip', x: 0, y: 430, w: 1320, h: 355 },
      // Who is ready, Jim's lapsing license, and the footer that explains why.
      { name: 'Ready', x: 0, y: 845, w: 1320, h: 790 },
    ],
  },
  {
    out: '05-recap.png',
    source: 'recap.png',
    headline: 'Your season,\none page',
    sub: 'Days afield, harvests, places and the firsts.',
    full: true,
  },
  {
    out: '06-journal.png',
    source: 'journal.png',
    headline: 'The blank days\ncount',
    sub: 'Every hunt is kept, harvest or not.',
    // The Hunting filter: four of five days ended without a harvest.
    cards: [{ name: 'Entries', x: 0, y: 500, w: 1320, h: 1320 }],
  },
  {
    out: '07-family.png',
    source: 'family.png',
    plan: 'Family',
    headline: 'Everyone’s tags,\ntogether',
    sub: 'Up to six people, including the ones who will never install an app.',
    // The trip together, everyone's status, and the no-account footer.
    cards: [{ name: 'Family', x: 0, y: 525, w: 1320, h: 1280 }],
  },
  {
    out: '08-data.png',
    source: 'settings.png',
    headline: 'No account.\nNo server.',
    sub: 'Everything stays on your iPhone. Export all of it whenever you want.',
    // Export and Import, with the footer that says what the file holds.
    cards: [{ name: 'Your Data', x: 0, y: 2075, w: 1320, h: 590 }],
  },
];
