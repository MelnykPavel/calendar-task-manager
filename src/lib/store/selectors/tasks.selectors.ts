import type { Task } from '@/src/types/task';
import type { AppState } from '../types/app.types';
import { bucketKey } from '../utils/bucket';
import { dayTasksCache, weekTasksCache } from './cache/selector-caches';
import { selectSearchQuery } from './ui.selectors';

export type DayTasks = {
  dayKey: string;
  allDay: Task[];
  hours: Task[][];
};

function taskMatches(task: Task, q: string): boolean {
  if (!q) return true;
  return task.title.toLowerCase().includes(q);
}

export function selectDayTasks(dayKey: string) {
  const allDayKey = bucketKey(dayKey, 'allDay');
  const hourKeys = Array.from({ length: 24 }, (_, hour) =>
    bucketKey(dayKey, `hour:${hour}`),
  );

  return (s: AppState): DayTasks => {
    const q = selectSearchQuery(s);
    const sigParts = [q, String(s.bucketRev[allDayKey] ?? 0)];
    for (const key of hourKeys) sigParts.push(String(s.bucketRev[key] ?? 0));
    const sig = sigParts.join('|');

    const cached = dayTasksCache.get(dayKey);
    if (cached && cached.sig === sig) return cached.vm;

    const toTasks = (ids: string[]) =>
      ids
        .map((id) => s.entities[id])
        .filter((task): task is Task => Boolean(task))
        .filter((task) => taskMatches(task, q));

    const allDay = toTasks(s.orderByBucket[allDayKey] ?? []);
    const hours = hourKeys.map((key) => toTasks(s.orderByBucket[key] ?? []));

    const vm: DayTasks = { dayKey, allDay, hours };
    dayTasksCache.set(dayKey, { sig, vm });
    return vm;
  };
}

export function selectWeekTasks(dayKeys: string[]) {
  const key = dayKeys.join(',');
  const daySelectors = dayKeys.map(
    (dayKey) => [dayKey, selectDayTasks(dayKey)] as const,
  );

  return (s: AppState) => {
    const q = selectSearchQuery(s);
    const sigParts: string[] = [q];

    for (const dayKey of dayKeys) {
      sigParts.push(String(s.bucketRev[bucketKey(dayKey, 'allDay')] ?? 0));
      for (let hour = 0; hour < 24; hour += 1) {
        sigParts.push(
          String(s.bucketRev[bucketKey(dayKey, `hour:${hour}`)] ?? 0),
        );
      }
    }

    const sig = sigParts.join('|');
    const cached = weekTasksCache.get(key);
    if (cached && cached.sig === sig) return cached.map;

    const out: Record<string, DayTasks> = {};
    for (const [dayKey, selectDay] of daySelectors) out[dayKey] = selectDay(s);

    weekTasksCache.set(key, { sig, map: out });
    return out;
  };
}
