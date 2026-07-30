/**
 * RatingBadge.tsx — DESIGN.md §5: "Pill, orange-400 bg, white star + number,
 * 12/SemiBold — the floating '4.5' Ombe badge."
 */
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';

import { useTheme } from '@/theme/useTheme';
import { fontFamily } from '@/theme/typography';

export interface RatingBadgeProps {
  rating: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function RatingBadge({ rating, style, testID }: RatingBadgeProps): React.JSX.Element {
  const { colors, radius, typography, spacing } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        { backgroundColor: colors.accent, borderRadius: radius.badge, paddingHorizontal: spacing.sm },
        style,
      ]}
    >
      <Star size={12} color={colors.onPrimary} fill={colors.onPrimary} strokeWidth={0} />
      <Text style={[typography.caption, styles.label, { color: colors.onPrimary }]}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 22,
    gap: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fontFamily.semiBold,
  },
});
