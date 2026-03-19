import { css, useTheme } from '@emotion/react';
import { useMemo } from 'react';

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    height: 40,
    padding: '0 8px',
    borderRadius: 5,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    pointerEvents: 'none',
    borderLeft: '2px solid var(--holiday-color)',
    background: 'var(--holiday-bg)',
    color: 'var(--holiday-color)',
  }),
  dot: css({
    width: 5,
    height: 5,
    borderRadius: 2.5,
    flex: '0 0 auto',
    background: 'var(--holiday-color)',
  }),
  text: css({
    fontSize: 11,
    lineHeight: '14px',
    fontWeight: 500,
  }),
};

export default function HolidayLine({
  text,
  title,
}: {
  text: string;
  title?: string;
}) {
  const theme = useTheme();

  const cssVars = useMemo(
    () => ({
      ['--holiday-color' as string]: theme.colors.holiday,
      ['--holiday-bg' as string]: theme.colors.holidayBg,
    }),
    [theme.colors.holiday, theme.colors.holidayBg],
  );

  return (
    <div css={styles.root} style={cssVars} title={title ?? text}>
      <span css={styles.dot} />
      <span css={styles.text}>{text}</span>
    </div>
  );
}
