import { Form, Host, Section, Text, TextField } from '@expo/ui/swift-ui';
import { keyboardType } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import { addPerson } from '../../../src/data/store';
import { HeaderButton } from '../../../src/ui/HeaderButton';

/**
 * A name is enough. The years are there for the people whose history predates the
 * app — a grandfather who started in 1963 is the whole reason this tab exists.
 */
export default function NewPersonScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [huntingSince, setHuntingSince] = useState('');

  function parseYear(value: string): number | undefined {
    const year = Number.parseInt(value, 10);
    if (!Number.isFinite(year)) return undefined;
    // A four-digit year that could plausibly belong to a living hunter.
    if (year < 1900 || year > new Date().getFullYear()) return undefined;
    return year;
  }

  function save() {
    if (name.trim().length === 0) return;
    addPerson({
      name,
      birthYear: parseYear(birthYear),
      huntingSince: parseYear(huntingSince),
    });
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Person',
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
            <TextField placeholder="Name" onTextChange={setName} autoFocus />
          </Section>

          <Section
            footer={
              <Text>
                Both optional. They are how a profile can eventually say &quot;hunting since
                1963&quot; for someone who never filled anything in themselves.
              </Text>
            }>
            <TextField
              placeholder="Born"
              onTextChange={setBirthYear}
              modifiers={[keyboardType('numeric')]}
            />
            <TextField
              placeholder="Hunting since"
              onTextChange={setHuntingSince}
              modifiers={[keyboardType('numeric')]}
            />
          </Section>
        </Form>
      </Host>
    </>
  );
}
