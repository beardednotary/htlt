import {
  DatePicker,
  Form,
  Host,
  Picker,
  Section,
  Stepper,
  Text,
  TextField,
  Toggle,
} from '@expo/ui/swift-ui';
import { datePickerStyle, keyboardType, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import {
  HUNTING_SPECIES,
  METHOD_LABELS,
  METHOD_ORDER,
  TECHNIQUE_LABELS,
  TECHNIQUE_ORDER,
} from '../../../src/data/constants';
import { addActivity, addCatch, addHarvest, tagForSeason, useStore } from '../../../src/data/store';
import { seasonTitle, todayISO } from '../../../src/model/derive';
import type { FishingTechnique, Harvest, MethodOfTake, Pursuit } from '../../../src/model/types';
import { captureCoordinate, locationAvailable } from '../../../src/data/location';
import { HeaderButton } from '../../../src/ui/HeaderButton';

const NO_SEASON = 'none';

const SEXES: { value: NonNullable<Harvest['sex']>; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
];

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

  const [took, setTook] = useState(false);
  const [species, setSpecies] = useState('');
  const [customSpecies, setCustomSpecies] = useState('');
  const [sex, setSex] = useState<NonNullable<Harvest['sex']>>('unknown');
  const [points, setPoints] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [kept, setKept] = useState(true);
  const [recordWhere, setRecordWhere] = useState(false);

  const linkedSeason = seasons.find((season) => season.id === seasonId);
  // A harvest on a Deer season is a deer. Asking again invites a typo.
  const speciesFallback = linkedSeason?.species ?? (hunting ? 'Deer' : 'Fish');
  const speciesChoices = useMemo(() => {
    const list = linkedSeason?.species
      ? [linkedSeason.species, ...HUNTING_SPECIES.filter((s) => s !== linkedSeason.species)]
      : [...HUNTING_SPECIES];
    return list;
  }, [linkedSeason]);
  const chosenSpecies = species || speciesFallback;
  const needsCustomSpecies = hunting && chosenSpecies === 'Other';

  async function save() {
    const activity = addActivity({
      pursuit,
      date: todayISO(date),
      seasonId: seasonId === NO_SEASON ? undefined : seasonId,
      locationName: location,
      methodOfTake: hunting ? method : undefined,
      technique: hunting ? undefined : technique,
      notes,
    });

    if (took) {
      const picked = hunting ? chosenSpecies : species.trim();
      const named =
        (picked === 'Other' ? customSpecies.trim() : picked) || speciesFallback;
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
    }

    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: hunting ? 'Log Hunt' : 'Log Fishing Trip',
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => <HeaderButton label="Save" onPress={() => { void save(); }} prominent />,
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

          <Section
            footer={
              <Text>
                {hunting
                  ? 'A day with nothing taken is still worth logging.'
                  : 'Leave this off for a trip that skunked you.'}
              </Text>
            }>
            <Toggle
              label={hunting ? 'Harvested' : 'Caught something'}
              isOn={took}
              onIsOnChange={setTook}
            />
            {took && hunting ? (
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
            ) : null}
            {took && needsCustomSpecies ? (
              <TextField placeholder="Which species" onTextChange={setCustomSpecies} />
            ) : null}
            {took && !hunting ? (
              <TextField placeholder="Species — Rainbow Trout" onTextChange={setSpecies} />
            ) : null}
            {took && hunting ? (
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
            ) : null}
            {took && hunting ? (
              <TextField
                placeholder="Points (optional)"
                onTextChange={setPoints}
                modifiers={[keyboardType('numeric')]}
              />
            ) : null}
            {took && hunting && locationAvailable() ? (
              <Toggle label="Record where" isOn={recordWhere} onIsOnChange={setRecordWhere} />
            ) : null}
            {took && !hunting ? (
              <Stepper
                label={quantity === 1 ? '1 fish' : quantity + ' fish'}
                value={quantity}
                min={1}
                max={200}
                step={1}
                onValueChange={setQuantity}
              />
            ) : null}
            {took && !hunting ? <Toggle label="Kept" isOn={kept} onIsOnChange={setKept} /> : null}
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
