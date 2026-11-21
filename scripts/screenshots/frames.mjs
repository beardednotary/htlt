/**
 * The eight App Store frames: their story, headlines and where each card is cut from.
 *
 * Read by compose.cjs. The reasoning is in docs/ASO_LISTING.md §7 and the capture
 * steps in docs/SCREENSHOTS_RUNBOOK.md. Crops are in pixels of a 1320×2868 capture
 * (iPhone 17 Pro Max). Each `cards` entry is one section of the screen: its header
 * and its rounded group, and nothing of the next section.
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
    sub: 'Openers, expiries and draw deadlines, before they arrive.',
    cards: [
      { name: 'Needs Attention', x: 0, y: 330, w: 1320, h: 760 },
      { name: 'Coming Up', x: 0, y: 1110, w: 1320, h: 760 },
    ],
  },
  {
    out: '02-season.png',
    source: 'season.png',
    headline: 'Every tag,\none season',
    sub: 'Dates, licenses and the agency’s own regulation link, together.',
    cards: [
      { name: 'Dates', x: 0, y: 330, w: 1320, h: 520 },
      { name: 'Licenses & Tags', x: 0, y: 870, w: 1320, h: 560 },
      { name: 'Regulations', x: 0, y: 1450, w: 1320, h: 360 },
    ],
  },
  {
    out: '03-draws.png',
    source: 'season-draw.png',
    plan: 'Outdoorsman',
    headline: 'Draws and points,\ntracked',
    sub: 'Deadlines, results dates and preference points.',
    cards: [{ name: 'Draw', x: 0, y: 900, w: 1320, h: 900 }],
  },
  {
    out: '04-trip.png',
    source: 'trip.png',
    plan: 'Family',
    headline: 'Trip readiness,\nchecked',
    sub: 'Know who is missing a license before you drive four hours.',
    cards: [{ name: 'Readiness', x: 0, y: 330, w: 1320, h: 1100 }],
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
    cards: [{ name: 'Entries', x: 0, y: 330, w: 1320, h: 1500 }],
  },
  {
    out: '07-family.png',
    source: 'family.png',
    plan: 'Family',
    headline: 'Everyone’s tags,\ntogether',
    sub: 'Up to six people, including the ones who will never install an app.',
    cards: [{ name: 'People', x: 0, y: 330, w: 1320, h: 900 }],
  },
  {
    out: '08-data.png',
    source: 'settings.png',
    headline: 'No account.\nNo server.',
    sub: 'Everything stays on your iPhone. Export all of it whenever you want.',
    cards: [{ name: 'Your Data', x: 0, y: 1200, w: 1320, h: 560 }],
  },
];
