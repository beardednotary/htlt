import { DatePicker, Form, Picker, Section, Text } from '@expo/ui/swift-ui';
import { datePickerStyle, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { METHOD_LABELS, METHOD_ORDER } from '../../../../../src/data/constants';
import { addSeasonWindow, useStore } from '../../../../../src/data/store';
import { todayISO } from '../../../../../src/model/derive';
import type { MethodOfTake } from '../../../../../src/model/types';
import { HeaderButton } from '../../../../../src/ui/HeaderButton';
import { AppHost } from '../../../../../src/ui/AppHost';

/** A season can have several dated windows — archery, then general, then youth. */
export default function SeasonDatesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const router = useRouter();

  const season = data.seasons.find((s) => s.id === id);
  const [method, setMethod] = useState<MethodOfTake>(season?.methods[0] ?? 'rifle');
  const [opens, setOpens] = useState(new Date());
  const [closes, setCloses] = useState(new Date());

  function save() {
    if (!season) return;
    const opensOn = todayISO(opens);
    const closesOn = todayISO(closes);
    addSeasonWindow(season.id, {
      label: METHOD_LABELS[method],
      method,
      opensOn,
      // A window that closes before it opens is a typo, not an intention.
      closesOn: closesOn < opensOn ? opensOn : closesOn,
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
      <AppHost style={{ flex: 1 }} useViewportSizeMeasurement>
        <Form>
          <Section>
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

          <Section footer={<Text>Openers and closers, as the agency publishes them.</Text>}>
            <DatePicker
              title="Opens"
              selection={opens}
              displayedComponents={['date']}
              onDateChange={setOpens}
              modifiers={[datePickerStyle('compact')]}
            />
            <DatePicker
              title="Closes"
              selection={closes}
              displayedComponents={['date']}
              onDateChange={setCloses}
              modifiers={[datePickerStyle('compact')]}
            />
          </Section>
        </Form>
      </AppHost>
    </>
  );
}
