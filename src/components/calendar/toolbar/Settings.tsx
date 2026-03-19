'use client';

import { css, useTheme } from '@emotion/react';
import { Settings2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useAppStore } from '@/src/lib/store/app.store';
import { useClickOutside } from '@/src/hooks/useClickOutside';
import { countryCodeOptions } from './settings.constants';

const styles = {
  settingsContainer: css({ position: 'relative', zIndex: 20 }),
  settingsButton: css({
    height: 38,
    width: 38,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    border: 'var(--border-default)',
    background: 'var(--color-paper-dark)',
    color: 'var(--color-ink)',
    cursor: 'pointer',
  }),
  settingsPopover: css({
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: 280,
    zIndex: 50,
    borderRadius: 'var(--radii-lg)',
    background: 'var(--color-paper)',
    border: 'var(--border-default)',
    boxShadow: 'var(--shadow-popover)',
    padding: 16,
    display: 'grid',
    gap: 14,
  }),
  settingsTitle: css({
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 15,
    margin: 0,
  }),
  settingsSection: css({
    display: 'grid',
    gap: 10,
    paddingTop: 12,
    borderTop: 'var(--border-default)',
  }),
  settingHeader: css({
    display: 'grid',
    gap: 2,
  }),
  settingTitle: css({ fontSize: 12, fontWeight: 700 }),
  settingSubtitle: css({ fontSize: 11, color: 'var(--color-ink-muted)' }),
  themeButtonGroup: css({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
  }),
  themeButton: css({
    height: 30,
    borderRadius: '999px',
    border: 'var(--border-default)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    background: 'var(--color-paper-dark)',
    color: 'var(--color-ink)',
  }),
  themeButtonActive: css({
    background: 'var(--color-accent)',
    borderColor: 'var(--color-accent)',
    color: '#ffffff',
  }),
  countrySelect: css({
    height: 34,
    padding: '0 12px',
    borderRadius: '999px',
    border: 'var(--border-default)',
    cursor: 'pointer',
    fontSize: 12,
    color: 'var(--color-ink)',
    background: 'var(--color-paper-dark)',
  }),
};

export default function Settings() {
  const theme = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { countryCode, setCountryCode, setThemeMode, themeMode } = useAppStore(
    useShallow((state) => ({
      countryCode: state.countryCode,
      setCountryCode: state.calendarActions.setCountryCode,
      setThemeMode: state.uiActions.setThemeMode,
      themeMode: state.themeMode,
    })),
  );

  const themeVars = useMemo(
    () => ({
      ['--radii-lg' as string]: theme.radii.lg,
      ['--border-default' as string]: theme.borders.default,
      ['--color-paper' as string]: theme.colors.paper,
      ['--color-paper-dark' as string]: theme.colors.paperDark,
      ['--color-ink' as string]: theme.colors.ink,
      ['--color-ink-muted' as string]: theme.colors.inkMuted,
      ['--color-accent' as string]: theme.colors.accent,
      ['--font-display' as string]: theme.font.display,
      ['--shadow-popover' as string]: theme.shadows.popover,
    }),
    [
      theme.borders.default,
      theme.colors.accent,
      theme.colors.ink,
      theme.colors.inkMuted,
      theme.colors.paper,
      theme.colors.paperDark,
      theme.font.display,
      theme.radii.lg,
      theme.shadows.popover,
    ],
  );

  useClickOutside(settingsOpen, settingsRef, () => setSettingsOpen(false));

  return (
    <div css={styles.settingsContainer} ref={settingsRef} style={themeVars}>
      <button
        type="button"
        onClick={() => setSettingsOpen((value) => !value)}
        css={styles.settingsButton}
        aria-label="Settings"
        aria-expanded={settingsOpen}
      >
        <Settings2 size={16} />
      </button>

      {settingsOpen && (
        <div css={styles.settingsPopover}>
          <h3 css={styles.settingsTitle}>Display Settings</h3>

          <div css={styles.settingsSection}>
            <div css={styles.settingHeader}>
              <div css={styles.settingTitle}>Theme</div>
              <div css={styles.settingSubtitle}>
                Match the calendar chrome and surfaces.
              </div>
            </div>

            <div css={styles.themeButtonGroup}>
              {(['light', 'dark'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setThemeMode(mode)}
                  css={[
                    styles.themeButton,
                    themeMode === mode && styles.themeButtonActive,
                  ]}
                >
                  {mode === 'light' ? 'Light' : 'Dark'}
                </button>
              ))}
            </div>
          </div>

          <div css={styles.settingsSection}>
            <div css={styles.settingHeader}>
              <div css={styles.settingTitle}>Country</div>
              <div css={styles.settingSubtitle}>
                Choose the holiday calendar used across all views.
              </div>
            </div>

            <select
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              css={styles.countrySelect}
              aria-label="Country"
            >
              {countryCodeOptions.map((countryCodeOption) => (
                <option key={countryCodeOption} value={countryCodeOption}>
                  {countryCodeOption}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
