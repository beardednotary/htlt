import { Stack } from 'expo-router';

import { screenBackground } from '../../../src/ui/theme';

export default function TodayLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        contentStyle: { backgroundColor: screenBackground },
      }}>
      <Stack.Screen name="index" options={{ title: 'Today' }} />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          presentation: 'formSheet',
          headerLargeTitle: false,
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
}
