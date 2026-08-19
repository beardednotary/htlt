import { Stack } from 'expo-router';

export default function SeasonsLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" options={{ title: 'Seasons' }} />
    </Stack>
  );
}
