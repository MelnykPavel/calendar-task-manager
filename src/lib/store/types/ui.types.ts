import type { DayKey, TaskId, ThemeMode, ViewMode } from './common';

export type EditorState =
  | { open: false }
  | {
      open: true;
      mode: 'create';
      dayKey: DayKey;
      initialAllDay: boolean;
      initialTimeMinutes: number;
    }
  | {
      open: true;
      mode: 'edit';
      dayKey: DayKey;
      taskId: TaskId;
    }
  | {
      open: true;
      mode: 'view';
      dayKey: DayKey;
      taskId: TaskId;
    };

export type UiSlice = {
  searchText: string;
  viewMode: ViewMode;
  themeMode: ThemeMode;
  editor: EditorState;

  uiActions: {
    setSearchText: (v: string) => void;
    setViewMode: (v: ViewMode) => void;
    setThemeMode: (v: ThemeMode) => void;
    toggleTheme: () => void;
    openCreate: (dayKey: DayKey, initialTimeMinutes?: number, initialAllDay?: boolean) => void;
    openEdit: (taskId: TaskId) => void;
    openView: (taskId: TaskId) => void;
    closeEditor: () => void;
  };
};
