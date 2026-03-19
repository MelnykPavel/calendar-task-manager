'use client';

import TaskInlineEditorForm from './TaskInlineEditorForm';
import TaskInlineEditorView from './TaskInlineEditorView';
import type { TaskInlineEditorProps } from './task-inline-editor.types';

export default function TaskInlineEditor(props: TaskInlineEditorProps) {
  if (props.mode === 'view') return <TaskInlineEditorView {...props} />;
  return <TaskInlineEditorForm {...props} />;
}
