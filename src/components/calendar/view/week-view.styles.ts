import { css, useTheme } from '@emotion/react';
import { useMemo } from 'react';

import {
  CALENDAR_ALL_DAY_HEIGHT,
  CALENDAR_CELL_HEIGHT,
  CALENDAR_WEEK_HEADER_HEIGHT,
  CALENDAR_WEEK_TIME_COLUMN_WIDTH,
  DESKTOP_CALENDAR_MIN_WIDTH,
} from '@/src/components/calendar/layout.constants';

export const weekHours = Array.from(
  { length: 24 },
  (_, index) => `${String(index).padStart(2, '0')}:00`,
);

export const weekViewStyles = {
  wrapper: css({
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'auto',
    background: 'var(--color-paper-light)',
  }),
  grid: css({
    minWidth: DESKTOP_CALENDAR_MIN_WIDTH,
    display: 'grid',
    gridTemplateColumns: `${CALENDAR_WEEK_TIME_COLUMN_WIDTH}px repeat(7, minmax(0, 1fr))`,
    gridTemplateRows: `${CALENDAR_WEEK_HEADER_HEIGHT}px ${CALENDAR_ALL_DAY_HEIGHT}px repeat(24, ${CALENDAR_CELL_HEIGHT}px)`,
  }),
  headerCorner: css({
    position: 'sticky',
    top: 0,
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  dayHeader: css({
    position: 'sticky',
    top: 0,
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRight: 'var(--cell-border-right)',
  }),
  dayHeaderToday: css({
    background:
      'linear-gradient(180deg, var(--today-header-bg), var(--today-header-bg-soft))',
  }),
  dayLabel: css({
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--day-label-color)',
  }),
  dayLabelToday: css({
    color: 'var(--today-label-color)',
  }),
  dayDateWrap: css({
    minWidth: 40,
    height: 40,
    padding: '0 10px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
  }),
  dayDate: css({
    fontSize: 24,
    fontWeight: 700,
  }),
  dayDateToday: css({
    background: 'var(--today-pill-bg)',
    color: '#ffffff',
    boxShadow: '0 10px 24px var(--today-pill-shadow)',
  }),
  allDayCornerCell: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '10px 8px 0',
    fontSize: 10,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  }),
  hourLabel: css({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: '8px 8px 0',
    fontSize: 10,
  }),
};

export function useWeekThemeStyles(theme: ReturnType<typeof useTheme>) {
  return useMemo(
    () => ({
      wrapper: css({
        background: theme.colors.paperLight,
      }),
      grid: css({
        borderLeft: theme.borders.default,
        borderTop: theme.borders.default,
      }),
      headerCorner: css({
        borderRight: theme.borders.default,
        borderBottom: theme.borders.default,
        background: theme.colors.paper,
      }),
      dayHeader: css({
        borderBottom: theme.borders.default,
        background: theme.colors.paper,
        ['--today-header-bg' as string]: theme.colors.accentLight,
        ['--today-header-bg-soft' as string]: theme.colors.paper,
      }),
      dayLabel: css({
        fontFamily: theme.font.mono,
        ['--today-label-color' as string]: theme.colors.accentDarker,
      }),
      dayDate: css({
        color: theme.colors.ink,
        fontFamily: theme.font.display,
        ['--today-pill-bg' as string]: theme.colors.accent,
        ['--today-pill-shadow' as string]: theme.colors.accentDark,
      }),
      allDayCornerCell: css({
        borderRight: theme.borders.default,
        borderBottom: theme.borders.default,
        background: theme.colors.paperLight,
        color: theme.colors.inkMuted,
        fontFamily: theme.font.mono,
      }),
      hourLabel: css({
        borderRight: theme.borders.default,
        borderBottom: theme.borders.default,
        background: theme.colors.paperLight,
        color: theme.colors.inkMuted,
        fontFamily: theme.font.mono,
      }),
    }),
    [theme],
  );
}
