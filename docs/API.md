# TIMPLA — API.md

> The contract between `/frontend` and `/backend`. This file is the single source of truth for the
> data model. A field only exists if it is listed here, and it must be spelled identically in
> `frontend/src/db/schema.ts` and the matching Laravel migration.

---

## 0. Ground rules

1. **The app never needs this API.** Every feature works against local SQLite. Only
   `frontend/src/sync/` may call these endpoints. A 500, a timeout, or a logged-out user must be
   invisible to the rest of the app.
2. **IDs are client-generated UUIDv4 strings.** The server never mints an id for a synced row. It
   accepts whatever the client sends and treats it as the primary key.
3. **Timestamps are ISO-8601 UTC with milliseconds and a `Z` suffix** — `2026-07-29T04:05:06.789Z`.
   Both halves store and compare them as strings. This format sorts lexicographically, which is what
   makes last-write-wins cheap.
4. **Nothing is ever hard-deleted.** Deleting sets `deleted_at`. A row with `deleted_at != null`
   still syncs, so the tombstone propagates to other devices.
5. **Every synced row belongs to a user.** The server adds `user_id`; the client never sends it and
   never sees it. Ownership is enforced by a Policy on every model.

---

## 1. Data model

Three synced tables — `beans`, `brews`, `recipes` — plus one local-only table, `profiles`.

### 1.1 Shared columns

Every synced table has exactly these, with these types:

| Column | SQLite (Drizzle) | Laravel migration | Notes |
|--------|------------------|-------------------|-------|
| `id` | `text('id').primaryKey()` | `$t->uuid('id')->primary()` | client-generated UUIDv4 |
| `created_at` | `text('created_at').notNull()` | `$t->string('created_at')` | ISO-8601 UTC ms |
| `updated_at` | `text('updated_at').notNull()` | `$t->string('updated_at')->index()` | ISO-8601 UTC ms, drives sync |
| `deleted_at` | `text('deleted_at')` | `$t->string('deleted_at')->nullable()` | ISO-8601 UTC ms or null |

Backend-only additions (never sent by the client, never returned):

| Column | Laravel migration |
|--------|-------------------|
| `user_id` | `$t->foreignId('user_id')->constrained()->cascadeOnDelete()` |

> Timestamps are **string** columns on both halves, not native datetimes. This is deliberate — it
> guarantees the two databases hold byte-identical values and removes every timezone-conversion bug
> from the sync path.

### 1.2 `beans`

| Field | Type | Null | Default | Notes |
|-------|------|------|---------|-------|
| `id` | string | no | — | UUID |
| `name` | string | no | — | "Sagada Arabica" |
| `roaster` | string | yes | null | |
| `origin` | string | yes | null | |
| `process` | string | yes | null | washed / natural / honey / anaerobic / other |
| `roast_level` | string | yes | null | light / medium_light / medium / medium_dark / dark |
| `roast_date` | string | yes | null | date only, `YYYY-MM-DD` — drives the freshness pill |
| `grams` | number | yes | null | bag size in grams |
| `price` | number | yes | null | what the bag cost |
| `currency` | string | no | `"PHP"` | ISO 4217 |
| `bought_at` | string | yes | null | where it was bought |
| `photo_uri` | string | yes | null | **local only** — device file URI, never sent to the server |
| `photo_path` | string | yes | null | server-side storage path, set by the photo upload endpoint |
| `notes` | string | yes | null | tasting notes |
| `is_finished` | boolean | no | `false` | archived / bag emptied |
| `finished_at` | string | yes | null | ISO-8601 UTC ms |
| `created_at` / `updated_at` / `deleted_at` | string | see §1.1 | | |

Booleans are `integer({ mode: 'boolean' })` in Drizzle and `boolean` in Laravel; on the wire they are
JSON `true` / `false`.

`photo_uri` is the one field that is intentionally **not** symmetric. The device path is meaningless
on another device, so sync carries `photo_path` and each client resolves it to a local file itself.

### 1.3 `brews`

| Field | Type | Null | Default | Notes |
|-------|------|------|---------|-------|
| `id` | string | no | — | UUID |
| `bean_id` | string | yes | null | UUID of a bean; nullable so a brew can outlive its bag |
| `method` | string | no | — | see §1.5 |
| `dose_g` | number | yes | null | coffee in grams |
| `water_g` | number | yes | null | water in grams (or ml — 1:1) |
| `temp_c` | number | yes | null | |
| `grind` | string | yes | null | free text — grinder settings are not comparable across grinders |
| `time_seconds` | number | yes | null | total brew time |
| `rating` | number | yes | null | 0–5 in 0.5 steps |
| `notes` | string | yes | null | |
| `brewed_at` | string | no | — | ISO-8601 UTC ms — this is what the log sorts by, not `created_at` |
| `created_at` / `updated_at` / `deleted_at` | string | see §1.1 | | |

`ratio` is **never stored**. It is computed as `water_g / dose_g` and displayed as `1:15`. If either
side is null or zero, show nothing.

`bean_id` is a plain string, not a foreign key constraint, on both halves. Sync delivers rows in
arbitrary order, and a FK constraint would reject a brew that arrives before its bean. Referential
integrity is enforced in application code, not the schema.

### 1.4 `recipes`

| Field | Type | Null | Default | Notes |
|-------|------|------|---------|-------|
| `id` | string | no | — | UUID |
| `name` | string | no | — | "Sunday V60" |
| `bean_id` | string | yes | null | preferred bean |
| `method` | string | no | — | see §1.5 |
| `dose_g` | number | yes | null | |
| `water_g` | number | yes | null | |
| `temp_c` | number | yes | null | |
| `grind` | string | yes | null | |
| `time_seconds` | number | yes | null | |
| `notes` | string | yes | null | |
| `source_brew_id` | string | yes | null | the brew this dial-in was saved from |
| `times_used` | number | no | `0` | incremented on each 3-tap repeat |
| `created_at` / `updated_at` / `deleted_at` | string | see §1.1 | | |

### 1.5 `method` enum

Identical list on both halves. Stored as the snake_case key; the label is a frontend concern.

```
v60 · french_press · moka · espresso · drip · aeropress · cold_brew · other
```

### 1.6 `profiles` — local only, never synced

Device-level settings. Has no Laravel counterpart, no `user_id`, and never appears in a sync
payload. Single row, `id = 'local'`.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `id` | string | `'local'` | |
| `display_name` | string | `'YENN'` | greeting on the dashboard |
| `units` | string | `'metric'` | `metric` (g/ml) or `imperial` (tsp/cups) |
| `default_method` | string | `'v60'` | pre-selected in New Brew |
| `theme` | string | `'system'` | `system` / `light` / `dark` |
| `onboarded` | boolean | `false` | gates the first-run welcome |
| `last_synced_at` | string | null | ISO-8601 UTC ms — the sync cursor |
| `created_at` / `updated_at` | string | — | |

---

## 2. Conventions

- Base URL: `{host}/api`
- `Accept: application/json` on every request. `Content-Type: application/json` on every body.
- Auth: `Authorization: Bearer {token}` (Sanctum personal access token).
- Success bodies are always `{ "data": ... }`. Collections are `{ "data": [...] }`.
- Validation failures are `422` with Laravel's standard shape:

```json
{ "message": "The email field is required.", "errors": { "email": ["The email field is required."] } }
```

- `401` unauthenticated · `403` not your row · `404` unknown id · `429` throttled.
- Auth endpoints are throttled to 10 requests/minute per IP. Sync is throttled to 60/minute per user.

---

## 3. Auth

### `POST /api/auth/register`

```json
{ "name": "Yenn", "email": "yenn@example.com", "password": "secret1234", "password_confirmation": "secret1234", "device_name": "Pixel 8" }
```

`201` →

```json
{ "data": { "token": "3|abcdef…", "user": { "id": 1, "name": "Yenn", "email": "yenn@example.com" } } }
```

### `POST /api/auth/login`

```json
{ "email": "yenn@example.com", "password": "secret1234", "device_name": "Pixel 8" }
```

`200` → same shape as register. `422` if the credentials do not match.

### `POST /api/auth/logout` *(auth)*

Revokes the calling token only. `204`.

### `GET /api/me` *(auth)*

`200` → `{ "data": { "id": 1, "name": "Yenn", "email": "yenn@example.com" } }`

---

## 4. Resource CRUD *(auth)*

Available for `beans`, `brews`, and `recipes` — identical shape for all three.

| Method | Path | Result |
|--------|------|--------|
| `GET` | `/api/{resource}` | `200` — all non-deleted rows owned by the caller |
| `POST` | `/api/{resource}` | `201` — client supplies `id`; re-posting a known id updates it |
| `GET` | `/api/{resource}/{id}` | `200` · `403` if not yours · `404` if unknown |
| `PATCH` | `/api/{resource}/{id}` | `200` — partial update |
| `DELETE` | `/api/{resource}/{id}` | `204` — sets `deleted_at`, never removes the row |

`GET` collections accept `?since=<iso>` to filter on `updated_at` and `?with_deleted=1` to include
tombstones. The sync engine uses `/api/sync` instead of these; CRUD exists for tooling and tests.

A resource object on the wire is exactly the fields in §1, minus `photo_uri`, plus `photo_url` on
beans (see §6).

---

## 5. Sync

### `GET /api/sync?since=<iso8601>` *(auth)*

Everything the caller owns whose `updated_at` is **strictly greater than** `since`, tombstones
included. Omit `since` for a full pull (first login, fresh reinstall).

`200` →

```json
{
  "data": {
    "server_time": "2026-07-29T04:05:06.789Z",
    "beans": [ /* … */ ],
    "brews": [ /* … */ ],
    "recipes": [ /* … */ ]
  }
}
```

`server_time` is the server's clock at the moment the query ran. The client stores it as the next
`since` — never its own clock, which prevents clock skew from silently skipping rows.

### `POST /api/sync` *(auth)*

```json
{
  "beans": [ /* rows where updated_at > last_synced_at */ ],
  "brews": [ /* … */ ],
  "recipes": [ /* … */ ]
}
```

Per row, keyed by `id`:

- **Unknown id** → insert, owned by the caller.
- **Known id, incoming `updated_at` > stored** → overwrite every field.
- **Known id, incoming `updated_at` <= stored** → keep the server's version and report it as a
  conflict so the client can pull the winner.
- **Known id owned by someone else** → `403` for the whole request. Ids are UUIDs; this means a bug,
  not a collision.

`200` →

```json
{
  "data": {
    "server_time": "2026-07-29T04:05:06.789Z",
    "applied": { "beans": 3, "brews": 12, "recipes": 1 },
    "conflicts": [ { "table": "brews", "id": "…uuid…", "reason": "stale" } ]
  }
}
```

Each request is wrapped in a single database transaction — a partial push never lands.

Batch cap: 500 rows per table per request. Over that, `422`; the client pages.

### Client algorithm

```
push  → POST /api/sync with every local row where updated_at > last_synced_at
pull  → GET  /api/sync?since=last_synced_at
merge → for each remote row: if it is unknown locally, or its updated_at is newer
        than the local row's, write it (tombstones included). Otherwise ignore it.
commit→ last_synced_at = server_time from the pull
```

Push before pull. That ordering means a row edited on this device wins its own round trip, and
anything the server rejected as stale comes straight back in the pull that follows.

---

## 6. Photos

Bean photos live on the device. Sync moves the bytes, not the path.

### `POST /api/beans/{id}/photo` *(auth)*

`multipart/form-data`, field `photo`, JPEG or PNG, max 8 MB.

`200` → `{ "data": { "photo_path": "beans/9f2…-a1.jpg", "photo_url": "https://…/api/photos/…?signature=…" } }`

Stores the file, sets `photo_path` on the bean, and bumps the bean's `updated_at`.

### `GET /api/photos/{path}` — signed, no bearer token

Returns the image. URLs are signed and expire after 24 hours, so the frontend re-reads `photo_url`
from the bean resource rather than caching the URL long-term.

### `DELETE /api/beans/{id}/photo` *(auth)*

`204`. Clears `photo_path` and deletes the file.

Download rule: when a pulled bean has a `photo_path` the device has no local copy for, the sync
engine downloads it to app storage and sets the local `photo_uri`. A failed photo transfer is
logged and retried on the next sync — it never fails the sync as a whole.

---

## 7. Changing the schema

Any field change is one task touching four places, or it does not ship:

1. `frontend/src/db/schema.ts`
2. a new Laravel migration in `backend/database/migrations/`
3. the tables in §1 of this file
4. the API Resource in `backend/app/Http/Resources/`
