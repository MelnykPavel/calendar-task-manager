'use client';

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback } from 'react';

import { useDndStore } from '@/src/lib/store/dnd.store';
import { useAppStore } from '@/src/lib/store/app.store';
import { resolveDropTarget } from '@/src/lib/store/utils/resolve-drop-target';
import TaskDragOverlay from './TaskDragOverlay';
import {
  getDragPointer,
  isPointInsideBaseDrop,
  isPointInsideExpandedDrop,
  isTaskDragData,
  MOUSE_SENSOR_OPTIONS,
  resolveDropTargetFromPoint,
  TOUCH_SENSOR_OPTIONS,
} from './dnd-provider.helpers';
import { useDndMotionQueues } from '@/src/hooks/useDndMotionQueues';

export default function DndProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewMode = useAppStore((state) => state.viewMode);
  const { flushPreviewNow, queueAutoScroll, queuePreviewMove, resetQueues } =
    useDndMotionQueues();

  const sensors = useSensors(
    useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      resetQueues();
      const data = event.active.data.current;
      if (!isTaskDragData(data)) return;

      const rect =
        event.active.rect.current.initial ??
        event.active.rect.current.translated;
      const width = rect?.width ?? 200;
      const isTouch = event.activatorEvent.type.startsWith('touch');

      useDndStore.getState().dndActions.startDrag(data.taskId, width, isTouch);
    },
    [resetQueues],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!isTaskDragData(active.data.current)) return;

      const pointer = getDragPointer(event);
      const { snapshot } = useDndStore.getState();
      const pending = useDndStore.getState().pending;

      let target = over
        ? resolveDropTarget(over, snapshot, {
            activeTaskId: active.data.current.taskId,
            pending,
          })
        : null;

      const overData = over?.data.current;
      const overTask = Boolean(overData && isTaskDragData(overData));

      const insidePendingOverlay = Boolean(
        pointer &&
        pending &&
        isPointInsideExpandedDrop(pending.toBucketKey, pointer),
      );

      if (insidePendingOverlay && pending) {
        if (!target || target.toBucketKey !== pending.toBucketKey) {
          target = {
            toBucketKey: pending.toBucketKey,
            toIndex: pending.toIndex,
          };
        }
      }

      if (!insidePendingOverlay && target && pointer && overTask) {
        const insideBase = isPointInsideBaseDrop(target.toBucketKey, pointer);
        if (!insideBase) {
          target = resolveDropTargetFromPoint(pointer);
        }
      }

      if (!target && pointer) {
        target = resolveDropTargetFromPoint(pointer);
      }

      if (!target) return;

      if (pointer) {
        queueAutoScroll(target.toBucketKey, pointer.y);
      }

      queuePreviewMove({
        taskId: active.data.current.taskId,
        toBucketKey: target.toBucketKey,
        toIndex: target.toIndex,
      });
    },
    [queueAutoScroll, queuePreviewMove],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      flushPreviewNow();
      resetQueues();
      const dndStore = useDndStore.getState();
      const touchDragging = dndStore.touchDragging;
      const activeData = event.active.data.current;
      const overData = event.over?.data.current;

      if (
        touchDragging &&
        !dndStore.pending &&
        event.over &&
        isTaskDragData(activeData) &&
        isTaskDragData(overData)
      ) {
        const fallbackTarget = resolveDropTarget(
          event.over,
          dndStore.snapshot,
          {
            activeTaskId: activeData.taskId,
            pending: null,
          },
        );

        if (fallbackTarget) {
          dndStore.dndActions.previewMove({
            taskId: activeData.taskId,
            toBucketKey: fallbackTarget.toBucketKey,
            toIndex: fallbackTarget.toIndex,
          });
        }
      }

      const { pending } = useDndStore.getState();
      const shouldCommitOnTouch =
        !event.over && touchDragging && Boolean(pending);

      if (!event.over && !shouldCommitOnTouch) {
        dndStore.dndActions.rollback();
      } else {
        void dndStore.dndActions.commitMove();
      }
    },
    [flushPreviewNow, resetQueues],
  );

  const handleDragCancel = useCallback(() => {
    flushPreviewNow();
    resetQueues();
    useDndStore.getState().dndActions.rollback();
  }, [flushPreviewNow, resetQueues]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <TaskDragOverlay />
    </DndContext>
  );
}
