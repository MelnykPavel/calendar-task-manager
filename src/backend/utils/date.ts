const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE_RE.test(value);
}

export function assertIsoDateString(value: unknown, message = 'Expected YYYY-MM-DD'): asserts value is string {
  if (!isIsoDateString(value)) throw new Error(message);
}

export function compareIsoDate(a: string, b: string) {
  return a.localeCompare(b);
}

export function parseIsoDateToUtcDate(isoDate: string): Date {
  assertIsoDateString(isoDate);
  const [y, m, d] = isoDate.split('-').map((n) => Number(n));
  return new Date(Date.UTC(y, m - 1, d));
}

export function toIsoDateUtc(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysIso(isoDate: string, days: number): string {
  const dt = parseIsoDateToUtcDate(isoDate);
  dt.setUTCDate(dt.getUTCDate() + days);
  return toIsoDateUtc(dt);
}
