/**
 * Divider.tsx — a 1px `line-200` rule, per DESIGN.md §1 ("Dividers, input
 * underlines, card borders").
 */
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface DividerProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Divider({ style, testID }: DividerProps): React.JSX.Element {
  const { colors } = useTheme();

  return <View testID={testID} style={[styles.base, { backgroundColor: colors.border }, style]} />;
}

const styles = StyleSheet.create({
  base: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
