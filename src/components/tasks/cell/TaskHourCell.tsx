'use client';

import { useTheme } from '@emotion/react';
import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import DroppableDay from '@/src/components/dnd/DroppableDay';
import DroppableHour from '@/src/components/dnd/DroppableHour';
import TaskDayCellHeader from '@/src/components/tasks/cell/TaskDayCellHeader';
import HolidaysList from '@/src/components/holidays/HolidaysList';
import TaskDayCellTaskList from '@/src/components/tasks/cell/TaskDayCellTaskList';
import TaskEditorPanel from '@/src/components/tasks/editor/TaskEditorPanel';
import { taskHourCellStyles as styles } from '@/src/components/tasks/cell/task-hour-cell.styles';

import { useAppStore } from '@/src/lib/store/app.store';
import {
  selectDndDisabled,
  selectEditingTaskForCell,
  selectEditorCreatePropsForDay,
  selectIsEditorOpenForCell,
  selectViewingTaskForCell,
} from '@/src/lib/store/selectors/ui.selectors';
import { selectHolidayTextsForDay } from '@/src/lib/store/selectors/holidays.selectors';
import type { WeekDay } from '@/src/lib/store/selectors/calendar.selectors';
import {
  CALENDAR_ALL_DAY_HEIGHT,
  CALENDAR_CELL_HEIGHT,
  CELL_HEADER_VISUAL_HEIGHT,
  HOLIDAY_LINE_VISUAL_HEIGHT,
  TASK_CARD_VISUAL_HEIGHT,
} from '@/src/components/calendar/layout.constants';
import { useDayTasks } from '@/src/hooks/useDayTasks';

function TaskHourCell({
  day,
  hour,
  nowMinutes = 0,
  isLastColumn = false,
}: {
  day: WeekDay;
  hour?: number;
  nowMinutes?: number;
  isLastColumn?: boolean;
}) {
  const isAllDay = hour === undefined;
  const theme = useTheme();
  const { closeEditor, createTask, dndDisabled, openCreate } = useAppStore(
    useShallow((state) => ({
      closeEditor: state.uiActions.closeEditor,
      createTask: state.taskActions.create,
      dndDisabled: selectDndDisabled(state),
      openCreate: state.uiActions.openCreate,
    })),
  );

  const selectIsOpen = useMemo(
    () => selectIsEditorOpenForCell(day.dayKey, hour),
    [day.dayKey, hour],
  );
  const selectEditorProps = useMemo(
    () => selectEditorCreatePropsForDay(day.dayKey),
    [day.dayKey],
  );
  const selectHolidayTexts = useMemo(() => selectHolidayTextsForDay(day.dayKey), [day.dayKey]);
  const selectEditingTask = useMemo(() => selectEditingTaskForCell(day.dayKey, hour), [day.dayKey, hour]);
  const selectViewingTask = useMemo(
    () => selectViewingTaskForCell(day.dayKey, hour),
    [day.dayKey, hour],
  );

  const editorProps = useAppStore(selectEditorProps);
  const holidayTexts = useAppStore(selectHolidayTexts);
  const isEditorOpen = useAppStore(selectIsOpen);
  const editingTask = useAppStore(selectEditingTask);
  const viewingTask = useAppStore(selectViewingTask);

  const dayTasks = useDayTasks(day.dayKey);
  const tasks = useMemo(
    () => (isAllDay ? dayTasks.allDay : dayTasks.hours[hour ?? 0] ?? []),
    [dayTasks, hour, isAllDay],
  );

  const visibleTasks = useMemo(() => (editingTask ? tasks.filter((task) => task.id !== editingTask.id) : tasks), [editingTask, tasks]);

  const showNowLine = !isAllDay && day.isToday && Math.floor(nowMinutes / 60) === hour;
  const nowLineTop = `${((nowMinutes % 60) / 60) * 100}%`;
  const preferOverlayUpward = !isAllDay && (hour ?? 0) >= 20;
  const expandedHeight = useMemo(() => {
    const baseHeight = isAllDay ? CALENDAR_ALL_DAY_HEIGHT : CALENDAR_CELL_HEIGHT;
    const holidayHeight = isAllDay
      ? holidayTexts.length * HOLIDAY_LINE_VISUAL_HEIGHT
      : 0;

    return Math.max(
      baseHeight,
      CELL_HEADER_VISUAL_HEIGHT +
        20 +
        holidayHeight +
        visibleTasks.length * TASK_CARD_VISUAL_HEIGHT,
    );
  }, [holidayTexts.length, isAllDay, visibleTasks.length]);

  const cellVars = useMemo(
    () => ({
      ['--color-accent' as string]: theme.colors.accent,
      ['--cell-bg' as string]: isAllDay
        ? theme.colors.allDayBg
        : theme.colors.cellBg,
      ['--cell-border-bottom' as string]: theme.borders.default,
      ['--cell-border-right' as string]: isLastColumn ? 'none' : theme.borders.default,
      zIndex: isEditorOpen || Boolean(viewingTask) ? 14 : undefined,
    }),
    [
      isAllDay,
      isLastColumn,
      theme.borders.default,
      theme.colors.accent,
      theme.colors.allDayBg,
      theme.colors.cellBg,
      isEditorOpen,
      viewingTask,
    ],
  );

  const content = (
    <div css={styles.cell} style={cellVars}>
      {showNowLine && <div css={styles.nowLine} style={{ top: nowLineTop }} />}

      <TaskDayCellHeader
        dateNumber={day.dateNumber}
        dayKey={day.dayKey}
        mode="week"
        onAddTask={() =>
          openCreate(day.dayKey, isAllDay ? undefined : hour * 60, isAllDay)
        }
      />

      {isAllDay && <HolidaysList texts={holidayTexts} />}

      <TaskDayCellTaskList tasks={visibleTasks} dndDisabled={dndDisabled} />

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
            editorProps={editorProps}
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
  );

  return isAllDay ? (
    <DroppableDay dayKey={day.dayKey} css={styles.droppable} expandedHeight={expandedHeight} expandUpward={false}>
      {content}
    </DroppableDay>
  ) : (
    <DroppableHour dayKey={day.dayKey} hour={hour ?? 0} css={styles.droppable} expandedHeight={expandedHeight} expandUpward={preferOverlayUpward}>
      {content}
    </DroppableHour>
  );
}

export default memo(TaskHourCell);
