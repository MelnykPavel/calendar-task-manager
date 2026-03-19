import { css } from '@emotion/react';

export const taskHourCellStyles = {
  droppable: css({
    height: '100%',
  }),
  cell: css({
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'visible',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minHeight: 0,
    position: 'relative',
    background: 'var(--cell-bg)',
    borderRight: 'var(--cell-border-right)',
    borderBottom: 'var(--cell-border-bottom)',
    ':hover .ctm-add': { opacity: 1 },
  }),
  nowLine: css({
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    background: 'var(--color-accent)',
    zIndex: 10,
    pointerEvents: 'none',
    '::before': {
      content: '""',
      position: 'absolute',
      left: -4,
      top: -4,
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: 'var(--color-accent)',
    },
  }),
  editorOverlay: css({
    position: 'absolute',
    left: 8,
    top: 42,
    zIndex: 12,
    width: 'min(340px, calc(100vw - 32px))',
    maxHeight: 'min(420px, calc(100dvh - 160px))',
    overflow: 'visible',
  }),
  editorOverlayUpward: css({
    top: 'auto',
    bottom: 8,
  }),
};
