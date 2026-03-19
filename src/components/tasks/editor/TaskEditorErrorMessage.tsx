'use client';

import { css, useTheme } from '@emotion/react';
import { useMemo } from 'react';

const styles = {
  errorMessage: css({
    fontSize: 11,
    color: 'var(--color-danger)',
  }),
};

export default function TaskEditorErrorMessage({
  message,
}: {
  message?: string | null;
}) {
  const theme = useTheme();

  const themeVars = useMemo(
    () => ({ ['--color-danger' as string]: theme.colors.danger }),
    [theme.colors.danger],
  );

  if (!message) return null;

  return (
    <div css={styles.errorMessage} style={themeVars}>
      {message}
    </div>
  );
}
