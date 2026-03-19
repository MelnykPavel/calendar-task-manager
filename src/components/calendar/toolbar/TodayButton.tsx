'use client';

import { css, useTheme } from '@emotion/react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { selectIsCurrentPeriod } from '@/src/lib/store/selectors/calendar.selectors';
import { useAppStore } from '@/src/lib/store/app.store';

const styles = {
  todayButton: css({
    height: 32,
    padding: '0 12px',
    borderRadius: '999px',
    border: 'var(--border-default)',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--color-ink)',
    background: 'var(--color-paper-dark)',
    transition: 'transform 140ms ease, opacity 140ms ease',
  }),
  todayButtonActive: css({
    cursor: 'pointer',
    opacity: 1,
    ':hover': {
      transform: 'translateY(-1px)',
    },
  }),
  todayButtonDisabled: css({
    cursor: 'default',
    opacity: 0.55,
  }),
};

export default function TodayButton() {
  const theme = useTheme();
  const isCurrentPeriod = useAppStore(selectIsCurrentPeriod);
  const { goToToday, viewMode } = useAppStore(
    useShallow((state) => ({
      goToToday: state.calendarActions.goToToday,
      viewMode: state.viewMode,
    })),
  );

  const themeVars = useMemo(
    () => ({
      ['--border-default' as string]: theme.borders.default,
      ['--color-ink' as string]: theme.colors.ink,
      ['--color-paper-dark' as string]: theme.colors.paperDark,
    }),
    [theme.borders.default, theme.colors.ink, theme.colors.paperDark],
  );

  return (
    <button
      type="button"
      onClick={goToToday}
      disabled={isCurrentPeriod}
      css={[
        styles.todayButton,
        isCurrentPeriod ? styles.todayButtonDisabled : styles.todayButtonActive,
      ]}
      style={themeVars}
      aria-label={
        viewMode === 'week' ? 'Go to current week' : 'Go to current month'
      }
    >
      Today
    </button>
  );
}
