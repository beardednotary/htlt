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
