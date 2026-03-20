'use client';

import { memo } from 'react';

import { useNowMinutes } from '@/src/hooks/useNowMinutes';
import { taskHourCellStyles as styles } from '@/src/components/tasks/cell/task-hour-cell.styles';

function NowLine({ hour }: { hour: number }) {
  const nowMinutes = useNowMinutes();
  if (Math.floor(nowMinutes / 60) !== hour) return null;

  const top = `${((nowMinutes % 60) / 60) * 100}%`;
  return <div css={styles.nowLine} style={{ top }} />;
}

export default memo(NowLine);
