import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Image as SwiftUIImage } from '@expo/ui/swift-ui';

import { setWhatsNewSeen, useStore } from '../src/data/store';
import {
  WHATS_NEW,
  WHATS_NEW_FOOTER,
  WHATS_NEW_RELEASE,
} from '../src/release/whatsNew';
import { noteUpgrade } from '../src/review/review';
import { accent, onAccent } from '../src/ui/theme';
import { AppHost } from '../src/ui/AppHost';

/**
 * Shown once to people updating from an earlier version, laid out like the welcome
 * so the two read as one family. Opened again from Settings it is just the notes:
 * `replay` skips marking it seen and the rating handoff.
 */
export default function WhatsNewScreen() {
  const router = useRouter();
  const { data } = useStore();
  const { replay } = useLocalSearchParams<{ replay?: string }>();

  function done() {
    router.back();
    if (replay) return;
    setWhatsNewSeen(WHATS_NEW_RELEASE);
    noteUpgrade(data);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic">
        <Text style={styles.kicker}>{`Version ${WHATS_NEW_RELEASE}`}</Text>
        <Text style={styles.title}>What’s New</Text>

        <View style={styles.items}>
          {WHATS_NEW.map((item) => (
            <View key={item.title} style={styles.item}>
              <View style={styles.itemIcon}>
                <AppHost matchContents>
                  <SwiftUIImage systemName={item.symbol} size={24} />
                </AppHost>
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemBody}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>{WHATS_NEW_FOOTER}</Text>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={done}>
          <Text style={styles.buttonLabel}>Continue</Text>
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

  items: { paddingTop: 32 },
  item: { flexDirection: 'row', paddingBottom: 26 },
  itemIcon: { width: 44, alignItems: 'center', paddingTop: 1 },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 17, fontWeight: '600', color: PlatformColor('label') },
  itemBody: {
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
    backgroundColor: accent,
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  buttonLabel: { fontSize: 17, fontWeight: '600', color: onAccent },
});
