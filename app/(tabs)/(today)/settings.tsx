import { Alert, Button, Form, Host, HStack, Section, Spacer, Text, Toggle } from '@expo/ui/swift-ui';
import { foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  calendarAvailable,
  removeCalendar,
  requestCalendarAccess,
  syncCalendar,
} from '../../../src/calendar/calendar';
import { exportData, pickImportFile } from '../../../src/data/backup';
import type { AppData } from '../../../src/data/store';
import {
  replaceAllData,
  setCalendarSync,
  setRemindersEnabled,
  useStore,
} from '../../../src/data/store';
import { useEntitlements } from '../../../src/purchases/entitlements';
import { canSyncCalendar } from '../../../src/purchases/limits';
import { restore } from '../../../src/purchases/purchases';
import { planReminders } from '../../../src/notifications/plan';
import {
  cancelAllReminders,
  hasPermission,
  requestPermission,
  syncReminders,
} from '../../../src/notifications/reminders';
import { HeaderButton } from '../../../src/ui/HeaderButton';

export default function SettingsScreen() {
  const { data } = useStore();
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [pendingImport, setPendingImport] = useState<AppData | null>(null);
  const [importFailed, setImportFailed] = useState(false);
  const [calendarUnavailable, setCalendarUnavailable] = useState(false);
  const calendarOn = Boolean(data.settings.calendarEnabled);
  const [scheduled, setScheduled] = useState<number | null>(null);

  const { tier, live, refresh } = useEntitlements();
  const enabled = data.settings.remindersEnabled;

  const planName =
    tier === 'family' ? 'Family' : tier === 'outdoorsman' ? 'Outdoorsman' : 'Free';
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

  async function toggleCalendar(next: boolean) {
    if (!next) {
      if (data.settings.calendarId) await removeCalendar(data.settings.calendarId);
      setCalendarSync(false, undefined);
      return;
    }

    const gate = canSyncCalendar(tier);
    if (!gate.allowed) {
      router.push(`/paywall?requires=${gate.requires}&reason=${encodeURIComponent(gate.reason)}`);
      return;
    }

    if (!calendarAvailable() || !(await requestCalendarAccess())) {
      setCalendarUnavailable(true);
      return;
    }

    const result = await syncCalendar(data, data.settings.calendarId);
    if (!result) {
      setCalendarUnavailable(true);
      return;
    }
    setCalendarSync(true, result.calendarId);
  }

  async function startImport() {
    const result = await pickImportFile();
    if (result.status === 'cancelled') return;
    if (result.status === 'invalid') {
      setImportFailed(true);
      return;
    }
    setPendingImport(result.data);
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
            title="Subscription"
            footer={
              <Text>
                {tier === 'free'
                  ? 'Free keeps three active licenses, tags or permits, and an unlimited journal. Logging is never paywalled.'
                  : 'Manage or cancel in your Apple Account settings.'}
              </Text>
            }>
            <HStack>
              <Text>Plan</Text>
              <Spacer />
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                {planName}
              </Text>
            </HStack>
            {tier === 'free' ? (
              <Button
                label="See What's Included"
                systemImage="sparkles"
                onPress={() => router.push('/paywall?requires=outdoorsman')}
              />
            ) : null}
            {live ? (
              <Button
                label="Restore Purchases"
                systemImage="arrow.clockwise"
                onPress={() => {
                  void restore().then(() => refresh());
                }}
              />
            ) : null}
          </Section>

          <Section
            title="Calendar"
            footer={
              <Text>
                Openers, application deadlines and trips are written to a calendar called
                Hunting Seasons that this app creates. Your own calendars are never touched,
                and turning this off deletes it.
              </Text>
            }>
            <Toggle label="Add to Calendar" isOn={calendarOn} onIsOnChange={toggleCalendar} />
          </Section>

          <Section
            title="Your Data"
            footer={
              <Text>
                A plain file with every record you have entered. Photos stay in the app and
                travel with your device backup. Importing replaces everything here.
              </Text>
            }>
            <Button
              label="Export"
              systemImage="square.and.arrow.up"
              onPress={() => {
                void exportData(data);
              }}
            />
            <Button
              label="Import"
              systemImage="square.and.arrow.down"
              onPress={() => {
                void startImport();
              }}
            />
          </Section>

          <Section
            title="Reminders"
            footer={
              <Text>
                Openers a week and a day out, licenses 30 and 7 days before they lapse, draw
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
            <Button
              label="How This App Works"
              systemImage="questionmark.circle"
              onPress={() => router.push('/welcome')}
            />
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
          title="Replace everything?"
          isPresented={pendingImport !== null}
          onIsPresentedChange={(presented) => {
            if (!presented) setPendingImport(null);
          }}>
          <Alert.Message>
            <Text>
              This file becomes your records. Whatever is on this device now is discarded.
            </Text>
          </Alert.Message>
          <Alert.Actions>
            <Button
              role="destructive"
              label="Replace"
              onPress={() => {
                if (pendingImport) replaceAllData(pendingImport);
                setPendingImport(null);
              }}
            />
            <Button role="cancel" label="Cancel" onPress={() => setPendingImport(null)} />
          </Alert.Actions>
        </Alert>

        <Alert
          title="Calendar is unavailable"
          isPresented={calendarUnavailable}
          onIsPresentedChange={setCalendarUnavailable}>
          <Alert.Message>
            <Text>
              Allow calendar access for this app in the Settings app. If you have just
              updated, this build may predate calendar support.
            </Text>
          </Alert.Message>
          <Alert.Actions>
            <Button label="OK" onPress={() => setCalendarUnavailable(false)} />
          </Alert.Actions>
        </Alert>

        <Alert
          title="That file could not be read"
          isPresented={importFailed}
          onIsPresentedChange={setImportFailed}>
          <Alert.Message>
            <Text>It does not look like a file this app exported.</Text>
          </Alert.Message>
          <Alert.Actions>
            <Button label="OK" onPress={() => setImportFailed(false)} />
          </Alert.Actions>
        </Alert>

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
