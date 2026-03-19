const base = {
  radii: {
    sm: '6px',
    md: '12px',
    lg: '20px',
  },
  shadows: {
    md: '0 16px 34px rgba(15, 23, 42, 0.10)',
    popover: '0 24px 60px rgba(15, 23, 42, 0.18)',
  },
  spacing: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '10px',
    xl: '12px',
  },
  typography: {
    xs: 11,
    sm: 12,
    base: 13,
    lg: 18,
  },
  font: {
    ui: 'var(--font-dm-sans)',
    mono: 'var(--font-dm-mono)',
    display: 'var(--font-syne)',
  },
} as const;

const border = (color: string, width = 1) => `${width}px solid ${color}`;

export type ThemeColors = {
  ink: string;
  inkMuted: string;
  inkLight: string;
  paperLight: string;
  paper: string;
  paperDark: string;
  line: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  accentBg: string;
  accentDarker: string;
  weekend: string;
  holiday: string;
  holidayBg: string;
  cellBg: string;
  cellMutedBg: string;
  allDayBg: string;
  taskBg: string;
  taskBorder: string;
  danger: string;
};

export type ThemeBase = typeof base & {
  colors: ThemeColors;
  borders: Record<string, string>;
};

const lightTheme: ThemeBase = {
  ...base,
  colors: {
    ink: '#0f172a',
    inkMuted: 'rgba(15, 23, 42, 0.45)',
    inkLight: 'rgba(15, 23, 42, 0.7)',
    paperLight: '#f5f7fb',
    paper: '#ffffff',
    paperDark: '#f1f4f8',
    line: 'rgba(15, 23, 42, 0.12)',
    accent: '#0ea5e9',
    accentLight: 'rgba(14, 165, 233, 0.12)',
    accentDark: 'rgba(14, 165, 233, 0.35)',
    accentBg: 'rgba(14, 165, 233, 0.16)',
    accentDarker: 'rgba(14, 165, 233, 0.7)',
    weekend: '#e8954a',
    holiday: '#f97316',
    holidayBg: 'rgba(249, 115, 22, 0.12)',
    cellBg: '#ffffff',
    cellMutedBg: '#eef3f8',
    allDayBg: '#f6f8fb',
    taskBg: '#ffffff',
    taskBorder: 'rgba(15, 23, 42, 0.12)',
    danger: '#b42318',
  },
  borders: {} as Record<string, string>,
};

const darkTheme: ThemeBase = {
  ...base,
  colors: {
    ink: '#e6edf3',
    inkMuted: 'rgba(230, 237, 243, 0.45)',
    inkLight: 'rgba(230, 237, 243, 0.7)',
    paperLight: '#0d1117',
    paper: '#151b23',
    paperDark: '#1b2330',
    line: 'rgba(255, 255, 255, 0.06)',
    accent: '#22d3ee',
    accentLight: 'rgba(34, 211, 238, 0.18)',
    accentDark: 'rgba(34, 211, 238, 0.35)',
    accentBg: 'rgba(34, 211, 238, 0.22)',
    accentDarker: 'rgba(34, 211, 238, 0.7)',
    weekend: '#e8954a',
    holiday: '#f59e0b',
    holidayBg: 'rgba(245, 158, 11, 0.12)',
    cellBg: '#111822',
    cellMutedBg: '#16202c',
    allDayBg: '#192330',
    taskBg: '#1c2735',
    taskBorder: 'rgba(255, 255, 255, 0.08)',
    danger: '#f97066',
  },
  borders: {} as Record<string, string>,
};

function attachBorders(theme: ThemeBase) {
  return {
    ...theme,
    borders: {
      default: border(theme.colors.line),
      accent: border(theme.colors.accent),
      danger: border(theme.colors.danger),
      focus: border(theme.colors.accentDarker, 2),
    },
  };
}

export const themes: Record<'light' | 'dark', ThemeBase> = {
  light: attachBorders(lightTheme),
  dark: attachBorders(darkTheme),
};

export type AppTheme = ThemeBase;
