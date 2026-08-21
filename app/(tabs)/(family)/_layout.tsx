import { Stack, useRouter } from 'expo-router';

import { PlatformColor } from 'react-native';

import { HeaderMenu } from '../../../src/ui/HeaderMenu';
import { accent, screenBackground } from '../../../src/ui/theme';

export default function FamilyLayout() {
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
          title: 'Family',
          headerRight: () => (
            <HeaderMenu
              items={[
                {
                  label: 'Add Person',
                  systemImage: 'person.badge.plus',
                  onPress: () => router.push('/person/new'),
                },
                { label: 'Plan a Trip', systemImage: 'map', onPress: () => router.push('/trip/new') },
              ]}
            />
          ),
        }}
      />
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
