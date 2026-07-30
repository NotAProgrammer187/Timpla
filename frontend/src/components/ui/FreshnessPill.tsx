/**
 * FreshnessPill.tsx — DESIGN.md §5: 24px pill. Colors come from the
 * `colors.freshness.{fresh,peak,fading}` tokens (green-100/green-800, peak-bg/
 * orange-400, bg-50/ink-400). Day-count → state mapping belongs to
 * `features/beans/freshness.ts` — this only renders a given state.
 */
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export type FreshnessState = 'fresh' | 'peak' | 'fading';

export interface FreshnessPillProps {
  state: FreshnessState;
  label?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const DEFAULT_LABEL: Record<FreshnessState, string> = {
  fresh: 'Fresh',
  peak: 'Peak',
  fading: 'Fading',
};

export function FreshnessPill({ state, label, style, testID }: FreshnessPillProps): React.JSX.Element {
  const { colors, radius, typography, spacing } = useTheme();
  const { bg, text } = colors.freshness[state];

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        { backgroundColor: bg, borderRadius: radius.badge, paddingHorizontal: spacing.sm },
        style,
      ]}
    >
      <Text style={[typography.caption, { color: text }]} numberOfLines={1}>
        {label ?? DEFAULT_LABEL[state]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
