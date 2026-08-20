import { Form, Host, Picker, Section, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import {
  HUNTING_SPECIES,
  JURISDICTIONS,
  METHOD_LABELS,
  METHOD_ORDER,
} from '../../../src/data/constants';
import { addSeason } from '../../../src/data/store';
import type { MethodOfTake, Pursuit } from '../../../src/model/types';
import { HeaderButton } from '../../../src/ui/HeaderButton';

const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];

/**
 * Deliberately short. Enough to create the season and see it on the list — dates,
 * tags, licenses and regulations get filled in afterwards, when the hunter has them.
 */
export default function NewSeasonScreen() {
  const router = useRouter();
  const [pursuit, setPursuit] = useState<Pursuit>('hunting');
  const [species, setSpecies] = useState(HUNTING_SPECIES[0]);
  const [jurisdictionId, setJurisdictionId] = useState('us-ca');
  const [year, setYear] = useState(THIS_YEAR);
  const [method, setMethod] = useState<MethodOfTake>('rifle');

  const hunting = pursuit === 'hunting';

  function save() {
    addSeason({
      pursuit,
      species: hunting ? species : undefined,
      jurisdictionId,
      year,
      methods: hunting ? [method] : [],
    });
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => <HeaderButton label="Add" onPress={save} prominent />,
        }}
      />
      <Host style={{ flex: 1 }} useViewportSizeMeasurement>
        <Form>
          <Section>
            <Picker
              selection={pursuit}
              onSelectionChange={(value) => setPursuit(value as Pursuit)}
              modifiers={[pickerStyle('segmented')]}>
              <Text modifiers={[tag('hunting')]}>Hunting</Text>
              <Text modifiers={[tag('fishing')]}>Fishing</Text>
            </Picker>
          </Section>

          {hunting ? (
            <Section>
              <Picker
                label="Species"
                selection={species}
                onSelectionChange={(value) => setSpecies(String(value))}
                modifiers={[pickerStyle('menu')]}>
                {HUNTING_SPECIES.map((name) => (
                  <Text key={name} modifiers={[tag(name)]}>
                    {name}
                  </Text>
                ))}
              </Picker>
            </Section>
          ) : null}

          <Section>
            <Picker
              label="Where"
              selection={jurisdictionId}
              onSelectionChange={(value) => setJurisdictionId(String(value))}
              modifiers={[pickerStyle('menu')]}>
              {JURISDICTIONS.map((jurisdiction) => (
                <Text key={jurisdiction.id} modifiers={[tag(jurisdiction.id)]}>
                  {jurisdiction.name}
                </Text>
              ))}
            </Picker>
            <Picker
              label="Year"
              selection={year}
              onSelectionChange={(value) => setYear(Number(value))}
              modifiers={[pickerStyle('menu')]}>
              {YEARS.map((value) => (
                <Text key={value} modifiers={[tag(value)]}>
                  {`${value}`}
                </Text>
              ))}
            </Picker>
          </Section>

          {hunting ? (
            <Section
              footer={<Text>Add more methods, dates and tags after the season exists.</Text>}>
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
            </Section>
          ) : null}
        </Form>
      </Host>
    </>
  );
}
