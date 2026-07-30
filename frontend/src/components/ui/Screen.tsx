/**
 * Screen.tsx — safe-area screen wrapper. DESIGN.md §6: "Screen padding: 20
 * horizontal." Background is bg-50 (bg-0 cards float above it).
 */
import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/useTheme';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: readonly Edge[];
  paddingHorizontal?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const DEFAULT_EDGES: readonly Edge[] = ['top', 'bottom', 'left', 'right'];

export function Screen({
  children,
  scroll = false,
  edges = DEFAULT_EDGES,
  paddingHorizontal = true,
  contentStyle,
  testID,
}: ScreenProps): React.JSX.Element {
  const { colors, layout } = useTheme();

  const horizontalPadding = paddingHorizontal ? layout.screenPaddingX : 0;

  if (scroll) {
    return (
      <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.bg }]}>
        <ScrollView
          testID={testID}
          contentContainerStyle={[{ paddingHorizontal: horizontalPadding }, styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView testID={testID} edges={edges} style={[styles.flex, { backgroundColor: colors.bg }]}>
      <View style={[styles.flex, { paddingHorizontal: horizontalPadding }, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
