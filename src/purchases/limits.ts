import type { AppData } from '../data/store';
import { credentialStatus } from '../model/derive';
import type { Tier } from './purchases';

/**
 * What the free tier holds.
 *
 * Deliberately not the journal. Logging stays unlimited on every tier — that is the
 * data we want people accumulating, and paywalling "log another fish" converts far
 * worse than paywalling the paperwork that piles up once someone is serious.
 */
export const FREE_ACTIVE_CREDENTIALS = 3;
export const FREE_PEOPLE = 1;

export interface Gate {
  allowed: boolean;
  /** Which tier unlocks it, for the paywall to lead with. */
  requires: Exclude<Tier, 'free'>;
  reason: string;
}

const allow: Gate = { allowed: true, requires: 'outdoorsman', reason: '' };

/** Expired credentials do not count against the limit; they are history, not clutter. */
export function activeCredentialCount(data: AppData): number {
  return data.credentials.filter(
    (credential) => credentialStatus(credential.validUntil) !== 'expired'
  ).length;
}

export function canAddCredential(data: AppData, tier: Tier): Gate {
  if (tier !== 'free') return allow;
  if (activeCredentialCount(data) < FREE_ACTIVE_CREDENTIALS) return allow;
  return {
    allowed: false,
    requires: 'outdoorsman',
    reason: `Free keeps ${FREE_ACTIVE_CREDENTIALS} active licenses, tags or permits. Outdoorsman keeps as many as your season needs.`,
  };
}

/**
 * The free limit, said before someone fills in a form rather than after. Meeting a
 * paywall on Save — with the fields already typed — reads as a trap; seeing "2 of 3"
 * on the way in reads as a plan.
 *
 * Deliberately avoids the word license/licence: this sits on a sheet whose own title
 * follows the season's jurisdiction, and fixed copy must not contradict it.
 */
export function credentialAllowance(data: AppData, tier: Tier): string | null {
  if (tier !== 'free') return null;
  const used = activeCredentialCount(data);
  const left = Math.max(0, FREE_ACTIVE_CREDENTIALS - used);
  const lead = `Free keeps ${FREE_ACTIVE_CREDENTIALS} active at a time, and expired ones do not count.`;
  if (left === 0) return `${lead} All ${FREE_ACTIVE_CREDENTIALS} are in use; Outdoorsman keeps as many as you need.`;
  return `${lead} ${used} of ${FREE_ACTIVE_CREDENTIALS} in use.`;
}

export function canAddPerson(data: AppData, tier: Tier): Gate {
  if (tier === 'family') return allow;
  if (data.people.length < FREE_PEOPLE) return allow;
  return {
    allowed: false,
    requires: 'family',
    reason:
      'Family keeps licenses, tags and seasons organized for everyone you hunt with — including the ones who will never install an app.',
  };
}

export function canExportRecap(tier: Tier): Gate {
  if (tier !== 'free') return allow;
  return {
    allowed: false,
    requires: 'outdoorsman',
    reason: 'Outdoorsman exports your season as a PDF you can print, keep or send.',
  };
}

/**
 * Draws are the reason a serious multi-state hunter pays. Points accumulate over
 * years and the deadlines are unforgiving, which is exactly the anxiety a
 * subscription should be relieving.
 */
export function canTrackDraws(tier: Tier): Gate {
  if (tier !== 'free') return allow;
  return {
    allowed: false,
    requires: 'outdoorsman',
    reason:
      'Outdoorsman tracks draw applications and preference points — when to apply, when results land, and how many points you are sitting on.',
  };
}

/**
 * Planning convenience rather than a safety net — nobody misses a season because
 * their calendar did not sync, which is why this can sit behind the paywall when
 * reminders cannot.
 */
export function canSyncCalendar(tier: Tier): Gate {
  if (tier !== 'free') return allow;
  return {
    allowed: false,
    requires: 'outdoorsman',
    reason:
      'Outdoorsman puts your openers, deadlines and trips in your calendar, where the people you live with can see them.',
  };
}
