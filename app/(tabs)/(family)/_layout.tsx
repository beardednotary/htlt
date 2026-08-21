import { Stack } from 'expo-router';

import { PlatformColor } from 'react-native';

import { accent, screenBackground } from '../../../src/ui/theme';

export default function FamilyLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Family' }} />
      <Stack.Screen
        name="person/new"
        options={{
          title: 'Add Person',
          presentation: 'formSheet',
          headerLargeTitle: false,
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen name="person/[id]/index" options={{ headerLargeTitle: false }} />
      <Stack.Screen
        name="trip/new"
        options={{
          title: 'Plan a Trip',
          presentation: 'formSheet',
          headerLargeTitle: false,
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen name="trip/[id]/index" options={{ headerLargeTitle: false }} />
    </Stack>
  );
}
