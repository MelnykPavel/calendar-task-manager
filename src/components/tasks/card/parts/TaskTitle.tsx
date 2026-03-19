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

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const tokens: Array<{ value: string; match: boolean }> = [];
    let cursor = 0;

    while (cursor < text.length) {
      const matchIndex = lowerText.indexOf(lowerQuery, cursor);
      if (matchIndex === -1) {
        tokens.push({ value: text.slice(cursor), match: false });
        break;
      }

      if (matchIndex > cursor) {
        tokens.push({ value: text.slice(cursor, matchIndex), match: false });
      }

      tokens.push({
        value: text.slice(matchIndex, matchIndex + lowerQuery.length),
        match: true,
      });
      cursor = matchIndex + lowerQuery.length;
    }

    return tokens.length > 0 ? tokens : [{ value: text, match: false }];
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
