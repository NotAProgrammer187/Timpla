// The only place that talks to Drizzle for recipes (STRUCTURE.md rule #5).
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { brews, recipes, type Recipe } from '@/db/schema';
import { nowIso } from '@/lib/dates';
import { useAsyncQuery } from '@/lib/useAsyncQuery';
import { newId } from '@/lib/uuid';

import type { CreateRecipeInput, UpdateRecipeInput } from './types';

function buildRecipeListQuery(withDeleted = false) {
  return db
    .select()
    .from(recipes)
    .where(withDeleted ? undefined : isNull(recipes.deletedAt))
    .orderBy(desc(recipes.updatedAt));
}

export async function listRecipes(options: { withDeleted?: boolean } = {}): Promise<Recipe[]> {
  return buildRecipeListQuery(options.withDeleted);
}

export async function getRecipe(id: string, options: { withDeleted?: boolean } = {}): Promise<Recipe | undefined> {
  const conditions = [eq(recipes.id, id)];
  if (!options.withDeleted) conditions.push(isNull(recipes.deletedAt));
  const rows = await db.select().from(recipes).where(and(...conditions)).limit(1);
  return rows[0];
}

export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  const now = nowIso();
  const [row] = await db
    .insert(recipes)
    .values({ ...input, id: newId(), timesUsed: 0, createdAt: now, updatedAt: now })
    .returning();
  return row;
}

/** Saves a brew (rated ≥4) as a reusable dial-in — SCREENS.md §3.4 "Save as recipe". */
export async function createRecipeFromBrew(brewId: string, name: string): Promise<Recipe> {
  const [brew] = await db.select().from(brews).where(eq(brews.id, brewId)).limit(1);
  if (!brew) throw new Error(`createRecipeFromBrew: no brew with id ${brewId}`);

  return createRecipe({
    name,
    beanId: brew.beanId,
    method: brew.method,
    doseG: brew.doseG,
    waterG: brew.waterG,
    tempC: brew.tempC,
    grind: brew.grind,
    timeSeconds: brew.timeSeconds,
    notes: brew.notes,
    sourceBrewId: brew.id,
  });
}

export async function updateRecipe(id: string, patch: UpdateRecipeInput): Promise<Recipe | undefined> {
  const [row] = await db
    .update(recipes)
    .set({ ...patch, updatedAt: nowIso() })
    .where(eq(recipes.id, id))
    .returning();
  return row;
}

export async function softDeleteRecipe(id: string): Promise<void> {
  const now = nowIso();
  await db.update(recipes).set({ deletedAt: now, updatedAt: now }).where(eq(recipes.id, id));
}

/** Bumps `times_used` on each 3-tap repeat (SCREENS.md §3.4). */
export async function incrementRecipeUse(id: string): Promise<Recipe | undefined> {
  const existing = await getRecipe(id);
  if (!existing) return undefined;

  const [row] = await db
    .update(recipes)
    .set({ timesUsed: existing.timesUsed + 1, updatedAt: nowIso() })
    .where(eq(recipes.id, id))
    .returning();
  return row;
}

/** Top recipes by usage — dashboard "quick repeat" (SCREENS.md §2.1). */
export async function topRecipes(limit = 3): Promise<Recipe[]> {
  return db
    .select()
    .from(recipes)
    .where(isNull(recipes.deletedAt))
    .orderBy(desc(recipes.timesUsed))
    .limit(limit);
}

// ---------------------------------------------------------------------------
// Live-query hooks — re-render on write via drizzle's expo-sqlite change listener.
// ---------------------------------------------------------------------------

export function useRecipeList(options: { withDeleted?: boolean } = {}) {
  return useLiveQuery(buildRecipeListQuery(options.withDeleted), [options.withDeleted]);
}

/** Top recipes by use count — the dashboard's quick-repeat row (SCREENS.md §2.1). */
export function useTopRecipes(limit = 3) {
  const { updatedAt } = useLiveQuery(db.select({ count: sql<number>`count(*)` }).from(recipes));
  return useAsyncQuery(() => topRecipes(limit), [updatedAt?.getTime(), limit]);
}
