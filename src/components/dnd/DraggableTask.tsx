'use client';

import { useCallback, useMemo } from 'react';
import { type DraggableAttributes } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { taskDragId, type TaskDragData } from '@/src/lib/dnd/ids';

type DragListeners = ReturnType<typeof useSortable>['listeners'];

export default function DraggableTask({
  taskId,
  bucketKey,
  disabled,
  children,
}: {
  taskId: string;
  bucketKey: string;
  index: number;
  disabled?: boolean;
  children: (ctx: {
    isDragging: boolean;
    ref: (el: HTMLElement | null) => void;
    handleRef: (el: HTMLElement | null) => void;
    listeners: DragListeners;
    attributes: DraggableAttributes;
    style: React.CSSProperties;
  }) => React.ReactNode;
}) {
  const data = useMemo<TaskDragData>(
    () => ({ type: 'task', taskId, bucketKey }),
    [bucketKey, taskId],
  );

  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: taskDragId(taskId),
    data,
    disabled: Boolean(disabled),
  });

  const style = useMemo<React.CSSProperties>(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition: transition ?? 'transform 200ms ease',
    }),
    [transform, transition],
  );

  const bindRef = useCallback(
    (element: HTMLElement | null) => setNodeRef(element),
    [setNodeRef],
  );
  const bindHandleRef = useCallback(
    (element: HTMLElement | null) => setActivatorNodeRef(element),
    [setActivatorNodeRef],
  );

  return children({
    isDragging,
    ref: bindRef,
    handleRef: bindHandleRef,
    listeners,
    attributes,
    style,
  });
}
