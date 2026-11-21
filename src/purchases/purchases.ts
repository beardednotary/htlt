import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

export {
  ENTITLEMENT_FAMILY,
  ENTITLEMENT_OUTDOORSMAN,
  PRODUCT_FAMILY_ANNUAL,
  PRODUCT_OUTDOORSMAN_ANNUAL,
  tierForProduct,
  tierFrom,
  type Tier,
} from './tiers';
import { PRODUCT_FAMILY_ANNUAL, PRODUCT_OUTDOORSMAN_ANNUAL } from './tiers';

/**
 * Public SDK key. Safe to ship — it goes out inside the binary either way — but read
 * from the environment rather than pasted in.
 *
 * `EXPO_PUBLIC_` variables are inlined by Metro at bundle time, which means the value
 * has to exist on the machine running the build. A local `.env` is gitignored and is
 * therefore *not* uploaded to EAS Build, so a release built in the cloud gets
 * `undefined` here and every purchase silently turns into "not configured" — which is
 * exactly what TestFlight showed. The key has to be set on EAS as well:
 *
 *   npx eas env:push production --path .env
 *
 * Repeat for `preview` and `development`. See docs/subscriptions-setup.md.
 */
const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

let configured = false;

export function isConfigured(): boolean {
  return configured;
}

export async function configurePurchases(): Promise<void> {
  if (configured) return;
  if (!API_KEY) {
    // Loud, because the failure mode is otherwise invisible: the app runs fine and
    // simply never sells anything. Better to see it in the build log and in the
    // device console than to find out from a tester.
    console.error(
      '[purchases] EXPO_PUBLIC_REVENUECAT_IOS_KEY is not set — purchases are disabled ' +
        'in this build. Set it with `eas env:set` for the environment this was built in.'
    );
    return;
  }
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

/**
 * Which products this Apple Account can still start a free trial on. Anything the
 * App Store will not vouch for — ineligible, unknown, or an error — reads as false,
 * so the paywall never promises a trial that would actually bill on day one.
 */
export async function trialEligibility(productIds: string[]): Promise<Record<string, boolean>> {
  const none = Object.fromEntries(productIds.map((id) => [id, false]));
  if (!configured || productIds.length === 0) return none;
  try {
    const result = await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds);
    return Object.fromEntries(
      productIds.map((id) => [
        id,
        result[id]?.status ===
          Purchases.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE,
      ])
    );
  } catch {
    return none;
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

/**
 * Must be called after `configurePurchases` has resolved: before that there is no SDK
 * instance to listen to, and the listener is silently dropped. EntitlementsProvider
 * sequences this; see `startEntitlementSync`.
 */
export function onCustomerInfoChange(listener: (info: CustomerInfo) => void): () => void {
  if (!configured) return () => {};
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}
