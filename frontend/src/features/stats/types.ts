import type { BrewMethod } from '@/db/schema';

export type { BrewMethod };

export interface MonthlyCount {
  /** `YYYY-MM` */
  month: string;
  /** Short display label, e.g. "Jul 2026". */
  label: string;
  count: number;
}

export interface MonthlyRating {
  /** `YYYY-MM` */
  month: string;
  /** Short display label, e.g. "Jul 2026". */
  label: string;
  avgRating: number | null;
}

export interface FavoriteMethod {
  method: BrewMethod;
  count: number;
}

export interface ThisWeekSummary {
  count: number;
  avgRating: number | null;
  streak: number;
}
