/**
 * Stars.tsx — 0–5 star rating, 0.5 steps. Read-only display when `onChange` is
 * omitted; an interactive picker (tap the left/right half of a star for a half or
 * full value) when it's provided. Used for brew ratings (SCREENS.md §3.3).
 */
import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';

import { useTheme } from '@/theme/useTheme';

export interface StarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const STAR_COUNT = 5;

function clampToHalfStep(value: number): number {
  const stepped = Math.round(value * 2) / 2;
  return Math.min(STAR_COUNT, Math.max(0, stepped));
}

interface StarGlyphProps {
  fillFraction: number; // 0, 0.5, or 1
  size: number;
  filledColor: string;
  emptyColor: string;
}

function StarGlyph({ fillFraction, size, filledColor, emptyColor }: StarGlyphProps): React.JSX.Element {
  if (fillFraction <= 0) {
    return <Star size={size} color={emptyColor} strokeWidth={1.8} />;
  }
  if (fillFraction >= 1) {
    return <Star size={size} color={filledColor} fill={filledColor} strokeWidth={0} />;
  }
  return (
    <View style={{ width: size, height: size }}>
      <Star size={size} color={emptyColor} strokeWidth={1.8} style={StyleSheet.absoluteFill} />
      <View style={[styles.halfMask, { width: size / 2, height: size }]}>
        <Star size={size} color={filledColor} fill={filledColor} strokeWidth={0} />
      </View>
    </View>
  );
}

export function Stars({ value, onChange, size = 20, style, testID }: StarsProps): React.JSX.Element {
  const { colors, spacing } = useTheme();
  const clamped = clampToHalfStep(value);
  const interactive = typeof onChange === 'function';

  return (
    <View testID={testID} style={[styles.row, { gap: spacing.xs }, style]} accessibilityRole={interactive ? 'adjustable' : 'image'}>
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const starNumber = index + 1;
        const fillFraction = Math.min(1, Math.max(0, clamped - index));

        if (!interactive) {
          return (
            <StarGlyph
              key={starNumber}
              fillFraction={fillFraction}
              size={size}
              filledColor={colors.accent}
              emptyColor={colors.border}
            />
          );
        }

        return (
          <View key={starNumber} style={{ width: size, height: size }}>
            <StarGlyph fillFraction={fillFraction} size={size} filledColor={colors.accent} emptyColor={colors.border} />
            <View style={StyleSheet.absoluteFill}>
              <View style={styles.pressRow}>
                <Pressable
                  accessibilityLabel={`Rate ${starNumber - 0.5} out of ${STAR_COUNT} stars`}
                  hitSlop={4}
                  style={styles.pressHalf}
                  onPress={() => onChange?.(starNumber - 0.5)}
                />
                <Pressable
                  accessibilityLabel={`Rate ${starNumber} out of ${STAR_COUNT} stars`}
                  hitSlop={4}
                  style={styles.pressHalf}
                  onPress={() => onChange?.(starNumber)}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  halfMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  pressRow: {
    flex: 1,
    flexDirection: 'row',
  },
  pressHalf: {
    flex: 1,
  },
});
