import { css, useTheme } from '@emotion/react';
import { useMemo } from 'react';

import TaskDayCell from '@/src/components/tasks/cell/TaskDayCell';
import {
  CALENDAR_CELL_HEIGHT,
  DESKTOP_CALENDAR_MIN_WIDTH,
} from '@/src/components/calendar/layout.constants';
import { selectMonth } from '@/src/lib/store/selectors/calendar.selectors';
import { useAppStore } from '@/src/lib/store/app.store';

const styles = {
  wrapper: css({
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'auto',
    background: 'var(--color-paper-light)',
  }),
  inner: css({
    minWidth: DESKTOP_CALENDAR_MIN_WIDTH,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  }),
  weekdayRow: css({
    position: 'sticky',
    top: 0,
    zIndex: 2,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    height: 42,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    borderBottom: 'var(--border-default)',
    background: 'var(--color-paper)',
    color: 'var(--color-ink-muted)',
  }),
  daysGrid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gridAutoRows: `${CALENDAR_CELL_HEIGHT}px`,
    borderLeft: 'var(--border-default)',
    borderTop: 'var(--border-default)',
    background: 'var(--color-paper)',
  }),
  weekdayCell: css({
    padding: '12px 14px',
    borderRight: 'var(--border-default)',
    fontFamily: 'var(--font-mono)',
  }),
  weekdayCellLast: css({
    borderRight: 'none',
  }),
  weekdayCellWeekend: css({
    color: 'var(--color-weekend)',
  }),
};

export default function MonthView() {
  const theme = useTheme();
  const month = useAppStore(selectMonth);

  const themeVars = useMemo(
    () => ({
      ['--color-paper-light' as string]: theme.colors.paperLight,
      ['--color-paper' as string]: theme.colors.paper,
      ['--color-ink-muted' as string]: theme.colors.inkMuted,
      ['--color-weekend' as string]: theme.colors.weekend,
      ['--border-default' as string]: theme.borders.default,
      ['--font-mono' as string]: theme.font.mono,
    }),
    [
      theme.borders.default,
      theme.colors.inkMuted,
      theme.colors.paper,
      theme.colors.paperLight,
      theme.colors.weekend,
      theme.font.mono,
    ],
  );

  return (
    <div css={styles.wrapper} style={themeVars}>
      <div css={styles.inner}>
        <div css={styles.weekdayRow}>
          {month.weekLabels.map((label, index) => (
            <div
              key={label}
              css={[
                styles.weekdayCell,
                label === 'Sat' && styles.weekdayCellWeekend,
                index === month.weekLabels.length - 1 && styles.weekdayCellLast,
              ]}
            >
              {label}
            </div>
          ))}
        </div>

        <div css={styles.daysGrid}>
          {month.days.map((day, index) => {
            const totalRows = Math.ceil(month.days.length / 7);
            const rowIndex = Math.floor(index / 7);
            const isBottomRows = rowIndex >= totalRows - 2;

            return (
              <TaskDayCell
                key={day.dayKey}
                day={day}
                preferOverlayUpward={isBottomRows}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
