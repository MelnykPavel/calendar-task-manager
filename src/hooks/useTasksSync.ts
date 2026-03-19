'use client';

import { useAppStore } from '@/src/lib/store/app.store';
import { useEffect } from 'react';

const selectHydrateRange = (state: ReturnType<typeof useAppStore.getState>) =>
  state.taskActions.hydrateRange;

export function useTasksSync(input: { from: string; to: string }) {
  const hydrateRange = useAppStore(selectHydrateRange);

  useEffect(() => {
    const controller = new AbortController();
    void hydrateRange({
      from: input.from,
      to: input.to,
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [hydrateRange, input.from, input.to]);
}
