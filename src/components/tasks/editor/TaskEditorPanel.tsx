'use client';

import TaskInlineEditor from '@/src/components/tasks/editor/TaskInlineEditor';
import { useAppStore } from '@/src/lib/store/app.store';
import type { EditorCreateProps } from '@/src/lib/store/selectors/ui.selectors';
import type { Task } from '@/src/types/task';

type EditorSubmitInput = {
  title: string;
  day?: string;
  dots: string[];
  allDay: boolean;
  timeMinutes: number;
};

export default function TaskEditorPanel({
  dayKey,
  isEditorOpen,
  editingTask,
  viewingTask,
  editorProps,
  onClose,
  onCreate,
}: {
  dayKey: string;
  isEditorOpen: boolean;
  editingTask: Task | null;
  viewingTask: Task | null;
  editorProps: EditorCreateProps;
  onClose: () => void;
  onCreate: (input: EditorSubmitInput) => Promise<void>;
}) {
  if (viewingTask) {
    return (
      <TaskInlineEditor
        mode="view"
        task={viewingTask}
        onCancel={onClose}
        onEdit={() => useAppStore.getState().uiActions.openEdit(viewingTask.id)}
        onDelete={async () => {
          if (!window.confirm('Delete this task?')) return;
          try {
            await useAppStore.getState().taskActions.remove(viewingTask.id);
            onClose();
          } catch {}
        }}
      />
    );
  }

  if (!isEditorOpen) return null;

  return (
    <TaskInlineEditor
      mode={editingTask ? 'edit' : 'create'}
      placeholder={editingTask ? undefined : 'New task'}
      initialValue={editingTask?.title}
      initialDay={editingTask?.day}
      initialDots={editingTask?.dots}
      initialAllDay={editingTask?.allDay ?? editorProps.initialAllDay}
      initialTimeMinutes={
        editingTask?.timeMinutes ?? editorProps.initialTimeMinutes
      }
      showDay={Boolean(editingTask)}
      onCancel={onClose}
      onSubmit={async (input) => {
        if (editingTask) {
          await useAppStore.getState().taskActions.update(editingTask.id, {
            title: input.title,
            day: input.day,
            dots: input.dots,
            allDay: input.allDay,
            timeMinutes: input.timeMinutes,
          });
        } else {
          await onCreate({
            day: dayKey,
            title: input.title,
            dots: input.dots,
            allDay: input.allDay,
            timeMinutes: input.timeMinutes,
          });
        }
        onClose();
      }}
    />
  );
}
