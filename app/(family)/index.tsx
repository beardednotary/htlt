import {
  ContentUnavailableView,
  HStack,
  Host,
  Image,
  List,
  Section,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  contentShape,
  font,
  foregroundStyle,
  listStyle,
  onTapGesture,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useStore } from '../../src/data/store';
import { credentialStatus } from '../../src/model/derive';
import type { Person } from '../../src/model/types';
import { HeaderButton } from '../../src/ui/HeaderButton';

export default function FamilyScreen() {
  const { data } = useStore();
  const router = useRouter();

  const people = useMemo(
    () => [...data.people].sort((a, b) => a.name.localeCompare(b.name)),
    [data.people]
  );

  /** What a glance at this person should tell you: what they hold, and what is wrong. */
  function summaryFor(person: Person): { line: string; needsAttention: boolean } {
    const credentials = data.credentials.filter((c) => c.personId === person.id);
    if (credentials.length === 0) {
      return { line: 'Nothing on file', needsAttention: false };
    }
    const problems = credentials.filter((credential) => {
      const status = credentialStatus(credential.validUntil);
      return status === 'expired' || status === 'expiring';
    });
    const held = `${credentials.length} on file`;
    if (problems.length === 0) return { line: held, needsAttention: false };
    const expired = problems.filter((c) => credentialStatus(c.validUntil) === 'expired').length;
    return {
      line: expired > 0 ? `${held} · ${expired} expired` : `${held} · ${problems.length} expiring`,
      needsAttention: true,
    };
  }

  const header = (
    <Stack.Screen
      options={{
        headerRight: () => (
          <HeaderButton systemImage="plus" onPress={() => router.push('/person/new')} />
        ),
      }}
    />
  );

  if (people.length === 0) {
    return (
      <>
        {header}
        <Host style={{ flex: 1 }}>
          <ContentUnavailableView
            title="No People Yet"
            systemImage="person.2"
            description="Add the people you hunt and fish with. Nobody needs an account of their own — you hold their licences, tags and history, which is how a family's hunting history stays in one place. Tap + to add someone."
          />
        </Host>
      </>
    );
  }

  return (
    <>
      {header}
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section
            footer={
              <Text>
                Everyone here is a record you keep. Nobody needs their own account, which is
                what lets you hold a lifetime of hunts for someone who will never install this.
              </Text>
            }>
            {people.map((person) => {
              const summary = summaryFor(person);
              return (
                <HStack
                  key={person.id}
                  modifiers={[
                    contentShape(shapes.rectangle()),
                    onTapGesture(() => router.push('/person/' + person.id)),
                  ]}>
                  <VStack alignment="leading" spacing={2}>
                    <Text modifiers={[font({ textStyle: 'body' })]}>{person.name}</Text>
                    <Text
                      modifiers={[
                        font({ textStyle: 'subheadline' }),
                        summary.needsAttention
                          ? foregroundStyle('orange')
                          : foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      ]}>
                      {summary.line}
                    </Text>
                  </VStack>
                  <Spacer />
                  <Image
                    systemName="chevron.right"
                    size={13}
                    modifiers={[foregroundStyle({ type: 'hierarchical', style: 'tertiary' })]}
                  />
                </HStack>
              );
            })}
          </Section>
        </List>
      </Host>
    </>
  );
}
