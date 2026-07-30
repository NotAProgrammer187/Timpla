/**
 * EmptyState.tsx — DESIGN.md §9: "Empty states: one line + one CTA. Never
 * paragraphs." §4 Tier 2: illustration centered, max width 60% of screen.
 * `illustration` is an optional slot so screens can pass in 3D clay art
 * (frontend/assets/illustrations) without this primitive depending on a file.
 */
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

import { Button } from './Button';
import type { IconComponent } from './icon';

export interface EmptyStateProps {
  message: string;
  illustration?: React.ReactNode;
  ctaLabel?: string;
  onCtaPress?: () => void;
  ctaIcon?: IconComponent;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function EmptyState({
  message,
  illustration,
  ctaLabel,
  onCtaPress,
  ctaIcon,
  style,
  testID,
}: EmptyStateProps): React.JSX.Element {
  const { colors, typography, spacing } = useTheme();

  return (
    <View testID={testID} style={[styles.container, { paddingVertical: spacing.xxxl }, style]}>
      {illustration ? (
        <View style={[styles.illustration, { marginBottom: spacing.lg }]}>{illustration}</View>
      ) : null}
      <Text style={[typography.body, styles.message, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
        {message}
      </Text>
      {ctaLabel && onCtaPress ? <Button title={ctaLabel} onPress={onCtaPress} icon={ctaIcon} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '60%',
    aspectRatio: 1,
  },
  message: {
    textAlign: 'center',
  },
});
