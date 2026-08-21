import { Form, Host, Picker, Section, Stepper, Text, TextField, Toggle } from '@expo/ui/swift-ui';
import { keyboardType, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { HUNTING_SPECIES } from '../../../../../src/data/constants';
import { addCatch, addHarvest, tagForSeason, useStore } from '../../../../../src/data/store';
import type { Harvest } from '../../../../../src/model/types';
import { captureCoordinate, locationAvailable } from '../../../../../src/data/location';
import { HeaderButton } from '../../../../../src/ui/HeaderButton';

const SEXES: { value: NonNullable<Harvest['sex']>; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
];

/** Adding to a day already logged — the second fish, or the buck taken after lunch. */
export default function AddTakeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const router = useRouter();

  const activity = data.activities.find((entry) => entry.id === id);
  const season = data.seasons.find((s) => s.id === activity?.seasonId);
  const hunting = activity?.pursuit !== 'fishing';

  const [species, setSpecies] = useState('');
  const [customSpecies, setCustomSpecies] = useState('');
  const [sex, setSex] = useState<NonNullable<Harvest['sex']>>('unknown');
  const [points, setPoints] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [kept, setKept] = useState(true);
  const [recordWhere, setRecordWhere] = useState(false);

  const fallback = season?.species ?? (hunting ? 'Deer' : 'Fish');
  const speciesChoices = season?.species
    ? [season.species, ...HUNTING_SPECIES.filter((name) => name !== season.species)]
    : [...HUNTING_SPECIES];
  const chosenSpecies = species || fallback;
  const needsCustomSpecies = hunting && chosenSpecies === 'Other';

  async function save() {
    if (!activity) return;
    const picked = hunting ? chosenSpecies : species.trim();
    const named = (picked === 'Other' ? customSpecies.trim() : picked) || fallback;
    if (hunting) {
      const parsedPoints = Number.parseInt(points, 10);
      const coordinate = recordWhere ? await captureCoordinate() : null;
      addHarvest({
        activityId: activity.id,
        species: named,
        coordinate: coordinate ?? undefined,
        sex,
        points: Number.isFinite(parsedPoints) ? parsedPoints : undefined,
        credentialId: tagForSeason(activity.seasonId),
      });
    } else {
      addCatch({ activityId: activity.id, species: named, quantity, kept });
    }
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: hunting ? 'Add Harvest' : 'Add Catch',
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => <HeaderButton label="Add" onPress={() => { void save(); }} prominent />,
        }}
      />
      <Host style={{ flex: 1 }} useViewportSizeMeasurement>
        <Form>
          <Section
            footer={
              <Text>
                {hunting
                  ? 'Seeded from the season this entry belongs to.'
                  : 'Left blank, this is recorded as ' + fallback + '.'}
              </Text>
            }>
            {hunting ? (
              <Picker
                label="Species"
                selection={chosenSpecies}
                onSelectionChange={(value) => setSpecies(String(value))}
                modifiers={[pickerStyle('menu')]}>
                {speciesChoices.map((name) => (
                  <Text key={name} modifiers={[tag(name)]}>
                    {name}
                  </Text>
                ))}
              </Picker>
            ) : (
              <TextField placeholder="Species — Rainbow Trout" onTextChange={setSpecies} />
            )}
            {needsCustomSpecies ? (
              <TextField placeholder="Which species" onTextChange={setCustomSpecies} />
            ) : null}
          </Section>

          {hunting ? (
            <Section>
              <Picker
                label="Sex"
                selection={sex}
                onSelectionChange={(value) => setSex(value as NonNullable<Harvest['sex']>)}
                modifiers={[pickerStyle('menu')]}>
                {SEXES.map((option) => (
                  <Text key={option.value} modifiers={[tag(option.value)]}>
                    {option.label}
                  </Text>
                ))}
              </Picker>
              <TextField
                placeholder="Points (optional)"
                onTextChange={setPoints}
                modifiers={[keyboardType('numeric')]}
              />
              {locationAvailable() ? (
                <Toggle label="Record where" isOn={recordWhere} onIsOnChange={setRecordWhere} />
              ) : null}
            </Section>
          ) : (
            <Section>
              <Stepper
                label={quantity === 1 ? '1 fish' : quantity + ' fish'}
                value={quantity}
                min={1}
                max={200}
                step={1}
                onValueChange={setQuantity}
              />
              <Toggle label="Kept" isOn={kept} onIsOnChange={setKept} />
            </Section>
          )}
        </Form>
      </Host>
    </>
  );
}
