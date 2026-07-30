// The only place that talks to Drizzle for brews (STRUCTURE.md rule #5).
import { and, desc, eq, gte, isNull, like, or, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { brews, type Brew } from '@/db/schema';
import { isSameDay, nowIso } from '@/lib/dates';
import { useAsyncQuery } from '@/lib/useAsyncQuery';
import { newId } from '@/lib/uuid';

import type { CreateBrewInput, ListBrewsOptions, UpdateBrewInput } from './types';

function buildBrewListQuery(options: ListBrewsOptions = {}) {
  const conditions = [];
  if (!options.withDeleted) conditions.push(isNull(brews.deletedAt));
  if (options.method) conditions.push(eq(brews.method, options.method));
  if (options.minRating != null) conditions.push(gte(brews.rating, options.minRating));
  if (options.since) conditions.push(gte(brews.brewedAt, options.since));
  if (options.beanId) conditions.push(eq(brews.beanId, options.beanId));
  if (options.search) {
    const pattern = `%${options.search}%`;
    conditions.push(or(like(brews.notes, pattern), like(brews.grind, pattern)));
  }

  let query = db
    .select()
    .from(brews)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(brews.brewedAt))
    .$dynamic();

  if (options.limit != null) query = query.limit(options.limit);
  if (options.offset != null) query = query.offset(options.offset);

  return query;
}

export async function listBrews(options: ListBrewsOptions = {}): Promise<Brew[]> {
  return buildBrewListQuery(options);
}

export async function getBrew(id: string, options: { withDeleted?: boolean } = {}): Promise<Brew | undefined> {
  const conditions = [eq(brews.id, id)];
  if (!options.withDeleted) conditions.push(isNull(brews.deletedAt));
  const rows = await db.select().from(brews).where(and(...conditions)).limit(1);
  return rows[0];
}

export async function createBrew(input: CreateBrewInput): Promise<Brew> {
  const now = nowIso();
  const [row] = await db
    .insert(brews)
    .values({ ...input, id: newId(), createdAt: now, updatedAt: now })
    .returning();
  return row;
}

export async function updateBrew(id: string, patch: UpdateBrewInput): Promise<Brew | undefined> {
  const [row] = await db
    .update(brews)
    .set({ ...patch, updatedAt: nowIso() })
    .where(eq(brews.id, id))
    .returning();
  return row;
}

export async function softDeleteBrew(id: string): Promise<void> {
  const now = nowIso();
  await db.update(brews).set({ deletedAt: now, updatedAt: now }).where(eq(brews.id, id));
}

/** Most recent brew — powers "pre-fill last values" in New Brew (SCREENS.md §3.3). */
export async function lastBrew(): Promise<Brew | undefined> {
  const rows = await db
    .select()
    .from(brews)
    .where(isNull(brews.deletedAt))
    .orderBy(desc(brews.brewedAt))
    .limit(1);
  return rows[0];
}

/** Brews logged today, local calendar day — powers the dashboard hero card. */
export async function brewsToday(): Promise<Brew[]> {
  const rows = await db
    .select()
    .from(brews)
    .where(isNull(brews.deletedAt))
    .orderBy(desc(brews.brewedAt));
  const now = new Date();
  return rows.filter((row) => isSameDay(row.brewedAt, now));
}

export async function countBrews(options: { withDeleted?: boolean } = {}): Promise<number> {
  const conditions = [];
  if (!options.withDeleted) conditions.push(isNull(brews.deletedAt));

  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(brews)
    .where(conditions.length ? and(...conditions) : undefined);
  return row?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Live-query hooks — re-render on write via drizzle's expo-sqlite change listener.
// ---------------------------------------------------------------------------

export function useBrewList(options: ListBrewsOptions = {}) {
  return useLiveQuery(buildBrewListQuery(options), [
    options.search,
    options.method,
    options.minRating,
    options.since,
    options.beanId,
    options.limit,
    options.offset,
    options.withDeleted,
  ]);
}

/** Today's brews — drives the dashboard hero card (SCREENS.md §2.1). */
export function useBrewsToday() {
  const { updatedAt } = useLiveQuery(db.select({ count: sql<number>`count(*)` }).from(brews));
  return useAsyncQuery(() => brewsToday(), [updatedAt?.getTime()]);
}

/** Live count of non-deleted brews, for the Profile stat strip. */
export function useBrewCount() {
  const { updatedAt } = useLiveQuery(db.select({ count: sql<number>`count(*)` }).from(brews));
  return useAsyncQuery(() => countBrews(), [updatedAt?.getTime()]);
}
