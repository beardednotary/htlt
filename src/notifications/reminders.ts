import * as Notifications from 'expo-notifications';

import type { AppData } from '../data/store';
import { planReminders } from './plan';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function hasPermission(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/** Asked only when the hunter turns reminders on, never on first launch. */
export async function requestPermission(): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Replaces the whole schedule rather than diffing it. A household's plan is a few
 * dozen notifications at most, and rebuilding from the records is the only way to
 * be certain a deleted season stops nagging.
 */
export async function syncReminders(data: AppData): Promise<number> {
  if (!(await hasPermission())) return 0;

  await cancelAllReminders();
  const planned = planReminders(data);

  for (const reminder of planned) {
    await Notifications.scheduleNotificationAsync({
      content: { title: reminder.title, body: reminder.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.fireAt,
      },
    });
  }

  return planned.length;
}
