import { css } from '@emotion/react';
import { sanitizeDots } from '../../editor/TaskDotsPicker';

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    minHeight: 8,
  }),
  dot: css({
    width: 18,
    height: 4,
    borderRadius: 999,
    display: 'inline-block',
    flexShrink: 0,
  }),
};

export default function TaskDots({ dots }: { dots?: string[] }) {
  const normalized = sanitizeDots(dots);
  if (normalized.length === 0) return null;

  return (
    <div css={styles.container}>
      {normalized.map((color) => (
        <span key={color} css={styles.dot} style={{ background: color }} />
      ))}
    </div>
  );
}
