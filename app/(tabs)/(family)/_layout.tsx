import { Stack } from 'expo-router';

import { screenBackground } from '../../../src/ui/theme';

export default function FamilyLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        contentStyle: { backgroundColor: screenBackground },
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
