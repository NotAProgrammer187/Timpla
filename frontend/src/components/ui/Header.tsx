/**
 * Header.tsx — DESIGN.md §6: "back circle-button (40px, bg-50) left, centered
 * title, optional action right — the Ombe header on every inner page."
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

import { useTheme } from '@/theme/useTheme';

export interface HeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  testID?: string;
}

const CIRCLE_SIZE = 40;

export function Header({ title, onBack, right, testID }: HeaderProps): React.JSX.Element {
  const { colors, typography, spacing } = useTheme();

  return (
    <View testID={testID} style={[styles.row, { paddingVertical: spacing.md }]}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[styles.circle, { backgroundColor: colors.bg }]}
          >
            <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.8} />
          </Pressable>
        ) : null}
      </View>
      <Text style={[typography.h1, styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: CIRCLE_SIZE,
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
