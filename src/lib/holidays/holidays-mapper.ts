import type { Holiday } from '@/src/types/holiday';

export function mapHolidaysByDay(holidays: Holiday[]) {
  const byDay: Record<string, Holiday[]> = {};
  const seenByDay: Record<string, Set<string>> = {};

  for (const h of holidays) {
    const dayKey = h.date;
    const text = (h.localName || h.name).trim();
    const uniq = `${h.date}|${h.countryCode}|${text}`;

    if (!seenByDay[dayKey]) seenByDay[dayKey] = new Set();
    if (seenByDay[dayKey].has(uniq)) continue;
    seenByDay[dayKey].add(uniq);

    if (!byDay[dayKey]) byDay[dayKey] = [];
    byDay[dayKey].push(h);
  }

  return byDay;
}
