import type { Over } from '@dnd-kit/core';
import type { DndPending } from '@/src/lib/store/types/dnd.types';
import type { DndSnapshot } from '@/src/lib/store/types/dnd.types';
import { bucketKey } from '@/src/lib/store/utils/bucket';
import type {
  DayDropData,
  HourDropData,
  TaskDragData,
} from '@/src/lib/dnd/ids';

function isDayDropData(data: unknown): data is DayDropData {
  return (
    !!data && typeof data === 'object' && (data as DayDropData).type === 'day'
  );
}

function isHourDropData(data: unknown): data is HourDropData {
  return (
    !!data && typeof data === 'object' && (data as HourDropData).type === 'hour'
  );
}

function isTaskDragData(data: unknown): data is TaskDragData {
  return (
    !!data && typeof data === 'object' && (data as TaskDragData).type === 'task'
  );
}

export type DropTarget = {
  toBucketKey: string;
  toIndex: number;
};

export function resolveDropTarget(
  over: Over,
  snapshot: DndSnapshot | null,
  options?: {
    activeTaskId?: string;
    pending?: DndPending | null;
  },
): DropTarget | null {
  const data = over.data.current;

  if (isDayDropData(data)) {
    return {
      toBucketKey: bucketKey(data.dayKey, 'allDay'),
      toIndex: Number.POSITIVE_INFINITY,
    };
  }

  if (isHourDropData(data)) {
    return {
      toBucketKey: bucketKey(data.dayKey, `hour:${data.hour}`),
      toIndex: Number.POSITIVE_INFINITY,
    };
  }

  if (isTaskDragData(data)) {
    if (options?.activeTaskId && data.taskId === options.activeTaskId) {
      if (options.pending) {
        return {
          toBucketKey: options.pending.toBucketKey,
          toIndex: options.pending.toIndex,
        };
      }
    }

    if (!snapshot) return null;

    const targetBucketKey = snapshot.bucketByTaskId[data.taskId];
    if (!targetBucketKey) return null;

    const ids = snapshot.orderByBucket[targetBucketKey] ?? [];
    const idx = ids.indexOf(data.taskId);

    return {
      toBucketKey: targetBucketKey,
      toIndex: idx === -1 ? Number.POSITIVE_INFINITY : idx,
    };
  }

  return null;
}
