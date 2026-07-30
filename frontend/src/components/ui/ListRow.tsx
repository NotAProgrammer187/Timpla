/**
 * ListRow.tsx — DESIGN.md §5 List rows: "64–72px height: leading icon-badge or 48px
 * thumbnail (radius 16) → title h2 + caption → trailing value/chevron/rating."
 * `leading` accepts an `IconBadge` or a themed thumbnail; `trailing` accepts a value
 * label, a `RatingBadge`, or is left empty and `chevron` is set for a plain chevron.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { useTheme } from '@/theme/useTheme';

export interface ListRowProps {
  title: string;
  caption?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ListRow({
  title,
  caption,
  leading,
  trailing,
  chevron = false,
  onPress,
  style,
  testID,
}: ListRowProps): React.JSX.Element {
  const { colors, typography, spacing } = useTheme();

  const content = (
    <View style={[styles.row, { paddingVertical: spacing.sm, gap: spacing.md }, style]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.body}>
        <Text style={[typography.h2, { color: colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        {caption ? (
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      {chevron ? <ChevronRight size={20} color={colors.textMuted} strokeWidth={1.8} /> : null}
    </View>
  );

  if (!onPress) {
    return (
      <View testID={testID} style={styles.minHeight}>
        {content}
      </View>
    );
  }

  return (
    <Pressable testID={testID} onPress={onPress} accessibilityRole="button" style={styles.minHeight}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  minHeight: {
    minHeight: 64,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
