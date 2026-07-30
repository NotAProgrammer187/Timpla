/**
 * _layout.tsx — root layout (STRUCTURE.md): fonts, DB provider, splash.
 *
 * Loads Poppins (Regular + SemiBold — DESIGN.md §2's two-weight max), holds the
 * splash screen until fonts are ready, and wraps the app in
 * GestureHandlerRootView > SafeAreaProvider > ThemeProvider > DatabaseProvider > Stack.
 *
 * NOTE: `@/db/provider` is owned by the parallel data-layer agent and may not exist
 * yet — that's expected. Do not stub it here.
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Poppins_400Regular, Poppins_600SemiBold, useFonts } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';

import { ThemeProvider, useTheme } from '@/theme/useTheme';
import { DatabaseProvider } from '@/db/provider';

// Per expo-splash-screen docs: call this in global scope, unawaited, so it runs
// before the splash screen would otherwise auto-hide.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden in some environments (e.g. web) — non-fatal.
});

function RootNavigation(): React.JSX.Element {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const fontsReady = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {
        // No-op — nothing useful to do if hiding the splash fails.
      });
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <DatabaseProvider>
            <RootNavigation />
          </DatabaseProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
