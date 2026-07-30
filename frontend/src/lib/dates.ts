// Framework-free date helpers. Timestamps are ISO-8601 UTC strings with milliseconds and a
// trailing `Z` (API.md §0.3 / §1.1) — e.g. "2026-07-29T04:05:06.789Z". `Date#toISOString()`
// already produces exactly that shape, so most of this file is a thin, explicit wrapper around it.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Current instant as an ISO-8601 UTC string with milliseconds, e.g. "2026-07-29T04:05:06.789Z". */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Converts a Date to the same ISO-8601 UTC-with-ms string format used for storage. */
export function toIso(date: Date): string {
  return date.toISOString();
}

/** Parses a stored ISO-8601 string back into a Date. */
export function fromIso(s: string): Date {
  return new Date(s);
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Today's date, local time zone, as `YYYY-MM-DD` — matches the `roast_date` storage format. */
export function todayDateOnly(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Parses a `YYYY-MM-DD` date-only string as a local calendar date at midnight. */
function parseDateOnly(dateOnly: string): Date {
  const [y, m, d] = dateOnly.split('-').map((part) => Number.parseInt(part, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Whole days elapsed between a `YYYY-MM-DD` date-only string and today, local time zone. */
export function daysSince(dateOnly: string): number {
  const then = parseDateOnly(dateOnly);
  const today = parseDateOnly(todayDateOnly());
  return Math.floor((today.getTime() - then.getTime()) / MS_PER_DAY);
}

/** True when two values (ISO datetime strings, date-only strings, or Dates) fall on the same local calendar day. */
export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = typeof a === 'string' ? new Date(a) : a;
  const db = typeof b === 'string' ? new Date(b) : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/**
 * ISO-8601 UTC string for local midnight on the 1st of a month, `monthsAgo` months back
 * from the current month (0 = this month). Handy as a `since` bound for stats queries.
 */
export function startOfMonthIso(monthsAgo = 0): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1, 0, 0, 0, 0);
  return start.toISOString();
}

/** Formats a stored ISO timestamp for list rows: "Just now" / "5m ago" / "2h ago" / "Yesterday" / "Mar 4". */
export function formatRelative(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < 60 * 1000) return 'Just now';

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (isSameDay(then, now)) return `${diffHours}h ago`;

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (isSameDay(then, yesterday)) return 'Yesterday';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const label = `${months[then.getMonth()]} ${then.getDate()}`;
  return then.getFullYear() === now.getFullYear() ? label : `${label}, ${then.getFullYear()}`;
}
