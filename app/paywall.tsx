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
import { currentOffering, purchase, restore } from '../src/purchases/purchases';

/** Apple requires both to be reachable from any screen that sells a subscription. */
const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://dahvio.com/htlt/privacy';

const OUTDOORSMAN_FEATURES = [
  'Unlimited licenses, tags and permits',
  'Every state and province you hunt',
  'Draw applications and preference points',
  'Reminders for openers, deadlines and expiries',
  'Your season as a printable PDF',
];

const FAMILY_FEATURES = [
  'Everything in Outdoorsman',
  'Up to six people in one household',
  'Licenses and tags for people without accounts',
  'Who is ready for the trip, and who is not',
  'A shared history that outlasts the season',
];

export default function PaywallScreen() {
  const { reason, requires } = useLocalSearchParams<{ reason?: string; requires?: string }>();
  const router = useRouter();
  const { live, refresh } = useEntitlements();

  const family = requires === 'family';
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void currentOffering().then((offering) => setPackages(offering?.availablePackages ?? []));
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
    try {
      await restore();
      await refresh();
      router.back();
    } catch {
      setError('Nothing to restore on this Apple Account.');
    } finally {
      setBusy(false);
    }
  }

  const features = family ? FAMILY_FEATURES : OUTDOORSMAN_FEATURES;

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
        ) : packages.length === 0 ? (
          <Text style={styles.unavailable}>
            {live
              ? 'Subscriptions are not available right now. Try again in a moment.'
              : 'Subscriptions are not configured in this build yet.'}
          </Text>
        ) : (
          packages.map((pkg) => (
            <Pressable
              key={pkg.identifier}
              style={({ pressed }) => [styles.buy, pressed && styles.buyPressed]}
              disabled={busy}
              onPress={() => {
                void buy(pkg);
              }}>
              <Text style={styles.buyLabel}>{pkg.product.title || 'Subscribe'}</Text>
              <Text style={styles.buyPrice}>{pkg.product.priceString} / year</Text>
            </Pressable>
          ))
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={() => void restorePurchases()} disabled={busy}>
          <Text style={styles.secondary}>Restore Purchases</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.secondary}>Not now</Text>
        </Pressable>

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
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: PlatformColor('systemBlue'),
    alignItems: 'center',
  },
  buyPressed: { opacity: 0.85 },
  buyLabel: { fontSize: 17, fontWeight: '600', color: '#fff' },
  buyPrice: { fontSize: 14, color: 'rgba(255,255,255,0.9)', paddingTop: 2 },

  error: {
    paddingTop: 16,
    fontSize: 14,
    color: PlatformColor('systemRed'),
    textAlign: 'center',
  },

  secondary: {
    paddingTop: 20,
    fontSize: 16,
    color: PlatformColor('systemBlue'),
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
