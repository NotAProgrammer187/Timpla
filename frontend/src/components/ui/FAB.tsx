/**
 * FAB.tsx — DESIGN.md §5: "56px circle, green-800, white plus, shadow level 2."
 * Used on Home/Brews/Beans to start the New Brew flow (SCREENS.md nav).
 */
import React, { useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Plus } from 'lucide-react-native';

import { useTheme } from '@/theme/useTheme';

export interface FABProps {
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const SIZE = 56;
const PRESS_DURATION_MS = 100;

export function FAB({ onPress, disabled = false, style, testID }: FABProps): React.JSX.Element {
  const { colors, shadows } = useTheme();
  // Lazy `useState` initialiser — see the note in Button.tsx.
  const [scale] = useState(() => new Animated.Value(1));

  const animateTo = (toValue: number): void => {
    Animated.timing(scale, { toValue, duration: PRESS_DURATION_MS, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[shadows.fab, { transform: [{ scale }] }, style]}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel="Log a brew"
        accessibilityState={{ disabled }}
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => animateTo(0.98)}
        onPressOut={() => animateTo(1)}
        style={[
          styles.base,
          { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.primary },
          disabled && styles.disabled,
        ]}
      >
        <Plus size={26} color={colors.onPrimary} strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
