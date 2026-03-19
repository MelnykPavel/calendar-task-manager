'use client';

import { css, useTheme } from '@emotion/react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useAppStore } from '@/src/lib/store/app.store';

const styles = {
  viewModeGroup: css({
    display: 'flex',
    alignItems: 'center',
    padding: 3,
    height: 33,
    gap: 4,
    background: 'var(--color-paper-dark)',
    border: 'var(--border-default)',
    borderRadius: 'var(--radii-md)',
  }),
  viewModeButton: css({
    height: 27,
    padding: '0 14px',
    borderRadius: 6,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: 'transparent',
    color: 'var(--color-ink-light)',
  }),
  viewModeButtonActive: css({
    background: 'var(--color-accent)',
    color: '#ffffff',
  }),
};

export default function ViewModeSwitcher() {
  const theme = useTheme();
  const { setViewMode, viewMode } = useAppStore(
    useShallow((state) => ({
      setViewMode: state.uiActions.setViewMode,
      viewMode: state.viewMode,
    })),
  );

  const themeVars = useMemo(
    () => ({
      ['--color-paper-dark' as string]: theme.colors.paperDark,
      ['--border-default' as string]: theme.borders.default,
      ['--radii-md' as string]: theme.radii.md,
      ['--color-ink-light' as string]: theme.colors.inkLight,
      ['--color-accent' as string]: theme.colors.accent,
    }),
    [
      theme.borders.default,
      theme.colors.accent,
      theme.colors.inkLight,
      theme.colors.paperDark,
      theme.radii.md,
    ],
  );

  return (
    <div css={styles.viewModeGroup} style={themeVars}>
      {(['month', 'week'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setViewMode(mode)}
          css={[
            styles.viewModeButton,
            viewMode === mode && styles.viewModeButtonActive,
          ]}
        >
          {mode === 'month' ? 'Month' : 'Week'}
        </button>
      ))}
    </div>
  );
}
