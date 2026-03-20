import type { Task } from '@/src/types/task';
import type { DayTasks } from '@/src/lib/store/selectors/tasks.selectors';
import type { DndPending, DndSnapshot } from '@/src/lib/store/types/dnd.types';
import {
  parseBucketKey,
  hourFromBucket,
  normalizeTimeForBucket,
} from '@/src/lib/store/utils/bucket';
import { insertIntoArray } from '@/src/lib/store/utils/task-order';
import type { Bucket } from '@/src/lib/store/types/common';

function removeTaskById(arr: Task[], taskId: string): Task[] {
  const idx = arr.findIndex((task) => task.id === taskId);
  if (idx === -1) return arr;

  const next = [...arr];
  next.splice(idx, 1);
  return next;
}

export function applyDndOverlay(
  base: DayTasks,
  pending: DndPending | null,
  snapshot: DndSnapshot | null,
): DayTasks {
  if (!pending || !snapshot) return base;

  const { taskId, fromBucketKey, toBucketKey, toIndex } = pending;
  const { day: fromDay, bucket: fromBucket } = parseBucketKey(fromBucketKey);
  const { day: toDay, bucket: toBucket } = parseBucketKey(toBucketKey);

  const { dayKey } = base;
  const affectsFrom = fromDay === dayKey;
  const affectsTo = toDay === dayKey;

  if (!affectsFrom && !affectsTo) return base;

  const originalTask = snapshot.entities[taskId];
  if (!originalTask) return base;

  const normalized = normalizeTimeForBucket(
    originalTask,
    toBucket as Bucket,
    originalTask.timeMinutes,
  );
  const overlayTask: Task = { ...originalTask, day: toDay, ...normalized };

  let allDay = base.allDay;
  let hours = base.hours;

  if (affectsFrom) {
    if (fromBucket === 'allDay') {
      allDay = removeTaskById(allDay, taskId);
    } else {
      const h = hourFromBucket(fromBucket as Bucket);
      if (h !== null) {
        hours = [...hours];
        hours[h] = removeTaskById(hours[h] ?? [], taskId);
      }
    }
  }

  if (affectsTo) {
    if (toBucket === 'allDay') {
      const targetList = removeTaskById(allDay, taskId);
      const clamped = Math.min(toIndex, targetList.length);
      allDay = insertIntoArray(targetList, overlayTask, clamped);
    } else {
      const h = hourFromBucket(toBucket as Bucket);
      if (h !== null) {
        if (hours === base.hours) hours = [...hours];
        const targetList = removeTaskById(hours[h] ?? [], taskId);
        const clamped = Math.min(toIndex, targetList.length);
        hours[h] = insertIntoArray(targetList, overlayTask, clamped);
      }
    }
  }

  if (allDay === base.allDay && hours === base.hours) return base;
  return { ...base, allDay, hours };
}
