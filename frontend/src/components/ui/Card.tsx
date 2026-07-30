/**
 * Card.tsx — DESIGN.md §3: white bg, radius 20, shadow `0 4 16 rgba(28,42,75,0.08)`,
 * "never both heavy shadow and border." Hero variant: primary green bg, radius 24,
 * white text (the dashboard hero). `flat` trades the shadow for a 1px border instead
 * — the "or border" alternative DESIGN.md calls out, for cards that sit inside an
 * already-shadowed surface (e.g. inside a BottomSheet).
 */
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export type CardVariant = 'default' | 'hero' | 'flat';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Card({ children, variant = 'default', style, testID }: CardProps): React.JSX.Element {
  const { colors, radius, shadows, layout } = useTheme();

  const variantStyle: ViewStyle = (() => {
    switch (variant) {
      case 'hero':
        return {
          backgroundColor: colors.primary,
          borderRadius: radius.hero,
        };
      case 'flat':
        return {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          ...shadows.card,
        };
    }
  })();

  return (
    <View testID={testID} style={[{ padding: layout.cardPadding }, variantStyle, style]}>
      {children}
    </View>
  );
}
