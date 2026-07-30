/**
 * Segmented.tsx — the Active / Finished control from SCREENS.md §4.1.
 *
 * A pill-shaped track (radius 28, DESIGN.md §3) holding two or more segments; the
 * selected one fills with green-800 and flips its label to white. Distinct from
 * `Chip`, which is a multi-select filter — this is one-of-N and always has exactly
 * one value selected. Generic over the option value so Settings can reuse it for the
 * metric/imperial units toggle in Phase 3.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';
import { fontFamily } from '@/theme/typography';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const TRACK_PADDING = 4;
const SEGMENT_HEIGHT = 34;

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
  testID,
}: SegmentedProps<T>): React.JSX.Element {
  const { colors, radius, typography } = useTheme();

  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      style={[
        styles.track,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderRadius: radius.pill,
          padding: TRACK_PADDING,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              {
                height: SEGMENT_HEIGHT,
                borderRadius: radius.pill,
                backgroundColor: selected ? colors.primary : 'transparent',
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                typography.body,
                {
                  color: selected ? colors.onPrimary : colors.textSecondary,
                  fontFamily: selected ? fontFamily.semiBold : fontFamily.regular,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  segment: {
    flex: 1,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
