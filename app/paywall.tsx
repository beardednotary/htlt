import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { useEntitlements } from '../src/purchases/entitlements';
import { planCopy } from '../src/purchases/offer';
import { FAMILY_FEATURES, FREE_LINE, OUTDOORSMAN_FEATURES } from '../src/purchases/paywallCopy';
import {
  currentOffering,
  isConfigured,
  purchase,
  restore,
  tierForProduct,
  trialEligibility,
} from '../src/purchases/purchases';
import { restoreMessage, restoreOutcome, tierName } from '../src/purchases/tiers';
import { accent, onAccent } from '../src/ui/theme';

/** Apple requires both to be reachable from any screen that sells a subscription. */
const TERMS_URL = 'https://dahvio.com/hunting-tags-license-tracker-terms';
const PRIVACY_URL = 'https://dahvio.com/hunting-tags-license-tracker-privacy';

export default function PaywallScreen() {
  const { reason, requires } = useLocalSearchParams<{ reason?: string; requires?: string }>();
  const router = useRouter();
  const { live, refresh } = useEntitlements();

  const family = requires === 'family';
  const requiredTier = family ? 'family' : 'outdoorsman';
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
  const [eligible, setEligible] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadOffering() {
    setPackages(null);
    const offering = await currentOffering();
    const available = offering?.availablePackages ?? [];
    setEligible(await trialEligibility(available.map((pkg) => pkg.product.identifier)));
    setPackages(available);
  }

  useEffect(() => {
    void loadOffering();
  }, []);

  async function buy(pkg: PurchasesPackage) {
    setBusy(true);
    setError(null);
    try {
      const info = await purchase(pkg);
      if (info) {
        await refresh();
        router.back();
      }
    } catch {
      setError('That purchase did not go through. Nothing was charged.');
    } finally {
      setBusy(false);
    }
  }

  async function restorePurchases() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const outcome = restoreOutcome(await restore(), isConfigured());
      await refresh();
      if (outcome.status === 'restored') {
        router.back();
        return;
      }
      setNotice(restoreMessage(outcome).message);
    } catch {
      setError('The App Store could not be reached. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  const features = family ? FAMILY_FEATURES : OUTDOORSMAN_FEATURES;

  // Only show what would actually unlock the thing they just hit. Family gates are
  // satisfied by Family alone; an Outdoorsman gate is satisfied by either, so both
  // stay visible and the higher tier reads as an upsell rather than a mistake.
  const offered = (packages ?? []).filter((pkg) =>
    family ? tierForProduct(pkg.product.identifier) === 'family' : true
  );

  const plans = offered.map((pkg) => {
    const tier = tierForProduct(pkg.product.identifier);
    return {
      pkg,
      isPrimary: tier === requiredTier,
      copy: planCopy({
        tierName: tierName(tier),
        priceString: pkg.product.priceString,
        intro: pkg.product.introPrice,
        trialEligible: eligible[pkg.product.identifier] === true,
      }),
    };
  });
  const trialTerms = plans.find((plan) => plan.isPrimary)?.copy.terms ?? null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic">
        <Text style={styles.kicker}>{family ? 'Family' : 'Outdoorsman'}</Text>
        <Text style={styles.title}>
          {family ? 'Everyone you hunt with, in one place.' : 'Your whole season, organized.'}
        </Text>

        {reason ? <Text style={styles.reason}>{reason}</Text> : null}

        <View style={styles.features}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.feature}>{feature}</Text>
            </View>
          ))}
        </View>

        {packages === null ? (
          <ActivityIndicator style={styles.loading} />
        ) : offered.length === 0 ? (
          <>
            <Text style={styles.unavailable}>
              {live
                ? 'The App Store did not return prices just now. This is usually a weak connection.'
                : 'Subscriptions are not configured in this build yet.'}
            </Text>
            {live ? (
              // A sheet that can only say "not available" is a dead end; give the
              // person something to press.
              <Pressable onPress={() => void loadOffering()} disabled={busy}>
                <Text style={styles.secondary}>Try Again</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          plans.map(({ pkg, isPrimary, copy }) => {
            // The tier they came for is the primary action. Anything above it is an
            // upsell and reads as one — two filled buttons make the eye pick neither,
            // and put the more expensive option in competition with the intended one.
            return (
              <Pressable
                key={pkg.identifier}
                style={({ pressed }) => [
                  styles.buy,
                  isPrimary ? styles.buyPrimary : styles.buySecondary,
                  pressed && styles.buyPressed,
                ]}
                disabled={busy}
                onPress={() => {
                  void buy(pkg);
                }}>
                <Text style={[styles.buyLabel, !isPrimary && styles.buyLabelSecondary]}>
                  {copy.label}
                </Text>
                <Text style={[styles.buyPrice, !isPrimary && styles.buyPriceSecondary]}>
                  {copy.detail}
                </Text>
              </Pressable>
            );
          })
        )}

        {trialTerms ? <Text style={styles.terms}>{trialTerms}</Text> : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <Pressable onPress={() => void restorePurchases()} disabled={busy}>
          <Text style={styles.secondary}>Restore Purchases</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.secondary}>Not now</Text>
        </Pressable>

        <Text style={styles.free}>{FREE_LINE}</Text>

        <Text style={styles.legal}>
          Subscriptions renew annually until cancelled. Manage or cancel in your Apple Account
          settings.
        </Text>
        <View style={styles.legalLinks}>
          <Pressable onPress={() => void Linking.openURL(TERMS_URL)}>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </Pressable>
          <Text style={styles.legalDot}>·</Text>
          <Pressable onPress={() => void Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PlatformColor('systemBackground') },
  content: { padding: 24, paddingTop: 40, paddingBottom: 48 },

  kicker: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: PlatformColor('secondaryLabel'),
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: PlatformColor('label'),
    paddingTop: 6,
  },
  reason: {
    fontSize: 16,
    lineHeight: 22,
    color: PlatformColor('secondaryLabel'),
    paddingTop: 14,
  },

  features: { paddingTop: 28 },
  featureRow: { flexDirection: 'row', paddingVertical: 6 },
  bullet: { fontSize: 17, color: PlatformColor('tertiaryLabel'), width: 18 },
  feature: { flex: 1, fontSize: 17, lineHeight: 23, color: PlatformColor('label') },

  loading: { paddingTop: 32 },
  unavailable: {
    paddingTop: 32,
    fontSize: 15,
    color: PlatformColor('secondaryLabel'),
    textAlign: 'center',
  },

  buy: {
    marginTop: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  buyPrimary: { backgroundColor: accent, marginTop: 24 },
  buySecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: accent,
  },
  buyPressed: { opacity: 0.85 },
  buyLabel: { fontSize: 17, fontWeight: '600', color: onAccent },
  buyLabelSecondary: { color: accent },
  buyPrice: { fontSize: 15, color: onAccent, opacity: 0.9, paddingTop: 2 },
  buyPriceSecondary: { color: accent, opacity: 0.8 },

  terms: {
    paddingTop: 12,
    fontSize: 13,
    lineHeight: 18,
    color: PlatformColor('secondaryLabel'),
    textAlign: 'center',
  },
  notice: {
    paddingTop: 16,
    fontSize: 14,
    lineHeight: 19,
    color: PlatformColor('secondaryLabel'),
    textAlign: 'center',
  },
  free: {
    paddingTop: 28,
    fontSize: 14,
    lineHeight: 19,
    color: PlatformColor('secondaryLabel'),
    textAlign: 'center',
  },

  error: {
    paddingTop: 16,
    fontSize: 14,
    color: PlatformColor('systemRed'),
    textAlign: 'center',
  },

  secondary: {
    paddingTop: 20,
    fontSize: 16,
    color: accent,
    textAlign: 'center',
  },

  legal: {
    paddingTop: 32,
    fontSize: 12,
    lineHeight: 17,
    color: PlatformColor('tertiaryLabel'),
    textAlign: 'center',
  },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', paddingTop: 8 },
  legalLink: { fontSize: 12, color: PlatformColor('secondaryLabel') },
  legalDot: { fontSize: 12, color: PlatformColor('tertiaryLabel'), paddingHorizontal: 8 },
});
