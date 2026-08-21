import { ContentUnavailableView, HStack, List, Section, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useStore } from '../../../src/data/store';
import { summarizeToday, type TodayItem } from '../../../src/model/today';
import { HeaderButton } from '../../../src/ui/HeaderButton';
import { AppHost } from '../../../src/ui/AppHost';

function Row({ item, tint }: { item: TodayItem; tint?: 'warning' }) {
  return (
    <VStack alignment="leading" spacing={2}>
      <Text modifiers={[font({ textStyle: 'body' })]}>{item.title}</Text>
      <Text
        modifiers={[
          font({ textStyle: 'subheadline' }),
          tint === 'warning'
            ? foregroundStyle('orange')
            : foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
        ]}>
        {item.detail}
      </Text>
    </VStack>
  );
}

export default function TodayScreen() {
  const { data } = useStore();
  const router = useRouter();
  const { comingUp, attention } = useMemo(() => summarizeToday(data), [data]);

  // Settings lives behind the person button, not a fifth tab.
  const header = (
    <Stack.Screen
      options={{
        headerRight: () => (
          <HeaderButton
            systemImage="person.crop.circle"
            onPress={() => router.push('/settings')}
          />
        ),
      }}
    />
  );

  if (comingUp.length === 0 && attention.length === 0) {
    return (
      <>
        {header}
        <AppHost style={{ flex: 1 }}>
        <ContentUnavailableView
          title="Nothing Coming Up"
          systemImage="calendar.badge.plus"
          description="Openers, application deadlines and licenses about to lapse all surface here. Today is assembled from what you enter elsewhere — start with a season."
          />
        </AppHost>
      </>
    );
  }

  return (
    <>
      {header}
      <AppHost style={{ flex: 1 }}>
      <List modifiers={[listStyle('insetGrouped')]}>
        {attention.length > 0 ? (
          <Section title="Needs Attention">
            {attention.map((item) => (
              <Row key={item.id} item={item} tint="warning" />
            ))}
          </Section>
        ) : null}

        {comingUp.length > 0 ? (
          <Section title="Coming Up">
            {comingUp.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </Section>
        ) : null}

        <Section>
          <HStack>
            <Text
              modifiers={[
                font({ textStyle: 'footnote' }),
                foregroundStyle({ type: 'hierarchical', style: 'tertiary' }),
              ]}>
              Dates come from what you entered. Verify them with the issuing agency.
            </Text>
            <Spacer />
          </HStack>
          </Section>
        </List>
      </AppHost>
    </>
  );
}
