import { Alert, Button, ContentUnavailableView, HStack, Image, List, Section, Spacer, Text, Toggle, VStack } from '@expo/ui/swift-ui';
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

import { removeTrip, setTripParticipant, setTripSeason, useStore } from '../../../../../src/data/store';
import { formatEntryDate, formatShortDate, seasonSubtitle, seasonTitle } from '../../../../../src/model/derive';
import { tripReadiness } from '../../../../../src/model/readiness';
import { AppHost } from '../../../../../src/ui/AppHost';

export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const trip = useMemo(() => data.trips.find((entry) => entry.id === id), [data.trips, id]);
  const readiness = useMemo(() => (trip ? tripReadiness(data, trip) : null), [data, trip]);

  if (!trip || !readiness) {
    return (
      <AppHost style={{ flex: 1 }}>
        <ContentUnavailableView
          title="Trip Not Found"
          systemImage="questionmark.folder"
          description="It may have been deleted."
        />
      </AppHost>
    );
  }

  const entries = data.activities
    .filter((activity) => activity.tripId === trip.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  function confirmDelete() {
    if (!trip) return;
    removeTrip(trip.id);
    setConfirmingDelete(false);
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: trip.name, headerLargeTitle: false }} />
      <AppHost style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section>
            <HStack>
              <Text>Dates</Text>
              <Spacer />
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                {`${formatShortDate(trip.startsOn)} – ${formatShortDate(trip.endsOn)}`}
              </Text>
            </HStack>
            {trip.locationName ? (
              <HStack>
                <Text>Where</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                  {trip.locationName}
                </Text>
              </HStack>
            ) : null}
          </Section>

          <Section
            title="Ready"
            footer={
              <Text>
                {readiness.unknowable
                  ? 'Add who is going and link the seasons this trip is for, and this becomes a real answer.'
                  : 'Checked against the trip dates, not today — a license that lapses the day before the opener is the point.'}
              </Text>
            }>
            {readiness.unknowable ? (
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                Nothing to check yet
              </Text>
            ) : (
              readiness.people.map((person) => (
                <VStack key={person.personId} alignment="leading" spacing={3}>
                  <HStack>
                    <Text>{person.name}</Text>
                    <Spacer />
                    <Image
                      systemName={person.ready ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'}
                      size={16}
                      color={person.ready ? 'green' : 'orange'}
                    />
                  </HStack>
                  {person.issues.map((issue) => (
                    <Text
                      key={issue}
                      modifiers={[
                        font({ textStyle: 'footnote' }),
                        foregroundStyle('orange'),
                      ]}>
                      {issue}
                    </Text>
                  ))}
                </VStack>
              ))
            )}
          </Section>

          <Section title="Going">
            {data.people.length === 0 ? (
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                Nobody in the household yet
              </Text>
            ) : (
              data.people.map((person) => (
                <Toggle
                  key={person.id}
                  label={person.name}
                  isOn={trip.participantIds.includes(person.id)}
                  onIsOnChange={(on) => setTripParticipant(trip.id, person.id, on)}
                />
              ))
            )}
          </Section>

          <Section
            title="Seasons"
            footer={<Text>What this trip is for. Readiness is checked against these.</Text>}>
            {data.seasons.length === 0 ? (
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                No seasons yet
              </Text>
            ) : (
              data.seasons.map((season) => (
                <Toggle
                  key={season.id}
                  label={`${seasonTitle(season)} · ${seasonSubtitle(season)}`}
                  isOn={trip.seasonIds.includes(season.id)}
                  onIsOnChange={(on) => setTripSeason(trip.id, season.id, on)}
                />
              ))
            )}
          </Section>

          <Section title="Journal">
            {entries.length === 0 ? (
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                Nothing logged on this trip yet
              </Text>
            ) : (
              entries.map((activity) => (
                <HStack
                  key={activity.id}
                  modifiers={[
                    contentShape(shapes.rectangle()),
                    onTapGesture(() => router.push('/entry/' + activity.id)),
                  ]}>
                  <Text>
                    {activity.locationName ||
                      (activity.pursuit === 'hunting' ? 'Hunt' : 'Fishing')}
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
              ))
            )}
          </Section>

          <Section>
            <Text
              modifiers={[
                foregroundStyle('red'),
                contentShape(shapes.rectangle()),
                onTapGesture(() => setConfirmingDelete(true)),
              ]}>
              Delete Trip
            </Text>
          </Section>
        </List>

        <Alert
          title={'Delete ' + trip.name + '?'}
          isPresented={confirmingDelete}
          onIsPresentedChange={setConfirmingDelete}>
          <Alert.Message>
            <Text>Entries logged on it are kept. The days still happened.</Text>
          </Alert.Message>
          <Alert.Actions>
            <Button role="destructive" label="Delete" onPress={confirmDelete} />
            <Button role="cancel" label="Cancel" onPress={() => setConfirmingDelete(false)} />
          </Alert.Actions>
        </Alert>
      </AppHost>
    </>
  );
}
