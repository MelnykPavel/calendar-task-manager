import type { AppState } from '../types/app.types';
import { statusCache } from './cache/selector-caches';
import { selectVisibleYears } from './calendar.selectors';
import type { Task } from '@/src/types/task';

export type Status = {
  active: boolean;
  isBusy: boolean;
  hasError: boolean;
  message: string;
  tasksError: string | null;
  holidaysError: string | null;
  counts: { total: number; matches: number };
  dndDisabled: boolean;
};

export type EditorCreateProps = {
  initialAllDay: boolean | undefined;
  initialTimeMinutes: number | undefined;
};

export function selectSearchQuery(state: AppState): string {
  return state.searchText.trim().toLowerCase();
}

export function selectDndDisabled(state: AppState): boolean {
  return selectSearchQuery(state).length > 0 || state.editor.open;
}

export function selectIsEditorOpenForDay(dayKey: string) {
  return (state: AppState): boolean =>
    state.editor.open &&
    state.editor.dayKey === dayKey &&
    (state.editor.mode === 'create' || state.editor.mode === 'edit');
}

export function selectIsEditorOpenForCell(
  dayKey: string,
  hour: number | undefined,
) {
  const isAllDay = hour === undefined;

  return (state: AppState): boolean => {
    if (!state.editor.open) return false;
    if (state.editor.dayKey !== dayKey) return false;
    if (state.editor.mode === 'view') return false;

    if (state.editor.mode === 'edit') {
      const task = state.entities[state.editor.taskId];
      if (!task) return false;

      if (isAllDay) return task.allDay;

      return !task.allDay && Math.floor(task.timeMinutes / 60) === hour;
    }

    if (isAllDay) {
      return (
        state.editor.initialAllDay === undefined ||
        state.editor.initialAllDay === true
      );
    }

    return (
      state.editor.initialAllDay === false &&
      state.editor.initialTimeMinutes !== undefined &&
      Math.floor(state.editor.initialTimeMinutes / 60) === hour
    );
  };
}

export function selectViewingTaskForDay(dayKey: string) {
  return (state: AppState): Task | null => {
    if (
      !state.editor.open ||
      state.editor.mode !== 'view' ||
      state.editor.dayKey !== dayKey
    ) {
      return null;
    }

    return state.entities[state.editor.taskId] ?? null;
  };
}

export function selectViewingTaskForCell(
  dayKey: string,
  hour: number | undefined,
) {
  const isAllDay = hour === undefined;

  return (state: AppState): Task | null => {
    if (
      !state.editor.open ||
      state.editor.mode !== 'view' ||
      state.editor.dayKey !== dayKey
    ) {
      return null;
    }

    const task = state.entities[state.editor.taskId];
    if (!task) return null;

    if (isAllDay) return task.allDay ? task : null;
    return !task.allDay && Math.floor(task.timeMinutes / 60) === hour
      ? task
      : null;
  };
}

export function selectEditingTaskForDay(dayKey: string) {
  return (state: AppState): Task | null => {
    if (
      !state.editor.open ||
      state.editor.mode !== 'edit' ||
      state.editor.dayKey !== dayKey
    ) {
      return null;
    }

    return state.entities[state.editor.taskId] ?? null;
  };
}

export function selectEditingTaskForCell(
  dayKey: string,
  hour: number | undefined,
) {
  const isAllDay = hour === undefined;

  return (state: AppState): Task | null => {
    if (
      !state.editor.open ||
      state.editor.mode !== 'edit' ||
      state.editor.dayKey !== dayKey
    ) {
      return null;
    }

    const task = state.entities[state.editor.taskId];
    if (!task) return null;

    if (isAllDay) return task.allDay ? task : null;
    return !task.allDay && Math.floor(task.timeMinutes / 60) === hour
      ? task
      : null;
  };
}

const EMPTY_EDITOR_PROPS: EditorCreateProps = {
  initialAllDay: undefined,
  initialTimeMinutes: undefined,
};

type EditorPropsCacheEntry = { sig: string; props: EditorCreateProps };
const editorPropsCache = new Map<string, EditorPropsCacheEntry>();

export function selectEditorCreatePropsForDay(dayKey: string) {
  return (state: AppState): EditorCreateProps => {
    if (
      !state.editor.open ||
      state.editor.mode !== 'create' ||
      state.editor.dayKey !== dayKey
    ) {
      return EMPTY_EDITOR_PROPS;
    }

    const sig = `${String(state.editor.initialAllDay)}|${String(state.editor.initialTimeMinutes)}`;
    const cached = editorPropsCache.get(dayKey);
    if (cached?.sig === sig) return cached.props;

    const props: EditorCreateProps = {
      initialAllDay: state.editor.initialAllDay,
      initialTimeMinutes: state.editor.initialTimeMinutes,
    };
    editorPropsCache.set(dayKey, { sig, props });
    return props;
  };
}

export function selectStatus(state: AppState): Status {
  const q = selectSearchQuery(state);
  const tasksLoading = state.tasksRequest.loading;
  const tasksError = state.tasksRequest.error;
  const countryCode = state.countryCode.toUpperCase();
  const visibleYears = selectVisibleYears(state);

  let holidaysLoading = false;
  let holidaysError: string | null = null;

  for (const year of visibleYears) {
    const key = `${year}-${countryCode}`;
    holidaysLoading ||= Boolean(state.holidaysLoading[key]);
    holidaysError ??= state.holidaysError[key] ?? null;
  }

  const sig = [
    String(state.tasksRev),
    q,
    String(tasksLoading),
    visibleYears.join(','),
    String(holidaysLoading),
    tasksError ?? '',
    holidaysError ?? '',
    String(state.editor.open),
    state.editor.open ? state.editor.dayKey : '',
    state.editor.open ? state.editor.mode : '',
  ].join('|');

  const cached = statusCache.get('status');
  if (cached?.sig === sig) return cached.vm;

  const allTasks = Object.values(state.entities);
  const total = allTasks.length;
  let matches = total;

  if (q) {
    matches = 0;
    for (const task of allTasks) {
      if (task.title.toLowerCase().includes(q)) matches += 1;
    }
  }

  const isBusy = tasksLoading || holidaysLoading;
  const hasError = Boolean(tasksError || holidaysError);
  const searchActive = q.length > 0;
  const dndDisabled = selectDndDisabled(state);

  const parts: string[] = [];
  if (isBusy) parts.push('Syncing...');
  if (searchActive && matches === 0) parts.push('No tasks match your search');
  if (searchActive && matches > 0) parts.push(`Filtering ${matches}/${total}`);
  if (searchActive) parts.push('Drag disabled while filtering');

  const vm: Status = {
    active: isBusy || hasError || searchActive,
    isBusy,
    hasError,
    message: parts.join(' | '),
    tasksError,
    holidaysError,
    counts: { total, matches },
    dndDisabled,
  };

  statusCache.set('status', { sig, vm });
  return vm;
}
