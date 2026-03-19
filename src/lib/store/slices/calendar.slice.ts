import type { CalendarSlice } from '../types/calendar.types';
import type { Slice } from '../types/app.types';
import { today, shiftMonthKey, shiftDayKey } from '../utils/date-keys';

export const createCalendarSlice: Slice<CalendarSlice> = (set, get) => {
  const t = today();

  return {
    monthKey: t.monthKey,
    weekAnchor: t.dayKey,
    weekStartsOn: 'sun',
    countryCode: 'US',

    calendarActions: {
      setMonthKey: (monthKey) => set({ monthKey }),
      prevMonth: () => set({ monthKey: shiftMonthKey(get().monthKey, -1) }),
      nextMonth: () => set({ monthKey: shiftMonthKey(get().monthKey, 1) }),
      prevWeek: () => set({ weekAnchor: shiftDayKey(get().weekAnchor, -7) }),
      nextWeek: () => set({ weekAnchor: shiftDayKey(get().weekAnchor, 7) }),
      goToToday: () => {
        const now = today();
        set({ monthKey: now.monthKey, weekAnchor: now.dayKey });
      },
      setCountryCode: (cc) => set({ countryCode: cc.toUpperCase() }),
      setWeekStartsOn: (v) => set({ weekStartsOn: v }),
    },
  };
};
