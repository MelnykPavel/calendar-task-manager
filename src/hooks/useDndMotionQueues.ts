import { useCallback, useEffect, useRef } from 'react';

import { useDndStore } from '@/src/lib/store/dnd.store';
import {
  autoScrollTarget,
  toDropIdFromBucketKey,
} from '@/src/components/dnd/dnd-provider.helpers';

type PreviewPayload = {
  taskId: string;
  toBucketKey: string;
  toIndex: number;
};

export function useDndMotionQueues() {
  const scrollRafRef = useRef<number | null>(null);
  const scrollDropIdRef = useRef<string | null>(null);
  const scrollPointerYRef = useRef<number | null>(null);
  const previewRafRef = useRef<number | null>(null);
  const previewPayloadRef = useRef<PreviewPayload | null>(null);

  const flushAutoScroll = useCallback(() => {
    scrollRafRef.current = null;
    const dropId = scrollDropIdRef.current;
    const pointerY = scrollPointerYRef.current;
    if (!dropId || pointerY === null) return;
    autoScrollTarget(dropId, pointerY);
  }, []);

  const queueAutoScroll = useCallback(
    (toBucketKey: string, pointerY: number) => {
      scrollDropIdRef.current = toDropIdFromBucketKey(toBucketKey);
      scrollPointerYRef.current = pointerY;
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = window.requestAnimationFrame(flushAutoScroll);
    },
    [flushAutoScroll],
  );

  const flushPreviewMove = useCallback(() => {
    previewRafRef.current = null;
    const payload = previewPayloadRef.current;
    if (!payload) return;
    useDndStore.getState().dndActions.previewMove(payload);
  }, []);

  const queuePreviewMove = useCallback(
    (payload: PreviewPayload) => {
      const queued = previewPayloadRef.current;
      if (
        queued &&
        queued.taskId === payload.taskId &&
        queued.toBucketKey === payload.toBucketKey &&
        queued.toIndex === payload.toIndex
      ) {
        return;
      }

      previewPayloadRef.current = payload;
      if (previewRafRef.current !== null) return;
      previewRafRef.current = window.requestAnimationFrame(flushPreviewMove);
    },
    [flushPreviewMove],
  );

  const flushPreviewNow = useCallback(() => {
    if (previewRafRef.current !== null) {
      window.cancelAnimationFrame(previewRafRef.current);
      previewRafRef.current = null;
    }

    const payload = previewPayloadRef.current;
    if (!payload) return;
    useDndStore.getState().dndActions.previewMove(payload);
  }, []);

  const resetQueues = useCallback(() => {
    scrollDropIdRef.current = null;
    scrollPointerYRef.current = null;
    previewPayloadRef.current = null;
    if (scrollRafRef.current !== null) {
      window.cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
    if (previewRafRef.current !== null) {
      window.cancelAnimationFrame(previewRafRef.current);
      previewRafRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      if (scrollRafRef.current !== null)
        window.cancelAnimationFrame(scrollRafRef.current);
      if (previewRafRef.current !== null)
        window.cancelAnimationFrame(previewRafRef.current);
    },
    [],
  );

  return { queueAutoScroll, queuePreviewMove, flushPreviewNow, resetQueues };
}
