import type { StateCreator } from 'zustand';
import type { CalendarSlice } from './calendar.types';
import type { UiSlice } from './ui.types';
import type { TasksSlice } from './tasks.types';
import type { HolidaysSlice } from './holidays.types';

export type AppState = CalendarSlice & UiSlice & TasksSlice & HolidaysSlice;

export type Slice<T> = StateCreator<AppState, [], [], T>;
