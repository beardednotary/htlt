import { Stack } from 'expo-router';

export default function TodayLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" options={{ title: 'Today' }} />
    </Stack>
  );
}
