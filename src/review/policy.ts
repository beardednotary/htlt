import type { ISODate } from '../model/types';

/**
 * When to ask for an App Store rating.
 *
 * The moment has to be one people actually reach. A prompt tied to something rare —
 * a fifth harvest, a full season — never fires for most users, and an app with no
 * ratings converts worse on every product page view. So this counts the ordinary
 * things that show the app doing its job: a license or tag saved with its expiry, a
 * season given its dates, a day logged. Three of those, on a sheet that has just
 * closed, is someone who has got something out of it.
 *
 * Apple caps the system prompt at three showings a year and may show nothing at all;
 * the spacing here keeps us well inside that and never asks twice in one season.
 */
export const ASK_AFTER_ACCOMPLISHMENTS = 3;
export const DAYS_BETWEEN_ASKS = 120;

export interface ReviewState {
  accomplishments: number;
  lastAskedOn?: ISODate;
}

export const EMPTY_REVIEW_STATE: ReviewState = { accomplishments: 0 };

function daysBetween(from: ISODate, to: ISODate): number {
  const a = Date.UTC(Number(from.slice(0, 4)), Number(from.slice(5, 7)) - 1, Number(from.slice(8, 10)));
  const b = Date.UTC(Number(to.slice(0, 4)), Number(to.slice(5, 7)) - 1, Number(to.slice(8, 10)));
  return Math.round((b - a) / 86_400_000);
}

/** Record one accomplishment and decide whether this is the moment to ask. */
export function afterAccomplishment(
  state: ReviewState | undefined,
  today: ISODate
): { next: ReviewState; ask: boolean } {
  const current = state ?? EMPTY_REVIEW_STATE;
  const accomplishments = current.accomplishments + 1;

  const due = accomplishments >= ASK_AFTER_ACCOMPLISHMENTS;
  const rested =
    !current.lastAskedOn || daysBetween(current.lastAskedOn, today) >= DAYS_BETWEEN_ASKS;

  if (due && rested) {
    // Reset the count so the next ask needs fresh use, not just elapsed time.
    return { next: { accomplishments: 0, lastAskedOn: today }, ask: true };
  }
  return { next: { ...current, accomplishments }, ask: false };
}
