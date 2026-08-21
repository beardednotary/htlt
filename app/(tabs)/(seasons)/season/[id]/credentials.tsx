import { DatePicker, Form, HStack, Picker, Section, Spacer, Text, TextField, VStack } from '@expo/ui/swift-ui';
import {
  contentShape,
  datePickerStyle,
  font,
  foregroundStyle,
  onTapGesture,
  pickerStyle,
  shapes,
  tag,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { jurisdictionName } from '../../../../../src/data/constants';
import { credentialKindLabel, licenceWord } from '../../../../../src/data/vocabulary';
import {
  addCredential,
  linkCredential,
  primaryPersonId,
  useStore,
} from '../../../../../src/data/store';
import { todayISO } from '../../../../../src/model/derive';
import type { CredentialKind } from '../../../../../src/model/types';
import { useEntitlements } from '../../../../../src/purchases/entitlements';
import { canAddCredential } from '../../../../../src/purchases/limits';
import { HeaderButton } from '../../../../../src/ui/HeaderButton';
import { AppHost } from '../../../../../src/ui/AppHost';

const KIND_ORDER: CredentialKind[] = ['license', 'tag', 'permit', 'validation'];

/**
 * Credentials are entered once and pointed at every season they cover, so this screen
 * offers the household's existing ones before it offers a blank form.
 */
export default function SeasonCredentialsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const router = useRouter();
  const { tier } = useEntitlements();

  const season = data.seasons.find((s) => s.id === id);
  const jurisdictionId = season?.jurisdictionId ?? 'us-ca';
  const available = data.credentials.filter((c) => !season?.credentialIds.includes(c.id));

  const people = data.people;
  const [personId, setPersonId] = useState<string>(() => people[0]?.id ?? '');
  const [kind, setKind] = useState<CredentialKind>('license');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [expires, setExpires] = useState(
    new Date(season?.year ?? new Date().getFullYear(), 11, 31)
  );

  function create() {
    if (!season || name.trim().length === 0) return;

    const gate = canAddCredential(data, tier);
    if (!gate.allowed) {
      router.push(`/paywall?requires=${gate.requires}&reason=${encodeURIComponent(gate.reason)}`);
      return;
    }

    const credential = addCredential({
      kind,
      name: name.trim(),
      jurisdictionId: season.jurisdictionId,
      personId: personId || primaryPersonId(),
      number: number.trim() || undefined,
      year: season.year,
      validUntil: todayISO(expires),
    });
    linkCredential(season.id, credential.id);
    router.back();
  }

  function link(credentialId: string) {
    if (!season) return;
    linkCredential(season.id, credentialId);
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${licenceWord(jurisdictionId)} or Tag`,
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => (
            <HeaderButton
              label="Add"
              onPress={create}
              prominent
              disabled={name.trim().length === 0}
            />
          ),
        }}
      />
      <AppHost style={{ flex: 1 }} useViewportSizeMeasurement>
        <Form>
          <Section title="New">
            {people.length > 1 ? (
              <Picker
                label="Whose"
                selection={personId}
                onSelectionChange={(value) => setPersonId(String(value))}
                modifiers={[pickerStyle('menu')]}>
                {people.map((person) => (
                  <Text key={person.id} modifiers={[tag(person.id)]}>
                    {person.name}
                  </Text>
                ))}
              </Picker>
            ) : null}
            <Picker
              label="Kind"
              selection={kind}
              onSelectionChange={(value) => setKind(value as CredentialKind)}
              modifiers={[pickerStyle('menu')]}>
              {KIND_ORDER.map((value) => (
                <Text key={value} modifiers={[tag(value)]}>
                  {credentialKindLabel(value, jurisdictionId)}
                </Text>
              ))}
            </Picker>
            <TextField
              placeholder={
                season
                  ? `${jurisdictionName(jurisdictionId)} Hunting ${licenceWord(jurisdictionId)}`
                  : 'Name'
              }
              onTextChange={setName}
            />
            <TextField placeholder="Number (optional)" onTextChange={setNumber} />
            <DatePicker
              title="Expires"
              selection={expires}
              displayedComponents={['date']}
              onDateChange={setExpires}
              modifiers={[datePickerStyle('compact')]}
            />
          </Section>

          {available.length > 0 ? (
            <Section
              title="Already Entered"
              footer={<Text>One license can cover as many seasons as it applies to.</Text>}>
              {available.map((credential) => (
                <HStack
                  key={credential.id}
                  modifiers={[
                    contentShape(shapes.rectangle()),
                    onTapGesture(() => link(credential.id)),
                  ]}>
                  <VStack alignment="leading" spacing={2}>
                    <Text>{credential.name}</Text>
                    <Text
                      modifiers={[
                        font({ textStyle: 'footnote' }),
                        foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      ]}>
                      {jurisdictionName(credential.jurisdictionId)}
                    </Text>
                  </VStack>
                  <Spacer />
                </HStack>
              ))}
            </Section>
          ) : null}
        </Form>
      </AppHost>
    </>
  );
}
