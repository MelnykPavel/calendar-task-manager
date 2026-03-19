import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { createCalendarSlice } from './slices/calendar.slice';
import { createUiSlice } from './slices/ui.slice';
import { createTasksSlice } from './slices/tasks.slice';
import { createHolidaysSlice } from './slices/holidays.slice';
import type { AppState } from './types/app.types';

const isDev = process.env.NODE_ENV === 'development';

type PersistedState = {
  weekStartsOn: AppState['weekStartsOn'];
  themeMode: AppState['themeMode'];
  countryCode: AppState['countryCode'];
  viewMode: AppState['viewMode'];
};

export const useAppStore = create<
  AppState,
  [['zustand/devtools', never], ['zustand/persist', PersistedState]]
>(
  devtools(
    persist(
      (...a) => ({
        ...createCalendarSlice(...a),
        ...createUiSlice(...a),
        ...createTasksSlice(...a),
        ...createHolidaysSlice(...a),
      }),
      {
        name: 'calendar-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (s) => ({
          weekStartsOn: s.weekStartsOn,
          themeMode: s.themeMode,
          countryCode: s.countryCode,
          viewMode: s.viewMode,
        }),
      },
    ),
    { name: 'CalendarStore', enabled: isDev },
  ),
);
