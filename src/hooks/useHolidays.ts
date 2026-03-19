'use client';

import { getHolidays } from '@/src/lib/api/holidays.client';
import { mapHolidaysByDay } from '@/src/lib/holidays/holidays-mapper';
import type { Holiday } from '@/src/types/holiday';
import { useCallback, useEffect, useState } from 'react';

type State = {
  loading: boolean;
  error: string | null;
  holidays: Holiday[];
  byDay: Record<string, Holiday[]>;
};

export function useHolidays(input: { year: number; countryCode: string }) {
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    holidays: [],
    byDay: {},
  });

  const [nonce, setNonce] = useState(0);
  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setState((s) => ({ ...s, loading: true, error: null }));
    });

    getHolidays(
      { year: input.year, country: input.countryCode },
      controller.signal,
    )
      .then((holidays) => {
        setState({
          loading: false,
          error: null,
          holidays,
          byDay: mapHolidaysByDay(holidays),
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof Error && err.name === 'AbortError') return;
        setState((s) => ({
          ...s,
          loading: false,
          error: (err as Error).message ?? 'Failed to load holidays',
        }));
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [input.year, input.countryCode, nonce]);

  return { ...state, refetch };
}
