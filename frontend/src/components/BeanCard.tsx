/**
 * BeanCard.tsx — the Bean Library card from SCREENS.md §4.1: "photo, name, roaster/
 * origin, roast date, price, and a freshness pill — Fresh (0–14d) green, Peak
 * (15–30d) accent, Fading (31d+) muted."
 *
 * A composite (STRUCTURE.md line 44). The freshness bucket comes from
 * `features/beans/freshness.ts`; this file only arranges primitives.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Package } from 'lucide-react-native';

import type { Bean } from '@/db/schema';
import { daysOffRoast, freshnessOf } from '@/features/beans/freshness';
import { formatMoney } from '@/lib/format';
import { useTheme } from '@/theme/useTheme';
import { Card, FreshnessPill, IconBadge, ListRow } from '@/components/ui';

export interface BeanCardProps {
  bean: Bean;
  onPress?: () => void;
  testID?: string;
}

const THUMB_SIZE = 48;

export function BeanCard({ bean, onPress, testID }: BeanCardProps): React.JSX.Element {
  const { colors, radius, typography, spacing } = useTheme();

  const freshness = freshnessOf(bean.roastDate);
  const days = daysOffRoast(bean.roastDate);
  const price = formatMoney(bean.price, bean.currency);

  const caption = [bean.roaster, bean.origin].filter(Boolean).join(' · ');

  const leading = bean.photoUri ? (
    <Image
      source={{ uri: bean.photoUri }}
      style={[styles.thumb, { borderRadius: radius.thumb, backgroundColor: colors.primarySoft }]}
      contentFit="cover"
      // DESIGN.md §4: 3D clay art is for empty/success states only, so a missing
      // photo falls back to a functional Lucide badge, never an illustration.
      accessibilityLabel={`${bean.name} bag photo`}
    />
  ) : (
    <IconBadge icon={Package} size={THUMB_SIZE} />
  );

  return (
    <Card testID={testID} style={styles.card}>
      <ListRow
        title={bean.name}
        caption={caption || undefined}
        leading={leading}
        trailing={
          price ? (
            <Text style={[typography.h2, { color: colors.textPrimary }]}>{price}</Text>
          ) : undefined
        }
        onPress={onPress}
      />
      {freshness ? (
        <View style={[styles.footer, { paddingTop: spacing.xs, gap: spacing.sm }]}>
          <FreshnessPill state={freshness} />
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {days === 0 ? 'Roasted today' : `${days} ${days === 1 ? 'day' : 'days'} off roast`}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 8,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
