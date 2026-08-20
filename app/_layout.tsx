import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';

import { loadStore, useStore } from '../src/data/store';
import { syncReminders } from '../src/notifications/reminders';

export default function RootLayout() {
  const { loaded, data } = useStore();

  useEffect(() => {
    void loadStore();
  }, []);

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

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(today)">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sun.horizon', selected: 'sun.horizon.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(seasons)">
        <NativeTabs.Trigger.Label>Seasons</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(journal)">
        <NativeTabs.Trigger.Label>Journal</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book.closed', selected: 'book.closed.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(family)">
        <NativeTabs.Trigger.Label>Family</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
