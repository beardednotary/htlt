import { tierFrom, type EntitlementSnapshot, type Tier } from './tiers';

export interface EntitlementSyncDeps {
  configure: () => Promise<void>;
  isConfigured: () => boolean;
  currentInfo: () => Promise<EntitlementSnapshot | null>;
  subscribe: (listener: (info: EntitlementSnapshot) => void) => () => void;
}

export interface EntitlementState {
  tier: Tier;
  live: boolean;
}

/**
 * Configure first, then read, then listen — in that order.
 *
 * The listener used to be attached in the same tick as the (async) configure call, so
 * it was attached to an SDK that did not exist yet and silently dropped. Purchases
 * still worked because the paywall refreshed by hand, but anything that changed the
 * subscription outside the paywall — a trial ending, a renewal, a refund, Family
 * Sharing — went unnoticed until the app was killed and relaunched.
 *
 * Returns a stop function that is safe to call before setup has finished.
 */
export function startEntitlementSync(
  deps: EntitlementSyncDeps,
  onState: (state: EntitlementState) => void
): () => void {
  let stopped = false;
  let unsubscribe: (() => void) | null = null;

  void (async () => {
    await deps.configure();
    if (stopped) return;
    const live = deps.isConfigured();
    if (!live) {
      onState({ tier: 'free', live: false });
      return;
    }
    const info = await deps.currentInfo();
    if (stopped) return;
    onState({ tier: tierFrom(info), live: true });
    unsubscribe = deps.subscribe((next) => onState({ tier: tierFrom(next), live: true }));
  })();

  return () => {
    stopped = true;
    unsubscribe?.();
  };
}
