/**
 * typography.ts — DESIGN.md §2 type scale, transcribed as RN TextStyle objects.
 *
 * Font: Poppins only, two weights max (Regular + SemiBold), loaded in src/app/_layout.tsx
 * via @expo-google-fonts/poppins as `Poppins_400Regular` / `Poppins_600SemiBold`.
 * Line height: 1.4x for body copy, 1.2x for headings/labels (DESIGN.md §2).
 */
import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Poppins_400Regular',
  semiBold: 'Poppins_600SemiBold',
} as const;

export type FontFamily = typeof fontFamily;

/**
 * `button` is a short, single-line uppercase label (not a paragraph), so it uses the
 * 1.2 "heading" line-height multiplier rather than the 1.4 body multiplier — DESIGN.md
 * §2 only defines the two multipliers for body vs. headings and doesn't call out
 * buttons explicitly; treating a pill label as heading-class text is the closer fit.
 */
export const typography: Record<
  'display' | 'h1' | 'h2' | 'body' | 'caption' | 'button' | 'stat',
  TextStyle
> = {
  display: {
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    lineHeight: 34, // 28 * 1.2
  },
  h1: {
    fontFamily: fontFamily.semiBold,
    fontSize: 22,
    lineHeight: 26, // 22 * 1.2
  },
  h2: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    lineHeight: 20, // 17 * 1.2
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20, // 14 * 1.4
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17, // 12 * 1.4
  },
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 17, // 14 * 1.2
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stat: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    lineHeight: 24, // 20 * 1.2
  },
};

export type Typography = typeof typography;
