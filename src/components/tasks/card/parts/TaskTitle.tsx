'use client';

import { css, useTheme } from '@emotion/react';
import { useMemo } from 'react';

import { useAppStore } from '@/src/lib/store/app.store';
import { selectSearchQuery } from '@/src/lib/store/selectors/ui.selectors';

const styles = {
  title: css({
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 600,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    wordBreak: 'break-word',
    color: 'var(--color-ink)',
  }),
  highlight: css({
    background: 'var(--highlight-bg)',
    color: 'inherit',
    borderRadius: 4,
    padding: '0 1px',
    boxShadow: '0 0 0 1px var(--highlight-border)',
  }),
};

export default function TaskTitle({ text }: { text: string }) {
  const theme = useTheme();
  const query = useAppStore(selectSearchQuery);

  const themeVars = useMemo(
    () => ({
      ['--color-ink' as string]: theme.colors.ink,
      ['--highlight-bg' as string]: theme.colors.accentLight,
      ['--highlight-border' as string]: theme.colors.accentDark,
    }),
    [theme.colors.accentDark, theme.colors.accentLight, theme.colors.ink],
  );

  const parts = useMemo(() => {
    if (!query) return [{ value: text, match: false }];

    const lowerQuery = query.toLowerCase();

    return text
      .split(new RegExp(`(${lowerQuery})`, 'i'))
      .filter(Boolean)
      .map((part) => ({
        value: part,
        match: part.toLowerCase() === lowerQuery,
      }));
  }, [query, text]);

  return (
    <div css={styles.title} style={themeVars} title={text}>
      {parts.map((part, index) =>
        part.match ? (
          <mark key={`${part.value}-${index}`} css={styles.highlight}>
            {part.value}
          </mark>
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ),
      )}
    </div>
  );
}
