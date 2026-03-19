'use client';

import { css, useTheme } from '@emotion/react';
import { Check, X } from 'lucide-react';
import Color from 'color';
import { useMemo } from 'react';

const styles = {
  actions: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  }),
  cancelButton: css({
    height: 22,
    paddingInline: 8,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 'var(--radii-sm)',
    border: 'var(--border-default)',
    background: 'var(--color-accent-light)',
    cursor: 'pointer',
    color: 'var(--color-ink)',
    fontSize: 11,
    fontWeight: 600,
  }),
  submitButton: css({
    height: 22,
    paddingInline: 8,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    transition: 'all 120ms ease',
    borderRadius: 'var(--radii-sm)',
  }),
  submitButtonActive: css({
    border: 'var(--border-accent)',
    background: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
    cursor: 'pointer',
    ':hover': { background: 'var(--color-accent-light-hover)' },
  }),
  submitButtonInactive: css({
    border: 'var(--border-default)',
    background: 'transparent',
    color: 'var(--color-ink)',
    cursor: 'default',
  }),
};

export default function TaskEditorActions({
  onCancel,
  onSubmit,
  canSubmit,
  isBusy,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isBusy: boolean;
}) {
  const theme = useTheme();

  const themeVars = useMemo(
    () => ({
      ['--color-ink' as string]: theme.colors.ink,
      ['--radii-sm' as string]: theme.radii.sm,
      ['--border-default' as string]: theme.borders.default,
      ['--border-accent' as string]: theme.borders.accent,
      ['--color-accent-light' as string]: theme.colors.accentLight,
      ['--color-accent' as string]: theme.colors.accent,
      ['--color-accent-light-hover' as string]: Color(theme.colors.accentLight)
        .darken(0.15)
        .hex(),
    }),
    [
      theme.colors.ink,
      theme.radii.sm,
      theme.borders.default,
      theme.borders.accent,
      theme.colors.accentLight,
      theme.colors.accent,
    ],
  );

  return (
    <div css={styles.actions} style={themeVars}>
      <button
        type="button"
        onClick={onCancel}
        css={styles.cancelButton}
        aria-label="Cancel"
        disabled={isBusy}
      >
        <X size={12} />
        Cancel
      </button>

      <button
        type="button"
        onClick={onSubmit}
        css={[
          styles.submitButton,
          canSubmit ? styles.submitButtonActive : styles.submitButtonInactive,
        ]}
        aria-label="Submit"
        disabled={!canSubmit}
      >
        <Check size={12} />
        Save
      </button>
    </div>
  );
}
