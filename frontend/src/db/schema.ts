// Drizzle sqlite schema — mirrors docs/API.md §1 exactly, field-for-field.
// A Laravel agent is mirroring the same tables in parallel; do not drift field names.
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ---------------------------------------------------------------------------
// §1.5 method enum — identical list on both halves, snake_case keys.
// ---------------------------------------------------------------------------
export const BREW_METHODS = [
  'v60',
  'french_press',
  'moka',
  'espresso',
  'drip',
  'aeropress',
  'cold_brew',
  'other',
] as const;

export type BrewMethod = (typeof BREW_METHODS)[number];

export const BREW_METHOD_LABELS: Record<BrewMethod, string> = {
  v60: 'V60',
  french_press: 'French Press',
  moka: 'Moka',
  espresso: 'Espresso',
  drip: 'Drip',
  aeropress: 'AeroPress',
  cold_brew: 'Cold Brew',
  other: 'Other',
};

// ---------------------------------------------------------------------------
// §1.2 beans
// ---------------------------------------------------------------------------
export const beans = sqliteTable(
  'beans',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    roaster: text('roaster'),
    origin: text('origin'),
    process: text('process'),
    roastLevel: text('roast_level'),
    roastDate: text('roast_date'),
    grams: real('grams'),
    price: real('price'),
    currency: text('currency').notNull().default('PHP'),
    boughtAt: text('bought_at'),
    // local only — device file URI, never sent to the server (API.md §1.2)
    photoUri: text('photo_uri'),
    // server-side storage path, set by the photo upload endpoint
    photoPath: text('photo_path'),
    notes: text('notes'),
    isFinished: integer('is_finished', { mode: 'boolean' }).notNull().default(false),
    finishedAt: text('finished_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => [index('beans_updated_at_idx').on(table.updatedAt)],
);

// ---------------------------------------------------------------------------
// §1.3 brews
// ---------------------------------------------------------------------------
export const brews = sqliteTable(
  'brews',
  {
    id: text('id').primaryKey(),
    // plain text, no FK constraint — sync delivers rows out of order (API.md §1.3)
    beanId: text('bean_id'),
    method: text('method').notNull(),
    doseG: real('dose_g'),
    waterG: real('water_g'),
    tempC: real('temp_c'),
    grind: text('grind'),
    timeSeconds: integer('time_seconds'),
    rating: real('rating'),
    notes: text('notes'),
    brewedAt: text('brewed_at').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => [index('brews_updated_at_idx').on(table.updatedAt)],
);

// ---------------------------------------------------------------------------
// §1.4 recipes
// ---------------------------------------------------------------------------
export const recipes = sqliteTable(
  'recipes',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    beanId: text('bean_id'),
    method: text('method').notNull(),
    doseG: real('dose_g'),
    waterG: real('water_g'),
    tempC: real('temp_c'),
    grind: text('grind'),
    timeSeconds: integer('time_seconds'),
    notes: text('notes'),
    sourceBrewId: text('source_brew_id'),
    timesUsed: integer('times_used').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => [index('recipes_updated_at_idx').on(table.updatedAt)],
);

// ---------------------------------------------------------------------------
// §1.6 profiles — local only, never synced. Single row, id = 'local'.
// ---------------------------------------------------------------------------
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull().default('YENN'),
  units: text('units').notNull().default('metric'),
  defaultMethod: text('default_method').notNull().default('v60'),
  theme: text('theme').notNull().default('system'),
  onboarded: integer('onboarded', { mode: 'boolean' }).notNull().default(false),
  lastSyncedAt: text('last_synced_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------
export type Bean = typeof beans.$inferSelect;
export type NewBean = typeof beans.$inferInsert;

export type Brew = typeof brews.$inferSelect;
export type NewBrew = typeof brews.$inferInsert;

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
