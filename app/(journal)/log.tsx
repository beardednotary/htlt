import { DatePicker, Form, Host, Picker, Section, Text, TextField } from '@expo/ui/swift-ui';
import { datePickerStyle, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import {
  METHOD_LABELS,
  METHOD_ORDER,
  TECHNIQUE_LABELS,
  TECHNIQUE_ORDER,
} from '../../src/data/constants';
import { addActivity, useStore } from '../../src/data/store';
import { seasonTitle, todayISO } from '../../src/model/derive';
import type { FishingTechnique, MethodOfTake, Pursuit } from '../../src/model/types';
import { HeaderButton } from '../../src/ui/HeaderButton';

const NO_SEASON = 'none';

/**
 * Logging is meant to be quick enough to do in the truck. Date and pursuit are the
 * only things that matter; everything else is optional, including whether anything
 * was taken.
 */
export default function LogActivityScreen() {
  const { pursuit: pursuitParam } = useLocalSearchParams<{ pursuit?: string }>();
  const { data } = useStore();
  const router = useRouter();

  const pursuit: Pursuit = pursuitParam === 'fishing' ? 'fishing' : 'hunting';
  const hunting = pursuit === 'hunting';

  const seasons = useMemo(
    () => data.seasons.filter((season) => season.pursuit === pursuit),
    [data.seasons, pursuit]
  );

  const [date, setDate] = useState(new Date());
  const [seasonId, setSeasonId] = useState<string>(NO_SEASON);
  const [location, setLocation] = useState('');
  const [method, setMethod] = useState<MethodOfTake>('rifle');
  const [technique, setTechnique] = useState<FishingTechnique>('spin');
  const [notes, setNotes] = useState('');

  function save() {
    addActivity({
      pursuit,
      date: todayISO(date),
      seasonId: seasonId === NO_SEASON ? undefined : seasonId,
      locationName: location,
      methodOfTake: hunting ? method : undefined,
      technique: hunting ? undefined : technique,
      notes,
    });
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: hunting ? 'Log Hunt' : 'Log Fishing Trip',
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => <HeaderButton label="Save" onPress={save} prominent />,
        }}
      />
      <Host style={{ flex: 1 }} useViewportSizeMeasurement>
        <Form>
          <Section>
            <DatePicker
              title="Date"
              selection={date}
              displayedComponents={['date']}
              onDateChange={setDate}
              modifiers={[datePickerStyle('compact')]}
            />
            <TextField placeholder="Where" onTextChange={setLocation} />
          </Section>

          {seasons.length > 0 ? (
            <Section
              footer={<Text>Linking a season keeps this entry with its tags and regulations.</Text>}>
              <Picker
                label="Season"
                selection={seasonId}
                onSelectionChange={(value) => setSeasonId(String(value))}
                modifiers={[pickerStyle('menu')]}>
                <Text modifiers={[tag(NO_SEASON)]}>None</Text>
                {seasons.map((season) => (
                  <Text key={season.id} modifiers={[tag(season.id)]}>
                    {seasonTitle(season)}
                  </Text>
                ))}
              </Picker>
            </Section>
          ) : null}

          <Section>
            {hunting ? (
              <Picker
                label="Method"
                selection={method}
                onSelectionChange={(value) => setMethod(value as MethodOfTake)}
                modifiers={[pickerStyle('menu')]}>
                {METHOD_ORDER.map((value) => (
                  <Text key={value} modifiers={[tag(value)]}>
                    {METHOD_LABELS[value]}
                  </Text>
                ))}
              </Picker>
            ) : (
              <Picker
                label="Technique"
                selection={technique}
                onSelectionChange={(value) => setTechnique(value as FishingTechnique)}
                modifiers={[pickerStyle('menu')]}>
                {TECHNIQUE_ORDER.map((value) => (
                  <Text key={value} modifiers={[tag(value)]}>
                    {TECHNIQUE_LABELS[value]}
                  </Text>
                ))}
              </Picker>
            )}
          </Section>

          <Section title="Notes">
            <TextField
              placeholder={hunting ? 'Saw three, none close enough.' : 'Water was high and off colour.'}
              onTextChange={setNotes}
              axis="vertical"
            />
          </Section>
        </Form>
      </Host>
    </>
  );
}
