/**
 * IconBadge.tsx — DESIGN.md §4: "Icon badges in lists: icon on a 40px green-100
 * rounded-square (radius 12), icon in green-800."
 */
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

import type { IconComponent } from './icon';

export interface IconBadgeProps {
  icon: IconComponent;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const BADGE_SIZE = 40;
const ICON_SIZE = 20;

export function IconBadge({ icon: Icon, size = BADGE_SIZE, style, testID }: IconBadgeProps): React.JSX.Element {
  const { colors, radius } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: radius.badge, backgroundColor: colors.primarySoft },
        style,
      ]}
    >
      <Icon size={ICON_SIZE} color={colors.primary} strokeWidth={1.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
