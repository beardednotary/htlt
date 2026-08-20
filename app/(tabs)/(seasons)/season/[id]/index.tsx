import {
  Alert,
  Button,
  ContentUnavailableView,
  HStack,
  Host,
  Image,
  List,
  Menu,
  Section,
  Spacer,
  SwipeActions,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  listStyle,
  shapes,
  contentShape,
  onTapGesture,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useMemo, useState } from 'react';

import { addCredentialLabel, credentialsSectionTitle } from '../../../../../src/data/vocabulary';
import {
  addSeasonParticipant,
  markRegulationReviewed,
  removeRegulation,
  removeSeason,
  removeSeasonParticipant,
  useStore,
} from '../../../../../src/data/store';
import {
  formatShortDate,
  reviewedLine,
  seasonSubtitle,
  seasonTitle,
  todayISO,
} from '../../../../../src/model/derive';

export default function SeasonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const season = useMemo(() => data.seasons.find((s) => s.id === id), [data.seasons, id]);
  const hunts = useMemo(
    () => data.activities.filter((activity) => activity.seasonId === id),
    [data.activities, id]
  );

  if (!season) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title="Season Not Found"
          systemImage="questionmark.folder"
          description="It may have been deleted."
        />
      </Host>
    );
  }

  const credentials = data.credentials.filter((c) => season.credentialIds.includes(c.id));
  const regulations = data.regulations.filter((r) => season.regulationIds.includes(r.id));
  const participants = data.people.filter((person) => season.participantIds.includes(person.id));
  const available = data.people.filter((person) => !season.participantIds.includes(person.id));

  function confirmDelete() {
    if (!season) return;
    removeSeason(season.id);
    setConfirmingDelete(false);
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: seasonTitle(season), headerLargeTitle: false }} />
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section>
            <VStack alignment="leading" spacing={2}>
              <Text modifiers={[font({ textStyle: 'title2', weight: 'semibold' })]}>
                {seasonTitle(season)}
              </Text>
              <Text
                modifiers={[
                  font({ textStyle: 'subheadline' }),
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                ]}>
                {seasonSubtitle(season)}
              </Text>
            </VStack>
          </Section>

          <Section title="Dates">
            {season.windows.length === 0 ? (
              <Text
                modifiers={[
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                ]}>
                No dates yet
              </Text>
            ) : (
              season.windows.map((window) => (
                <HStack key={window.id}>
                  <Text>{window.label}</Text>
                  <Spacer />
                  <Text
                    modifiers={[
                      foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                    ]}>
                    {`${formatShortDate(window.opensOn)} – ${formatShortDate(window.closesOn)}`}
                  </Text>
                </HStack>
              ))
            )}
            <Button
              label="Add Dates"
              systemImage="calendar.badge.plus"
              onPress={() => router.push(`/season/${season.id}/dates`)}
            />
          </Section>

          <Section title={credentialsSectionTitle(season.jurisdictionId)}>
            {credentials.length === 0 ? (
              <Text
                modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                Nothing linked yet
              </Text>
            ) : (
              credentials.map((credential) => (
                <HStack key={credential.id}>
                  <Text>{credential.name}</Text>
                  <Spacer />
                  <Image
                    systemName="checkmark"
                    size={14}
                    modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}
                  />
                </HStack>
              ))
            )}
            <Button
              label={addCredentialLabel(season.jurisdictionId)}
              systemImage="plus"
              onPress={() => router.push(`/season/${season.id}/credentials`)}
            />
          </Section>

          <Section
            title="Regulations"
            footer={<Text>Always verify current regulations with the issuing agency.</Text>}>
            {regulations.length === 0 ? (
              <Text
                modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                No official link saved
              </Text>
            ) : (
              regulations.map((regulation) => (
                <SwipeActions key={regulation.id}>
                  <HStack
                    modifiers={[
                      contentShape(shapes.rectangle()),
                      onTapGesture(() => {
                        if (regulation.url) void WebBrowser.openBrowserAsync(regulation.url);
                      }),
                    ]}>
                    <VStack alignment="leading" spacing={2}>
                      <Text>{regulation.title}</Text>
                      <Text
                        modifiers={[
                          font({ textStyle: 'footnote' }),
                          foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                        ]}>
                        {reviewedLine(regulation.lastReviewedOn)}
                      </Text>
                      {regulation.notes ? (
                        <Text
                          modifiers={[
                            font({ textStyle: 'footnote' }),
                            foregroundStyle({ type: 'hierarchical', style: 'tertiary' }),
                          ]}>
                          {regulation.notes}
                        </Text>
                      ) : null}
                    </VStack>
                    <Spacer />
                    {regulation.url ? (
                      <Image
                        systemName="arrow.up.right"
                        size={13}
                        modifiers={[
                          foregroundStyle({ type: 'hierarchical', style: 'tertiary' }),
                        ]}
                      />
                    ) : null}
                  </HStack>
                  <SwipeActions.Actions edge="trailing">
                    <Button
                      label="Reviewed"
                      systemImage="checkmark"
                      onPress={() => markRegulationReviewed(regulation.id, todayISO())}
                    />
                    <Button
                      label="Delete"
                      systemImage="trash"
                      role="destructive"
                      onPress={() => removeRegulation(season.id, regulation.id)}
                    />
                  </SwipeActions.Actions>
                </SwipeActions>
              ))
            )}
            <Button
              label="Add Regulation Link"
              systemImage="plus"
              onPress={() => router.push(`/season/${season.id}/regulations`)}
            />
          </Section>

          <Section
            title="People"
            footer={<Text>Who is on this season. Everyone lives in Family.</Text>}>
            {participants.length === 0 ? (
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                Nobody added yet
              </Text>
            ) : (
              participants.map((person) => (
                <SwipeActions key={person.id}>
                  <Text>{person.name}</Text>
                  <SwipeActions.Actions edge="trailing">
                    <Button
                      label="Remove"
                      systemImage="person.badge.minus"
                      role="destructive"
                      onPress={() => removeSeasonParticipant(season.id, person.id)}
                    />
                  </SwipeActions.Actions>
                </SwipeActions>
              ))
            )}
            {available.length > 0 ? (
              <Menu label="Add Person" systemImage="plus">
                {available.map((person) => (
                  <Button
                    key={person.id}
                    label={person.name}
                    onPress={() => addSeasonParticipant(season.id, person.id)}
                  />
                ))}
              </Menu>
            ) : null}
          </Section>

          <Section title="Journal">
            <Text
              modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
              {hunts.length === 0
                ? 'Nothing logged yet'
                : `${hunts.length} ${hunts.length === 1 ? 'entry' : 'entries'}`}
            </Text>
          </Section>

          <Section>
            <Text
              modifiers={[
                foregroundStyle('red'),
                contentShape(shapes.rectangle()),
                onTapGesture(() => setConfirmingDelete(true)),
              ]}>
              Delete Season
            </Text>
          </Section>
        </List>

        <Alert
          title="Delete this season?"
          isPresented={confirmingDelete}
          onIsPresentedChange={setConfirmingDelete}>
          <Alert.Message>
            <Text>Its dates and links are removed. Logged hunts are kept.</Text>
          </Alert.Message>
          <Alert.Actions>
            <Button role="destructive" label="Delete" onPress={confirmDelete} />
            <Button role="cancel" label="Cancel" onPress={() => setConfirmingDelete(false)} />
          </Alert.Actions>
        </Alert>
      </Host>
    </>
  );
}
