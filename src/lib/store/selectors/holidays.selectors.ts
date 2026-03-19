import type { Holiday } from '@/src/types/holiday';
import type { AppState } from '../types/app.types';
import {
  holidayTextCache,
  holidaysForDaysCache,
} from './cache/selector-caches';

function getYear(dayKey: string): number {
  return Number(dayKey.slice(0, 4));
}

function holidayText(h: Holiday): string {
  return (h.localName || h.name).trim();
}

export function selectHolidayTextsForDay(dayKey: string) {
  return (s: AppState): string[] => {
    const year = getYear(dayKey);
    const cc = s.countryCode.toUpperCase();
    const key = `${year}-${cc}`;
    const rev = s.holidaysRevByKey[key] ?? 0;

    const cacheKey = `${key}|${dayKey}`;
    const cached = holidayTextCache.get(cacheKey);
    if (cached && cached.rev === rev) return cached.texts;

    const list = s.holidaysByDayKey[key]?.[dayKey] ?? [];
    const texts = list.map(holidayText).filter(Boolean);
    holidayTextCache.set(cacheKey, { rev, texts });
    return texts;
  };
}

export function selectHolidayTextsForDays(dayKeys: string[]) {
  const key = dayKeys.join(',');
  return (s: AppState): Record<string, string[]> => {
    const cc = s.countryCode.toUpperCase();
    const years = Array.from(new Set(dayKeys.map(getYear))).sort();
    const sigParts: string[] = [cc];
    for (const y of years)
      sigParts.push(String(s.holidaysRevByKey[`${y}-${cc}`] ?? 0));
    const sig = sigParts.join('|');

    const cached = holidaysForDaysCache.get(key);
    if (cached && cached.sig === sig) return cached.map;

    const out: Record<string, string[]> = {};
    for (const d of dayKeys) {
      const hk = `${getYear(d)}-${cc}`;
      const list = s.holidaysByDayKey[hk]?.[d] ?? [];
      out[d] = list.map(holidayText).filter(Boolean);
    }

    holidaysForDaysCache.set(key, { sig, map: out });
    return out;
  };
}
