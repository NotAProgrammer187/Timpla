// Framework-free freshness logic for bean bags. Windows per SCREENS.md §4.1:
// Fresh 0–14d green · Peak 15–30d accent · Fading 31d+ muted.
import { daysSince } from '@/lib/dates';

export type Freshness = 'fresh' | 'peak' | 'fading';

/** Days elapsed since roast, or null when the bag has no recorded roast date. */
export function daysOffRoast(roastDate: string | null | undefined): number | null {
  if (!roastDate) return null;
  return daysSince(roastDate);
}

/**
 * Freshness bucket for a bag's roast date, per SCREENS.md §4.1:
 * 0–14 days → fresh, 15–30 days → peak, 31+ days → fading. Null when there's no roast date.
 */
export function freshnessOf(roastDate: string | null | undefined): Freshness | null {
  const days = daysOffRoast(roastDate);
  if (days == null) return null;
  if (days <= 14) return 'fresh';
  if (days <= 30) return 'peak';
  return 'fading';
}
