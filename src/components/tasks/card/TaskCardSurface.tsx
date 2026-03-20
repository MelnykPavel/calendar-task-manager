'use client';

import { type DraggableAttributes } from '@dnd-kit/core';
import { css, useTheme } from '@emotion/react';
import { Clock, Sun } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import type { Task } from '@/src/types/task';
import TaskDots from './parts/TaskDots';
import TaskTitle from './parts/TaskTitle';

const styles = {
  root: css({
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    minHeight: 40,
    borderRadius: 'var(--radii-md)',
    border: '1px solid var(--color-task-border)',
    background: 'var(--color-task-bg)',
    userSelect: 'none',
    overflow: 'hidden',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'var(--touch-action)',
    transition:
      'transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, opacity 140ms ease',
    ':focus-visible': {
      outline: '2px solid var(--color-accent-dark)',
      outlineOffset: 2,
    },
  }),
  padding: css({ padding: '8px 10px' }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  }),
  meta: css({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  }),
  timeBadge: css({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-ink-muted)',
    flexShrink: 0,
  }),
  draggingSource: css({
    opacity: 0.18,
    '@media (pointer: coarse)': {
      opacity: 1,
    },
  }),
};

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}

type TaskPreview = Pick<Task, 'title' | 'dots' | 'allDay' | 'timeMinutes'>;
type DragListeners = Record<string, unknown>;

export default function TaskCardSurface({
  task,
  dndDisabled = false,
  isDragging = false,
  isOverlay = false,
  onOpen,
  nodeRef,
  handleRef,
  dragAttributes,
  dragListeners,
  style,
}: {
  task: TaskPreview;
  dndDisabled?: boolean;
  isDragging?: boolean;
  isOverlay?: boolean;
  onOpen?: () => void;
  nodeRef?: (element: HTMLDivElement | null) => void;
  handleRef?: (element: HTMLDivElement | null) => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: DragListeners | undefined;
  style?: React.CSSProperties;
}) {
  const theme = useTheme();

  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      nodeRef?.(element);
      handleRef?.(element);
    },
    [handleRef, nodeRef],
  );

  const themeVars = useMemo(
    () => ({
      ['--radii-md' as string]: theme.radii.md,
      ['--color-task-border' as string]: theme.colors.taskBorder,
      ['--color-task-bg' as string]: theme.colors.taskBg,
      ['--color-accent-dark' as string]: theme.colors.accentDark,
      ['--color-ink-muted' as string]: theme.colors.inkMuted,
      ['--touch-action' as string]:
        dndDisabled || isOverlay ? 'auto' : 'manipulation',
      ['--shadow-md' as string]: theme.shadows.md,
    }),
    [
      dndDisabled,
      isOverlay,
      theme.colors.accentDark,
      theme.colors.taskBg,
      theme.colors.taskBorder,
      theme.colors.inkMuted,
      theme.radii.md,
      theme.shadows.md,
    ],
  );

  return (
    <div
      ref={setRefs}
      {...dragAttributes}
      {...dragListeners}
      style={{
        ...style,
        ...themeVars,
        boxShadow: isDragging || isOverlay ? 'var(--shadow-md)' : 'none',
        cursor: isOverlay ? 'grabbing' : dndDisabled ? 'default' : 'grab',
      }}
      onClick={onOpen}
      data-dnd-disabled={dndDisabled ? 'true' : 'false'}
      css={[
        styles.root,
        styles.padding,
        isDragging && !isOverlay && styles.draggingSource,
      ]}
    >
      <div css={styles.content}>
        <div css={styles.meta}>
          {task.dots.length > 0 && <TaskDots dots={task.dots} />}
          <div
            css={[
              styles.timeBadge,
              task.dots.length === 0 && { marginLeft: 'auto' },
            ]}
          >
            {task.allDay ? (
              <>
                <Sun size={11} />
                All day
              </>
            ) : (
              <>
                <Clock size={11} />
                {formatTime(task.timeMinutes)}
              </>
            )}
          </div>
        </div>
        <TaskTitle text={task.title} />
      </div>
    </div>
  );
}
