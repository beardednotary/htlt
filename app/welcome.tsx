import { Stack, useRouter } from 'expo-router';
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Host, Image as SwiftUIImage } from '@expo/ui/swift-ui';
import type { SFSymbol } from 'sf-symbols-typescript';

import { setWelcomeSeen } from '../src/data/store';

interface Step {
  symbol: SFSymbol;
  title: string;
  body: string;
}

/**
 * Not a tour. Four sentences explaining how the pieces relate, because the one
 * thing nobody can guess from looking at the app is that a season is the centre
 * and everything else hangs off it.
 */
const STEPS: Step[] = [
  {
    symbol: 'calendar',
    title: 'Start with a season',
    body: 'One species, one place, one year — California Deer, 2026. Add the dates it runs when the agency publishes them.',
  },
  {
    symbol: 'checklist',
    title: 'Hang everything off it',
    body: 'The tag, the license that covers it, the official regulations and when you last read them. A license is entered once and points at every season it covers.',
  },
  {
    symbol: 'book.closed',
    title: 'Log the days',
    body: 'Where you went, what you carried, what came of it. Days with nothing taken are worth keeping — most days are those.',
  },
  {
    symbol: 'person.2',
    title: 'Add your people',
    body: 'Everyone you hunt with, whether or not they will ever install an app. You hold their licenses, their tags and their history.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  function done() {
    setWelcomeSeen(true);
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic">
        <Text style={styles.kicker}>Hunting Tags &amp; License Tracker</Text>
        <Text style={styles.title}>Everything your season needs, in one place.</Text>

        <View style={styles.steps}>
          {STEPS.map((step) => (
            <View key={step.title} style={styles.step}>
              <Host matchContents style={styles.stepIcon}>
                <SwiftUIImage systemName={step.symbol} size={26} />
              </Host>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Today assembles itself from all of it — openers, deadlines and anything about to
          expire. Regulations always link to the agency that issues them; verify with them
          before you hunt.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={done}>
          <Text style={styles.buttonLabel}>Get Started</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PlatformColor('systemBackground') },
  content: { padding: 24, paddingTop: 44, paddingBottom: 40 },

  kicker: {
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: PlatformColor('secondaryLabel'),
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 38,
    color: PlatformColor('label'),
    paddingTop: 6,
  },

  steps: { paddingTop: 32 },
  step: { flexDirection: 'row', paddingBottom: 26 },
  stepIcon: { width: 40, paddingTop: 2 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 17, fontWeight: '600', color: PlatformColor('label') },
  stepBody: {
    fontSize: 15,
    lineHeight: 21,
    color: PlatformColor('secondaryLabel'),
    paddingTop: 3,
  },

  footer: {
    fontSize: 13,
    lineHeight: 19,
    color: PlatformColor('tertiaryLabel'),
    paddingBottom: 28,
  },

  button: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: PlatformColor('systemBlue'),
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  buttonLabel: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
