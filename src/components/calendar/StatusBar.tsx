'use client';

import { css, useTheme } from '@emotion/react';
import { AlertTriangle, Info, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import {
  selectVisibleRange,
  selectVisibleYears,
} from '@/src/lib/store/selectors/calendar.selectors';
import { selectStatus } from '@/src/lib/store/selectors/ui.selectors';
import { useAppStore } from '@/src/lib/store/app.store';
import { STATUS_BAR_HEIGHT } from '@/src/components/calendar/layout.constants';

const styles = {
  wrapper: css({
    minHeight: STATUS_BAR_HEIGHT,
    display: 'flex',
    alignItems: 'center',
  }),
  container: css({
    width: '100%',
    minHeight: STATUS_BAR_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 2,
  }),
  content: css({
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }),
  messages: css({
    minWidth: 0,
    display: 'grid',
    gap: 2,
  }),
  messagePrimary: css({
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-ink)',
  }),
  messageError: css({
    fontSize: 11,
    color: 'var(--color-danger)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  placeholder: css({
    opacity: 0,
    pointerEvents: 'none',
  }),
  retryButton: css({
    height: 30,
    padding: '0 10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: 'none',
    borderRadius: '999px',
    background: 'var(--color-paper-dark)',
    color: 'var(--color-ink)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  }),
};

export default function StatusBar() {
  const theme = useTheme();
  const range = useAppStore(selectVisibleRange);
  const years = useAppStore(selectVisibleYears);
  const status = useAppStore(selectStatus);
  const { countryCode, hydrateRange, refetchHolidays } = useAppStore(
    useShallow((state) => ({
      countryCode: state.countryCode,
      hydrateRange: state.taskActions.hydrateRange,
      refetchHolidays: state.holidayActions.refetch,
    })),
  );

  const retryControllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      retryControllerRef.current?.abort();
    },
    [],
  );

  const themeVars = useMemo(
    () => ({
      ['--color-danger' as string]: theme.colors.danger,
      ['--color-ink' as string]: theme.colors.ink,
      ['--color-paper-dark' as string]: theme.colors.paperDark,
    }),
    [theme.colors.danger, theme.colors.ink, theme.colors.paperDark],
  );

  const body = status.active ? (
    <div
      css={styles.container}
      role={status.hasError ? 'alert' : 'status'}
      aria-live={status.hasError ? 'assertive' : 'polite'}
    >
      <div css={styles.content}>
        {status.hasError ? (
          <AlertTriangle size={16} color="var(--color-danger)" />
        ) : status.isBusy ? (
          <Loader2 size={16} className="ctm-spin" />
        ) : (
          <Info size={16} color="var(--color-ink)" />
        )}

        <div css={styles.messages}>
          {status.message.length > 0 && (
            <div css={styles.messagePrimary}>{status.message}</div>
          )}
          {status.tasksError && (
            <div css={styles.messageError}>Tasks: {status.tasksError}</div>
          )}
          {status.holidaysError && (
            <div css={styles.messageError}>
              Holidays: {status.holidaysError}
            </div>
          )}
        </div>
      </div>

      {status.hasError && (
        <button
          type="button"
          onClick={() => {
            retryControllerRef.current?.abort();
            const controller = new AbortController();
            retryControllerRef.current = controller;

            void hydrateRange({
              from: range.from,
              to: range.to,
              signal: controller.signal,
            });
            for (const year of years) {
              void refetchHolidays(year, countryCode);
            }
          }}
          css={styles.retryButton}
          aria-label="Retry"
        >
          <RotateCcw size={14} />
          Retry
        </button>
      )}
    </div>
  ) : (
    <div css={[styles.container, styles.placeholder]} aria-hidden="true">
      <div css={styles.content}>
        <Info size={16} />
        <div css={styles.messages}>
          <div css={styles.messagePrimary}>Placeholder</div>
        </div>
      </div>
    </div>
  );

  return (
    <div css={styles.wrapper} style={themeVars}>
      {body}
    </div>
  );
}
