/**
 * Input.tsx — DESIGN.md §3 "Ombe style" inputs: caption label on top in ink-400,
 * value below, single 1px bottom underline in line-200 that turns green-800 on focus.
 * No boxed inputs — except `TextArea`, the one deliberate exception for multiline
 * notes (radius 14, line-200 border), per DESIGN.md §3 and §10.
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix?: string;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  placeholder?: string;
  editable?: boolean;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  suffix,
  keyboardType,
  error,
  placeholder,
  editable = true,
  autoFocus,
  style,
  testID,
}: InputProps): React.JSX.Element {
  const { colors, typography, spacing } = useTheme();
  const [focused, setFocused] = useState(false);

  const underlineColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={[styles.container, style]}>
      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>{label}</Text>
      <View style={[styles.underlineRow, { borderBottomColor: underlineColor }]}>
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={editable}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[typography.body, styles.underlineInput, { color: colors.textPrimary }]}
        />
        {suffix ? (
          <Text style={[typography.body, { color: colors.textMuted, marginLeft: spacing.xs }]}>{suffix}</Text>
        ) : null}
      </View>
      {error ? <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.xs }]}>{error}</Text> : null}
    </View>
  );
}

export interface TextAreaProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** The ONLY boxed input allowed by DESIGN.md — for multiline notes. */
export function TextArea({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  numberOfLines = 4,
  style,
  testID,
}: TextAreaProps): React.JSX.Element {
  const { colors, radius, typography, spacing } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>{label}</Text>
      ) : null}
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={numberOfLines}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical="top"
        style={[
          typography.body,
          styles.boxedInput,
          {
            color: colors.textPrimary,
            borderColor,
            borderRadius: radius.input,
            padding: spacing.md,
          },
        ]}
      />
      {error ? <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.xs }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  underlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  underlineInput: {
    flex: 1,
    padding: 0,
  },
  boxedInput: {
    borderWidth: 1,
    minHeight: 96,
  },
});
