/**
 * (tabs)/_layout.tsx — the 4-tab bar (STRUCTURE.md). SCREENS.md nav table: Home /
 * Brews / Beans / Profile. DESIGN.md §4: the active tab icon sits inside a 40px
 * green-800 filled circle with a white icon; inactive icons are ink-600, stroke
 * 1.8, size 22–24. DESIGN.md §6: tab bar is white, radius 24 on the top corners,
 * floating above bg-50 (achieved here with a card-level shadow for separation).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Coffee, Home, Package, User } from 'lucide-react-native';

import { useTheme } from '@/theme/useTheme';
import type { IconComponent } from '@/components/ui';

const ACTIVE_CIRCLE_SIZE = 40;
const ICON_SIZE = 22;

interface TabBarIconProps {
  icon: IconComponent;
  focused: boolean;
}

function TabBarIcon({ icon: Icon, focused }: TabBarIconProps): React.JSX.Element {
  const { colors } = useTheme();

  if (focused) {
    return (
      <View
        style={[
          styles.activeCircle,
          { width: ACTIVE_CIRCLE_SIZE, height: ACTIVE_CIRCLE_SIZE, borderRadius: ACTIVE_CIRCLE_SIZE / 2, backgroundColor: colors.primary },
        ]}
      >
        <Icon size={ICON_SIZE} color={colors.onPrimary} strokeWidth={1.8} />
      </View>
    );
  }

  return <Icon size={ICON_SIZE} color={colors.textSecondary} strokeWidth={1.8} />;
}

export default function TabsLayout(): React.JSX.Element {
  const { colors, radius, shadows } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.hero,
            borderTopRightRadius: radius.hero,
            borderTopWidth: 0,
          },
          shadows.card,
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabBarIcon icon={Home} focused={focused} /> }}
      />
      <Tabs.Screen
        name="brews"
        options={{ title: 'Brews', tabBarIcon: ({ focused }) => <TabBarIcon icon={Coffee} focused={focused} /> }}
      />
      <Tabs.Screen
        name="beans"
        options={{ title: 'Beans', tabBarIcon: ({ focused }) => <TabBarIcon icon={Package} focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabBarIcon icon={User} focused={focused} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 68,
    paddingTop: 10,
  },
  activeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
