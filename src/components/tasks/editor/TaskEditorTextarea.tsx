'use client';

import { css, useTheme } from '@emotion/react';
import { useCallback, useEffect, useMemo, useRef, KeyboardEvent } from 'react';

const styles = {
  textarea: css({
    display: 'block',
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 13,
    lineHeight: '18px',
    fontFamily: 'inherit',
    fontWeight: 550,
    resize: 'none',
    overflow: 'hidden',
    padding: 0,
    margin: 0,
    color: 'inherit',
    '::placeholder': {
      color: 'var(--color-ink)',
      opacity: 0.6,
      fontWeight: 450,
    },
  }),
};

export default function TaskEditorTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  readOnly,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
}) {
  const theme = useTheme();

  const themeVars = useMemo(
    () => ({ ['--color-ink' as string]: theme.colors.ink }),
    [theme.colors.ink],
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? 'Task title'}
      maxLength={500}
      rows={1}
      css={styles.textarea}
      style={themeVars}
      onKeyDown={onKeyDown}
      aria-label="Task title"
      autoFocus={autoFocus ?? true}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
}
