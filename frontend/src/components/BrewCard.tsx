/**
 * BrewCard.tsx — the Brew List card from SCREENS.md §3.1: "method icon, bean name,
 * date, star rating (0.5 steps), one-line note preview. White cards, soft shadow,
 * rating badge in accent orange."
 *
 * A composite (STRUCTURE.md line 44) — it owns no colors of its own, only the
 * arrangement of Card / IconBadge / ListRow / RatingBadge.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BREW_METHOD_LABELS, type Brew } from '@/db/schema';
import { formatRatio } from '@/lib/format';
import { formatRelative } from '@/lib/dates';
import { useTheme } from '@/theme/useTheme';
import { Card, IconBadge, ListRow, RatingBadge } from '@/components/ui';

import { methodIcon } from './methodIcon';

export interface BrewCardProps {
  brew: Brew;
  /** Resolved from the bean list by the screen — `bean_id` is a plain string, not an FK. */
  beanName?: string;
  onPress?: () => void;
  testID?: string;
}

export function BrewCard({ brew, beanName, onPress, testID }: BrewCardProps): React.JSX.Element {
  const { colors, typography, spacing } = useTheme();

  const methodLabel = BREW_METHOD_LABELS[brew.method as keyof typeof BREW_METHOD_LABELS] ?? brew.method;
  const ratio = formatRatio(brew.doseG, brew.waterG);

  // SCREENS.md §3.1 wants method + date in the caption; the ratio rides along when
  // both sides are present (API.md §1.3: show nothing when either is missing).
  const caption = [methodLabel, formatRelative(brew.brewedAt), ratio].filter(Boolean).join(' · ');

  return (
    <Card testID={testID} style={styles.card}>
      <ListRow
        title={beanName ?? methodLabel}
        caption={caption}
        leading={<IconBadge icon={methodIcon(brew.method)} />}
        trailing={brew.rating != null ? <RatingBadge rating={brew.rating} /> : undefined}
        onPress={onPress}
      />
      {brew.notes ? (
        <View style={{ paddingTop: spacing.xs }}>
          <Text style={[typography.body, { color: colors.textSecondary }]} numberOfLines={1}>
            {brew.notes}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    // The ListRow inside already carries its own vertical rhythm.
    paddingVertical: 8,
  },
});
