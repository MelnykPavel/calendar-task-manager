'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useAppStore } from '@/src/lib/store/app.store';
import {
  selectVisibleRange,
  selectVisibleYears,
} from '@/src/lib/store/selectors/calendar.selectors';

export default function CalendarDataSync() {
  const range = useAppStore(selectVisibleRange);
  const years = useAppStore(selectVisibleYears);
  const { countryCode, ensureHolidays, hydrateRange } = useAppStore(
    useShallow((state) => ({
      countryCode: state.countryCode,
      ensureHolidays: state.holidayActions.ensure,
      hydrateRange: state.taskActions.hydrateRange,
    })),
  );

  useEffect(() => {
    const controller = new AbortController();

    void hydrateRange({
      from: range.from,
      to: range.to,
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [hydrateRange, range.from, range.to]);

  useEffect(() => {
    for (const year of years) {
      void ensureHolidays(year, countryCode);
    }
  }, [countryCode, ensureHolidays, years]);

  return null;
}
