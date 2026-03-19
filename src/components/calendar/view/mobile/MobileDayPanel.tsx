import { Plus } from 'lucide-react';
import { formatDate } from '@/src/lib/date/utils';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import TaskDayCellTaskList from '@/src/components/tasks/cell/TaskDayCellTaskList';
import DroppableDay from '@/src/components/dnd/DroppableDay';
import TaskEditorPanel from '@/src/components/tasks/editor/TaskEditorPanel';
import HolidayLine from '@/src/components/holidays/HolidayLine';
import { mobileViewStyles as styles } from './mobile-view.styles';
import { useAppStore } from '@/src/lib/store/app.store';
import { useDayTasks } from '@/src/hooks/useDayTasks';
import {
  selectDndDisabled,
  selectEditingTaskForDay,
  selectEditorCreatePropsForDay,
  selectIsEditorOpenForDay,
  selectViewingTaskForDay,
} from '@/src/lib/store/selectors/ui.selectors';
import { selectHolidayTextsForDay } from '@/src/lib/store/selectors/holidays.selectors';

type EditorSubmitInput = {
  title: string;
  day?: string;
  dots: string[];
  allDay: boolean;
  timeMinutes: number;
};

export default function MobileDayPanel({
  dayKey,
}: {
  dayKey: string;
}) {
  const { closeEditor, createTask, dndDisabled, openCreate } = useAppStore(
    useShallow((state) => ({
      closeEditor: state.uiActions.closeEditor,
      createTask: state.taskActions.create,
      dndDisabled: selectDndDisabled(state),
      openCreate: state.uiActions.openCreate,
    })),
  );

  const selectHolidayTexts = useMemo(() => selectHolidayTextsForDay(dayKey), [dayKey]);
  const selectIsOpen = useMemo(() => selectIsEditorOpenForDay(dayKey), [dayKey]);
  const selectEditorProps = useMemo(() => selectEditorCreatePropsForDay(dayKey), [dayKey]);
  const selectEditingTask = useMemo(() => selectEditingTaskForDay(dayKey), [dayKey]);
  const selectViewingTask = useMemo(() => selectViewingTaskForDay(dayKey), [dayKey]);

  const holidayTexts = useAppStore(selectHolidayTexts);
  const isEditorOpen = useAppStore(selectIsOpen);
  const editorProps = useAppStore(selectEditorProps);
  const editingTask = useAppStore(selectEditingTask);
  const viewingTask = useAppStore(selectViewingTask);

  const dayTasks = useDayTasks(dayKey);
  const tasks = useMemo(() => [dayTasks.allDay, ...dayTasks.hours].flat(), [dayTasks]);
  const visibleTasks = useMemo(
    () => (editingTask ? tasks.filter((task) => task.id !== editingTask.id) : tasks),
    [editingTask, tasks],
  );

  const selectedLabel = useMemo(() => (dayKey ? formatDate(dayKey, 'dddd, MMM D') : ''), [dayKey]);
  const selectedMeta = `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;

  const handleCreateTask = async (input: EditorSubmitInput) => {
    await createTask({
      day: input.day ?? dayKey,
      title: input.title,
      dots: input.dots,
      allDay: input.allDay,
      timeMinutes: input.timeMinutes,
    });
  };

  return (
    <section css={styles.panel}>
      <div css={styles.panelHeader}>
        <div css={styles.panelTitle}>
          <div css={styles.panelDate}>{selectedLabel}</div>
          <div css={styles.panelMeta}>{selectedMeta}</div>
        </div>

        <button type="button" css={styles.addButton} onClick={() => openCreate(dayKey)}>
          <Plus size={14} />
          Add
        </button>
      </div>

      {holidayTexts.length > 0 && (
        <div css={styles.holidayList}>
          {holidayTexts.map((text, index) => (
            <HolidayLine key={`${dayKey}:${index}`} text={text} />
          ))}
        </div>
      )}

      <div css={styles.tasksArea}>
        {visibleTasks.length > 0 ? (
          <DroppableDay dayKey={dayKey}>
            <TaskDayCellTaskList tasks={visibleTasks} dndDisabled={dndDisabled} />
          </DroppableDay>
        ) : (
          <div css={styles.emptyState}>No tasks for this day yet. Tap Add to create the first one.</div>
        )}
      </div>

      <div css={styles.editorOverlay}>
        <TaskEditorPanel
          dayKey={dayKey}
          isEditorOpen={isEditorOpen}
          editingTask={editingTask}
          viewingTask={viewingTask}
          editorProps={editorProps}
          onClose={closeEditor}
          onCreate={handleCreateTask}
        />
      </div>
    </section>
  );
}
