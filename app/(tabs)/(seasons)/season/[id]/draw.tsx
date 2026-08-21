import { DatePicker, Form, Picker, Section, Text, TextField, Toggle, useNativeState } from '@expo/ui/swift-ui';
import {
  contentShape,
  datePickerStyle,
  foregroundStyle,
  keyboardType,
  onTapGesture,
  pickerStyle,
  shapes,
  tag,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { drawForSeason, removeDrawApplication, saveDrawApplication, useStore } from '../../../../../src/data/store';
import { DRAW_STATUS_LABELS, DRAW_STATUS_ORDER, pointsAreRelevant } from '../../../../../src/model/draw';
import { todayISO } from '../../../../../src/model/derive';
import type { DrawStatus } from '../../../../../src/model/types';
import { HeaderButton } from '../../../../../src/ui/HeaderButton';
import { AppHost } from '../../../../../src/ui/AppHost';

function parseDate(iso: string | undefined, fallback: Date): Date {
  if (!iso) return fallback;
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/**
 * The draw is part of the season, not a separate thing to maintain. A hunt starts
 * the day you decide to apply, not the day you find out you were successful.
 */
export default function SeasonDrawScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const router = useRouter();

  const season = data.seasons.find((entry) => entry.id === id);
  const existing = season ? drawForSeason(data, season.id) : undefined;
  const thisYear = season?.year ?? new Date().getFullYear();

  const [status, setStatus] = useState<DrawStatus>(existing?.status ?? 'planning');
  const [tracksDates, setTracksDates] = useState(
    Boolean(existing?.deadline || existing?.opensOn || existing?.resultsOn)
  );
  const [opens, setOpens] = useState(() => parseDate(existing?.opensOn, new Date(thisYear, 2, 1)));
  const [deadline, setDeadline] = useState(() =>
    parseDate(existing?.deadline, new Date(thisYear, 3, 7))
  );
  const [results, setResults] = useState(() =>
    parseDate(existing?.resultsOn, new Date(thisYear, 4, 28))
  );
  const [points, setPoints] = useState(
    existing?.preferencePoints != null ? String(existing.preferencePoints) : ''
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');

  // Uncontrolled fields would render empty while holding the old values in state,
  // which reads as data loss even though saving would have preserved it.
  const pointsState = useNativeState(
    existing?.preferencePoints != null ? String(existing.preferencePoints) : ''
  );
  const notesState = useNativeState(existing?.notes ?? '');

  function save() {
    if (!season) return;
    const parsedPoints = Number.parseInt(points, 10);
    saveDrawApplication(season.id, {
      status,
      opensOn: tracksDates ? todayISO(opens) : undefined,
      deadline: tracksDates ? todayISO(deadline) : undefined,
      resultsOn: tracksDates ? todayISO(results) : undefined,
      preferencePoints: Number.isFinite(parsedPoints) ? parsedPoints : undefined,
      notes,
    });
    router.back();
  }

  function remove() {
    if (!season) return;
    removeDrawApplication(season.id);
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? 'Draw' : 'Add Draw',
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => <HeaderButton label="Save" onPress={save} prominent />,
        }}
      />
      <AppHost style={{ flex: 1 }} useViewportSizeMeasurement>
        <Form>
          <Section
            footer={
              <Text>
                A season moves through the draw with you — planning, applied, drawn, tag in
                hand.
              </Text>
            }>
            <Picker
              label="Status"
              selection={status}
              onSelectionChange={(value) => setStatus(value as DrawStatus)}
              modifiers={[pickerStyle('menu')]}>
              {DRAW_STATUS_ORDER.map((value) => (
                <Text key={value} modifiers={[tag(value)]}>
                  {DRAW_STATUS_LABELS[value]}
                </Text>
              ))}
            </Picker>
          </Section>

          <Section
            footer={
              <Text>
                Deadlines are the part nobody can afford to miss. With dates saved, Today
                counts them down and reminders fire 30, 7 and 1 days out.
              </Text>
            }>
            <Toggle label="Track dates" isOn={tracksDates} onIsOnChange={setTracksDates} />
            {tracksDates ? (
              <DatePicker
                title="Applications open"
                selection={opens}
                displayedComponents={['date']}
                onDateChange={setOpens}
                modifiers={[datePickerStyle('compact')]}
              />
            ) : null}
            {tracksDates ? (
              <DatePicker
                title="Deadline"
                selection={deadline}
                displayedComponents={['date']}
                onDateChange={setDeadline}
                modifiers={[datePickerStyle('compact')]}
              />
            ) : null}
            {tracksDates ? (
              <DatePicker
                title="Results"
                selection={results}
                displayedComponents={['date']}
                onDateChange={setResults}
                modifiers={[datePickerStyle('compact')]}
              />
            ) : null}
          </Section>

          {pointsAreRelevant(status) ? (
            <Section
              footer={<Text>Points you hold going into this draw, if the state uses them.</Text>}>
              <TextField
                text={pointsState}
                placeholder="Preference points"
                onTextChange={setPoints}
                modifiers={[keyboardType('numeric')]}
              />
            </Section>
          ) : null}

          <Section title="Notes">
            <TextField
              text={notesState}
              placeholder="Unit 61 second choice. Party application with Dad."
              onTextChange={setNotes}
              axis="vertical"
            />
          </Section>

          {existing ? (
            <Section>
              <Text
                modifiers={[
                  foregroundStyle('red'),
                  contentShape(shapes.rectangle()),
                  onTapGesture(remove),
                ]}>
                Remove Draw
              </Text>
            </Section>
          ) : null}
        </Form>
      </AppHost>
    </>
  );
}
