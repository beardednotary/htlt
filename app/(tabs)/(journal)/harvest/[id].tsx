import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Image,
  Linking,
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatCoordinate, mapsUrl } from '../../../../src/data/location';
import { captureWithCamera, pickFromLibrary } from '../../../../src/data/photos';
import { addPhotoToHarvest, useStore } from '../../../../src/data/store';
import { credentialKindLabel } from '../../../../src/data/vocabulary';
import { METHOD_LABELS } from '../../../../src/data/constants';
import { formatEntryDate, seasonTitle } from '../../../../src/model/derive';
import { HeaderMenu } from '../../../../src/ui/HeaderMenu';
import { accent } from '../../../../src/ui/theme';

/**
 * Ours to design, along with the recap. Everywhere else the app is a filing
 * cabinet that happens to be beautiful; this is the page someone opens in twenty
 * years, and it should read like a page rather than a form.
 */
export default function HarvestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const router = useRouter();

  const harvest = useMemo(
    () => data.harvests.find((entry) => entry.id === id),
    [data.harvests, id]
  );

  const activity = data.activities.find((entry) => entry.id === harvest?.activityId);
  const season = data.seasons.find((entry) => entry.id === activity?.seasonId);
  const credential = data.credentials.find((entry) => entry.id === harvest?.credentialId);
  const photos = data.documents.filter((document) =>
    harvest?.documentIds.includes(document.id)
  );

  if (!harvest || !activity) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>This harvest is no longer here.</Text>
      </View>
    );
  }

  const hero = photos[0];
  const rest = photos.slice(1);

  const facts: { label: string; value: string; onPress?: () => void }[] = [
    { label: 'Taken', value: formatEntryDate(activity.date) },
    ...(activity.locationName ? [{ label: 'Where', value: activity.locationName }] : []),
    ...(season ? [{ label: 'Season', value: seasonTitle(season) }] : []),
    ...(activity.methodOfTake
      ? [{ label: 'Method', value: METHOD_LABELS[activity.methodOfTake] }]
      : []),
    ...(harvest.sex && harvest.sex !== 'unknown'
      ? [{ label: 'Sex', value: harvest.sex === 'male' ? 'Male' : 'Female' }]
      : []),
    ...(harvest.points ? [{ label: 'Points', value: String(harvest.points) }] : []),
    ...(credential
      ? [
          {
            label: credentialKindLabel(credential.kind, credential.jurisdictionId),
            value: credential.name,
          },
        ]
      : []),
    ...(harvest.coordinate
      ? [
          {
            label: 'Coordinates',
            value: formatCoordinate(harvest.coordinate),
            onPress: () => {
              const coordinate = harvest.coordinate;
              if (coordinate) void Linking.openURL(mapsUrl(coordinate, harvest.species));
            },
          },
        ]
      : []),
  ];

  function addPhoto(source: 'camera' | 'library') {
    const pick = source === 'camera' ? captureWithCamera() : pickFromLibrary();
    void pick.then((picked) => {
      if (picked && harvest) addPhotoToHarvest(harvest.id, picked);
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: harvest.species,
          headerLargeTitle: false,
          headerTransparent: Boolean(hero),
          headerRight: () => (
            <HeaderMenu
              systemImage="ellipsis.circle"
              items={[
                { label: 'Take Photo', systemImage: 'camera', onPress: () => addPhoto('camera') },
                {
                  label: 'Choose Photo',
                  systemImage: 'photo.on.rectangle',
                  onPress: () => addPhoto('library'),
                },
              ]}
            />
          ),
        }}
      />
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior={hero ? 'never' : 'automatic'}
        contentContainerStyle={styles.content}>
        {hero ? (
          <View style={styles.hero}>
            <Image source={{ uri: hero.uri }} style={styles.heroPhoto} />
            <View style={styles.heroScrim} />
            <Text style={styles.heroSpecies}>{harvest.species}</Text>
            <Text style={styles.heroDate}>{formatEntryDate(activity.date)}</Text>
          </View>
        ) : (
          <View style={styles.plainHeader}>
            <Text style={styles.plainSpecies}>{harvest.species}</Text>
            <Text style={styles.plainDate}>{formatEntryDate(activity.date)}</Text>
          </View>
        )}

        <View style={styles.facts}>
          {facts.map((fact) => (
            <Pressable
              key={fact.label}
              disabled={!fact.onPress}
              onPress={fact.onPress}
              style={styles.factRow}>
              <Text style={styles.factLabel}>{fact.label}</Text>
              <Text style={[styles.factValue, fact.onPress ? styles.factLink : null]}>
                {fact.value}
              </Text>
            </Pressable>
          ))}
        </View>

        {harvest.notes ? <Text style={styles.notes}>{harvest.notes}</Text> : null}

        {rest.length > 0 ? (
          <View style={styles.gallery}>
            {rest.map((photo) => (
              <Image key={photo.id} source={{ uri: photo.uri }} style={styles.galleryPhoto} />
            ))}
          </View>
        ) : null}

        <Pressable style={styles.entryLink} onPress={() => router.push('/entry/' + activity.id)}>
          <Text style={styles.entryLinkText}>See the whole day</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PlatformColor('systemBackground') },
  content: { paddingBottom: 56 },

  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PlatformColor('systemBackground'),
  },
  missingText: { fontSize: 16, color: PlatformColor('secondaryLabel') },

  hero: { height: 380, justifyContent: 'flex-end' },
  heroPhoto: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  heroScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.3)' },
  heroSpecies: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#fff',
    paddingHorizontal: 20,
  },
  heroDate: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 20,
    paddingBottom: 22,
  },

  plainHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  plainSpecies: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    color: PlatformColor('label'),
  },
  plainDate: { fontSize: 15, color: PlatformColor('secondaryLabel'), paddingTop: 2 },

  facts: { paddingHorizontal: 20, paddingTop: 26 },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PlatformColor('separator'),
  },
  factLabel: { fontSize: 16, color: PlatformColor('secondaryLabel') },
  factValue: { fontSize: 16, color: PlatformColor('label'), flexShrink: 1, textAlign: 'right' },
  factLink: { color: accent },

  notes: {
    paddingHorizontal: 20,
    paddingTop: 26,
    fontSize: 17,
    lineHeight: 24,
    color: PlatformColor('label'),
  },

  gallery: { paddingHorizontal: 20, paddingTop: 26, gap: 12 },
  galleryPhoto: { width: '100%', height: 240, borderRadius: 12 },

  entryLink: { paddingHorizontal: 20, paddingTop: 30 },
  entryLinkText: { fontSize: 16, color: accent },
});
