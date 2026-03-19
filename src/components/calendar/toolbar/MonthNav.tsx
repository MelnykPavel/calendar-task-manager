'use client';

import { css, useTheme } from '@emotion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { selectVisibleLabel } from '@/src/lib/store/selectors/calendar.selectors';
import { useAppStore } from '@/src/lib/store/app.store';

const styles = {
  monthNav: css({
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '32px minmax(148px, auto) 32px',
    alignItems: 'center',
    gap: 6,
    '@media (max-width: 768px)': {
      gridTemplateColumns: '32px minmax(0, 1fr) 32px',
      flex: '1 1 auto',
    },
  }),
  monthButton: css({
    height: 32,
    width: 32,
    borderRadius: '999px',
    border: 'var(--border-default)',
    background: 'var(--color-paper-dark)',
    color: 'var(--color-ink)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    transition: 'transform 140ms ease, background 140ms ease',
    ':hover': {
      transform: 'translateY(-1px)',
      background: 'var(--color-paper)',
    },
  }),
  monthLabel: css({
    minWidth: 0,
    textAlign: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 17,
    letterSpacing: '-0.02em',
    color: 'var(--color-ink)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
};

export default function MonthNav() {
  const theme = useTheme();
  const label = useAppStore(selectVisibleLabel);
  const { nextMonth, nextWeek, prevMonth, prevWeek, viewMode } = useAppStore(
    useShallow((state) => ({
      nextMonth: state.calendarActions.nextMonth,
      nextWeek: state.calendarActions.nextWeek,
      prevMonth: state.calendarActions.prevMonth,
      prevWeek: state.calendarActions.prevWeek,
      viewMode: state.viewMode,
    })),
  );

  const handlePrev = viewMode === 'week' ? prevWeek : prevMonth;
  const handleNext = viewMode === 'week' ? nextWeek : nextMonth;

  const themeVars = useMemo(
    () => ({
      ['--border-default' as string]: theme.borders.default,
      ['--color-paper' as string]: theme.colors.paper,
      ['--color-paper-dark' as string]: theme.colors.paperDark,
      ['--font-display' as string]: theme.font.display,
      ['--color-ink' as string]: theme.colors.ink,
    }),
    [
      theme.borders.default,
      theme.colors.ink,
      theme.colors.paper,
      theme.colors.paperDark,
      theme.font.display,
    ],
  );

  return (
    <div css={styles.monthNav} style={themeVars}>
      <button
        type="button"
        onClick={handlePrev}
        css={styles.monthButton}
        aria-label={viewMode === 'week' ? 'Previous week' : 'Previous month'}
      >
        <ChevronLeft size={16} />
      </button>
      <div css={styles.monthLabel}>{label}</div>
      <button
        type="button"
        onClick={handleNext}
        css={styles.monthButton}
        aria-label={viewMode === 'week' ? 'Next week' : 'Next month'}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
