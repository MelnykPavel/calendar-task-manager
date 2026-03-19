import { createLRUMap } from './lru-map';
import type { Month, Week } from '../calendar.selectors';
import type { DayTasks } from '../tasks.selectors';
import type { Status } from '../ui.selectors';

export const monthCache = createLRUMap<string, { monthKey: string; weekStartsOn: string; vm: Month }>(12);

export const weekCache = createLRUMap<string, { weekAnchor: string; weekStartsOn: string; vm: Week }>(52);

export const dayTasksCache = createLRUMap<string, { sig: string; vm: DayTasks }>(60);

export const weekTasksCache = createLRUMap<string, { sig: string; map: Record<string, DayTasks> }>(12);

export const holidayTextCache = createLRUMap<string, { rev: number; texts: string[] }>(200);

export const holidaysForDaysCache = createLRUMap<string, { sig: string; map: Record<string, string[]> }>(50);

export const statusCache = createLRUMap<string, { sig: string; vm: Status }>(1);
