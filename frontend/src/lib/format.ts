// Framework-free display formatters. Pure functions only — no styling, no network.

type Units = 'metric' | 'imperial';

/** Trims a trailing ".0" but keeps one decimal place when the value actually needs it. */
function trimOneDecimal(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * "1:15" style brew ratio. `ratio` is never stored (API.md §1.3) — always computed on the fly.
 * Returns null when either side is null/undefined/0, per API.md §1.3 ("show nothing").
 */
export function formatRatio(doseG: number | null | undefined, waterG: number | null | undefined): string | null {
  if (doseG == null || waterG == null || doseG === 0 || waterG === 0) return null;
  return `1:${trimOneDecimal(waterG / doseG)}`;
}

/** "18g" / "18.5g". Returns null when grams is null/undefined. */
export function formatGrams(grams: number | null | undefined): string | null {
  if (grams == null) return null;
  return `${trimOneDecimal(grams)}g`;
}

/** "93°C" (metric) or converted to Fahrenheit for imperial. Returns null when temp is null/undefined. */
export function formatTemp(c: number | null | undefined, units: Units = 'metric'): string | null {
  if (c == null) return null;
  if (units === 'imperial') {
    const f = (c * 9) / 5 + 32;
    return `${Math.round(f)}°F`;
  }
  return `${Math.round(c)}°C`;
}

/** "3:15" (mm:ss), or "1:03:15" once an hour is crossed. Returns null when seconds is null/undefined. */
export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null) return null;
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = s < 10 ? `0${s}` : String(s);
  if (h > 0) {
    const mm = m < 10 ? `0${m}` : String(m);
    return `${h}:${mm}:${ss}`;
  }
  return `${m}:${ss}`;
}

/** Locale-aware currency formatting, e.g. "₱250.00". Returns null when amount is null/undefined. */
export function formatMoney(amount: number | null | undefined, currency = 'PHP'): string | null {
  if (amount == null) return null;
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** "4.5" / "4" star rating, 0.5 steps. Returns null when rating is null/undefined. */
export function formatRating(rating: number | null | undefined): string | null {
  if (rating == null) return null;
  return trimOneDecimal(rating);
}
