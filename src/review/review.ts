import { getReviewState, setReviewState } from '../data/store';
import { todayISO } from '../model/derive';
import { afterAccomplishment } from './policy';

type StoreReviewModule = typeof import('expo-store-review');

let cached: StoreReviewModule | null | undefined;

/**
 * expo-store-review is a native module. A JavaScript update can reach a binary built
 * before it was added, so it is loaded defensively — no module means no prompt, never
 * a crash.
 */
function storeReview(): StoreReviewModule | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-store-review') as StoreReviewModule;
  } catch {
    cached = null;
  }
  return cached;
}

/** How long to wait for a sheet to finish dismissing before the system prompt. */
const AFTER_DISMISS_MS = 700;

/**
 * Call after something has been saved and its sheet dismissed. Counts the moment, and
 * on the right one asks the system to show its rating prompt. iOS decides whether it
 * actually appears.
 */
export function noteAccomplishment(): void {
  const { next, ask } = afterAccomplishment(getReviewState(), todayISO());
  setReviewState(next);
  if (!ask) return;

  const module = storeReview();
  if (!module) return;
  setTimeout(() => {
    void module
      .isAvailableAsync()
      .then((available) => (available ? module.requestReview() : undefined))
      .catch(() => undefined);
  }, AFTER_DISMISS_MS);
}
