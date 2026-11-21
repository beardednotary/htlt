/**
 * The eight App Store frames: their story, headlines, and which part of each screen
 * pops out of the phone.
 *
 * Read by compose.cjs, drawn by render.swift. The reasoning is in docs/ASO_LISTING.md §7
 * and the capture steps in docs/SCREENSHOTS_RUNBOOK.md.
 *
 * Each frame shows one full capture (1320×2868, iPhone 17 Pro Max, light appearance)
 * inside a phone. `pop` lifts one section of a capture out of the phone, wider than it:
 * `y` and `h` are capture pixels from the top of the section header to the last row
 * worth showing. A pop can name its own `source`, for a section that only fits on
 * screen once scrolled. `xcrun swift scripts/screenshots/bands.swift <capture>` prints
 * where each rounded group starts and ends.
 *
 * Legibility in search results (about 230 px wide) decides the type: one headline size
 * for the set, the largest that fits every line (at most HEADLINE_MAX), and a semibold
 * subline of SUB_SIZE. Sublines are broken by hand into two balanced lines, so no
 * word sits alone on the second.
 *
 * Voice rules from AGENTS.md apply: no exclamation marks, US spelling, state it.
 */

export const CANVAS = { width: 1290, height: 2796 };
export const CAPTURE = { width: 1320, height: 2868 };

export const HEADLINE_MAX = 150;
export const SUB_SIZE = 70;

export const STYLE = {
  /** Blaze orange, the icon's background. */
  background: '#F26B1D',
  ink: '#FFFFFF',
  subInk: '#FFFFFF',
  planBackground: '#FFFFFF',
  planInk: '#C2490B',
};

export const FRAMES = [
  {
    out: '01-deadlines.png',
    source: 'today.png',
    headline: 'Never miss\na deadline',
    sub: 'Openers, expiries and draws,\nahead of time.',
    // An expiring license and the trip that is not ready.
    pop: { name: 'Needs Attention', y: 520, h: 730 },
  },
  {
    out: '02-season.png',
    source: 'season.png',
    headline: 'Every tag,\none season',
    sub: 'Dates, licenses and the\nofficial regulation link.',
    // The household's licenses and tags, each with its holder.
    pop: { name: 'Licenses & Tags', y: 1400, h: 736 },
  },
  {
    out: '03-draws.png',
    source: 'season-draw.png',
    plan: 'Outdoorsman',
    headline: 'Draws and points,\ntracked',
    sub: 'Deadlines, results dates\nand preference points.',
    // Status, deadline, results date and points; stops before Edit Draw.
    pop: { name: 'Draw', y: 1735, h: 713 },
  },
  {
    out: '04-trip.png',
    source: 'trip.png',
    plan: 'Family',
    headline: 'Trip readiness,\nchecked',
    sub: 'Every license checked\nagainst the trip’s own dates.',
    // Who is ready, and Jim's license lapsing before the trip ends.
    pop: { name: 'Ready', y: 845, h: 680 },
  },
  {
    out: '05-recap.png',
    source: 'recap.png',
    headline: 'Your season,\none page',
    sub: 'Days afield, harvests,\nplaces and the firsts.',
  },
  {
    out: '06-journal.png',
    source: 'journal.png',
    headline: 'The blank days\ncount',
    sub: 'Every hunt is kept,\nharvest or not.',
    // Four days, three of them without a harvest.
    pop: { name: 'Entries', y: 720, h: 860 },
  },
  {
    out: '07-family.png',
    source: 'family.png',
    plan: 'Family',
    headline: 'Everyone’s tags,\ntogether',
    sub: 'Up to six people,\nwith or without the app.',
    // Ray, Ethan and Jim, each with what is on file and expiring.
    pop: { name: 'People', y: 960, h: 680 },
  },
  {
    out: '08-data.png',
    source: 'settings.png',
    headline: 'No account.\nNo server.',
    sub: 'Everything stays on your\niPhone. Export it anytime.',
    // Export and Import, with the footer that says what the file holds.
    pop: { name: 'Your Data', y: 1660, h: 620 },
  },
];
