import { DatePicker, Form, Host, Section, Text, TextField, Toggle } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import { addTrip, useStore } from '../../../../src/data/store';
import { todayISO } from '../../../../src/model/derive';
import { HeaderButton } from '../../../../src/ui/HeaderButton';

export default function NewTripScreen() {
  const { data } = useStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [starts, setStarts] = useState(new Date());
  const [ends, setEnds] = useState(new Date());
  const [going, setGoing] = useState<string[]>(() => data.people.slice(0, 1).map((p) => p.id));

  function toggle(personId: string, on: boolean) {
    setGoing((current) =>
      on ? [...new Set([...current, personId])] : current.filter((id) => id !== personId)
    );
  }

  function save() {
    if (name.trim().length === 0) return;
    addTrip({
      name,
      locationName: location,
      startsOn: todayISO(starts),
      endsOn: todayISO(ends),
      participantIds: going,
    });
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Plan a Trip',
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => (
            <HeaderButton
              label="Add"
              onPress={save}
              prominent
              disabled={name.trim().length === 0}
            />
          ),
        }}
      />
      <Host style={{ flex: 1 }} useViewportSizeMeasurement>
        <Form>
          <Section>
            <TextField placeholder="Opening Weekend" onTextChange={setName} autoFocus />
            <TextField placeholder="Where" onTextChange={setLocation} />
          </Section>

          <Section>
            <DatePicker
              title="Leaves"
              selection={starts}
              displayedComponents={['date']}
              onDateChange={setStarts}
              modifiers={[datePickerStyle('compact')]}
            />
            <DatePicker
              title="Returns"
              selection={ends}
              displayedComponents={['date']}
              onDateChange={setEnds}
              modifiers={[datePickerStyle('compact')]}
            />
          </Section>

          {data.people.length > 0 ? (
            <Section
              title="Going"
              footer={
                <Text>
                  Link the seasons this trip is for afterwards, and the app will tell you
                  who is short a license before you are standing in a parking lot.
                </Text>
              }>
              {data.people.map((person) => (
                <Toggle
                  key={person.id}
                  label={person.name}
                  isOn={going.includes(person.id)}
                  onIsOnChange={(on) => toggle(person.id, on)}
                />
              ))}
            </Section>
          ) : null}
        </Form>
      </Host>
    </>
  );
}
