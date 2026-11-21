import { Button, Host, Image as SwiftUIImage, Menu } from '@expo/ui/swift-ui';
import { buttonStyle, fixedSize, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { memo, useMemo, useRef, type RefObject } from 'react';
import {
  Image,
  PlatformColor,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { pickFromLibrary } from '../../../../src/data/photos';
import {
  addPhotoDocument,
  setRecapCover,
  useStore,
} from '../../../../src/data/store';
import { summarizeYear, yearsWithActivity, type Tally, type YearRecap } from '../../../../src/model/recap';
import { shareRecap } from '../../../../src/model/recapExport';
import { shareCardAvailable, shareRecapImage } from '../../../../src/model/recapCard';
import { useEntitlements } from '../../../../src/purchases/entitlements';
import { canExportRecap } from '../../../../src/purchases/limits';
import { AppHost } from '../../../../src/ui/AppHost';
import { accent } from '../../../../src/ui/theme';

function chooseCover(year: number) {
  void pickFromLibrary().then((picked) => {
    if (!picked) return;
    const document = addPhotoDocument(picked);
    setRecapCover(year, document.id);
  });
}

/**
 * The recap's bar menu: a native Stack.Toolbar menu, with the shared glass
 * background hidden — see "Navigation bar buttons" in AGENTS.md. Memoized so it
 * is only rebuilt when the recap or its cover changes.
 */
const RecapToolbar = memo(function RecapToolbar({
  recap,
  hasChosenCover,
  cardRef,
}: {
  recap: YearRecap;
  hasChosenCover: boolean;
  cardRef: RefObject<View | null>;
}) {
  const router = useRouter();
  const { tier } = useEntitlements();

  function gatedExport(run: () => void) {
    const gate = canExportRecap(tier);
    if (!gate.allowed) {
      router.push(`/paywall?requires=${gate.requires}&reason=${encodeURIComponent(gate.reason)}`);
      return;
    }
    run();
  }

  return (
    <Stack.Toolbar placement="right" tintColor={accent}>
      <Stack.Toolbar.Menu hidesSharedBackground icon="ellipsis.circle">
        <Stack.Toolbar.MenuAction
          icon="square.and.arrow.up"
          onPress={() => gatedExport(() => void shareRecap(recap))}>
          Share as PDF
        </Stack.Toolbar.MenuAction>
        {shareCardAvailable() ? (
          <Stack.Toolbar.MenuAction
            icon="photo.badge.arrow.down"
            onPress={() => gatedExport(() => void shareRecapImage(cardRef, recap.year))}>
            Share as Image
          </Stack.Toolbar.MenuAction>
        ) : null}
        <Stack.Toolbar.MenuAction icon="photo" onPress={() => chooseCover(recap.year)}>
          Choose Cover Photo
        </Stack.Toolbar.MenuAction>
        {hasChosenCover ? (
          <Stack.Toolbar.MenuAction
            icon="wand.and.stars"
            onPress={() => setRecapCover(recap.year, undefined)}>
            Use Automatic Cover
          </Stack.Toolbar.MenuAction>
        ) : null}
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
});

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
  const cardRef = useRef<View>(null);

  // "latest" lets a static header button link here without knowing the data.
  const years = yearsWithActivity(data);
  const current = Number(year) || years[0] || new Date().getFullYear();
  const recap = useMemo(() => summarizeYear(data, current), [data, current]);

  // A chosen cover wins; otherwise the year picks its own photo.
  const chosenCoverId = data.settings.recapCovers?.[String(current)];
  const chosenCover = data.documents.find((document) => document.id === chosenCoverId);
  const coverUri = chosenCover?.uri ?? recap.heroPhotoUri;

  return (
    <>
      <Stack.Screen
        options={{
          title: String(current),
          headerLargeTitle: false,
        }}
      />
      <RecapToolbar
        recap={recap}
        hasChosenCover={Boolean(chosenCoverId)}
        cardRef={cardRef}
      />
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}>
        <Hero recap={recap} coverUri={coverUri} onChooseCover={() => chooseCover(current)} />

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
            <Host
              matchContents
              style={{ minWidth: 44, minHeight: 44, backgroundColor: 'transparent' }}>
              <Menu
                label={<SwiftUIImage systemName="calendar" color={accent} />}
                modifiers={[
                  buttonStyle('plain'),
                  foregroundStyle(accent),
                  fixedSize({ horizontal: true }),
                ]}>
                {years.map((value) => (
                  <Button
                    key={value}
                    label={String(value)}
                    // Replacing keeps the back stack shallow while browsing years.
                    onPress={() => router.replace(`/recap/${value}`)}
                  />
                ))}
              </Menu>
            </Host>
          </View>
        ) : null}
      </ScrollView>

      {/* Rendered off-screen at a fixed size so the shared image is the same
          whatever device captured it. */}
      <View style={styles.cardHost} pointerEvents="none">
        <View ref={cardRef} collapsable={false} style={styles.card}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.cardPhoto} />
          ) : (
            <View style={[styles.cardPhoto, styles.heroBlank]} />
          )}
          <View style={styles.cardScrim} />
          <View style={styles.cardBody}>
            <Text style={styles.cardYear}>{recap.year}</Text>
            <View style={styles.cardStats}>
              <CardStat value={recap.daysAfield} label="Days afield" />
              <CardStat value={recap.harvests} label="Harvests" />
              <CardStat value={recap.fish} label="Fish" />
            </View>
            {recap.places.length > 0 ? (
              <Text style={styles.cardPlaces}>{recap.places.join('  ·  ')}</Text>
            ) : null}
            {recap.firsts.length > 0 ? (
              <Text style={styles.cardFirst}>{recap.firsts[0].label}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </>
  );
}

function CardStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.cardStat}>
      <Text style={styles.cardStatValue}>{value}</Text>
      <Text style={styles.cardStatLabel}>{label}</Text>
    </View>
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
      <AppHost matchContents style={styles.heroEdit} seedColor="#ffffff">
        <Button onPress={onChooseCover}>
          <SwiftUIImage systemName="photo.badge.plus" size={20} color="#ffffff" />
        </Button>
      </AppHost>
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

/**
 * The ground behind the cover type when there is no cover photo yet.
 *
 * Deliberately a fixed colour rather than a semantic one. Everything else in the
 * app follows the system appearance, but this specific surface cannot: the type
 * over it is white, because its normal backdrop is a photograph. A semantic
 * background turns near-white in light appearance and the type disappears.
 */
const heroGround = '#293B38';

/**
 * A scrim handles an average photo. It does not handle a bright one — snow, sky,
 * an overexposed morning — so the type carries its own shadow as well. Cheap
 * insurance on a surface where we do not control the image.
 */
const overPhoto = {
  textShadowColor: 'rgba(0,0,0,0.45)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
} as const;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PlatformColor('systemBackground') },
  content: { paddingBottom: 64 },

  hero: { height: 260, justifyContent: 'flex-end' },
  heroPhoto: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  // Fixed, not semantic. The type on top of this is always white, because it is
  // normally sitting on a photograph — so the ground underneath it has to be dark
  // in every appearance. `secondarySystemBackground` is #1C1C1E in the dark and
  // #F2F2F7 in the light, which put white 72pt type on near-white at about 2:1.
  heroBlank: { backgroundColor: heroGround },
  heroScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroYear: {
    fontSize: 72,
    fontWeight: '700',
    letterSpacing: -2,
    color: '#fff',
    paddingHorizontal: 20,
    ...overPhoto,
  },
  heroCaption: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 20,
    paddingBottom: 20,
    ...overPhoto,
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

  cardHost: { position: 'absolute', left: -2000, top: 0 },
  card: { width: 360, height: 640, justifyContent: 'flex-end', overflow: 'hidden' },
  cardPhoto: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  cardScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  cardBody: { padding: 28 },
  cardYear: { fontSize: 84, fontWeight: '700', letterSpacing: -3, color: '#fff', ...overPhoto },
  cardStats: { flexDirection: 'row', paddingTop: 18 },
  cardStat: { flex: 1 },
  cardStatValue: { fontSize: 30, fontWeight: '600', color: '#fff', ...overPhoto },
  cardStatLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
    paddingTop: 2,
    ...overPhoto,
  },
  cardPlaces: { fontSize: 14, color: 'rgba(255,255,255,0.9)', paddingTop: 18, ...overPhoto },
  cardFirst: { fontSize: 20, fontWeight: '600', color: '#fff', paddingTop: 10, ...overPhoto },
});
