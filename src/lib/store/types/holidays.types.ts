import type { Holiday } from '@/src/types/holiday';
import type { DayKey, CountryCode } from './common';

export type HolidaysSlice = {
  holidaysByDayKey: Record<string, Record<DayKey, Holiday[]>>;
  holidaysLoaded: Record<string, boolean>;
  holidaysLoading: Record<string, boolean>;
  holidaysError: Record<string, string | null>;
  holidaysRevByKey: Record<string, number>;

  holidayActions: {
    ensure: (year: number, country: CountryCode) => Promise<void>;
    refetch: (year: number, country: CountryCode) => Promise<void>;
    clear: (key?: string) => void;
  };
};
