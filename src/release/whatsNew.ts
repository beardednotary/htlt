import type { SFSymbol } from 'sf-symbols-typescript';

import type { AppData, AppSettings } from '../data/store';

/**
 * The release these notes describe. Bump it, and rewrite WHATS_NEW, only when a
 * release changes something a returning user would notice. A release that leaves
 * this alone shows nothing, which is the right answer for most updates.
 */
export const WHATS_NEW_RELEASE = '1.1';

export interface WhatsNewItem {
  symbol: SFSymbol;
  title: string;
  body: string;
}

/**
 * Written for someone who has used 1.0, so it skips anything they would not have
 * met there. Same voice as everywhere else: what changed, stated plainly.
 */
export const WHATS_NEW: WhatsNewItem[] = [
  {
    symbol: 'gift',
    title: 'A week free, once',
    body: 'Outdoorsman and Family start with seven days free if you have not had a trial. The yearly price that follows is on the button, before you subscribe.',
  },
  {
    symbol: 'checklist',
    title: 'Free slots, shown up front',
    body: 'The license and tag form shows how many of your three free slots are in use before you fill anything in. Expired ones do not count.',
  },
  {
    symbol: 'location',
    title: 'Seasons start where you hunt',
    body: 'A new season opens on the state or province you used last, rather than California.',
  },
  {
    symbol: 'arrow.clockwise',
    title: 'Your plan, kept current',
    body: 'Restore Purchases says what it found, and your plan updates as soon as you come back to the app.',
  },
];

export const WHATS_NEW_FOOTER =
  'Reminders, every state and province, and the journal are still free on every plan. The orange icon is new too.';

/**
 * Only for people who were here before this release. A fresh install sees the
 * welcome instead, and finishing the welcome marks these notes as seen, because
 * everything in them is simply how the app works for that person.
 */
export function shouldShowWhatsNew(
  settings: Pick<AppSettings, 'welcomeSeen' | 'whatsNewSeen'>
): boolean {
  return settings.welcomeSeen === true && settings.whatsNewSeen !== WHATS_NEW_RELEASE;
}

/**
 * The saves the review policy counts as accomplishments, already made before the
 * policy existed: a license or tag, a season with its dates, a draw, a logged day.
 */
export function priorUse(data: AppData): number {
  return (
    data.credentials.length +
    data.seasons.filter((season) => season.windows.length > 0).length +
    data.drawApplications.length +
    data.activities.length
  );
}
