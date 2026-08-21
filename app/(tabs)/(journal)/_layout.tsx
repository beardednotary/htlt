import { Stack } from 'expo-router';

import { PlatformColor } from 'react-native';

import { accent, screenBackground } from '../../../src/ui/theme';

export default function JournalLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        contentStyle: { backgroundColor: screenBackground },
        headerTintColor: accent,
        // Apple tints controls, not titles.
        headerTitleStyle: { color: PlatformColor('label') },
        headerLargeTitleStyle: { color: PlatformColor('label') },
        // Our lists are SwiftUI, inside a Host — there is no React Native ScrollView
        // in the screen's descendant chain for react-native-screens to attach the
        // automatic scroll edge effect to. Left on automatic, the bar re-resolves its
        // glass on every transition, which is the white flash. The one screen that
        // never flashed was the one with no list at all.
        scrollEdgeEffects: { top: 'hidden', bottom: 'hidden', left: 'hidden', right: 'hidden' },
      }}>
      <Stack.Screen name="index" options={{ title: 'Journal' }} />
      <Stack.Screen name="entry/[id]/index" options={{ headerLargeTitle: false }} />
      <Stack.Screen name="harvest/[id]" options={{ headerLargeTitle: false }} />
      <Stack.Screen
        name="entry/[id]/take"
        options={{
          presentation: 'formSheet',
          headerLargeTitle: false,
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name="log"
        options={{
          presentation: 'formSheet',
          headerLargeTitle: false,
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
