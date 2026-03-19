import type { MonthKey, DayKey, CountryCode } from './common';

export type CalendarSlice = {
  monthKey: MonthKey;
  weekAnchor: DayKey;
  weekStartsOn: 'sun' | 'mon';
  countryCode: CountryCode;

  calendarActions: {
    setMonthKey: (k: MonthKey) => void;
    prevMonth: () => void;
    nextMonth: () => void;
    prevWeek: () => void;
    nextWeek: () => void;
    goToToday: () => void;
    setCountryCode: (cc: CountryCode) => void;
    setWeekStartsOn: (v: 'sun' | 'mon') => void;
  };
};
