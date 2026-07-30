/**
 * tokens.ts — THE ONLY FILE IN THE REPO ALLOWED TO CONTAIN A HEX CODE.
 *
 * Transcribed directly from docs/DESIGN.md §1 (Color Palette), §3 (Shape & Elevation),
 * §6 (Layout Rules) and §8 (Dark Mode). Every other file in the app must import colors,
 * spacing, radius and shadows from here — never write a literal hex or rgba() elsewhere.
 */
import { Platform, type ViewStyle } from 'react-native';

/** Raw palette — every hex from DESIGN.md §1, plus the small set of rgba() values
 * needed to implement dark-mode borders/text per §8. This is the ONLY place either
 * kind of literal color value may appear in the codebase. */
export const palette = {
  // Primary
  green900: '#014D33',
  green800: '#036635',
  green600: '#0B7A4B',
  green100: '#DFF2E9',
  green50: '#F0F8F4',

  // Accent
  cream300: '#F2D9AC',
  orange400: '#F59E42',
  /** "Peak" freshness pill background — DESIGN.md §5 lists it inline as #FDEBD3. */
  peakBg: '#FDEBD3',

  // Neutrals
  navy900: '#1C2A4B',
  ink900: '#1D1D1F',
  ink600: '#5A5F6A',
  ink400: '#9AA0AB',
  line200: '#E7E9EE',
  bg0: '#FFFFFF',
  bg50: '#F7F8FA',

  // Semantic
  success: '#0B7A4B',
  warning: '#F59E42',
  danger: '#D9534F',

  // Dark mode (DESIGN.md §8)
  darkCard: '#243354',
  white: '#FFFFFF',
  whiteAlpha72: 'rgba(255, 255, 255, 0.72)',
  whiteAlpha48: 'rgba(255, 255, 255, 0.48)',
  whiteAlpha08: 'rgba(255, 255, 255, 0.08)',
  /** Dark-mode "selected chip" / primary-soft tint — a translucent green since a flat
   * green-100 patch reads as a light box floating on navy. See useTheme.ts note. */
  greenAlpha24: 'rgba(11, 122, 75, 0.24)',

  // Shadow color for cards/FABs — DESIGN.md §3 shadow `rgba(28,42,75,0.08)`,
  // which is navy-900 at low opacity.
  shadowColor: '#1C2A4B',

  /** BottomSheet backdrop — not itemized in DESIGN.md's palette table, but every
   * sheet needs a dim scrim; kept here so it's still the only file with an rgba(). */
  backdrop: 'rgba(28, 42, 75, 0.4)',
} as const;

export type Palette = typeof palette;

/** The three freshness buckets a bag can be in — DESIGN.md §5, mirrored by
 * `features/beans/freshness.ts`. */
export type FreshnessKey = 'fresh' | 'peak' | 'fading';

/**
 * Shape of a semantic color map. Values are widened to `string` on purpose: the
 * palette above is `as const`, so without this the light map's literal types would
 * become the *required* types for the dark map and every dark value would be a type
 * error. The two maps are alternatives, not one canonical set.
 */
export interface ThemeColors {
  bg: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  onPrimaryMuted: string;
  accent: string;
  secondaryBtn: string;
  danger: string;
  success: string;
  warning: string;
  link: string;
  overlay: string;
  freshness: Record<FreshnessKey, { bg: string; text: string }>;
}

/** Semantic color map — light theme (default). */
export const lightColors: ThemeColors = {
  bg: palette.bg50,
  surface: palette.bg0,
  textPrimary: palette.ink900,
  textSecondary: palette.ink600,
  textMuted: palette.ink400,
  border: palette.line200,
  primary: palette.green800,
  primaryPressed: palette.green900,
  primarySoft: palette.green100,
  onPrimary: palette.bg0,
  onPrimaryMuted: palette.whiteAlpha72,
  accent: palette.orange400,
  secondaryBtn: palette.cream300,
  danger: palette.danger,
  success: palette.success,
  warning: palette.warning,
  /** DESIGN.md §1: green-600 for "Links, secondary emphasis" — also used for the
   * Ghost button label. */
  link: palette.green600,
  /** BottomSheet backdrop scrim. */
  overlay: palette.backdrop,
  /** DESIGN.md §5 Freshness pill states. */
  freshness: {
    fresh: { bg: palette.green100, text: palette.green800 },
    peak: { bg: palette.peakBg, text: palette.orange400 },
    fading: { bg: palette.bg50, text: palette.ink400 },
  },
};

/**
 * Semantic color map — dark theme, per DESIGN.md §8 ("deferred, but reserve tokens"):
 * bg-50 → navy-900, cards → darkCard, ink-900 → white, green-800 stays, shadows off,
 * borders whiteAlpha08.
 */
export const darkColors: ThemeColors = {
  bg: palette.navy900,
  surface: palette.darkCard,
  textPrimary: palette.white,
  textSecondary: palette.whiteAlpha72,
  textMuted: palette.whiteAlpha48,
  border: palette.whiteAlpha08,
  primary: palette.green800,
  primaryPressed: palette.green900,
  primarySoft: palette.greenAlpha24,
  onPrimary: palette.white,
  onPrimaryMuted: palette.whiteAlpha72,
  accent: palette.orange400,
  secondaryBtn: palette.cream300,
  danger: palette.danger,
  success: palette.success,
  warning: palette.warning,
  link: palette.green600,
  overlay: palette.backdrop,
  // Not specified by DESIGN.md §8 — extrapolated using the same substitutions the
  // spec applies elsewhere (light-on-dark surfaces, translucent green tint, shadows
  // off). Peak keeps its light accent bg/text since it's a small saturated badge.
  freshness: {
    fresh: { bg: palette.greenAlpha24, text: palette.green100 },
    peak: { bg: palette.peakBg, text: palette.orange400 },
    fading: { bg: palette.darkCard, text: palette.whiteAlpha48 },
  },
};

/** Spacing scale — DESIGN.md §6: "4 / 8 / 12 / 16 / 20 / 24 / 32. Nothing off-scale." */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export type Spacing = typeof spacing;

/** Corner radius scale — DESIGN.md §3. */
export const radius = {
  pill: 28,
  card: 20,
  hero: 24,
  sheet: 24,
  input: 14,
  chip: 10,
  thumb: 16,
  badge: 12,
} as const;

export type Radius = typeof radius;

/** Elevation — DESIGN.md §3 card shadow `0 4 16 rgba(28,42,75,0.08)`, plus a heavier
 * "level 2" shadow for the FAB (DESIGN.md §5). `none` is used in dark mode, where
 * DESIGN.md §8 says shadows are off. */
export const shadows: Record<'card' | 'fab' | 'none', ViewStyle> = {
  card: {
    shadowColor: palette.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    ...Platform.select<ViewStyle>({
      android: { elevation: 4 },
      default: {},
    }),
  },
  fab: {
    shadowColor: palette.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    ...Platform.select<ViewStyle>({
      android: { elevation: 8 },
      default: {},
    }),
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    ...Platform.select<ViewStyle>({
      android: { elevation: 0 },
      default: {},
    }),
  },
};

/** Generous touch target padding for small controls (steppers, icon buttons). */
export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;

/** Layout constants — DESIGN.md §6. */
export const layout = {
  screenPaddingX: 20,
  sectionGap: 24,
  cardPadding: 16,
} as const;

export type Layout = typeof layout;
