import { useMemo, useRef } from 'react';

import type { AppState } from '@/src/lib/store/types/app.types';

type DaySummary = { taskCount: number; hasHoliday: boolean };

export function useDaySummariesSelector(dayKeys: string[]) {
  const cacheRef = useRef<{ sig: string; map: Record<string, DaySummary> }>({
    sig: '',
    map: {},
  });

  return useMemo(() => {
    return (state: AppState) => {
      const countryCode = state.countryCode.toUpperCase();
      const sigParts = [String(state.tasksRev), countryCode];

      for (const dayKey of dayKeys) {
        const holidayKey = `${dayKey.slice(0, 4)}-${countryCode}`;
        sigParts.push(String(state.holidaysRevByKey[holidayKey] ?? 0));
      }

      const sig = sigParts.join('|');
      if (cacheRef.current.sig === sig) return cacheRef.current.map;

      const map: Record<string, DaySummary> = {};
      for (const dayKey of dayKeys) {
        map[dayKey] = { taskCount: 0, hasHoliday: false };
      }

      for (const task of Object.values(state.entities)) {
        if (map[task.day]) map[task.day].taskCount += 1;
      }

      for (const dayKey of dayKeys) {
        const holidayKey = `${dayKey.slice(0, 4)}-${countryCode}`;
        map[dayKey].hasHoliday = Boolean(state.holidaysByDayKey[holidayKey]?.[dayKey]?.length);
      }

      cacheRef.current = { sig, map };
      return map;
    };
  }, [dayKeys]);
}
