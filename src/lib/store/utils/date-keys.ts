import { MonthKey, DayKey } from '../types/common';

export function today(): { monthKey: MonthKey; dayKey: DayKey } {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return { monthKey: `${yyyy}-${mm}`, dayKey: `${yyyy}-${mm}-${dd}` };
}

export function shiftMonthKey(monthKey: MonthKey, delta: number): MonthKey {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, (m ?? 1) - 1 + delta, 1);
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

export function shiftDayKey(dayKey: DayKey, deltaDays: number): DayKey {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, (d ?? 1) + deltaDays);
  const yyyy = String(dt.getFullYear());
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
