import { Stack, ThemeProvider, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { syncCalendar } from '../src/calendar/calendar';
import { loadStore, useStore } from '../src/data/store';
import { syncReminders } from '../src/notifications/reminders';
import { EntitlementsProvider } from '../src/purchases/entitlements';
import { shouldShowWhatsNew } from '../src/release/whatsNew';
import { navigationTheme } from '../src/ui/navigationTheme';

/**
 * A stack above the tabs, so anything that has to appear over the whole app —
 * the paywall, the first-run walkthrough — has somewhere to live. The tabs
 * themselves are one screen inside it.
 */
export default function RootLayout() {
  const { loaded, data } = useStore();
  const router = useRouter();

  useEffect(() => {
    void loadStore();
  }, []);

  // The welcome, once, the first time the app opens with nothing in it. Otherwise
  // What's New, once, for someone who was here before this release.
  const { welcomeSeen, whatsNewSeen } = data.settings;
  useEffect(() => {
    if (!loaded) return;
    if (!welcomeSeen) router.push('/welcome');
    else if (shouldShowWhatsNew({ welcomeSeen, whatsNewSeen })) router.push('/whats-new');
  }, [loaded, welcomeSeen, whatsNewSeen, router]);

  // The schedule is rebuilt from the records whenever they change, so a deleted
  // season stops nagging and a new opener starts. Debounced so a burst of edits
  // costs one rebuild rather than one per keystroke.
  useEffect(() => {
    if (!loaded || !data.settings.remindersEnabled) return;
    const timer = setTimeout(() => {
      void syncReminders(data);
    }, 800);
    return () => clearTimeout(timer);
  }, [loaded, data]);

  // Same rebuild-from-records contract as the reminders, on the same debounce.
  useEffect(() => {
    if (!loaded || !data.settings.calendarEnabled) return;
    const timer = setTimeout(() => {
      void syncCalendar(data, data.settings.calendarId);
    }, 1200);
    return () => clearTimeout(timer);
  }, [loaded, data]);

  return (
    <ThemeProvider value={navigationTheme}>
      <EntitlementsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.999],
        }}
      />
      <Stack.Screen
        name="whats-new"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: false,
          gestureEnabled: false,
          sheetAllowedDetents: [0.999],
        }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: false,
          gestureEnabled: false,
          sheetAllowedDetents: [0.999],
        }}
      />
      </Stack>
      </EntitlementsProvider>
    </ThemeProvider>
  );
}
