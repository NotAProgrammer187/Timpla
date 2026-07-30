# Illustrations

3D clay art from [3dicons.co](https://3dicons.co) (free, open source) goes here.

Per `docs/DESIGN.md` §4 (Tier 2 iconography):

- Used **only** for empty states, onboarding, success moments, and error screens.
- Never in navigation, list rows, or buttons — those are Lucide-only (Tier 1).
- One illustration per screen maximum, centered, max width 60% of screen.
- Must be recolored to the green/cream family (`green-800`, `green-100`, `cream-300`)
  if the pack ships in other hues — recolor in Figma before exporting here.

`components/ui/EmptyState.tsx` accepts an optional `illustration` prop (`ReactNode`)
so screens pass art in explicitly — the primitive itself never imports a specific
file from this folder.
