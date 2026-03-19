'use client';

import DraggableTask from '@/src/components/dnd/DraggableTask';
import type { Task } from '@/src/types/task';
import TaskCardSurface from './TaskCardSurface';

export default function TaskItemCard({
  task,
  index,
  dndDisabled,
  onOpen,
}: {
  task: Task;
  index: number;
  dndDisabled?: boolean;
  onOpen: () => void;
}) {
  return (
    <DraggableTask
      taskId={task.id}
      bucketKey={`${task.day}|${task.bucket}`}
      index={index}
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
