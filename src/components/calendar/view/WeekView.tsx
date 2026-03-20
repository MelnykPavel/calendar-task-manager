'use client';

import { useTheme } from '@emotion/react';
import { Fragment } from 'react';

import TaskHourCell from '@/src/components/tasks/cell/TaskHourCell';
import { selectWeek } from '@/src/lib/store/selectors/calendar.selectors';
import { useAppStore } from '@/src/lib/store/app.store';
import {
  useWeekThemeStyles,
  weekHours,
  weekViewStyles as styles,
} from '@/src/components/calendar/view/week-view.styles';

export default function WeekView() {
  const theme = useTheme();
  const week = useAppStore(selectWeek);
  const themed = useWeekThemeStyles(theme);
  const lastColumnIndex = week.days.length - 1;

  return (
    <div css={[styles.wrapper, themed.wrapper]}>
      <div css={[styles.grid, themed.grid]}>
        <div css={[styles.headerCorner, themed.headerCorner]} />
        {week.days.map((day, index) => (
          <div
            key={`col-${index}-header`}
            css={[
              styles.dayHeader,
              themed.dayHeader,
              day.isToday && styles.dayHeaderToday,
            ]}
            style={{
              ['--cell-border-right' as string]:
                index === lastColumnIndex ? 'none' : theme.borders.default,
            }}
          >
            <div
              css={[
                styles.dayLabel,
                themed.dayLabel,
                day.isToday && styles.dayLabelToday,
              ]}
              style={{
                ['--day-label-color' as string]:
                  week.weekLabels[index] === 'Sat'
                    ? theme.colors.weekend
                    : theme.colors.inkMuted,
              }}
            >
              {week.weekLabels[index]}
            </div>
            <div css={[styles.dayDateWrap, day.isToday && styles.dayDateToday]}>
              <div css={[styles.dayDate, themed.dayDate]}>{day.dateNumber}</div>
            </div>
          </div>
        ))}

        <div css={[styles.allDayCornerCell, themed.allDayCornerCell]}>
          all-day
        </div>
        {week.days.map((day, index) => (
          <TaskHourCell
            key={`col-${index}-allDay`}
            day={day}
            isLastColumn={index === lastColumnIndex}
          />
        ))}

        {weekHours.map((label, rowIndex) => (
          <Fragment key={`row-${rowIndex}`}>
            <div css={[styles.hourLabel, themed.hourLabel]}>{label}</div>
            {week.days.map((day, index) => (
              <TaskHourCell
                key={`col-${index}-row-${rowIndex}`}
                day={day}
                hour={rowIndex}
                isLastColumn={index === lastColumnIndex}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
