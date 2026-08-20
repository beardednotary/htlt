import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

/**
 * Entitlement identifiers as configured in RevenueCat. These are the contract
 * between this codebase and the dashboard — if they are renamed there, they must
 * be renamed here, and nothing else in the app should reference the raw strings.
 */
export const ENTITLEMENT_OUTDOORSMAN = 'outdoorsman';
export const ENTITLEMENT_FAMILY = 'family';

export type Tier = 'free' | 'outdoorsman' | 'family';

/** Public SDK key. Safe to ship, but read from the environment rather than pasted in. */
const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

let configured = false;

export function isConfigured(): boolean {
  return configured;
}

export async function configurePurchases(): Promise<void> {
  if (configured || !API_KEY) return;
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.WARN : LOG_LEVEL.ERROR);
  await Purchases.configure({ apiKey: API_KEY });
  configured = true;
}

export function tierFrom(info: CustomerInfo | null): Tier {
  if (!info) return 'free';
  const active = info.entitlements.active;
  if (active[ENTITLEMENT_FAMILY]) return 'family';
  if (active[ENTITLEMENT_OUTDOORSMAN]) return 'outdoorsman';
  return 'free';
}

export async function currentCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export async function currentOffering(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

export async function purchase(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error) {
    // A cancelled purchase is a normal outcome, not a failure worth surfacing.
    const cancelled = (error as { userCancelled?: boolean })?.userCancelled;
    if (cancelled) return null;
    throw error;
  }
}

export async function restore(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  return Purchases.restorePurchases();
}

export function onCustomerInfoChange(listener: (info: CustomerInfo) => void): () => void {
  if (!configured) return () => {};
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}
