/**
 * SectionTitle.tsx — a Dashboard/list section heading (h2) with an optional
 * trailing text action ("See all"-style), per the section rhythm implied by
 * DESIGN.md §6 (section gap 24) and SCREENS.md §2.1's dashboard sections.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface SectionTitleAction {
  label: string;
  onPress: () => void;
}

export interface SectionTitleProps {
  title: string;
  action?: SectionTitleAction;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SectionTitle({ title, action, style, testID }: SectionTitleProps): React.JSX.Element {
  const { colors, typography, spacing } = useTheme();

  return (
    <View testID={testID} style={[styles.row, { marginBottom: spacing.md }, style]}>
      <Text style={[typography.h2, { color: colors.textPrimary }]}>{title}</Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="button">
          <Text style={[typography.body, { color: colors.link }]}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
