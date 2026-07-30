/**
 * Button.tsx — DESIGN.md §5 Buttons + §7 Motion.
 *
 * Variants: primary (green pill, h52, white uppercase label), secondary (cream-300
 * bg, ink-900 label), ghost (text-only, green-600), danger (destructive, red pill).
 * Pressed: primary darkens to green-900 (the only variant DESIGN.md calls out a
 * press-color for); every variant scales to 0.98 over 100ms. Disabled: 40% opacity,
 * never a gray swap.
 */
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/useTheme';

import type { IconComponent } from './icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconComponent;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const PRESS_DURATION_MS = 100;

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon: Icon,
  fullWidth = false,
  style,
  testID,
}: ButtonProps): React.JSX.Element {
  const { colors, radius, typography, spacing, hitSlop } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  const isGhost = variant === 'ghost';
  const isInteractive = !disabled && !loading;

  const animateTo = (toValue: number): void => {
    Animated.timing(scale, {
      toValue,
      duration: PRESS_DURATION_MS,
      useNativeDriver: true,
    }).start();
  };

  const { restBg, pressedBg, labelColor } = useMemo((): {
    restBg: string;
    pressedBg: string;
    labelColor: string;
  } => {
    switch (variant) {
      case 'secondary':
        return { restBg: colors.secondaryBtn, pressedBg: colors.secondaryBtn, labelColor: colors.textPrimary };
      case 'ghost':
        return { restBg: 'transparent', pressedBg: 'transparent', labelColor: colors.link };
      case 'danger':
        return { restBg: colors.danger, pressedBg: colors.danger, labelColor: colors.onPrimary };
      case 'primary':
      default:
        return { restBg: colors.primary, pressedBg: colors.primaryPressed, labelColor: colors.onPrimary };
    }
  }, [variant, colors]);

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, { transform: [{ scale }] }, style]}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        onPress={onPress}
        disabled={!isInteractive}
        hitSlop={isGhost ? hitSlop : undefined}
        onPressIn={() => {
          setPressed(true);
          animateTo(0.98);
        }}
        onPressOut={() => {
          setPressed(false);
          animateTo(1);
        }}
        style={[
          styles.base,
          isGhost
            ? { paddingVertical: spacing.sm }
            : { height: 52, borderRadius: radius.pill, paddingHorizontal: spacing.xxl },
          { backgroundColor: pressed ? pressedBg : restBg },
          !isInteractive && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={labelColor} />
        ) : (
          <View style={styles.content}>
            {Icon ? <Icon size={18} color={labelColor} strokeWidth={1.8} /> : null}
            <Text style={[typography.button, { color: labelColor }]}>{title}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabled: {
    opacity: 0.4,
  },
});
