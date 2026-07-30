/**
 * Chip.tsx — DESIGN.md §5 Chips (method/filter selectors).
 * Radius 10, height 34. Default: bg-50 + line-200 border. Selected: green-100 bg,
 * green-800 text + border.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Chip({ label, selected = false, onPress, disabled = false, style, testID }: ChipProps): React.JSX.Element {
  const { colors, radius, typography, spacing } = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        {
          height: 34,
          borderRadius: radius.chip,
          paddingHorizontal: spacing.md,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primarySoft : colors.bg,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[typography.body, { color: selected ? colors.primary : colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.4,
  },
});
