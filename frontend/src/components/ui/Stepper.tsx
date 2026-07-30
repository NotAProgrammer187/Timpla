/**
 * Stepper.tsx — numeric −/+ stepper for dose/water/temp (SCREENS.md §3.3), with
 * long-press repeat: hold either button to keep incrementing/decrementing.
 */
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

import { useTheme } from '@/theme/useTheme';

export interface StepperProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  testID?: string;
}

const LONG_PRESS_DELAY_MS = 450;
const LONG_PRESS_INTERVAL_MS = 120;
const BUTTON_SIZE = 36;

export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = -Infinity,
  max = Infinity,
  suffix,
  testID,
}: StepperProps): React.JSX.Element {
  const { colors, typography, spacing } = useTheme();
  const valueRef = useRef(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const clamp = (next: number): number => Math.min(max, Math.max(min, next));

  const applyStep = (direction: 1 | -1): void => {
    const next = clamp(Math.round((valueRef.current + direction * step) * 100) / 100);
    valueRef.current = next;
    onChange(next);
  };

  const clearTimers = (): void => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  const startRepeating = (direction: 1 | -1): void => {
    applyStep(direction);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => applyStep(direction), LONG_PRESS_INTERVAL_MS);
    }, LONG_PRESS_DELAY_MS);
  };

  useEffect(() => clearTimers, []);

  return (
    <View testID={testID} style={styles.container}>
      {label ? (
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>{label}</Text>
      ) : null}
      <View style={[styles.row, { gap: spacing.lg }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease"
          onPressIn={() => startRepeating(-1)}
          onPressOut={clearTimers}
          style={[styles.button, { backgroundColor: colors.primarySoft }]}
        >
          <Minus size={16} color={colors.primary} strokeWidth={2} />
        </Pressable>
        <View style={styles.valueBox}>
          <Text style={[typography.stat, { color: colors.textPrimary }]} numberOfLines={1}>
            {value}
            {suffix ? <Text style={[typography.body, { color: colors.textMuted }]}> {suffix}</Text> : null}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase"
          onPressIn={() => startRepeating(1)}
          onPressOut={clearTimers}
          style={[styles.button, { backgroundColor: colors.primarySoft }]}
        >
          <Plus size={16} color={colors.primary} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBox: {
    minWidth: 64,
    alignItems: 'center',
  },
});
