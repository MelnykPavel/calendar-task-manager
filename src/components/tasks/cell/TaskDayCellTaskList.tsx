'use client';

import { css } from '@emotion/react';
import { useMemo } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import TaskItemCard from '@/src/components/tasks/card/TaskItemCard';
import { taskDragId } from '@/src/lib/dnd/ids';
import type { Task } from '@/src/types/task';
import { useAppStore } from '@/src/lib/store/app.store';

const styles = {
  root: css({
    flex: '1 1 auto',
    height: '100%',
    minHeight: 0,
    position: 'relative',
    overflowY: 'auto',
    overflowX: 'visible',
    paddingRight: 2,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '::-webkit-scrollbar': { width: 0, height: 0 },
  }),
  inner: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minHeight: '100%',
    paddingBottom: 10,
  }),
};

export default function TaskDayCellTaskList({
  tasks,
  dndDisabled: dndDisabledProp,
}: {
  tasks: Task[];
  dndDisabled?: boolean;
}) {
  const dndDisabled = Boolean(dndDisabledProp);
  const openView = useAppStore((state) => state.uiActions.openView);

  const sortableIds = useMemo(
    () => tasks.map((task) => taskDragId(task.id)),
    [tasks],
  );

  return (
    <div css={styles.root} data-task-scrollable="true">
      <div css={styles.inner}>
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task, index) => (
            <TaskItemCard
              key={task.id}
              task={task}
              dndDisabled={dndDisabled}
              onOpen={() => openView(task.id)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
