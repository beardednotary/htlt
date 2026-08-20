import {
  Alert,
  Button,
  ContentUnavailableView,
  HStack,
  Host,
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
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { removePerson, useStore } from '../../../../../src/data/store';
import { credentialKindLabel } from '../../../../../src/data/vocabulary';
import {
  credentialStatus,
  credentialStatusLine,
  formatEntryDate,
  seasonSubtitle,
  seasonTitle,
} from '../../../../../src/model/derive';

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const person = useMemo(
    () => data.people.find((entry) => entry.id === id),
    [data.people, id]
  );

  const credentials = useMemo(
    () => data.credentials.filter((credential) => credential.personId === id),
    [data.credentials, id]
  );
  const seasons = useMemo(
    () => data.seasons.filter((season) => season.participantIds.includes(id)),
    [data.seasons, id]
  );
  const activities = useMemo(
    () =>
      [...data.activities]
        .filter((activity) => activity.participantIds.includes(id))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.activities, id]
  );

  if (!person) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title="Person Not Found"
          systemImage="questionmark.folder"
          description="They may have been removed."
        />
      </Host>
    );
  }

  const harvestCount = data.harvests.filter((harvest) =>
    activities.some((activity) => activity.id === harvest.activityId)
  ).length;

  function confirmDelete() {
    if (!person) return;
    removePerson(person.id);
    setConfirmingDelete(false);
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: person.name, headerLargeTitle: false }} />
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          {person.birthYear || person.huntingSince ? (
            <Section>
              {person.birthYear ? (
                <HStack>
                  <Text>Born</Text>
                  <Spacer />
                  <Text
                    modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                    {String(person.birthYear)}
                  </Text>
                </HStack>
              ) : null}
              {person.huntingSince ? (
                <HStack>
                  <Text>Hunting since</Text>
                  <Spacer />
                  <Text
                    modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                    {String(person.huntingSince)}
                  </Text>
                </HStack>
              ) : null}
            </Section>
          ) : null}

          <Section
            title="Licenses & Tags"
            footer={<Text>Added from the season they cover, then pointed at whoever holds them.</Text>}>
            {credentials.length === 0 ? (
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                Nothing on file
              </Text>
            ) : (
              credentials.map((credential) => {
                const status = credentialStatus(credential.validUntil);
                return (
                  <VStack key={credential.id} alignment="leading" spacing={2}>
                    <Text>{credential.name}</Text>
                    <Text
                      modifiers={[
                        font({ textStyle: 'footnote' }),
                        status === 'expired' || status === 'expiring'
                          ? foregroundStyle('orange')
                          : foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      ]}>
                      {credentialKindLabel(credential.kind, credential.jurisdictionId) +
                        ' · ' +
                        credentialStatusLine(credential.validUntil)}
                    </Text>
                  </VStack>
                );
              })
            )}
          </Section>

          <Section title="Seasons">
            {seasons.length === 0 ? (
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                Not on any season yet
              </Text>
            ) : (
              seasons.map((season) => (
                <HStack
                  key={season.id}
                  modifiers={[
                    contentShape(shapes.rectangle()),
                    onTapGesture(() => router.push('/season/' + season.id)),
                  ]}>
                  <VStack alignment="leading" spacing={2}>
                    <Text>{seasonTitle(season)}</Text>
                    <Text
                      modifiers={[
                        font({ textStyle: 'footnote' }),
                        foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      ]}>
                      {seasonSubtitle(season)}
                    </Text>
                  </VStack>
                  <Spacer />
                </HStack>
              ))
            )}
          </Section>

          <Section title="History">
            <HStack>
              <Text>Days afield</Text>
              <Spacer />
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                {String(activities.length)}
              </Text>
            </HStack>
            <HStack>
              <Text>Harvests</Text>
              <Spacer />
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                {String(harvestCount)}
              </Text>
            </HStack>
            {activities.slice(0, 3).map((activity) => (
              <HStack
                key={activity.id}
                modifiers={[
                  contentShape(shapes.rectangle()),
                  onTapGesture(() => router.push('/entry/' + activity.id)),
                ]}>
                <Text
                  modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                  {activity.locationName || (activity.pursuit === 'hunting' ? 'Hunt' : 'Fishing')}
                </Text>
                <Spacer />
                <Text
                  modifiers={[
                    font({ textStyle: 'footnote' }),
                    foregroundStyle({ type: 'hierarchical', style: 'tertiary' }),
                  ]}>
                  {formatEntryDate(activity.date)}
                </Text>
              </HStack>
            ))}
          </Section>

          <Section>
            <Text
              modifiers={[
                foregroundStyle('red'),
                contentShape(shapes.rectangle()),
                onTapGesture(() => setConfirmingDelete(true)),
              ]}>
              Remove Person
            </Text>
          </Section>
        </List>

        <Alert
          title={'Remove ' + person.name + '?'}
          isPresented={confirmingDelete}
          onIsPresentedChange={setConfirmingDelete}>
          <Alert.Message>
            <Text>
              Their licenses and tags go with them. Hunts they were on are kept — the day
              still happened.
            </Text>
          </Alert.Message>
          <Alert.Actions>
            <Button role="destructive" label="Remove" onPress={confirmDelete} />
            <Button role="cancel" label="Cancel" onPress={() => setConfirmingDelete(false)} />
          </Alert.Actions>
        </Alert>
      </Host>
    </>
  );
}
