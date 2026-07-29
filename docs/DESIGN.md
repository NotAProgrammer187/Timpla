# TIMPLA — DESIGN.md

> Design system for the personal coffee journal, derived from the Ombe coffee-shop UI kit aesthetic.
> Rule zero: every screen should look like it shipped in that kit.

---

## 1. Color Palette

### Primary
| Token | Hex | Usage |
|-------|-----|-------|
| `green-900` | `#014D33` | Pressed states, dark hero cards |
| `green-800` (**PRIMARY**) | `#036635` | Buttons, active tab, hero cards, splash bg |
| `green-600` | `#0B7A4B` | Links, secondary emphasis, "Fresh" pill |
| `green-100` | `#DFF2E9` | Selected chip bg, icon-badge bg, success tint |
| `green-50`  | `#F0F8F4` | Section background tint |

### Accent
| Token | Hex | Usage |
|-------|-----|-------|
| `cream-300` | `#F2D9AC` | Secondary buttons (Ombe's "Create an Account" style) |
| `orange-400` | `#F59E42` | Star ratings, rating badges, "Peak" freshness pill |

### Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| `navy-900` | `#1C2A4B` | Optional dark-mode bg / showcase frames |
| `ink-900` | `#1D1D1F` | Headings |
| `ink-600` | `#5A5F6A` | Body text |
| `ink-400` | `#9AA0AB` | Placeholders, captions, timestamps |
| `line-200` | `#E7E9EE` | Dividers, input underlines, card borders |
| `bg-0` | `#FFFFFF` | Cards, sheets |
| `bg-50` | `#F7F8FA` | Screen background |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#0B7A4B` | Confirmations |
| `warning` | `#F59E42` | Freshness fading soon |
| `danger` | `#D9534F` | Delete, destructive confirm |

**Rules:**
- Primary green is the ONLY saturated color allowed in large areas. Accent orange appears only in small doses (stars, badges). Cream only on secondary buttons.
- Never place green text on green. On green surfaces, text is white at 100% / white 72% for secondary.

---

## 2. Typography

Font: **Poppins** (Google Fonts — matches Ombe's rounded geometric look). Fallback: system rounded.

| Style | Size / Weight | Usage |
|-------|---------------|-------|
| `display` | 28 / SemiBold | Screen titles ("Sign In", "Rewards" pattern) |
| `h1` | 22 / SemiBold | Card headlines, greeting name |
| `h2` | 17 / SemiBold | Card titles, list item names |
| `body` | 14 / Regular | Default text |
| `caption` | 12 / Regular | Labels above inputs, timestamps, hints |
| `button` | 14 / SemiBold, UPPERCASE, letter-spacing 0.5 | All pill buttons ("LOGIN" pattern) |
| `price/stat` | 20 / SemiBold | Big numbers (ratings, stats) |

Line height 1.4 for body, 1.2 for headings. Max two weights per screen (Regular + SemiBold).

---

## 3. Shape & Elevation

- **Corner radius scale:** buttons & pills `28` (full pill) · cards `20` · inputs/sheets `14` · chips `10` · thumbnails `16`.
- **Cards:** white bg, radius 20, shadow `0 4 16 rgba(28,42,75,0.08)`, optional 1px `line-200` border. Never both heavy shadow and border.
- **Hero cards:** primary green bg, radius 24, white text, product/3D image overflowing the top-right edge (signature Ombe trick).
- **Inputs:** Ombe style — caption label on top in `ink-400`, value below, single 1px bottom underline in `line-200`; underline turns `green-800` on focus. No boxed inputs except multiline notes (radius 14, `line-200` border).

---

## 4. Iconography

Two-tier system — this is what gives the kit its personality:

### Tier 1 — Functional icons (everywhere)
- **Set: Lucide** (`lucide-react-native`). Style equivalent to Ombe's Iconsax.
- Stroke width `1.8`, size `22–24` in nav/lists, `18` inline.
- Color: `ink-600` default, `green-800` active, white on green.
- Active bottom-tab icon sits in a `green-800` filled circle (40px) with white icon — exactly the Ombe tab pattern.
- Icon badges in lists: icon on a 40px `green-100` rounded-square (radius 12), icon in `green-800` (the "Delivery Address / Payment" row pattern).

### Tier 2 — 3D clay icons & illustrations (accents only)
- **Set: 3dicons.co** (free, open source) + any matching clay character pack.
- Use ONLY for: empty states, onboarding, success moments, error screens. Never in nav, lists, or buttons.
- One illustration per screen maximum, centered, max width 60% of screen.
- Keep to the green/cream family; recolor in Figma if a pack ships in other hues.

---

## 5. Core Components

### Buttons
| Variant | Style |
|---------|-------|
| Primary | Full-pill, `green-800` bg, white uppercase label, height 52 |
| Secondary | Full-pill, `cream-300` bg, `ink-900` label (Ombe "Create an Account") |
| Ghost | Text-only, `green-600`, used for "Resend", "Clear All" |
| FAB | 56px circle, `green-800`, white `plus`, shadow level 2 |

Pressed state: darken to `green-900`, scale 0.98. Disabled: 40% opacity, never gray-swap.

### Chips (method/filter selectors)
Radius 10, `bg-50` + `line-200` border default; selected = `green-100` bg, `green-800` text + border. Height 34.

### List rows
64–72px height: leading icon-badge or 48px thumbnail (radius 16) → title `h2` + caption → trailing value/chevron/rating.

### Rating badge
Pill, `orange-400` bg, white star + number, 12/SemiBold — the floating "4.5" Ombe badge.

### Freshness pill
Small pill 24px height: Fresh `green-100`/`green-800` · Peak `#FDEBD3`/`orange-400` · Fading `bg-50`/`ink-400`.

### Bottom sheet
Radius 24 top corners, drag handle 36×4 `line-200`, used for pickers and confirmations.

---

## 6. Layout Rules

- Screen padding: `20` horizontal. Section gap: `24`. Card internal padding: `16`.
- Spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32. Nothing off-scale.
- One hero element per screen max.
- Headers: back circle-button (40px, `bg-50`) left, centered title, optional action right — the Ombe header on every inner page.
- Bottom tab bar: white, radius 24 top corners, floating above `bg-50`.

## 7. Motion

- Screen transitions: default platform push.
- Button press: 100ms scale 0.98.
- Card entrance on dashboards: 200ms fade+rise, stagger 40ms, first load only.
- Success: single 300ms pop of the 3D icon. No confetti, no looping animations.

## 8. Dark Mode (deferred, but reserve tokens)

- `bg-50` → `navy-900`, cards → `#243354`, `ink-900` → white, `green-800` stays (passes contrast on navy), shadows off, borders `rgba(255,255,255,0.08)`.

## 9. Voice & Copy

- Short, warm, Taglish welcome ("Wala ka pang timpla today ☕").
- Buttons: verbs, uppercase ("SAVE BREW", "LOG A BREW").
- Empty states: one line + one CTA. Never paragraphs.

## 10. Do / Don't

✅ Big green pill buttons, generous whitespace, white cards on `bg-50`
✅ Product/illustration overflowing a green hero card edge
✅ Underline inputs with floating caption labels
❌ Gradients, glassmorphism, glow effects
❌ More than one accent color per screen
❌ 3D icons in navigation or list rows
❌ Boxed/outlined text inputs (except multiline notes)
