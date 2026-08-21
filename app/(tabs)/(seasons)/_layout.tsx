import { Stack, useRouter } from 'expo-router';

import { PlatformColor } from 'react-native';

import { accent, screenBackground } from '../../../src/ui/theme';
import { HeaderButton } from '../../../src/ui/HeaderButton';

export default function SeasonsLayout() {
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
          title: 'Seasons',
          headerLeft: () => (
            <HeaderButton systemImage="chart.bar" onPress={() => router.push('/recap/latest')} />
          ),
          headerRight: () => (
            <HeaderButton systemImage="plus" onPress={() => router.push('/new')} />
          ),
        }}
      />
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
