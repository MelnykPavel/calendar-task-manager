import { useMemo, useState } from 'react';
import { useTheme } from '@emotion/react';

import TaskEditorTextarea from '@/src/components/tasks/editor/TaskEditorTextarea';
import TaskEditorErrorMessage from '@/src/components/tasks/editor/TaskEditorErrorMessage';
import TaskEditorActions from '@/src/components/tasks/editor/TaskEditorActions';
import TaskDotsPicker from '@/src/components/tasks/editor/TaskDotsPicker';
import { isValidTimeString, minutesToTime, timeToMinutes } from '@/src/lib/date/utils';
import { editorStyles as styles } from './task-inline-editor.styles';
import type { TaskInlineEditorCreateEditProps } from './task-inline-editor.types';

export default function TaskInlineEditorForm({
  initialValue,
  initialDay,
  initialDots,
  initialAllDay,
  initialTimeMinutes,
  showDay,
  placeholder,
  onCancel,
  onSubmit,
}: TaskInlineEditorCreateEditProps) {
  const theme = useTheme();
  const themeVars = useMemo(
    () => ({
      ['--radii-md' as string]: theme.radii.md,
      ['--border-accent' as string]: theme.borders.accent,
      ['--border-default' as string]: theme.borders.default,
      ['--color-paper' as string]: theme.colors.paper,
      ['--color-paper-dark' as string]: theme.colors.paperDark,
      ['--color-accent-light' as string]: theme.colors.accentLight,
      ['--color-accent' as string]: theme.colors.accent,
      ['--color-ink' as string]: theme.colors.ink,
      ['--color-ink-muted' as string]: theme.colors.inkMuted,
      ['--font-mono' as string]: theme.font.mono,
      ['--editor-shadow' as string]: theme.colors.accentDark,
    }),
    [theme],
  );

  const [value, setValue] = useState(initialValue ?? '');
  const [dots, setDots] = useState<string[]>(initialDots ?? []);
  const [allDay, setAllDay] = useState(initialAllDay ?? true);
  const [timeStr, setTimeStr] = useState<string>(
    initialTimeMinutes !== undefined && initialTimeMinutes > 0 ? minutesToTime(initialTimeMinutes) : '09:00',
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const day = initialDay ?? '';
  const canSubmit = value.trim().length > 0 && !busy;

  async function submit() {
    const title = value.trim();
    if (!title) return;

    if (!allDay && !isValidTimeString(timeStr)) {
      setError('Enter a valid time (HH:MM)');
      return;
    }

    const resolvedDay = day.trim() || undefined;
    if (showDay && (!resolvedDay || !/^\d{4}-\d{2}-\d{2}$/.test(resolvedDay))) {
      setError('Pick a valid date');
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await onSubmit({
        title,
        day: resolvedDay,
        dots,
        allDay,
        timeMinutes: allDay ? 0 : timeToMinutes(timeStr),
      });
    } catch (err) {
      setError((err as Error).message ?? 'Failed to save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div onPointerDown={(event) => event.stopPropagation()} css={styles.root} style={themeVars}>
      <TaskEditorTextarea
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue);
          if (error) setError(null);
        }}
        placeholder={placeholder}
        disabled={busy}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onCancel();
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            void submit();
          }
        }}
      />

      <TaskDotsPicker value={dots} onChange={setDots} />

      <div css={styles.metaRow}>
        <label css={styles.allDayLabel}>
          <input
            type="checkbox"
            checked={allDay}
            onChange={(event) => {
              setAllDay(event.target.checked);
              if (error) setError(null);
            }}
            css={styles.allDayCheckbox}
            disabled={busy}
          />
          All day
        </label>

        {!allDay && (
          <input
            type="time"
            value={timeStr}
            onChange={(event) => {
              setTimeStr(event.target.value);
              if (error) setError(null);
            }}
            css={styles.timeInput}
            disabled={busy}
            aria-label="Task time"
          />
        )}

        {showDay && day && <div css={styles.dayBadge}>{day}</div>}
      </div>

      <TaskEditorErrorMessage message={error} />

      <TaskEditorActions onCancel={onCancel} onSubmit={submit} canSubmit={canSubmit} isBusy={busy} />
    </div>
  );
}
