import { Stack } from 'expo-router';

import { PlatformColor } from 'react-native';

import { accent, screenBackground } from '../../../src/ui/theme';

export default function SeasonsLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Seasons' }} />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Season',
          presentation: 'formSheet',
          headerLargeTitle: false,
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen name="season/[id]/index" options={{ headerLargeTitle: false }} />
      <Stack.Screen name="recap/[year]" options={{ headerLargeTitle: false }} />
      <Stack.Screen
        name="season/[id]/credentials"
        options={{
          title: 'License or Tag',
          presentation: 'formSheet',
          headerLargeTitle: false,
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name="season/[id]/regulations"
        options={{
          title: 'Regulation Link',
          presentation: 'formSheet',
          headerLargeTitle: false,
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name="season/[id]/draw"
        options={{
          presentation: 'formSheet',
          headerLargeTitle: false,
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name="season/[id]/dates"
        options={{
          title: 'Add Dates',
          presentation: 'formSheet',
          headerLargeTitle: false,
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
