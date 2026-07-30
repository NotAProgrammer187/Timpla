// The only place that talks to Drizzle for beans (STRUCTURE.md rule #5).
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { beans, brews, type Bean } from '@/db/schema';
import { nowIso } from '@/lib/dates';
import { newId } from '@/lib/uuid';

import type { BeanStats, CreateBeanInput, ListBeansOptions, UpdateBeanInput } from './types';

function buildBeanListQuery(options: ListBeansOptions = {}) {
  const conditions = [];
  if (!options.withDeleted) conditions.push(isNull(beans.deletedAt));
  if (options.finished != null) conditions.push(eq(beans.isFinished, options.finished));

  return db
    .select()
    .from(beans)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(beans.updatedAt));
}

export async function listBeans(options: ListBeansOptions = {}): Promise<Bean[]> {
  return buildBeanListQuery(options);
}

export async function getBean(id: string, options: { withDeleted?: boolean } = {}): Promise<Bean | undefined> {
  const conditions = [eq(beans.id, id)];
  if (!options.withDeleted) conditions.push(isNull(beans.deletedAt));
  const rows = await db.select().from(beans).where(and(...conditions)).limit(1);
  return rows[0];
}

export async function createBean(input: CreateBeanInput): Promise<Bean> {
  const now = nowIso();
  const [row] = await db
    .insert(beans)
    .values({
      ...input,
      id: newId(),
      currency: input.currency ?? 'PHP',
      isFinished: input.isFinished ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

export async function updateBean(id: string, patch: UpdateBeanInput): Promise<Bean | undefined> {
  const [row] = await db
    .update(beans)
    .set({ ...patch, updatedAt: nowIso() })
    .where(eq(beans.id, id))
    .returning();
  return row;
}

export async function softDeleteBean(id: string): Promise<void> {
  const now = nowIso();
  await db.update(beans).set({ deletedAt: now, updatedAt: now }).where(eq(beans.id, id));
}

export async function markBeanFinished(id: string, finished: boolean): Promise<Bean | undefined> {
  const now = nowIso();
  const [row] = await db
    .update(beans)
    .set({ isFinished: finished, finishedAt: finished ? now : null, updatedAt: now })
    .where(eq(beans.id, id))
    .returning();
  return row;
}

/** Brew count + average rating for this bag — "is this bag worth rebuying" (SCREENS.md §4.2). */
export async function beanStats(id: string): Promise<BeanStats> {
  const [row] = await db
    .select({
      brewCount: sql<number>`count(*)`,
      avgRating: sql<number | null>`avg(${brews.rating})`,
    })
    .from(brews)
    .where(and(eq(brews.beanId, id), isNull(brews.deletedAt)));

  return {
    brewCount: row?.brewCount ?? 0,
    avgRating: row?.avgRating ?? null,
  };
}

// ---------------------------------------------------------------------------
// Live-query hooks — re-render on write via drizzle's expo-sqlite change listener.
// ---------------------------------------------------------------------------

export function useBeanList(options: ListBeansOptions = {}) {
  return useLiveQuery(buildBeanListQuery(options), [options.finished, options.withDeleted]);
}
