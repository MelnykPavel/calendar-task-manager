import type { Task, UpdateTaskBody } from '@/src/types/task';
import type { DayKey, TaskId } from './common';

export type TasksSlice = {
  entities: Record<TaskId, Task>;
  orderByBucket: Record<string, TaskId[]>;
  bucketByTaskId: Record<TaskId, string>;
  bucketRev: Record<string, number>;
  tasksRev: number;

  hydratedRange: { from: DayKey; to: DayKey } | null;
  tasksRequest: { loading: boolean; error: string | null; inflightId: number };

  taskActions: {
    hydrateRange: (input: {
      from: DayKey;
      to: DayKey;
      signal?: AbortSignal;
    }) => Promise<void>;
    create: (input: {
      day: DayKey;
      title: string;
      dots?: string[];
      allDay: boolean;
      timeMinutes: number;
    }) => Promise<Task>;
    update: (id: TaskId, patch: UpdateTaskBody) => Promise<Task>;
    remove: (id: TaskId) => Promise<void>;
    _applyMove: (
      moved: Task,
      fromBucketKey: string,
      toBucketKey: string,
      toIndex: number,
    ) => void;
  };
};
