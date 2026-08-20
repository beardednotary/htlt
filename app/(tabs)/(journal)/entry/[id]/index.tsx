import {
  Alert,
  Button,
  ContentUnavailableView,
  HStack,
  Host,
  List,
  Menu,
  RNHostView,
  Section,
  Spacer,
  SwipeActions,
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
import { Image as RNImage } from 'react-native';

import { METHOD_LABELS, TECHNIQUE_LABELS } from '../../../../../src/data/constants';
import { captureWithCamera, deletePhotoFile, pickFromLibrary } from '../../../../../src/data/photos';
import {
  addPhotoToActivity,
  removeActivity,
  removeCatch,
  removeDocument,
  removeHarvest,
  useStore,
} from '../../../../../src/data/store';
import { formatEntryDate, seasonTitle } from '../../../../../src/model/derive';

export default function JournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const activity = useMemo(
    () => data.activities.find((entry) => entry.id === id),
    [data.activities, id]
  );
  const harvests = useMemo(
    () => data.harvests.filter((harvest) => harvest.activityId === id),
    [data.harvests, id]
  );
  const catches = useMemo(
    () => data.catches.filter((entry) => entry.activityId === id),
    [data.catches, id]
  );
  const photos = useMemo(() => {
    const owner = data.activities.find((entry) => entry.id === id);
    if (!owner) return [];
    return data.documents.filter((document) => owner.documentIds.includes(document.id));
  }, [data.documents, data.activities, id]);

  if (!activity) {
    return (
      <Host style={{ flex: 1 }}>
        <ContentUnavailableView
          title="Entry Not Found"
          systemImage="questionmark.folder"
          description="It may have been deleted."
        />
      </Host>
    );
  }

  const season = data.seasons.find((s) => s.id === activity.seasonId);
  const hunting = activity.pursuit === 'hunting';
  const title = season ? seasonTitle(season) : hunting ? 'Hunt' : 'Fishing';

  function confirmDelete() {
    if (!activity) return;
    removeActivity(activity.id);
    setConfirmingDelete(false);
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title, headerLargeTitle: false }} />
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section>
            <HStack>
              <Text>Date</Text>
              <Spacer />
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                {formatEntryDate(activity.date)}
              </Text>
            </HStack>
            {activity.locationName ? (
              <HStack>
                <Text>Where</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                  {activity.locationName}
                </Text>
              </HStack>
            ) : null}
            {activity.methodOfTake ? (
              <HStack>
                <Text>Method</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                  {METHOD_LABELS[activity.methodOfTake]}
                </Text>
              </HStack>
            ) : null}
            {activity.technique ? (
              <HStack>
                <Text>Technique</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                  {TECHNIQUE_LABELS[activity.technique]}
                </Text>
              </HStack>
            ) : null}
            {season ? (
              <HStack
                modifiers={[
                  contentShape(shapes.rectangle()),
                  onTapGesture(() => router.push('/season/' + season.id)),
                ]}>
                <Text>Season</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                  {seasonTitle(season)}
                </Text>
              </HStack>
            ) : null}
          </Section>

          <Section title={hunting ? 'Harvest' : 'Catches'}>
            {hunting && harvests.length === 0 ? (
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                Nothing taken
              </Text>
            ) : null}
            {!hunting && catches.length === 0 ? (
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                Nothing caught
              </Text>
            ) : null}

            {harvests.map((harvest) => {
              const credential = data.credentials.find((c) => c.id === harvest.credentialId);
              const detail = [
                harvest.sex && harvest.sex !== 'unknown' ? harvest.sex : undefined,
                harvest.points ? harvest.points + ' points' : undefined,
                credential ? 'Tag: ' + credential.name : undefined,
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <SwipeActions key={harvest.id}>
                  <VStack alignment="leading" spacing={2}>
                    <Text>{harvest.species}</Text>
                    {detail ? (
                      <Text
                        modifiers={[
                          font({ textStyle: 'footnote' }),
                          foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                        ]}>
                        {detail}
                      </Text>
                    ) : null}
                  </VStack>
                  <SwipeActions.Actions edge="trailing">
                    <Button
                      label="Delete"
                      systemImage="trash"
                      role="destructive"
                      onPress={() => removeHarvest(harvest.id)}
                    />
                  </SwipeActions.Actions>
                </SwipeActions>
              );
            })}

            {catches.map((entry) => {
              const detail = [
                entry.quantity + (entry.quantity === 1 ? ' fish' : ' fish'),
                entry.kept ? 'Kept' : 'Released',
              ].join(' · ');
              return (
                <SwipeActions key={entry.id}>
                  <VStack alignment="leading" spacing={2}>
                    <Text>{entry.species}</Text>
                    <Text
                      modifiers={[
                        font({ textStyle: 'footnote' }),
                        foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      ]}>
                      {detail}
                    </Text>
                  </VStack>
                  <SwipeActions.Actions edge="trailing">
                    <Button
                      label="Delete"
                      systemImage="trash"
                      role="destructive"
                      onPress={() => removeCatch(entry.id)}
                    />
                  </SwipeActions.Actions>
                </SwipeActions>
              );
            })}

            <Button
              label={hunting ? 'Add Harvest' : 'Add Catch'}
              systemImage="plus"
              onPress={() => router.push('/entry/' + activity.id + '/take')}
            />
          </Section>

          <Section title="Photos">
            {photos.length === 0 ? (
              <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                No photos yet
              </Text>
            ) : (
              photos.map((photo) => (
                <SwipeActions key={photo.id}>
                  <HStack>
                    <RNHostView matchContents>
                      <RNImage
                        source={{ uri: photo.uri }}
                        style={{ width: 56, height: 56, borderRadius: 8 }}
                      />
                    </RNHostView>
                    <Spacer />
                  </HStack>
                  <SwipeActions.Actions edge="trailing">
                    <Button
                      label="Delete"
                      systemImage="trash"
                      role="destructive"
                      onPress={() => {
                        removeDocument(photo.id);
                        void deletePhotoFile(photo.uri);
                      }}
                    />
                  </SwipeActions.Actions>
                </SwipeActions>
              ))
            )}
            <Menu label="Add Photo" systemImage="camera">
              <Button
                label="Take Photo"
                systemImage="camera"
                onPress={() => {
                  void captureWithCamera().then((picked) => {
                    if (picked && activity) addPhotoToActivity(activity.id, picked);
                  });
                }}
              />
              <Button
                label="Choose Photo"
                systemImage="photo.on.rectangle"
                onPress={() => {
                  void pickFromLibrary().then((picked) => {
                    if (picked && activity) addPhotoToActivity(activity.id, picked);
                  });
                }}
              />
            </Menu>
          </Section>

          {activity.notes ? (
            <Section title="Notes">
              <Text>{activity.notes}</Text>
            </Section>
          ) : null}

          <Section>
            <Text
              modifiers={[
                foregroundStyle('red'),
                contentShape(shapes.rectangle()),
                onTapGesture(() => setConfirmingDelete(true)),
              ]}>
              Delete Entry
            </Text>
          </Section>
        </List>

        <Alert
          title="Delete this entry?"
          isPresented={confirmingDelete}
          onIsPresentedChange={setConfirmingDelete}>
          <Alert.Message>
            <Text>Anything taken on this day is removed with it.</Text>
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
