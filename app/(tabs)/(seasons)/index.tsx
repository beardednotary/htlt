import { ContentUnavailableView, HStack, Image, List, Picker, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  contentShape,
  font,
  foregroundStyle,
  listStyle,
  onTapGesture,
  padding,
  pickerStyle,
  shapes,
  tag,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { useStore } from '../../../src/data/store';
import {
  seasonDatesLine,
  seasonPhase,
  seasonSubtitle,
  seasonTitle,
  type SeasonPhase,
} from '../../../src/model/derive';
import { AppHost } from '../../../src/ui/AppHost';
import { accent } from '../../../src/ui/theme';

const PHASES: { value: SeasonPhase; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];

const EMPTY_PHASE_TEXT: Record<SeasonPhase, string> = {
  active: 'Nothing open right now. Seasons appear here once their dates arrive.',
  upcoming: 'Nothing coming up. A season with no dates yet counts as upcoming.',
  past: 'Nothing closed yet. Seasons move here after their last day.',
};

export default function SeasonsScreen() {
  const { data } = useStore();
  const router = useRouter();
  const [phase, setPhase] = useState<SeasonPhase>('upcoming');

  const seasons = useMemo(
    () => data.seasons.filter((season) => seasonPhase(season) === phase),
    [data.seasons, phase]
  );


  if (data.seasons.length === 0) {
    return (
      <>
      <Stack.Toolbar placement="left" tintColor={accent}>
        <Stack.Toolbar.Button hidesSharedBackground icon="chart.bar" onPress={() => router.push('/recap/latest')} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right" tintColor={accent}>
        <Stack.Toolbar.Button hidesSharedBackground icon="plus" onPress={() => router.push('/new')} />
      </Stack.Toolbar>
        <AppHost style={{ flex: 1 }}>
          <ContentUnavailableView
            title="No Seasons Yet"
            systemImage="calendar"
            description="A season is one species, one place, one year — California Deer, 2026. Its tag, the license that covers it, the dates it runs and the official regulations all hang off it. Tap + to start one."
          />
        </AppHost>
      </>
    );
  }

  return (
    <>
      <Stack.Toolbar placement="left" tintColor={accent}>
        <Stack.Toolbar.Button hidesSharedBackground icon="chart.bar" onPress={() => router.push('/recap/latest')} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right" tintColor={accent}>
        <Stack.Toolbar.Button hidesSharedBackground icon="plus" onPress={() => router.push('/new')} />
      </Stack.Toolbar>
      <AppHost style={{ flex: 1 }}>
        <VStack spacing={0}>
          <Picker
            selection={phase}
            onSelectionChange={(value) => setPhase(value as SeasonPhase)}
            modifiers={[
              pickerStyle('segmented'),
              padding({ horizontal: 16, top: 8, bottom: 4 }),
            ]}>
            {PHASES.map((option) => (
              <Text key={option.value} modifiers={[tag(option.value)]}>
                {option.label}
              </Text>
            ))}
          </Picker>

          <List modifiers={[listStyle('insetGrouped')]}>
            {seasons.length === 0 ? (
              <Text
                modifiers={[
                  font({ textStyle: 'subheadline' }),
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                ]}>
                {EMPTY_PHASE_TEXT[phase]}
              </Text>
            ) : (
              seasons.map((season) => (
                <HStack
                  key={season.id}
                  modifiers={[
                    contentShape(shapes.rectangle()),
                    onTapGesture(() => router.push(`/season/${season.id}`)),
                  ]}>
                  <VStack alignment="leading" spacing={2}>
                    <Text modifiers={[font({ textStyle: 'body' })]}>{seasonTitle(season)}</Text>
                    <Text
                      modifiers={[
                        font({ textStyle: 'subheadline' }),
                        foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      ]}>
                      {seasonSubtitle(season)}
                    </Text>
                    <Text
                      modifiers={[
                        font({ textStyle: 'footnote' }),
                        foregroundStyle({ type: 'hierarchical', style: 'tertiary' }),
                      ]}>
                      {seasonDatesLine(season)}
                    </Text>
                  </VStack>
                  <Spacer />
                  <Image
                    systemName="chevron.right"
                    size={13}
                    modifiers={[foregroundStyle({ type: 'hierarchical', style: 'tertiary' })]}
                  />
                </HStack>
              ))
            )}
          </List>
        </VStack>
      </AppHost>
    </>
  );
}
