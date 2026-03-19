import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import { useAppStore } from '@/src/lib/store/app.store';
import { useDndStore } from '@/src/lib/store/dnd.store';
import {
  selectDayTasks,
  type DayTasks,
} from '@/src/lib/store/selectors/tasks.selectors';
import { applyDndOverlay } from '@/src/lib/store/utils/apply-dnd-overlay';

export function useDayTasks(dayKey: string): DayTasks {
  const base = useAppStore(selectDayTasks(dayKey));

  const { pending, snapshot } = useDndStore(
    useShallow((s) => ({ pending: s.pending, snapshot: s.snapshot })),
  );

  return useMemo(
    () => applyDndOverlay(base, pending, snapshot),
    [base, pending, snapshot],
  );
}
