/**
 * SearchInput.tsx — the "Search brews…" field from SCREENS.md §3.1.
 *
 * DESIGN.md §3 and §10 forbid boxed inputs (multiline notes are the one exception),
 * so this is the same underline treatment as `Input`: 1px bottom border in line-200
 * that turns green-800 on focus. Differences from `Input` are a leading Lucide
 * magnifier instead of a caption label, and a trailing clear button once there's a
 * value — which is why this is its own primitive rather than an `Input` variant.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { useTheme } from '@/theme/useTheme';
import { fontFamily } from '@/theme/typography';

export interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const ICON_SIZE = 18;

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search…',
  autoFocus,
  style,
  testID,
}: SearchInputProps): React.JSX.Element {
  const { colors, typography, spacing, hitSlop } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: focused ? colors.primary : colors.border, gap: spacing.sm },
        style,
      ]}
    >
      <Search size={ICON_SIZE} color={focused ? colors.primary : colors.textMuted} strokeWidth={1.8} />
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          typography.body,
          styles.input,
          { color: colors.textPrimary, fontFamily: fontFamily.regular, paddingVertical: spacing.sm },
        ]}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X size={ICON_SIZE} color={colors.textMuted} strokeWidth={1.8} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    // RN adds vendor padding to TextInput on Android; zero it so the underline sits
    // where the spacing scale says it should.
    paddingHorizontal: 0,
  },
});
