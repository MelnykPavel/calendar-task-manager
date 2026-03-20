'use client';

import { formatDate } from '@/src/lib/date/utils';
import { css, useTheme } from '@emotion/react';

import { Plus } from 'lucide-react';
import { useMemo } from 'react';

const styles = {
  header: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexShrink: 0,
  }),
  headerLeft: css({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  }),
  dateLabel: css({
    height: 26,
    minWidth: 26,
    padding: '0 6px',
    borderRadius: 13,
    display: 'grid',
    placeItems: 'center',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.02em',
    border: 'none',
    cursor: 'default',
    fontFamily: 'var(--date-label-font)',
    background: 'var(--date-label-bg)',
    color: 'var(--date-label-color)',
    opacity: 'var(--date-label-opacity)',
  }),
  addButton: css({
    height: 22,
    width: 22,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    opacity: 0,
    transition: 'opacity 150ms ease',
    flexShrink: 0,
    borderRadius: 'var(--add-btn-radius)',
    outline: 'var(--add-btn-border)',
  }),
};

export default function TaskDayCellHeader({
  dateNumber,
  dayKey,
  inMonth,
  isWeekend,
  onAddTask,
  mode,
}: {
  dateNumber: number;
  dayKey: string;
  inMonth?: boolean;
  isWeekend?: boolean;
  mode: 'month' | 'week';
  onAddTask: () => void;
}) {
  const theme = useTheme();

  // Вычисляем при каждом рендере — корректно работает через полночь
  const isToday = dayKey === formatDate(new Date(), 'YYYY-MM-DD');

  const dateColor = inMonth
    ? isWeekend
      ? theme.colors.weekend
      : theme.colors.inkLight
    : theme.colors.inkMuted;

  const themeVars = useMemo(
    () => ({
      ['--add-btn-radius' as string]: theme.radii.md,
      ['--add-btn-border' as string]: theme.borders.default,
      ['--date-label-font' as string]: theme.font.mono,
    }),
    [theme],
  );

  const dateLabelVars = useMemo(
    () => ({
      ['--date-label-bg' as string]: isToday
        ? theme.colors.accent
        : 'transparent',
      ['--date-label-color' as string]: isToday ? '#ffffff' : dateColor,
      ['--date-label-opacity' as string]: inMonth ? '1' : '0.35',
    }),
    [isToday, dateColor, inMonth, theme.colors.accent],
  );

  return (
    <div css={styles.header} style={themeVars}>
      <div css={styles.headerLeft}>
        {mode === 'month' && (
          <div css={styles.dateLabel} style={dateLabelVars}>
            {dateNumber}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onAddTask}
        css={styles.addButton}
        aria-label="Add task"
        className="ctm-add"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
