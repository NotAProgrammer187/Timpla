# CLAUDE.md — Timpla

Personal coffee brew journal. Solo dev (YENN). Monorepo.

## Stack
- `/frontend` — React Native + Expo (TypeScript), expo-router, Drizzle ORM on expo-sqlite, Lucide icons
- `/backend` — Laravel 11, API-only, Sanctum auth, SQLite database
- Docs in `/docs`: SCREENS.md (what every screen does), DESIGN.md (visual system), STRUCTURE.md (folder rules)

## Read these before writing code
- Building/changing UI → read `docs/DESIGN.md` first and follow it exactly
- Adding/changing a screen → read `docs/SCREENS.md` first
- Unsure where a file goes → read `docs/STRUCTURE.md`

## Hard rules — never violate
1. **Local-first, always.** All app features read/write local SQLite only — never the network. Only code inside `frontend/src/sync/` may call the backend API. Auth being logged out, backend being down, or sync failing must never block any feature. If the `sync/` folder is deleted, the app must still fully work offline.
2. **Schema changes touch both halves.** Any model change = update `frontend/src/db/schema.ts` AND a Laravel migration in the same task, field-for-field identical, plus a note in `docs/API.md`.
3. **No hex codes outside `frontend/src/theme/tokens.ts`.** All styling through tokens. No gradients, no glassmorphism, no glow effects, no boxed text inputs (underline style per DESIGN.md).
4. **Icons:** Lucide only for functional UI. 3D clay illustrations only for empty/success/error states, never in nav or lists.
5. **IDs are client-generated UUIDs.** All tables have `updated_at` and soft-delete `deleted_at`. Never hard-delete synced data.
6. **Backend is API-only.** No Blade views. Every model has a Policy checking ownership (`user_id`). Every write endpoint has a FormRequest. JSON via API Resources only.
7. **Secrets:** never commit `.env`; keep `.env.example` updated when adding any new env var.

## Conventions
- TypeScript strict mode; no `any`
- Components in `frontend/src/components/ui/` are the only styled primitives; screens compose them
- Copy/microcopy tone: short, warm, Taglish allowed ("Wala ka pang timpla today ☕")
- Commits: conventional style, scope by half — `feat(frontend): ...`, `fix(backend): ...`

## Git workflow — follow after every completed feature or fix
1. Create a branch first: `feat/<short-name>` or `fix/<short-name>` off `main` — never commit directly to `main`
2. Commit the work on that branch
3. Push the branch to origin
4. Open a pull request from the branch to `main` (`gh pr create`)
5. **Never delete the branch** after merge — keep all branches
6. **Never add "Co-Authored-By: Claude"** or any AI attribution to commit messages or PR descriptions

## Commands
- Frontend: `cd frontend && npm install` (first time) then `npx expo start`
- Backend: `cd backend && composer install && composer setup` (first time) then `php artisan serve` · tests: `php artisan test`
- `composer setup` copies `.env`, generates the app key, creates the SQLite file and migrates. Requires the `pdo_sqlite` PHP extension.
- If setup needs more steps than this, fix the setup, don't document workarounds

## Roadmap — full build, in order

Work strictly phase by phase. Do not start a phase until the previous one's "Done when" passes. Within the current phase, do not scaffold code for future phases.

### Phase 1 — Frontend foundation
Expo project setup, expo-router tab navigation, theme tokens (`tokens.ts` from DESIGN.md), UI primitives in `components/ui/` (Button, Chip, Input, Card, RatingBadge, FreshnessPill, ListRow, BottomSheet), Poppins fonts, splash screen.
**Done when:** all 4 tabs render with placeholder screens using only the primitives; zero hex codes outside tokens.ts.

### Phase 2 — Local data layer
Drizzle schema (`profiles`, `beans`, `brews`, `recipes` — client UUIDs, `updated_at`, `deleted_at`), migrations, typed query helpers in `features/*`. Seed script with demo beans/brews for dev.
**Done when:** CRUD works for all tables from a dev screen; app relaunches with data intact.

### Phase 3 — Core screens (per docs/SCREENS.md)
New Brew flow (≤30s to log, last values pre-filled), Brew List + Detail, Bean Library (list/detail/add with photo via expo-file-system), Dashboard with freshness alerts and quick-repeat, Settings (units, default method, JSON export via share sheet). Empty states with clay illustrations.
**Done when:** the app is a complete offline brew journal usable daily with no backend.

### Phase 4 — Backend API (Laravel)
Laravel 11 API-only project in `/backend`. SQLite DB. Sanctum token auth (register/login/logout). Models Bean/Brew/Recipe with HasUuids + SoftDeletes, migrations mirroring Drizzle field-for-field. Policies (ownership), FormRequests, API Resources. Photo upload to local storage with signed URLs. Sync endpoints: `GET /api/sync?since=` and `POST /api/sync`. DemoSeeder. Feature tests per controller. Dockerfile + docker-compose.
**Done when:** `php artisan test` passes; full CRUD + sync round-trip works via HTTP client against a seeded DB.

### Phase 5 — Connect: auth + sync engine
Frontend auth screens (login/register, token stored in expo-secure-store — app remains fully usable logged-out). `sync/api.ts` typed client from `docs/API.md`. `sync/engine.ts`: push local rows where `updated_at > lastSyncedAt`, pull remote since same, last-write-wins, soft-delete propagation, photo upload/download. Background trigger: on app foreground + after writes (debounced). Sync status indicator in Settings; conflicts and failures never block or corrupt local data.
**Done when:** two devices (or device + fresh reinstall) converge to identical data through the backend; airplane-mode usage syncs cleanly on reconnect.

### Phase 6 — Stats & polish
Stats screen (brews/month bar chart, favorite method, avg rating trend, cost per cup), Recipes/"Mga Timpla Ko" (save brew ≥4★ as recipe, 3-tap repeat), brew timer with bloom laps, dark mode via tokens, animations per DESIGN.md motion rules.
**Done when:** every screen in docs/SCREENS.md exists and matches DESIGN.md.

### Phase 7 — Open-source release
Root README with screenshots first, setup for both halves, self-hosting section ("point the app at your own backend"), MIT LICENSE with real name (no placeholders), `.env.example` files verified, `docs/API.md` complete, PR/feature-request policy line, GitHub Actions: frontend typecheck + backend tests.
**Done when:** a stranger can clone, boot both halves, and sync — using only the README.
