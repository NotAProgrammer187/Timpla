# TIMPLA — Screen Specification (Personal Coffee Journal)

> A single-user coffee brew journal, styled after the Ombe coffee-shop UI kit.
> Stack: React Native + Expo, local-first (SQLite / AsyncStorage). No backend, no auth for v1.
> Design language: see `DESIGN.md`.

---

## Navigation Structure

Bottom tab bar (4 tabs, outline icons):

| Tab | Icon (Lucide) | Screen |
|-----|--------------|--------|
| Home | `home` | Dashboard |
| Brews | `coffee` | Brew Log |
| Beans | `package` | Bean Library |
| Profile | `user` | My Stats & Settings |

Global FAB (floating action button, primary green, `plus` icon) on Home/Brews/Beans → starts **New Brew** flow.

---

## 1. Launch

### 1.1 Splash Screen
**What it does:** Full-bleed primary green background, app logo (cup line icon + wordmark) centered, "Version 1.0" small at bottom — mirrors Ombe's onboarding frame. Auto-advances after ~1.5s. No login (personal app).

### 1.2 First-Run Welcome (one time only)
**What it does:** One card with a 3D clay coffee-cup illustration, headline "Track every cup," short sub-line, single "Get Started" pill button. Asks two setup questions inline: default brew method (chips: V60 / French Press / Moka / Espresso / Drip / Other) and units (g/ml vs tsp/cups). Saves and never shows again.

---

## 2. Home — Dashboard

### 2.1 Dashboard
**What it does:** Daily landing screen.
- Greeting header: "Good Morning, YENN" + menu icon (Ombe pattern).
- **Hero card (wide, primary green, rounded-3xl):** "Today's brew" — if you brewed today, shows that brew's rating and method; if not, CTA "Wala ka pang timpla today ☕ → Log a brew."
- **Freshness alerts row:** horizontal cards for beans past their peak window ("Sagada beans — 21 days off roast").
- **Quick repeat:** your top 3 saved recipes as cards → tap opens New Brew pre-filled.
- **This week strip:** small stat chips — brews count, avg rating, current streak.

**Empty state:** 3D clay illustration + "Your journal is empty. First brew tayo?"

---

## 3. Brews Tab — Brew Log

### 3.1 Brew List
**What it does:** Reverse-chronological list of all brews. Each card: method icon, bean name, date, star rating (0.5 steps), one-line note preview. Search bar on top ("Search brews…") + filter chips (method, rating ≥4, this month). Ombe-style: white cards, soft shadow, rating badge in accent orange.

### 3.2 Brew Detail
**What it does:** Full record of one brew:
- Header card (green, rounded) with method, bean, date, big rating.
- Parameters grid: dose (g), water (g/ml), temp (°C), grind setting, time, ratio (auto-computed, e.g., 1:15).
- Notes section (free text).
- Actions: "Brew this again" (opens New Brew pre-filled) / Edit / Delete.

### 3.3 New Brew (the core flow — must be ≤30 seconds to complete)
**What it does:** One scrollable form, not a wizard:
1. Bean (picker from Bean Library, or "+ quick add").
2. Method (chips, default pre-selected).
3. Dose / water / temp / grind / time — numeric steppers with your last values pre-filled (this is the killer convenience).
4. Built-in **brew timer** (optional): start/stop, laps for bloom/pour.
5. Rating (stars) + notes.
"Save Brew" pill button pinned at bottom. Saving from a repeated recipe takes 3 taps total.

### 3.4 Recipes (accessed from Brews header icon `bookmark`)
**What it does:** Saved dial-ins. Any brew rated ≥4 shows "Save as recipe." Recipe = method + parameters + preferred bean. List of recipe cards; tap → New Brew pre-filled.

---

## 4. Beans Tab — Bean Library

### 4.1 Bean List
**What it does:** Cards for every bag: photo (camera snap of the bag), name, roaster/origin, roast date, price, and a **freshness pill**: Fresh (0–14d) green / Peak (15–30d) accent / Fading (31d+) muted. Segmented control: Active / Finished.

### 4.2 Bean Detail
**What it does:** Bag info + photo, price and where bought, roast date, tasting notes. Below: every brew made with this bean (mini list) + avg rating — "is this bag worth rebuying" at a glance. "Mark as finished" archives it.

### 4.3 Add/Edit Bean
**What it does:** Form: photo (camera/gallery), name, roaster, origin, roast date (date picker), grams, price, notes. Price-per-cup auto-computed later from usage.

---

## 5. Profile Tab — Stats & Settings

### 5.1 My Stats
**What it does:** The fun screen.
- Profile header (Ombe style): avatar, name, "Most Brewed" horizontal cards (like Ombe's "Most Ordered").
- Stat cards: total brews, brews/month chart (simple bar, primary green), avg rating trend, favorite method donut, total spent on beans, cost per cup.

### 5.2 Settings
**What it does:** Units, default method, dark mode toggle (sun/moon toggle like Ombe's menu), export data (JSON/CSV to share sheet), erase all data (double confirm). App version footer.

---

## Empty & Error States (use 3D clay illustrations, per DESIGN.md)

| State | Illustration | Copy |
|-------|--------------|------|
| Empty brew log | Character + cup | "First brew tayo?" |
| Empty bean library | Open box | "Add your first bag" |
| No search results | Character + 404-style "0" | "Walang nahanap" |
| Data export done | Paper plane | "Exported!" |

---

## MVP Cut Line

**Build now:** 1.1, 2.1, 3.1–3.3, 4.1–4.3, 5.2 (units + export only).
**Defer:** 1.2 setup polish, 3.4 recipes, 5.1 stats/charts, dark mode, brew timer laps.

Rule for a personal project: ship the 30-second brew logger first. Everything else is decoration you add per weekend.
