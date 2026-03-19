'use client';

import { css, useTheme } from '@emotion/react';
import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import CalendarDataSync from './CalendarDataSync';
import CalendarToolbar from './toolbar/Toolbar';
import StatusBar from './StatusBar';
import DesktopCalendar from './platform/DesktopCalendar';
import MobileCalendar from './platform/MobileCalendar';
import DndProvider from '../dnd/DndProvider';
import { MOBILE_BREAKPOINT_PX } from '@/src/components/calendar/layout.constants';
import { selectVisibleRange } from '@/src/lib/store/selectors/calendar.selectors';
import { useAppStore } from '@/src/lib/store/app.store';

const styles = {
  root: css({
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background:
      'radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 28%), var(--color-paper-light)',
  }),
  container: css({
    width: '100%',
    maxWidth: 1800,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
    padding: '16px',
    gap: 12,
    boxSizing: 'border-box',
    '@media (max-width: 768px)': {
      padding: '12px',
      gap: 10,
    },
  }),
  header: css({
    flexShrink: 0,
    position: 'relative',
    zIndex: 6,
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '10px 12px 8px',
    borderRadius: 'var(--shell-radius)',
    border: 'var(--border-default)',
    background:
      'linear-gradient(180deg, var(--color-paper), color-mix(in srgb, var(--color-paper) 92%, transparent))',
    boxShadow: 'var(--shell-shadow)',
    backdropFilter: 'blur(16px)',
  }),
  body: css({
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    isolation: 'isolate',
    position: 'relative',
    zIndex: 1,
    borderRadius: 'var(--shell-radius)',
    border: 'var(--border-default)',
    background: 'var(--color-paper)',
    boxShadow: 'var(--shell-shadow-soft)',
    [`@media (max-width: ${MOBILE_BREAKPOINT_PX}px)`]: {
      clipPath: 'inset(0 round var(--shell-radius))',
    },
  }),
  bodyMonthAutoHeight: css({
    [`@media (min-width: ${MOBILE_BREAKPOINT_PX + 1}px)`]: {
      flex: '0 0 auto',
      minHeight: 'auto',
      overflow: 'hidden',
    },
  }),
};

export default function CalendarShell() {
  const theme = useTheme();
  const range = useAppStore(selectVisibleRange);
  const viewMode = useAppStore((state) => state.viewMode);
  const { closeEditor } = useAppStore(
    useShallow((state) => ({
      closeEditor: state.uiActions.closeEditor,
    })),
  );

  useEffect(() => {
    closeEditor();
  }, [closeEditor, range.from, range.to]);

  const themeVars = useMemo(
    () => ({
      ['--color-paper-light' as string]: theme.colors.paperLight,
      ['--color-paper' as string]: theme.colors.paper,
      ['--border-default' as string]: theme.borders.default,
      ['--shell-radius' as string]: theme.radii.lg,
      ['--shell-shadow' as string]: theme.shadows.popover,
      ['--shell-shadow-soft' as string]: theme.shadows.md,
    }),
    [
      theme.borders.default,
      theme.colors.paper,
      theme.colors.paperLight,
      theme.radii.lg,
      theme.shadows.md,
      theme.shadows.popover,
    ],
  );

  return (
    <div css={styles.root} style={themeVars}>
      <CalendarDataSync />
      <div css={styles.container}>
        <header css={styles.header}>
          <CalendarToolbar />
          <StatusBar />
        </header>
        <main
          css={[
            styles.body,
            viewMode === 'month' && styles.bodyMonthAutoHeight,
          ]}
        >
          <DndProvider>
            <MobileCalendar />
            <DesktopCalendar />
          </DndProvider>
        </main>
      </div>
    </div>
  );
}
