import { Form, Host, Section, Text, TextField, useNativeState } from '@expo/ui/swift-ui';
import {
  autocorrectionDisabled,
  keyboardType,
  textInputAutocapitalization,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { JURISDICTIONS } from '../../../../../src/data/constants';
import { addRegulation, useStore } from '../../../../../src/data/store';
import { HeaderButton } from '../../../../../src/ui/HeaderButton';

/**
 * We save the pointer, not the law. The agency owns the regulations and the liability
 * that comes with them; we own remembering where they are and when you last looked.
 */
export default function SeasonRegulationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const router = useRouter();

  const season = data.seasons.find((s) => s.id === id);
  const jurisdiction = JURISDICTIONS.find((j) => j.id === season?.jurisdictionId);

  const defaultTitle = jurisdiction ? `${jurisdiction.name} Regulations` : 'Regulations';
  const defaultUrl = jurisdiction?.agencyUrl ?? '';

  const titleState = useNativeState(defaultTitle);
  const urlState = useNativeState(defaultUrl);
  const [title, setTitle] = useState(defaultTitle);
  const [url, setUrl] = useState(defaultUrl);
  const [notes, setNotes] = useState('');

  function save() {
    if (!season || title.trim().length === 0) return;
    addRegulation(season.id, { title, url, notes });
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => (
            <HeaderButton
              label="Add"
              onPress={save}
              prominent
              disabled={title.trim().length === 0}
            />
          ),
        }}
      />
      <Host style={{ flex: 1 }} useViewportSizeMeasurement>
        <Form>
          <Section
            title="Official Source"
            footer={
              <Text>
                Always verify current regulations with the issuing agency. This is a link to
                theirs, not a copy of the rules.
              </Text>
            }>
            <TextField
              text={titleState}
              placeholder="2027 Mammal Hunting Regulations"
              onTextChange={setTitle}
            />
            <TextField
              text={urlState}
              placeholder="wildlife.ca.gov"
              onTextChange={setUrl}
              modifiers={[
                keyboardType('url'),
                textInputAutocapitalization('never'),
                autocorrectionDisabled(),
              ]}
            />
          </Section>

          <Section title="Notes">
            <TextField
              placeholder="Nonlead ammunition required. Check shooting hours before the opener."
              onTextChange={setNotes}
              axis="vertical"
            />
          </Section>
        </Form>
      </Host>
    </>
  );
}
