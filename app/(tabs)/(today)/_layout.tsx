import { Stack, useRouter } from 'expo-router';

import { PlatformColor } from 'react-native';

import { accent, screenBackground } from '../../../src/ui/theme';
import { HeaderButton } from '../../../src/ui/HeaderButton';

export default function TodayLayout() {
  const router = useRouter();

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
      <Stack.Screen
        name="index"
        options={{
          title: 'Today',
          // Declared here rather than inside the screen: options set during render
          // hand React Navigation a new element every time, and the bar button is
          // torn down and rebuilt — which is the white capsule flashing on a tab
          // switch, the container appearing before its content resolves.
          headerRight: () => (
            <HeaderButton
              systemImage="person.crop.circle"
              onPress={() => router.push('/settings')}
            />
          ),
        }}
      />
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
