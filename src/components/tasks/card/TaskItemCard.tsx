'use client';

import DraggableTask from '@/src/components/dnd/DraggableTask';
import type { Task } from '@/src/types/task';
import TaskCardSurface from './TaskCardSurface';

export default function TaskItemCard({
  task,
  dndDisabled,
  onOpen,
}: {
  task: Task;
  dndDisabled?: boolean;
  onOpen: () => void;
}) {
  return (
    <DraggableTask
      taskId={task.id}
      bucketKey={`${task.day}|${task.bucket}`}
      disabled={dndDisabled}
    >
      {({ isDragging, ref, handleRef, listeners, attributes, style }) => (
        <TaskCardSurface
          task={task}
          dndDisabled={Boolean(dndDisabled)}
          isDragging={isDragging}
          onOpen={onOpen}
          nodeRef={ref}
          handleRef={handleRef}
          dragAttributes={attributes}
          dragListeners={listeners}
          style={style}
        />
      )}
    </DraggableTask>
  );
}
