import { css } from '@emotion/react';
import type { AppTheme } from './theme';

export const globalStyles = (theme: AppTheme) =>
  css({
    ':root': {
      '--ctm-ink': theme.colors.ink,
      '--ctm-ink-muted': theme.colors.inkMuted,
      '--ctm-paper-light': theme.colors.paperLight,
      '--ctm-paper': theme.colors.paper,
      '--ctm-paper-dark': theme.colors.paperDark,
      '--ctm-line': theme.colors.line,
      '--ctm-accent': theme.colors.accent,
      '--ctm-accent-light': theme.colors.accentLight,
      '--ctm-accent-dark': theme.colors.accentDark,
      '--ctm-accent-bg': theme.colors.accentBg,
      '--ctm-accent-darker': theme.colors.accentDarker,
      '--ctm-weekend': theme.colors.weekend,
      '--ctm-holiday': theme.colors.holiday,
      '--ctm-holiday-bg': theme.colors.holidayBg,
      '--ctm-danger': theme.colors.danger,
      '--ctm-shadow': theme.shadows.md,
      '--ctm-popover': theme.shadows.popover,
    },

    'html, body': {
      maxWidth: '100vw',
      overflowX: 'hidden',
    },

    body: {
      minHeight: '100dvh',
      color: theme.colors.ink,
      fontFamily: theme.font.ui,
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      background: theme.colors.paperLight,
    },

    a: {
      color: 'inherit',
      textDecoration: 'none',
    },

    'button, input, select, textarea': {
      font: 'inherit',
    },

    '::selection': {
      background: theme.colors.accentBg,
    },

    ':focus-visible': {
      outline: `2px solid ${theme.colors.accentDarker}`,
      outlineOffset: '2px',
    },

    '@keyframes ctm-spin': {
      to: { transform: 'rotate(360deg)' },
    },

    '.ctm-spin': {
      animation: 'ctm-spin 0.9s linear infinite',
    },
  });
