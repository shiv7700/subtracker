// Pure date helpers. Used by /api/check-reminders (the "brain") and the FE.
// All dates are calendar dates ("YYYY-MM-DD") compared at day granularity.

function toUtcMidnight(value: string | Date): number {
  const d = typeof value === "string" ? new Date(value + "T00:00:00Z") : value;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Whole calendar days from `from` until `target`.
 * 0 = same day, positive = future, negative = past.
 */
export function daysUntil(target: string | Date, from: string | Date = new Date()): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((toUtcMidnight(target) - toUtcMidnight(from)) / MS_PER_DAY);
}

/**
 * True if `target` falls within the next `windowDays` days (inclusive), and is not in the past.
 * e.g. isDueWithin(date, 3) → due today, tomorrow, in 2, or in 3 days.
 */
export function isDueWithin(
  target: string | Date,
  windowDays: number,
  from: string | Date = new Date(),
): boolean {
  const d = daysUntil(target, from);
  return d >= 0 && d <= windowDays;
}
