import { ContentUnavailableView, HStack, List, Picker, Spacer, Text, VStack } from '@expo/ui/swift-ui';
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

import { METHOD_LABELS, TECHNIQUE_LABELS } from '../../../src/data/constants';
import { useStore } from '../../../src/data/store';
import { formatEntryDate, seasonTitle } from '../../../src/model/derive';
import type { Activity, Pursuit } from '../../../src/model/types';
import { HeaderMenu } from '../../../src/ui/HeaderMenu';
import { AppHost } from '../../../src/ui/AppHost';

type Filter = 'all' | Pursuit;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'hunting', label: 'Hunting' },
  { value: 'fishing', label: 'Fishing' },
];

export default function JournalScreen() {
  const { data } = useStore();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');

  const entries = useMemo(() => {
    const matching =
      filter === 'all' ? data.activities : data.activities.filter((a) => a.pursuit === filter);
    return [...matching].sort((a, b) => b.date.localeCompare(a.date));
  }, [data.activities, filter]);

  function titleFor(activity: Activity): string {
    const season = data.seasons.find((s) => s.id === activity.seasonId);
    if (season) return seasonTitle(season);
    return activity.pursuit === 'hunting' ? 'Hunt' : 'Fishing';
  }

  function detailFor(activity: Activity): string {
    const harvests = data.harvests.filter((h) => h.activityId === activity.id);
    const catches = data.catches.filter((c) => c.activityId === activity.id);
    const parts: string[] = [];
    if (activity.locationName) parts.push(activity.locationName);
    if (activity.methodOfTake) parts.push(METHOD_LABELS[activity.methodOfTake]);
    if (activity.technique) parts.push(TECHNIQUE_LABELS[activity.technique]);
    if (harvests.length > 0) {
      parts.push(harvests.map((h) => h.species).join(', '));
    } else if (catches.length > 0) {
      const total = catches.reduce((sum, c) => sum + c.quantity, 0);
      parts.push(`${total} ${total === 1 ? 'fish' : 'fish'}`);
    } else if (activity.pursuit === 'hunting') {
      parts.push('No harvest');
    }
    return parts.join(' · ');
  }

  const header = (
    <Stack.Screen
      options={{
        headerRight: () => (
          <HeaderMenu
            items={[
              { label: 'Log Hunt', systemImage: 'scope', onPress: () => router.push('/log?pursuit=hunting') },
              { label: 'Log Fishing Trip', systemImage: 'fish', onPress: () => router.push('/log?pursuit=fishing') },
            ]}
          />
        ),
      }}
    />
  );

  if (data.activities.length === 0) {
    return (
      <>
        {header}
        <AppHost style={{ flex: 1 }}>
          <ContentUnavailableView
            title="No Entries Yet"
            systemImage="book.closed"
            description="Log the days you go out and what came of them. A day with nothing taken is still worth keeping. Tap + to record a hunt or a fishing trip."
          />
        </AppHost>
      </>
    );
  }

  return (
    <>
      {header}
      <AppHost style={{ flex: 1 }}>
        <VStack spacing={0}>
          <Picker
            selection={filter}
            onSelectionChange={(value) => setFilter(value as Filter)}
            modifiers={[pickerStyle('segmented'), padding({ horizontal: 16, top: 8, bottom: 4 })]}>
            {FILTERS.map((option) => (
              <Text key={option.value} modifiers={[tag(option.value)]}>
                {option.label}
              </Text>
            ))}
          </Picker>

          <List modifiers={[listStyle('insetGrouped')]}>
            {entries.length === 0 ? (
              <Text
                modifiers={[
                  font({ textStyle: 'subheadline' }),
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                ]}>
                Nothing logged under this filter yet.
              </Text>
            ) : (
              entries.map((activity) => (
                <HStack
                  key={activity.id}
                  modifiers={[
                    contentShape(shapes.rectangle()),
                    onTapGesture(() => router.push('/entry/' + activity.id)),
                  ]}>
                  <VStack alignment="leading" spacing={2}>
                    <Text modifiers={[font({ textStyle: 'body' })]}>{titleFor(activity)}</Text>
                    <Text
                      modifiers={[
                        font({ textStyle: 'subheadline' }),
                        foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      ]}>
                      {detailFor(activity)}
                    </Text>
                  </VStack>
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
          </List>
        </VStack>
      </AppHost>
    </>
  );
}
