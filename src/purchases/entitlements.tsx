import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import {
  configurePurchases,
  currentCustomerInfo,
  isConfigured,
  onCustomerInfoChange,
  tierFrom,
  type Tier,
} from './purchases';
import { startEntitlementSync } from './sync';

interface EntitlementsValue {
  tier: Tier;
  /** False until RevenueCat has answered, so nothing is gated on a guess. */
  ready: boolean;
  /** True when an API key is present. Without one there is nothing to gate against. */
  live: boolean;
  refresh: () => Promise<void>;
}

const EntitlementsContext = createContext<EntitlementsValue>({
  tier: 'free',
  ready: false,
  live: false,
  refresh: async () => {},
});

export function EntitlementsProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>('free');
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);

  async function refresh() {
    await configurePurchases();
    const configured = isConfigured();
    setLive(configured);
    if (!configured) {
      setReady(true);
      return;
    }
    setTier(tierFrom(await currentCustomerInfo()));
    setReady(true);
  }

  useEffect(() => {
    const stop = startEntitlementSync(
      {
        configure: configurePurchases,
        isConfigured,
        currentInfo: currentCustomerInfo,
        subscribe: onCustomerInfoChange,
      },
      (state) => {
        setTier(state.tier);
        setLive(state.live);
        setReady(true);
      }
    );

    // A trial that ended, or a subscription renewed or cancelled from Settings while
    // the app sat in the background, shows up the next time the app comes forward —
    // not after someone thinks to force-quit it.
    const foreground = AppState.addEventListener('change', (next) => {
      if (next === 'active') void refresh();
    });

    return () => {
      stop();
      foreground.remove();
    };
  }, []);

  const value = useMemo<EntitlementsValue>(
    () => ({ tier, ready, live, refresh }),
    [tier, ready, live]
  );

  return <EntitlementsContext value={value}>{children}</EntitlementsContext>;
}

export function useEntitlements(): EntitlementsValue {
  return use(EntitlementsContext);
}
