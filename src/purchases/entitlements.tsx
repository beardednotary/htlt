import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  configurePurchases,
  currentCustomerInfo,
  isConfigured,
  onCustomerInfoChange,
  tierFrom,
  type Tier,
} from './purchases';

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
    void refresh();
    return onCustomerInfoChange((info) => setTier(tierFrom(info)));
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
