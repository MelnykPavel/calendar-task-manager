import type { Task } from '@/src/types/task';

export type EditorSubmitInput = {
  title: string;
  day?: string;
  dots: string[];
  allDay: boolean;
  timeMinutes: number;
};

export type TaskInlineEditorCreateEditProps = {
  mode: 'create' | 'edit';
  initialValue?: string;
  initialDay?: string;
  initialDots?: string[];
  initialAllDay?: boolean;
  initialTimeMinutes?: number;
  showDay?: boolean;
  placeholder?: string;
  onCancel: () => void;
  onSubmit: (input: EditorSubmitInput) => void | Promise<void>;
};

export type TaskInlineEditorViewProps = {
  mode: 'view';
  task: Task;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export type TaskInlineEditorProps =
  | TaskInlineEditorCreateEditProps
  | TaskInlineEditorViewProps;
