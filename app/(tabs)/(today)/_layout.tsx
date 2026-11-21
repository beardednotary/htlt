import { Stack } from 'expo-router';

import { stackScreenOptions } from '../../../src/ui/navigationTheme';
import { screenBackground } from '../../../src/ui/theme';

export default function TodayLayout() {
  return (
    <Stack
      screenOptions={{
        ...stackScreenOptions,
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
