import { Alert, Button, Form, Host, HStack, Section, Spacer, Text, Toggle } from '@expo/ui/swift-ui';
import { foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { setRemindersEnabled, useStore } from '../../src/data/store';
import { planReminders } from '../../src/notifications/plan';
import {
  cancelAllReminders,
  hasPermission,
  requestPermission,
  syncReminders,
} from '../../src/notifications/reminders';
import { HeaderButton } from '../../src/ui/HeaderButton';

export default function SettingsScreen() {
  const { data } = useStore();
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [scheduled, setScheduled] = useState<number | null>(null);

  const enabled = data.settings.remindersEnabled;
  const wouldSchedule = planReminders(data).length;

  useEffect(() => {
    if (!enabled) {
      setScheduled(0);
      return;
    }
    void hasPermission().then((granted) => {
      if (!granted) setScheduled(0);
    });
  }, [enabled]);

  async function toggleReminders(next: boolean) {
    if (!next) {
      setRemindersEnabled(false);
      await cancelAllReminders();
      setScheduled(0);
      return;
    }

    const granted = (await hasPermission()) || (await requestPermission());
    if (!granted) {
      setDenied(true);
      return;
    }

    setRemindersEnabled(true);
    const count = await syncReminders(data);
    setScheduled(count);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLeft: () => <HeaderButton label="Done" onPress={() => router.back()} prominent />,
        }}
      />
      <Host style={{ flex: 1 }} useViewportSizeMeasurement>
        <Form>
          <Section
            title="Reminders"
            footer={
              <Text>
                Openers a week and a day out, licences 30 and 7 days before they lapse, draw
                deadlines, and a nudge to read the regulations two weeks before the season
                starts. All of it comes from what you have already entered.
              </Text>
            }>
            <Toggle label="Season & License Reminders" isOn={enabled} onIsOnChange={toggleReminders} />
            {enabled ? (
              <HStack>
                <Text>Scheduled</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                  {String(scheduled ?? wouldSchedule)}
                </Text>
              </HStack>
            ) : null}
          </Section>

          <Section
            footer={
              <Text>
                Dates come from you, not from any agency. Verify seasons and regulations with
                the wildlife agency that issues them.
              </Text>
            }>
            <HStack>
              <Text>Household</Text>
              <Spacer />
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                {data.people.length === 1
                  ? '1 person'
                  : String(data.people.length) + ' people'}
              </Text>
            </HStack>
            <HStack>
              <Text>Seasons</Text>
              <Spacer />
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                {String(data.seasons.length)}
              </Text>
            </HStack>
            <HStack>
              <Text>Journal entries</Text>
              <Spacer />
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                {String(data.activities.length)}
              </Text>
            </HStack>
          </Section>
        </Form>

        <Alert
          title="Notifications are off"
          isPresented={denied}
          onIsPresentedChange={setDenied}>
          <Alert.Message>
            <Text>
              Turn them on for this app in the Settings app, then come back and try again.
            </Text>
          </Alert.Message>
          <Alert.Actions>
            <Button label="OK" onPress={() => setDenied(false)} />
          </Alert.Actions>
        </Alert>
      </Host>
    </>
  );
}
