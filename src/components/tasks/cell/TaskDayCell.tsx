'use client';

import { css, useTheme } from '@emotion/react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import DroppableDay from '@/src/components/dnd/DroppableDay';
import TaskDayCellHeader from '@/src/components/tasks/cell/TaskDayCellHeader';
import HolidaysList from '@/src/components/holidays/HolidaysList';
import TaskDayCellTaskList from '@/src/components/tasks/cell/TaskDayCellTaskList';
import TaskEditorPanel from '@/src/components/tasks/editor/TaskEditorPanel';

import type { MonthDay } from '@/src/lib/store/selectors/calendar.selectors';
import {
  selectDndDisabled,
  selectEditingTaskForDay,
  selectEditorCreatePropsForDay,
  selectIsEditorOpenForDay,
  selectViewingTaskForDay,
} from '@/src/lib/store/selectors/ui.selectors';
import { selectHolidayTextsForDay } from '@/src/lib/store/selectors/holidays.selectors';
import { useAppStore } from '@/src/lib/store/app.store';
import {
  CALENDAR_CELL_HEIGHT,
  CELL_HEADER_VISUAL_HEIGHT,
  HOLIDAY_LINE_VISUAL_HEIGHT,
  TASK_CARD_VISUAL_HEIGHT,
} from '@/src/components/calendar/layout.constants';
import { useDayTasks } from '@/src/hooks/useDayTasks';

const styles = {
  cell: css({
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'visible',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minHeight: 0,
    position: 'relative',
    ':hover .ctm-add': { opacity: 1 },
  }),
  cellBgInMonth: css({ background: 'var(--cell-bg)' }),
  cellBgMuted: css({ background: 'var(--cell-muted-bg)' }),
  editorOverlay: css({
    position: 'absolute',
    left: 8,
    top: 44,
    zIndex: 12,
    width: 'min(340px, calc(100vw - 32px))',
    maxHeight: 'min(420px, calc(100dvh - 160px))',
    overflow: 'visible',
  }),
  editorOverlayUpward: css({
    top: 'auto',
    bottom: 8,
  }),
};

export default function TaskDayCell({
  day,
  style,
  preferOverlayUpward = false,
}: {
  day: MonthDay;
  style?: React.CSSProperties;
  preferOverlayUpward?: boolean;
}) {
  const theme = useTheme();
  const { closeEditor, createTask, dndDisabled, openCreate } = useAppStore(
    useShallow((state) => ({
      closeEditor: state.uiActions.closeEditor,
      createTask: state.taskActions.create,
      dndDisabled: selectDndDisabled(state),
      openCreate: state.uiActions.openCreate,
    })),
  );

  const selectIsEditorOpen = useMemo(
    () => selectIsEditorOpenForDay(day.dayKey),
    [day.dayKey],
  );
  const selectEditorCreateProps = useMemo(
    () => selectEditorCreatePropsForDay(day.dayKey),
    [day.dayKey],
  );
  const selectHolidayTexts = useMemo(
    () => selectHolidayTextsForDay(day.dayKey),
    [day.dayKey],
  );
  const selectEditingTask = useMemo(
    () => selectEditingTaskForDay(day.dayKey),
    [day.dayKey],
  );
  const selectViewingTask = useMemo(
    () => selectViewingTaskForDay(day.dayKey),
    [day.dayKey],
  );

  const isEditorOpen = useAppStore(selectIsEditorOpen);
  const editorCreateProps = useAppStore(selectEditorCreateProps);
  const holidayTexts = useAppStore(selectHolidayTexts);
  const dayTasks = useDayTasks(day.dayKey);
  const editingTask = useAppStore(selectEditingTask);
  const viewingTask = useAppStore(selectViewingTask);
  const tasks = useMemo(() => [dayTasks.allDay, ...dayTasks.hours].flat(), [dayTasks]);

  const visibleTasks = useMemo(
    () =>
      editingTask ? tasks.filter((task) => task.id !== editingTask.id) : tasks,
    [editingTask, tasks],
  );

  const themeVars = useMemo(
    () => ({
      ['--cell-bg' as string]: theme.colors.cellBg,
      ['--cell-muted-bg' as string]: theme.colors.cellMutedBg,
      ['--cell-border' as string]: theme.borders.default,
    }),
    [theme.borders.default, theme.colors.cellBg, theme.colors.cellMutedBg],
  );
  const expandedHeight = useMemo(
    () =>
      Math.max(
        CALENDAR_CELL_HEIGHT,
        CELL_HEADER_VISUAL_HEIGHT +
          24 +
          holidayTexts.length * HOLIDAY_LINE_VISUAL_HEIGHT +
          visibleTasks.length * TASK_CARD_VISUAL_HEIGHT,
      ),
    [holidayTexts.length, visibleTasks.length],
  );

  return (
    <DroppableDay
      dayKey={day.dayKey}
      expandedHeight={expandedHeight}
      expandUpward={preferOverlayUpward}
    >
      <div
        css={[
          styles.cell,
          day.inMonth ? styles.cellBgInMonth : styles.cellBgMuted,
        ]}
        style={{
          ...themeVars,
          borderRight: 'var(--cell-border)',
          borderBottom: 'var(--cell-border)',
          zIndex: isEditorOpen || Boolean(viewingTask) ? 14 : undefined,
          ...style,
        }}
      >
        <TaskDayCellHeader
          dateNumber={day.dateNumber}
          mode="month"
          dayKey={day.dayKey}
          inMonth={day.inMonth}
          isWeekend={day.isWeekend}
          onAddTask={() => openCreate(day.dayKey)}
        />

        <HolidaysList texts={holidayTexts} />

        <TaskDayCellTaskList
          tasks={visibleTasks}
          dndDisabled={dndDisabled}
        />

        {(viewingTask || isEditorOpen) && (
          <div
            css={[
              styles.editorOverlay,
              preferOverlayUpward && styles.editorOverlayUpward,
            ]}
          >
            <TaskEditorPanel
              dayKey={day.dayKey}
              isEditorOpen={isEditorOpen}
              editingTask={editingTask}
              viewingTask={viewingTask}
              editorProps={editorCreateProps}
              onClose={closeEditor}
              onCreate={async (input) => {
                await createTask({
                  day: day.dayKey,
                  title: input.title,
                  dots: input.dots,
                  allDay: input.allDay,
                  timeMinutes: input.timeMinutes,
                });
              }}
            />
          </div>
        )}
      </div>
    </DroppableDay>
  );
}
