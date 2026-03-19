import {
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type DragOverEvent,
} from '@dnd-kit/core';

import { dayDropId, hourDropId, type TaskDragData } from '@/src/lib/dnd/ids';
import {
  bucketKey,
  hourFromBucket,
  parseBucketKey,
} from '@/src/lib/store/utils/bucket';

type DndSnapshot = {
  orderByBucket: Record<string, string[] | undefined>;
};

export const MOUSE_SENSOR_OPTIONS = { activationConstraint: { distance: 5 } };
export const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 160, tolerance: 8 },
};

export function isTaskDragData(data: unknown): data is TaskDragData {
  return (
    !!data && typeof data === 'object' && (data as TaskDragData).type === 'task'
  );
}

export function toDropIdFromBucketKey(inputBucketKey: string) {
  const parsed = parseBucketKey(inputBucketKey);
  if (parsed.bucket === 'allDay') return dayDropId(parsed.day);

  const hour = hourFromBucket(parsed.bucket);
  return hour === null ? dayDropId(parsed.day) : hourDropId(parsed.day, hour);
}

export function autoScrollTarget(dropId: string, pointerY: number) {
  if (typeof document === 'undefined') return;

  const dropNode = document.querySelector<HTMLElement>(
    `[data-drop-id="${dropId}"]`,
  );
  if (!dropNode) return;

  const scrollable = dropNode.querySelector<HTMLElement>(
    '[data-task-scrollable]',
  );
  if (!scrollable) return;

  const rect = scrollable.getBoundingClientRect();
  const threshold = 44;
  const maxStep = 26;

  if (pointerY < rect.top + threshold) {
    const intensity = Math.min(
      1,
      (rect.top + threshold - pointerY) / threshold,
    );
    scrollable.scrollTop -= Math.ceil(maxStep * intensity);
    return;
  }

  if (pointerY > rect.bottom - threshold) {
    const intensity = Math.min(
      1,
      (pointerY - (rect.bottom - threshold)) / threshold,
    );
    scrollable.scrollTop += Math.ceil(maxStep * intensity);
  }
}

export function getDragPointer(event: DragOverEvent) {
  const translatedRect =
    event.active.rect.current.translated ?? event.active.rect.current.initial;
  if (!translatedRect) return null;

  return {
    x: translatedRect.left + translatedRect.width / 2,
    y: translatedRect.top + translatedRect.height / 2,
  };
}

function isPointInsideRect(point: { x: number; y: number }, rect: DOMRect) {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function isPointInsideBaseDrop(
  bucket: string,
  point: { x: number; y: number },
) {
  if (typeof document === 'undefined') return false;

  const dropId = toDropIdFromBucketKey(bucket);
  const baseNode = document.querySelector<HTMLElement>(
    `[data-drop-base-id="${dropId}"]`,
  );
  if (!baseNode) return false;

  return isPointInsideRect(point, baseNode.getBoundingClientRect());
}

export function isPointInsideExpandedDrop(
  bucket: string,
  point: { x: number; y: number },
) {
  if (typeof document === 'undefined') return false;

  const dropId = toDropIdFromBucketKey(bucket);
  const expandedNode = document.querySelector<HTMLElement>(
    `[data-drop-id="${dropId}"]`,
  );
  if (!expandedNode) return false;

  return isPointInsideRect(point, expandedNode.getBoundingClientRect());
}

function dropIdToTarget(dropId: string) {
  if (dropId.startsWith('day:')) {
    const dayKey = dropId.slice(4);
    if (!dayKey) return null;
    return {
      toBucketKey: bucketKey(dayKey, 'allDay'),
      toIndex: Number.POSITIVE_INFINITY,
    };
  }

  const match = /^hour:(\d{4}-\d{2}-\d{2}):(\d|1\d|2[0-3])$/.exec(dropId);
  if (!match) return null;

  const dayKey = match[1];
  const hour = Number(match[2]);
  return {
    toBucketKey: bucketKey(dayKey, `hour:${hour}`),
    toIndex: Number.POSITIVE_INFINITY,
  };
}

export function resolveDropTargetFromPoint(point: { x: number; y: number }) {
  if (typeof document === 'undefined') return null;

  const elements = document.elementsFromPoint(point.x, point.y);
  for (const element of elements) {
    if (!(element instanceof HTMLElement)) continue;

    const baseNode = element.closest<HTMLElement>('[data-drop-base-id]');
    const dropId = baseNode?.dataset.dropBaseId;
    if (!dropId) continue;

    const target = dropIdToTarget(dropId);
    if (target) return target;
  }

  return null;
}

export const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : rectIntersection(args);
};
