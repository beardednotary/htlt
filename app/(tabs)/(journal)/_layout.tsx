import { Stack } from 'expo-router';

import { screenBackground } from '../../../src/ui/theme';

export default function JournalLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        contentStyle: { backgroundColor: screenBackground },
      }}>
      <Stack.Screen name="index" options={{ title: 'Journal' }} />
      <Stack.Screen name="entry/[id]/index" options={{ headerLargeTitle: false }} />
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
