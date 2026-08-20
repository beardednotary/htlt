import { Stack } from 'expo-router';

export default function FamilyLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
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
    </Stack>
  );
}
