import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import { Pencil, Trash2, X } from 'lucide-react';

import TaskEditorTextarea from '@/src/components/tasks/editor/TaskEditorTextarea';
import TaskDots from '@/src/components/tasks/card/parts/TaskDots';
import { minutesToTime } from '@/src/lib/date/utils';
import { editorStyles as styles } from './task-inline-editor.styles';
import type { TaskInlineEditorViewProps } from './task-inline-editor.types';

function describeTaskTime(allDay: boolean, timeMinutes: number) {
  return allDay ? 'All day' : minutesToTime(timeMinutes);
}

export default function TaskInlineEditorView({
  task,
  onCancel,
  onEdit,
  onDelete,
}: TaskInlineEditorViewProps) {
  const theme = useTheme();
  const themeVars = useMemo(
    () => ({
      ['--radii-md' as string]: theme.radii.md,
      ['--radii-sm' as string]: theme.radii.sm,
      ['--border-accent' as string]: theme.borders.accent,
      ['--border-default' as string]: theme.borders.default,
      ['--color-paper' as string]: theme.colors.paper,
      ['--color-paper-dark' as string]: theme.colors.paperDark,
      ['--color-accent-light' as string]: theme.colors.accentLight,
      ['--color-ink' as string]: theme.colors.ink,
      ['--color-ink-muted' as string]: theme.colors.inkMuted,
      ['--color-danger' as string]: theme.colors.danger,
      ['--font-mono' as string]: theme.font.mono,
      ['--editor-shadow' as string]: theme.colors.accentDark,
    }),
    [theme],
  );

  return (
    <div css={styles.root} style={themeVars} onPointerDown={(event) => event.stopPropagation()}>
      <TaskDots dots={task.dots} />
      <TaskEditorTextarea value={task.title} onChange={() => {}} readOnly autoFocus={false} />

      <div css={styles.metaRow}>
        <div css={styles.dayBadge}>{describeTaskTime(task.allDay, task.timeMinutes)}</div>
        <div css={styles.dayBadge}>{task.day}</div>
      </div>

      <div css={styles.viewActions}>
        <button type="button" css={styles.viewButton} onClick={onCancel}>
          <X size={13} />
          Cancel
        </button>
        <button type="button" css={styles.viewButton} onClick={onEdit}>
          <Pencil size={13} />
          Edit
        </button>
        <button type="button" css={[styles.viewButton, styles.viewDeleteButton]} onClick={onDelete}>
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}
