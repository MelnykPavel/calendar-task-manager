'use client';

import { css, useTheme } from '@emotion/react';
import { useDroppable } from '@dnd-kit/core';
import { dayDropId, type DayDropData } from '@/src/lib/dnd/ids';
import { useMemo } from 'react';
import { useDndStore } from '@/src/lib/store/dnd.store';
import { bucketKey } from '@/src/lib/store/utils/bucket';

const styles = {
  root: css({
    position: 'relative',
    height: '100%',
    overflow: 'visible',
  }),
  content: css({
    position: 'relative',
    height: '100%',
    minHeight: '100%',
    transition: 'box-shadow 120ms ease, background-color 120ms ease',
  }),
  contentActive: css({
    boxShadow: 'var(--droppable-shadow-active)',
    background: 'var(--droppable-bg-active)',
  }),
  contentExpanded: css({
    position: 'absolute',
    inset: '0 0 auto 0',
    zIndex: 24,
    boxShadow: 'var(--droppable-shadow)',
  }),
  contentExpandedUpward: css({
    inset: 'auto 0 0 0',
  }),
};

export default function DroppableDay({
  dayKey,
  children,
  className,
  style,
  expandedHeight,
  expandUpward = false,
}: {
  dayKey: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  expandedHeight?: number;
  expandUpward?: boolean;
}) {
  const data = useMemo<DayDropData>(() => ({ type: 'day', dayKey }), [dayKey]);
  const targetBucketKey = useMemo(() => bucketKey(dayKey, 'allDay'), [dayKey]);

  const { setNodeRef, isOver } = useDroppable({
    id: dayDropId(dayKey),
    data,
  });

  const isDropTarget = useDndStore(
    (state) =>
      Boolean(state.activeTask) &&
      state.pending?.toBucketKey === targetBucketKey,
  );

  const theme = useTheme();
  const isExpanded = isDropTarget && Boolean(expandedHeight);
  const isHighlighted = isOver || isDropTarget;

  return (
    <div
      ref={setNodeRef}
      data-drop-base-id={dayDropId(dayKey)}
      className={className}
      css={styles.root}
      style={{
        ...style,
        ['--droppable-shadow' as string]: theme.shadows.md,
        ['--droppable-shadow-active' as string]: `0 0 0 1px ${theme.colors.accentDark}, ${theme.shadows.md}`,
        ['--droppable-bg-active' as string]: theme.colors.accentLight,
      }}
    >
      <div
        data-drop-id={dayDropId(dayKey)}
        css={[
          styles.content,
          isHighlighted && styles.contentActive,
          isExpanded && styles.contentExpanded,
          isExpanded && expandUpward && styles.contentExpandedUpward,
        ]}
        style={{
          height: isExpanded && expandedHeight ? expandedHeight : '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
