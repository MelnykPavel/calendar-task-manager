import { getHolidays } from '@/src/lib/api/holidays.client';
import type { Holiday } from '@/src/types/holiday';
import type { HolidaysSlice } from '../types/holidays.types';
import type { Slice } from '../types/app.types';
import type { DayKey } from '../types/common';

function mapHolidaysByDay(holidays: Holiday[]): Record<DayKey, Holiday[]> {
  const byDay: Record<string, Holiday[]> = {};
  const seenByDay: Record<string, Set<string>> = {};

  for (const h of holidays) {
    const dayKey = h.date;
    const text = (h.localName || h.name).trim();
    const uniq = `${h.date}|${h.countryCode}|${text}`;

    seenByDay[dayKey] ??= new Set();
    if (seenByDay[dayKey].has(uniq)) continue;
    seenByDay[dayKey].add(uniq);

    (byDay[dayKey] ??= []).push(h);
  }

  return byDay;
}

function omitKey<T>(record: Record<string, T>, key: string) {
  return Object.fromEntries(
    Object.entries(record).filter(([recordKey]) => recordKey !== key),
  ) as Record<string, T>;
}

export const createHolidaysSlice: Slice<HolidaysSlice> = (set, get) => ({
  holidaysByDayKey: {},
  holidaysLoaded: {},
  holidaysLoading: {},
  holidaysError: {},
  holidaysRevByKey: {},

  holidayActions: {
    ensure: async (year, country) => {
      const key = `${year}-${country.toUpperCase()}`;
      const s = get();
      if (s.holidaysLoaded[key] || s.holidaysLoading[key]) return;

      set((st) => ({
        holidaysLoading: { ...st.holidaysLoading, [key]: true },
        holidaysError: { ...st.holidaysError, [key]: null },
      }));

      try {
        const holidays = await getHolidays({
          year,
          country: country.toUpperCase(),
        });
        set((st) => ({
          holidaysByDayKey: {
            ...st.holidaysByDayKey,
            [key]: mapHolidaysByDay(holidays),
          },
          holidaysLoaded: { ...st.holidaysLoaded, [key]: true },
          holidaysLoading: { ...st.holidaysLoading, [key]: false },
          holidaysRevByKey: {
            ...st.holidaysRevByKey,
            [key]: (st.holidaysRevByKey[key] ?? 0) + 1,
          },
        }));
      } catch (err) {
        set((st) => ({
          holidaysLoading: { ...st.holidaysLoading, [key]: false },
          holidaysError: {
            ...st.holidaysError,
            [key]: (err as Error).message ?? 'Failed to load holidays',
          },
          holidaysRevByKey: {
            ...st.holidaysRevByKey,
            [key]: (st.holidaysRevByKey[key] ?? 0) + 1,
          },
        }));
      }
    },

    refetch: async (year, country) => {
      const key = `${year}-${country.toUpperCase()}`;
      set((s) => {
        return {
          holidaysByDayKey: omitKey(s.holidaysByDayKey, key),
          holidaysLoaded: omitKey(s.holidaysLoaded, key),
          holidaysRevByKey: {
            ...s.holidaysRevByKey,
            [key]: (s.holidaysRevByKey[key] ?? 0) + 1,
          },
        };
      });
      await get().holidayActions.ensure(year, country);
    },

    clear: (key) => {
      if (!key) {
        set({
          holidaysByDayKey: {},
          holidaysLoaded: {},
          holidaysLoading: {},
          holidaysError: {},
          holidaysRevByKey: {},
        });
        return;
      }

      set((s) => {
        return {
          holidaysByDayKey: omitKey(s.holidaysByDayKey, key),
          holidaysLoaded: omitKey(s.holidaysLoaded, key),
          holidaysLoading: omitKey(s.holidaysLoading, key),
          holidaysError: omitKey(s.holidaysError, key),
          holidaysRevByKey: {
            ...s.holidaysRevByKey,
            [key]: (s.holidaysRevByKey[key] ?? 0) + 1,
          },
        };
      });
    },
  },
});
