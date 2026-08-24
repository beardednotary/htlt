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

/**
 * Product identifiers as configured in App Store Connect. Like the entitlements
 * above, these are a contract with the dashboard — renaming one there means
 * renaming it here, and nowhere else should reference the raw strings.
 */
export const PRODUCT_OUTDOORSMAN_ANNUAL = 'com.dahvio.htlt.outdoorsman.annual';
export const PRODUCT_FAMILY_ANNUAL = 'com.dahvio.htlt.family.annual';

/** Which tier a package would grant, so the paywall can show only what qualifies. */
export function tierForProduct(productId: string): Tier {
  if (productId === PRODUCT_FAMILY_ANNUAL) return 'family';
  if (productId === PRODUCT_OUTDOORSMAN_ANNUAL) return 'outdoorsman';
  // An unrecognised product still unlocks something; treat it as the lower tier
  // rather than hiding it, so a new SKU is visible before this file knows about it.
  return 'outdoorsman';
}

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
  if (__DEV__) void reportStoreProducts();
}

/**
 * Asks the App Store directly about our two product IDs, bypassing offerings.
 *
 * "Offerings are empty" is ambiguous: it means the store returned nothing, which
 * could be a RevenueCat wiring problem or an App Store Connect one. This separates
 * them — if the store returns both products here, the fault is in the dashboard's
 * offering or product links. If it returns neither, the fault is on Apple's side:
 * product IDs, agreements, or metadata.
 */
async function reportStoreProducts(): Promise<void> {
  const wanted = [PRODUCT_OUTDOORSMAN_ANNUAL, PRODUCT_FAMILY_ANNUAL];
  try {
    const found = await Purchases.getProducts(wanted);
    const ids = found.map((product) => product.identifier);
    console.log('[purchases] App Store returned', found.length, 'of', wanted.length, 'products');
    for (const id of wanted) {
      const hit = found.find((product) => product.identifier === id);
      console.log(`[purchases]   ${hit ? 'FOUND  ' + hit.priceString : 'MISSING'}  ${id}`);
    }
    const unexpected = ids.filter((id) => !wanted.includes(id));
    if (unexpected.length > 0) console.log('[purchases] unexpected ids:', unexpected);
  } catch (error) {
    console.log('[purchases] getProducts threw:', error);
  }
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
