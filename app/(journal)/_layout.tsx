import { Stack } from 'expo-router';

export default function JournalLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" options={{ title: 'Journal' }} />
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
