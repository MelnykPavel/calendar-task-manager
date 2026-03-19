'use client';

import { css, useTheme } from '@emotion/react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useMemo, useTransition } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useAppStore } from '@/src/lib/store/app.store';

const styles = {
  searchContainer: css({
    position: 'relative',
    width: 220,
    height: 38,
    '@media (max-width: 768px)': {
      width: '100%',
    },
  }),
  searchLabel: css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 12px 0 38px',
    borderRadius: '999px',
    border: 'var(--border-default)',
    background: 'var(--color-paper-dark)',
    transition:
      'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
    transformOrigin: 'right center',
    ':focus-within': {
      transform: 'scale(1.03)',
      boxShadow: '0 10px 24px var(--focus-shadow)',
      borderColor: 'var(--color-accent-dark)',
    },
  }),
  searchIcon: css({
    position: 'absolute',
    left: 13,
    top: 10,
    color: 'var(--color-ink-muted)',
  }),
  searchInput: css({
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 13,
    color: 'var(--color-ink)',
    '::placeholder': {
      color: 'var(--color-ink-muted)',
    },
  }),
  clearSearchButton: css({
    height: 22,
    width: 22,
    borderRadius: '999px',
    border: 'none',
    background: 'var(--color-paper)',
    color: 'var(--color-ink)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  }),
};

export default function Search() {
  const theme = useTheme();
  const [, startTransition] = useTransition();
  const { searchText, setSearchText } = useAppStore(
    useShallow((state) => ({
      searchText: state.searchText,
      setSearchText: state.uiActions.setSearchText,
    })),
  );

  const themeVars = useMemo(
    () => ({
      ['--border-default' as string]: theme.borders.default,
      ['--color-paper-dark' as string]: theme.colors.paperDark,
      ['--color-paper' as string]: theme.colors.paper,
      ['--color-ink' as string]: theme.colors.ink,
      ['--color-ink-muted' as string]: theme.colors.inkMuted,
      ['--color-accent-dark' as string]: theme.colors.accentDark,
      ['--focus-shadow' as string]: theme.colors.accentLight,
    }),
    [
      theme.borders.default,
      theme.colors.accentDark,
      theme.colors.accentLight,
      theme.colors.ink,
      theme.colors.inkMuted,
      theme.colors.paper,
      theme.colors.paperDark,
    ],
  );

  return (
    <div css={styles.searchContainer} style={themeVars}>
      <label css={styles.searchLabel}>
        <SearchIcon size={14} css={styles.searchIcon} aria-hidden="true" />
        <input
          value={searchText}
          onChange={(event) => {
            const value = event.target.value;
            startTransition(() => setSearchText(value));
          }}
          placeholder="Search tasks..."
          type="text"
          css={styles.searchInput}
          aria-label="Search tasks"
        />
        {searchText && (
          <button
            type="button"
            onClick={() => setSearchText('')}
            css={styles.clearSearchButton}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </label>
    </div>
  );
}
