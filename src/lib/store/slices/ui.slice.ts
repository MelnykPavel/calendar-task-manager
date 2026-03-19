import { Slice } from '../types/app.types';
import { UiSlice } from '../types/ui.types';

const THEME_COOKIE = 'ctm-theme';

function persistThemeCookie(themeMode: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.cookie = `${THEME_COOKIE}=${themeMode}; path=/; max-age=31536000; samesite=lax`;
}

export const createUiSlice: Slice<UiSlice> = (set, get) => ({
  searchText: '',
  viewMode: 'month',
  themeMode: 'light',
  editor: { open: false },

  uiActions: {
    setSearchText: (v) => set({ searchText: v }),
    setViewMode: (v) => set({ viewMode: v }),
    setThemeMode: (v) => {
      persistThemeCookie(v);
      set({ themeMode: v });
    },
    toggleTheme: () => {
      const nextThemeMode = get().themeMode === 'light' ? 'dark' : 'light';
      persistThemeCookie(nextThemeMode);
      set({ themeMode: nextThemeMode });
    },

    openCreate: (dayKey, initialTimeMinutes, initialAllDay) =>
      set({
        editor: {
          open: true,
          mode: 'create',
          dayKey,
          initialAllDay: initialAllDay ?? true,
          initialTimeMinutes: initialTimeMinutes ?? 0,
        },
      }),

    openEdit: (taskId) => {
      const t = get().entities[taskId];
      if (!t) return;
      set({ editor: { open: true, mode: 'edit', dayKey: t.day, taskId } });
    },
    openView: (taskId) => {
      const t = get().entities[taskId];
      if (!t) return;
      set({ editor: { open: true, mode: 'view', dayKey: t.day, taskId } });
    },

    closeEditor: () => set({ editor: { open: false } }),
  },
});
