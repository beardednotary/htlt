/**
 * The pure half of purchases: identifiers, and how a customer's entitlements map to a
 * tier. Kept apart from `purchases.ts` so it can be reasoned about — and tested —
 * without loading the RevenueCat native module.
 */

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

/** The slice of RevenueCat's CustomerInfo this app reads. */
export interface EntitlementSnapshot {
  entitlements: { active: Record<string, unknown> };
}

export function tierFrom(info: EntitlementSnapshot | null): Tier {
  if (!info) return 'free';
  const active = info.entitlements.active;
  if (active[ENTITLEMENT_FAMILY]) return 'family';
  if (active[ENTITLEMENT_OUTDOORSMAN]) return 'outdoorsman';
  return 'free';
}

export function tierName(tier: Tier): string {
  if (tier === 'family') return 'Family';
  if (tier === 'outdoorsman') return 'Outdoorsman';
  return 'Free';
}

export type RestoreOutcome =
  | { status: 'restored'; tier: Exclude<Tier, 'free'> }
  | { status: 'nothing' }
  | { status: 'unavailable' };

/**
 * What a restore actually found. A restore that returns no active entitlement is a
 * real answer the person needs to hear — dismissing the sheet as if it worked leaves
 * them wondering whether they were charged for nothing.
 */
export function restoreOutcome(info: EntitlementSnapshot | null, configured: boolean): RestoreOutcome {
  if (!configured) return { status: 'unavailable' };
  const tier = tierFrom(info);
  if (tier === 'free') return { status: 'nothing' };
  return { status: 'restored', tier };
}

export function restoreMessage(outcome: RestoreOutcome): { title: string; message: string } {
  switch (outcome.status) {
    case 'restored':
      return {
        title: 'Purchases restored',
        message: `${tierName(outcome.tier)} is active on this iPhone.`,
      };
    case 'nothing':
      return {
        title: 'Nothing to restore',
        message:
          'This Apple Account has no active subscription for this app. If you subscribed with a different Apple Account, sign in with that one and try again.',
      };
    case 'unavailable':
      return {
        title: 'Restore is unavailable',
        message: 'The App Store could not be reached from this build. Try again later.',
      };
  }
}
