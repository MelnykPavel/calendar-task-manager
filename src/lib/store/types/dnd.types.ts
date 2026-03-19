import type { Task } from '@/src/types/task';
import type { TaskId, DayKey, Bucket } from './common';

export type DndSnapshot = {
  entities: Record<TaskId, Task>;
  orderByBucket: Record<string, TaskId[]>;
  bucketByTaskId: Record<TaskId, string>;
};

export type DndPending = {
  taskId: TaskId;
  fromBucketKey: string;
  toBucketKey: string;
  toIndex: number;
  toDay: DayKey;
  toBucket: Bucket;
  beforeId: TaskId | null;
  afterId: TaskId | null;
};
