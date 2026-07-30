/**
 * StatChip.tsx — SCREENS.md §2.1 "This week strip: small stat chips — brews
 * count, avg rating, current streak." A compact value + label chip.
 */
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface StatChipProps {
  value: string | number;
  label: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function StatChip({ value, label, style, testID }: StatChipProps): React.JSX.Element {
  const { colors, radius, typography, spacing } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.chip,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    >
      <Text style={[typography.stat, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 84,
  },
});
