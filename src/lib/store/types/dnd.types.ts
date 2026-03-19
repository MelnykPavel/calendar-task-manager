import type { Task } from '@/src/types/task';
import type { TaskId, DayKey, Bucket } from './common';

// Снимок AppStore в момент начала drag-сессии.
// Содержит только то, что нужно для:
//  - вычисления beforeId/afterId (orderByBucket, bucketByTaskId)
//  - применения overlay в useDayTasks (entities)
// bucketRev/tasksRev не нужны — AppStore не мутируем во время drag,
// откатывать нечего.
export type DndSnapshot = {
  entities: Record<TaskId, Task>;
  orderByBucket: Record<string, TaskId[]>;
  bucketByTaskId: Record<TaskId, string>;
};

export type DndPending = {
  taskId: TaskId;
  // Откуда (из snapshot) — нужен для applyDndOverlay
  fromBucketKey: string;
  // Куда
  toBucketKey: string;
  toIndex: number;
  // Для API (вычисляется один раз в previewMove)
  toDay: DayKey;
  toBucket: Bucket;
  beforeId: TaskId | null;
  afterId: TaskId | null;
};
