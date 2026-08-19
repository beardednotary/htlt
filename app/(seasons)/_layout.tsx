import { Stack } from 'expo-router';

export default function SeasonsLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
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
    </Stack>
  );
}
