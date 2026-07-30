// The only place that talks to Drizzle for dashboard/stats aggregates (STRUCTURE.md rule #5).
import { and, desc, gte, isNull, lt, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { beans, brews, type BrewMethod } from '@/db/schema';
import { startOfMonthIso } from '@/lib/dates';

import type { FavoriteMethod, MonthlyCount, MonthlyRating, ThisWeekSummary } from './types';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function monthKeyAndLabel(monthsAgo: number): { month: string; label: string } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return { month, label: `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}` };
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Brew count per month for the last `months` months (oldest first, current month last). */
export async function brewsPerMonth(months: number): Promise<MonthlyCount[]> {
  const out: MonthlyCount[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const { month, label } = monthKeyAndLabel(i);
    const lower = startOfMonthIso(i);
    const upper = startOfMonthIso(i - 1);
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(brews)
      .where(and(isNull(brews.deletedAt), gte(brews.brewedAt, lower), lt(brews.brewedAt, upper)));
    out.push({ month, label, count: row?.count ?? 0 });
  }
  return out;
}

/** Average rating per month for the last `months` months (oldest first, current month last). */
export async function avgRatingTrend(months: number): Promise<MonthlyRating[]> {
  const out: MonthlyRating[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const { month, label } = monthKeyAndLabel(i);
    const lower = startOfMonthIso(i);
    const upper = startOfMonthIso(i - 1);
    const [row] = await db
      .select({ avgRating: sql<number | null>`avg(${brews.rating})` })
      .from(brews)
      .where(and(isNull(brews.deletedAt), gte(brews.brewedAt, lower), lt(brews.brewedAt, upper)));
    out.push({ month, label, avgRating: row?.avgRating ?? null });
  }
  return out;
}

/** Most-used method among non-deleted brews, or null when there are no brews yet. */
export async function favoriteMethod(): Promise<FavoriteMethod | null> {
  const rows = await db
    .select({ method: brews.method, count: sql<number>`count(*)` })
    .from(brews)
    .where(isNull(brews.deletedAt))
    .groupBy(brews.method)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { method: row.method as BrewMethod, count: row.count };
}

/** Sum of bag prices across active bean records. Assumes a single household currency (PHP). */
export async function totalSpentOnBeans(): Promise<number> {
  const [row] = await db
    .select({ total: sql<number | null>`sum(${beans.price})` })
    .from(beans)
    .where(isNull(beans.deletedAt));
  return row?.total ?? 0;
}

/** Total bean spend divided by total brews logged — a rough cost-per-cup. Null with no brews. */
export async function costPerCup(): Promise<number | null> {
  const [spend, brewCountRow] = await Promise.all([
    totalSpentOnBeans(),
    db.select({ count: sql<number>`count(*)` }).from(brews).where(isNull(brews.deletedAt)),
  ]);
  const totalBrews = brewCountRow[0]?.count ?? 0;
  if (totalBrews === 0) return null;
  return spend / totalBrews;
}

/**
 * Consecutive days (local calendar) with at least one brew, counting back from today.
 * If today has no brew yet, the streak still counts from yesterday backward (the day isn't
 * over), and only drops to 0 once yesterday is also empty.
 */
export async function currentStreak(): Promise<number> {
  const rows = await db.select({ brewedAt: brews.brewedAt }).from(brews).where(isNull(brews.deletedAt));
  const days = new Set(rows.map((row) => dateKey(new Date(row.brewedAt))));

  let cursor = new Date();
  if (!days.has(dateKey(cursor))) {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
    if (!days.has(dateKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return streak;
}

/** Dashboard "this week" strip: brew count, avg rating, and current streak (SCREENS.md §2.1). */
export async function thisWeekSummary(): Promise<ThisWeekSummary> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const sinceIso = start.toISOString();

  const [row, streak] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)`, avgRating: sql<number | null>`avg(${brews.rating})` })
      .from(brews)
      .where(and(isNull(brews.deletedAt), gte(brews.brewedAt, sinceIso))),
    currentStreak(),
  ]);

  const summary = row[0];
  return {
    count: summary?.count ?? 0,
    avgRating: summary?.avgRating ?? null,
    streak,
  };
}
