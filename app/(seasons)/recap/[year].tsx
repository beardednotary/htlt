import { Button, Host, Image as SwiftUIImage } from '@expo/ui/swift-ui';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Image,
  PlatformColor,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { pickFromLibrary } from '../../../src/data/photos';
import {
  addPhotoDocument,
  setRecapCover,
  useStore,
} from '../../../src/data/store';
import { summarizeYear, yearsWithActivity, type Tally, type YearRecap } from '../../../src/model/recap';
import { shareRecap } from '../../../src/model/recapExport';
import { HeaderButton } from '../../../src/ui/HeaderButton';
import { HeaderMenu, type HeaderMenuItem } from '../../../src/ui/HeaderMenu';

/**
 * The one screen that is ours to design. Everywhere else the app wears Apple's
 * clothes; here it gets to sound like a product. Restrained on purpose — closer to
 * Fitness than to a year-in-review explosion — and honest: blank days are reported
 * with the same weight as good ones.
 */
export default function RecapScreen() {
  const { year } = useLocalSearchParams<{ year: string }>();
  const { data } = useStore();
  const router = useRouter();

  const current = Number(year) || new Date().getFullYear();
  const recap = useMemo(() => summarizeYear(data, current), [data, current]);
  const years = useMemo(() => yearsWithActivity(data), [data]);

  // A chosen cover wins; otherwise the year picks its own photo.
  const chosenCoverId = data.settings.recapCovers?.[String(current)];
  const chosenCover = data.documents.find((document) => document.id === chosenCoverId);
  const coverUri = chosenCover?.uri ?? recap.heroPhotoUri;

  function chooseCover() {
    void pickFromLibrary().then((picked) => {
      if (!picked) return;
      const document = addPhotoDocument(picked);
      setRecapCover(current, document.id);
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: String(current),
          headerLargeTitle: false,
          headerRight: () => (
            <HeaderMenu
              systemImage="ellipsis.circle"
              items={[
                {
                  label: 'Share as PDF',
                  systemImage: 'square.and.arrow.up',
                  onPress: () => {
                    void shareRecap(recap);
                  },
                },
                { label: 'Choose Cover Photo', systemImage: 'photo', onPress: chooseCover },
                ...(chosenCoverId
                  ? ([
                      {
                        label: 'Use Automatic Cover',
                        systemImage: 'wand.and.stars',
                        onPress: () => setRecapCover(current, undefined),
                      },
                    ] satisfies HeaderMenuItem[])
                  : []),
              ]}
            />
          ),
        }}
      />
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}>
        <Hero recap={recap} coverUri={coverUri} onChooseCover={chooseCover} />

        <View style={styles.statRow}>
          <Stat value={recap.daysAfield} label="Days afield" />
          <Stat value={recap.harvests} label="Harvests" />
          <Stat value={recap.fish} label="Fish" />
        </View>

        <View style={styles.statRow}>
          <Stat value={recap.hunts} label="Hunts" />
          <Stat value={recap.fishingTrips} label="Trips" />
          <Stat value={recap.places.length} label="Places" />
        </View>

        {recap.places.length > 0 ? (
          <Text style={styles.places}>{recap.places.join('  ·  ')}</Text>
        ) : null}

        {recap.firsts.length > 0 ? (
          <Block title="Firsts">
            {recap.firsts.map((first) => (
              <Text key={first.label} style={styles.first}>
                {first.label}
              </Text>
            ))}
          </Block>
        ) : null}

        <TallyBlock title="Species" items={recap.species} />
        <TallyBlock title="Method" items={recap.methods} />
        <TallyBlock title="With" items={recap.companions} />

        <Block title="The rest of it">
          <Text style={styles.plain}>
            {recap.hunts === 0
              ? 'No hunts logged this year.'
              : `${recap.blankHunts} of ${recap.hunts} ${
                  recap.hunts === 1 ? 'hunt' : 'hunts'
                } ended without a harvest.`}
          </Text>
          {recap.busiestMonth ? (
            <Text style={styles.plain}>{`Most days afield in ${recap.busiestMonth}.`}</Text>
          ) : null}
        </Block>

        {years.length > 1 ? (
          <View style={styles.switcher}>
            <HeaderMenu
              systemImage="calendar"
              items={years.map((value) => ({
                label: String(value),
                // Replacing keeps the back stack shallow while browsing years.
                onPress: () => router.replace(`/recap/${value}`),
              }))}
            />
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}

function Hero({
  recap,
  coverUri,
  onChooseCover,
}: {
  recap: YearRecap;
  coverUri?: string;
  onChooseCover: () => void;
}) {
  return (
    <View style={styles.hero}>
      {coverUri ? (
        <Image source={{ uri: coverUri }} style={styles.heroPhoto} />
      ) : (
        <View style={[styles.heroPhoto, styles.heroBlank]} />
      )}
      <View style={styles.heroScrim} />
      <Text style={styles.heroYear}>{recap.year}</Text>
      <Text style={styles.heroCaption}>
        {recap.isEmpty ? 'Nothing logged yet' : 'Your year outdoors'}
      </Text>

      {/* On the image itself, because nobody finds a cover picker in a menu. */}
      <Host matchContents style={styles.heroEdit} seedColor="#ffffff">
        <Button onPress={onChooseCover}>
          <SwiftUIImage systemName="photo.badge.plus" size={20} color="#ffffff" />
        </Button>
      </Host>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {children}
    </View>
  );
}

function TallyBlock({ title, items }: { title: string; items: Tally[] }) {
  if (items.length === 0) return null;
  return (
    <Block title={title}>
      {items.map((item) => (
        <View key={item.label} style={styles.tallyRow}>
          <Text style={styles.tallyLabel}>{item.label}</Text>
          <Text style={styles.tallyCount}>{item.count}</Text>
        </View>
      ))}
    </Block>
  );
}

const separator: ViewStyle = {
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: PlatformColor('separator'),
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PlatformColor('systemBackground') },
  content: { paddingBottom: 64 },

  hero: { height: 260, justifyContent: 'flex-end' },
  heroPhoto: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  heroBlank: { backgroundColor: PlatformColor('secondarySystemBackground') },
  heroScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.28)' },
  heroYear: {
    fontSize: 72,
    fontWeight: '700',
    letterSpacing: -2,
    color: '#fff',
    paddingHorizontal: 20,
  },
  heroCaption: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  statRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 28 },
  stat: { flex: 1 },
  statValue: {
    fontSize: 40,
    fontWeight: '600',
    letterSpacing: -1,
    color: PlatformColor('label'),
  },
  statLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: PlatformColor('secondaryLabel'),
    paddingTop: 2,
  },

  places: {
    paddingHorizontal: 20,
    paddingTop: 24,
    fontSize: 15,
    color: PlatformColor('secondaryLabel'),
  },

  block: { paddingHorizontal: 20, paddingTop: 36 },
  blockTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: PlatformColor('secondaryLabel'),
    paddingBottom: 10,
  },
  first: { fontSize: 22, fontWeight: '600', color: PlatformColor('label'), paddingVertical: 4 },
  plain: { fontSize: 16, color: PlatformColor('label'), paddingVertical: 3 },

  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    ...separator,
  },
  tallyLabel: { fontSize: 17, color: PlatformColor('label') },
  tallyCount: { fontSize: 17, color: PlatformColor('secondaryLabel') },

  heroEdit: { position: 'absolute', right: 14, top: 14 },
  switcher: { alignItems: 'center', paddingTop: 40 },
});
