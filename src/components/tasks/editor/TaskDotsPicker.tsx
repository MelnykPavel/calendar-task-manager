'use client';

import { css, useTheme } from '@emotion/react';
import { Pipette } from 'lucide-react';
import { useMemo } from 'react';

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  }),
  dotButton: css({
    width: 22,
    height: 22,
    borderRadius: 7,
    border: '1px solid transparent',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'transform 100ms ease, box-shadow 100ms ease',
    ':hover': { transform: 'translateY(-1px)' },
  }),
  dotActive: css({
    boxShadow:
      '0 0 0 2px var(--dot-surface), 0 0 0 4px var(--dot-ring), inset 0 0 0 1px rgba(255, 255, 255, 0.65)',
  }),
  pickerWrapper: css({
    position: 'relative',
    width: 22,
    height: 22,
    flexShrink: 0,
  }),
  pickerButton: css({
    width: 22,
    height: 22,
    borderRadius: 7,
    border: '1px solid var(--picker-border)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--picker-bg)',
    color: 'var(--picker-icon)',
  }),
  hiddenInput: css({
    position: 'absolute',
    inset: 0,
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    padding: 0,
    border: 'none',
  }),
  disabled: css({
    cursor: 'default',
    opacity: 0.78,
    pointerEvents: 'none',
  }),
};

export const DOT_PRESET_COLORS = [
  '#6257d4',
  '#3bb89a',
  '#5ba3d4',
  '#e8954a',
  '#e05c5c',
] as const;

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidDotColor(color: string): boolean {
  return HEX_RE.test(color);
}

export function sanitizeDots(input?: string[]): string[] {
  if (!input || input.length === 0) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of input) {
    if (isValidDotColor(item) && !seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }

  return result.slice(0, 5);
}

export default function TaskDotsPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string[];
  onChange: (dots: string[]) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const presetColors = DOT_PRESET_COLORS as readonly string[];

  const themeVars = useMemo(
    () => ({
      ['--picker-border' as string]: theme.colors.taskBorder,
      ['--picker-bg' as string]: theme.colors.paperDark,
      ['--picker-icon' as string]: theme.colors.inkMuted,
      ['--dot-surface' as string]: theme.colors.paper,
    }),
    [
      theme.colors.inkMuted,
      theme.colors.paper,
      theme.colors.paperDark,
      theme.colors.taskBorder,
    ],
  );

  const customColors = value.filter(
    (color) => !presetColors.includes(color),
  );
  const activeCustomColor = customColors.at(-1);
  const normalizedValue = sanitizeDots([
    ...value.filter((color) => presetColors.includes(color)),
    ...(activeCustomColor ? [activeCustomColor] : []),
  ]);

  function toggle(color: string) {
    if (disabled) return;
    if (normalizedValue.includes(color)) {
      onChange(normalizedValue.filter((current) => current !== color));
    } else if (normalizedValue.length < 5) {
      onChange(sanitizeDots([...normalizedValue, color]));
    }
  }

  function onCustomColor(event: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return;
    const color = event.target.value;
    if (!isValidDotColor(color)) return;

    if (presetColors.includes(color)) {
      toggle(color);
      return;
    }

    const presetSelection = normalizedValue.filter((item) =>
      presetColors.includes(item),
    );
    if (!activeCustomColor && presetSelection.length >= 5) return;

    onChange(sanitizeDots([...presetSelection, color]));
  }

  const renderColorButton = (color: string) => {
    const active = normalizedValue.includes(color);
    return (
      <button
        key={color}
        type="button"
        css={[styles.dotButton, active && styles.dotActive]}
        style={{
          background: color,
          ['--dot-ring' as string]: color,
        }}
        onClick={() => toggle(color)}
        aria-pressed={active}
        aria-label={`Toggle color ${color}`}
      />
    );
  };

  return (
    <div css={styles.root} style={themeVars}>
      {DOT_PRESET_COLORS.map(renderColorButton)}
      {activeCustomColor ? renderColorButton(activeCustomColor) : null}

      <div css={styles.pickerWrapper}>
        <div css={[styles.pickerButton, disabled && styles.disabled]}>
          <Pipette size={10} />
        </div>
        <input
          type="color"
          css={[styles.hiddenInput, disabled && styles.disabled]}
          value={activeCustomColor ?? DOT_PRESET_COLORS[0]}
          onChange={onCustomColor}
          title="Custom color"
          aria-label="Pick custom color"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
