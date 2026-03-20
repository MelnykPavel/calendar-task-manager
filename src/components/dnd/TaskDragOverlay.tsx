'use client';

import { createPortal } from 'react-dom';
import { DragOverlay } from '@dnd-kit/core';
import { useShallow } from 'zustand/react/shallow';

import TaskCardSurface from '@/src/components/tasks/card/TaskCardSurface';
import { useDndStore } from '@/src/lib/store/dnd.store';

const DROP_ANIMATION = {
  duration: 200,
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
};

export default function TaskDragOverlay() {
  const { activeTask, touchDragging, overlayWidth } = useDndStore(
    useShallow((s) => ({
      activeTask: s.activeTask,
      touchDragging: s.touchDragging,
      overlayWidth: s.overlayWidth,
    })),
  );

  const overlay = (
    <DragOverlay adjustScale={false} dropAnimation={DROP_ANIMATION} zIndex={50}>
      {activeTask && !touchDragging ? (
        <TaskCardSurface
          task={activeTask}
          isOverlay
          style={{
            width: overlayWidth,
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </DragOverlay>
  );

  if (typeof document === 'undefined') return overlay;
  return createPortal(overlay, document.body);
}
