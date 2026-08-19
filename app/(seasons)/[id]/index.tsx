import {
  Alert,
  Button,
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
  font,
  foregroundStyle,
  listStyle,
  shapes,
  contentShape,
  onTapGesture,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { METHOD_LABELS } from '../../../src/data/constants';
import { removeSeason, useStore } from '../../../src/data/store';
import { formatShortDate, seasonSubtitle, seasonTitle } from '../../../src/model/derive';

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
              onPress={() => router.push(`/${season.id}/dates`)}
            />
          </Section>

          <Section title="Licenses & Tags">
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
              label="Add License or Tag"
              systemImage="plus"
              onPress={() => router.push(`/${season.id}/credentials`)}
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
                <VStack key={regulation.id} alignment="leading" spacing={2}>
                  <Text>{regulation.title}</Text>
                  {regulation.lastReviewedOn ? (
                    <Text
                      modifiers={[
                        font({ textStyle: 'footnote' }),
                        foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      ]}>
                      {`Last reviewed ${formatShortDate(regulation.lastReviewedOn)}`}
                    </Text>
                  ) : null}
                </VStack>
              ))
            )}
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
