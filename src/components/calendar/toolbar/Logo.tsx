'use client';

import { css, useTheme } from '@emotion/react';
import { useMemo } from 'react';

const styles = {
  logo: css({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  }),
  logoMark: css({
    width: 12,
    height: 12,
    borderRadius: 999,
    background:
      'linear-gradient(135deg, var(--color-accent), var(--color-weekend))',
    boxShadow: '0 0 0 4px var(--color-accent-light)',
    flexShrink: 0,
  }),
  logoText: css({
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: '-0.03em',
    color: 'var(--color-ink)',
  }),
};

export default function Logo() {
  const theme = useTheme();

  const themeVars = useMemo(
    () => ({
      ['--color-accent' as string]: theme.colors.accent,
      ['--color-accent-light' as string]: theme.colors.accentLight,
      ['--color-weekend' as string]: theme.colors.weekend,
      ['--font-display' as string]: theme.font.display,
      ['--color-ink' as string]: theme.colors.ink,
    }),
    [
      theme.colors.accent,
      theme.colors.accentLight,
      theme.colors.ink,
      theme.colors.weekend,
      theme.font.display,
    ],
  );

  return (
    <div css={styles.logo} style={themeVars}>
      <span css={styles.logoMark} />
      <span css={styles.logoText}>Planner</span>
    </div>
  );
}
