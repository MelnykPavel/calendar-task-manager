import type { Holiday } from '@/src/types/holiday';
import type { DayKey, CountryCode } from './common';

export type HolidaysSlice = {
  /** Loaded holidays grouped by "YYYY-CC" key then by day */
  holidaysByDayKey: Record<string, Record<DayKey, Holiday[]>>;
  /** Whether holidays for a given "YYYY-CC" key have been loaded (replaces holidaysByKey) */
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
