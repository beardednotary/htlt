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
