/**
 * useTheme.ts — light/dark resolution.
 *
 * `ThemeProvider` holds the user's theme *preference* ('system' | 'light' | 'dark') in
 * React state, defaulting to 'system'. The Settings screen (Phase 3+) will call
 * `useThemePreference().setPreference(...)`; persisting that choice to disk is another
 * agent's job (the data layer) — here it just lives in context state.
 *
 * `useTheme()` resolves the preference against the OS color scheme and returns the
 * fully-assembled theme object every primitive should read from.
 */
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, hitSlop, layout, lightColors, radius, shadows, spacing } from './tokens';
import { typography } from './typography';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemePreferenceContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [preference, setPreference] = useState<ThemePreference>('system');

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({ preference, setPreference }),
    [preference]
  );

  return React.createElement(ThemePreferenceContext.Provider, { value }, children);
}

export function useThemePreference(): ThemePreferenceContextValue {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error('useThemePreference must be used within a ThemeProvider');
  }
  return ctx;
}

export interface Theme {
  colors: typeof lightColors;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: { card: (typeof shadows)['card']; fab: (typeof shadows)['fab']; none: (typeof shadows)['none'] };
  typography: typeof typography;
  layout: typeof layout;
  hitSlop: typeof hitSlop;
  isDark: boolean;
}

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const { preference } = useThemePreference();

  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return useMemo<Theme>(
    () => ({
      colors,
      spacing,
      radius,
      // DESIGN.md §8: shadows are off in dark mode.
      shadows: {
        card: isDark ? shadows.none : shadows.card,
        fab: isDark ? shadows.none : shadows.fab,
        none: shadows.none,
      },
      typography,
      layout,
      hitSlop,
      isDark,
    }),
    [colors, isDark]
  );
}
