import { create } from 'zustand';
import { moveTask } from '@/src/lib/api/tasks.client';
import type { Task } from '@/src/types/task';
import { useAppStore } from './app.store';
import type { TaskId, Bucket } from './types/common';
import type { DndSnapshot, DndPending } from './types/dnd.types';
import { parseBucketKey, normalizeTimeForBucket } from './utils/bucket';
import { removeFromArray, insertIntoArray } from './utils/task-order';

type DndState = {
  activeTask: Task | null;
  touchDragging: boolean;
  overlayWidth: number;
  snapshot: DndSnapshot | null;
  pending: DndPending | null;
  commitVersion: number;
};

type DndStore = DndState & {
  dndActions: {
    startDrag: (taskId: TaskId, width: number, isTouch: boolean) => void;
    previewMove: (input: {
      taskId: TaskId;
      toBucketKey: string;
      toIndex: number;
    }) => void;
    commitMove: () => Promise<void>;
    rollback: () => void;
    _clear: () => void;
  };
};

const INITIAL: DndState = {
  activeTask: null,
  touchDragging: false,
  overlayWidth: 200,
  snapshot: null,
  pending: null,
  commitVersion: 0,
};

export const useDndStore = create<DndStore>()((set, get) => ({
  ...INITIAL,

  dndActions: {
    startDrag: (taskId, width, isTouch) => {
      const appState = useAppStore.getState();

      set({
        activeTask: appState.entities[taskId] ?? null,
        touchDragging: isTouch,
        overlayWidth: width,
        snapshot: {
          entities: appState.entities,
          orderByBucket: appState.orderByBucket,
          bucketByTaskId: appState.bucketByTaskId,
        },
        pending: null,
        commitVersion: get().commitVersion + 1,
      });
    },

    previewMove: ({ taskId, toBucketKey, toIndex }) => {
      set((s) => {
        const { snapshot, pending } = s;
        if (!snapshot) return s;

        if (
          pending?.taskId === taskId &&
          pending?.toBucketKey === toBucketKey &&
          pending?.toIndex === toIndex
        ) {
          return s;
        }

        const fromBucketKey = snapshot.bucketByTaskId[taskId];
        if (!fromBucketKey) return s;

        const fromIndex = (snapshot.orderByBucket[fromBucketKey] ?? []).indexOf(
          taskId,
        );

        const { day: toDay, bucket: toBucket } = parseBucketKey(toBucketKey);

        const baseOrder = snapshot.orderByBucket[toBucketKey] ?? [];
        const withoutTask =
          fromBucketKey === toBucketKey
            ? removeFromArray(baseOrder, taskId)
            : [...baseOrder];
        let resolved = Number.isFinite(toIndex) ? toIndex : withoutTask.length;

        if (
          fromBucketKey === toBucketKey &&
          Number.isFinite(toIndex) &&
          fromIndex !== -1 &&
          toIndex > fromIndex
        ) {
          resolved -= 1;
        }

        if (resolved < 0) resolved = 0;
        const nextIds = insertIntoArray(withoutTask, taskId, resolved);
        const pos = nextIds.indexOf(taskId);
        const beforeId = pos > 0 ? (nextIds[pos - 1] ?? null) : null;
        const afterId =
          pos < nextIds.length - 1 ? (nextIds[pos + 1] ?? null) : null;

        return {
          ...s,
          pending: {
            taskId,
            fromBucketKey,
            toBucketKey,
            toIndex: resolved,
            toDay,
            toBucket: toBucket as Bucket,
            beforeId,
            afterId,
          },
        };
      });
    },

    commitMove: async () => {
      const { pending, snapshot, commitVersion } = get();
      if (!pending) {
        get().dndActions._clear();
        return;
      }

      const {
        taskId,
        toDay,
        toBucket,
        toBucketKey,
        fromBucketKey,
        toIndex,
        beforeId,
        afterId,
      } = pending;

      const appStore = useAppStore;
      const currentTask = appStore.getState().entities[taskId];

      if (currentTask) {
        const normalized = normalizeTimeForBucket(currentTask, toBucket);
        const optimisticTask: Task = {
          ...currentTask,
          day: toDay,
          ...normalized,
        };
        appStore
          .getState()
          .taskActions._applyMove(
            optimisticTask,
            fromBucketKey,
            toBucketKey,
            toIndex,
          );
      }

      get().dndActions._clear();

      const originalIndex =
        snapshot?.orderByBucket[fromBucketKey]?.indexOf(taskId) ?? -1;

      const noChange =
        fromBucketKey === toBucketKey && originalIndex === toIndex;
      if (noChange) {
        if (currentTask) {
          appStore
            .getState()
            .taskActions._applyMove(
              currentTask,
              toBucketKey,
              fromBucketKey,
              originalIndex,
            );
        }
        return;
      }

      try {
        const moved = await moveTask(taskId, {
          toDay,
          toBucket,
          beforeId,
          afterId,
        });

        if (get().commitVersion !== commitVersion) return;

        appStore
          .getState()
          .taskActions._applyMove(moved, toBucketKey, toBucketKey, toIndex);
      } catch (err) {
        if (get().commitVersion !== commitVersion) return;

        if (snapshot && currentTask) {
          const originalIdx =
            snapshot.orderByBucket[fromBucketKey]?.indexOf(taskId) ?? 0;
          appStore
            .getState()
            .taskActions._applyMove(
              currentTask,
              toBucketKey,
              fromBucketKey,
              originalIdx,
            );
        }

        appStore.setState((s) => ({
          tasksRequest: {
            ...s.tasksRequest,
            error: (err as Error).message ?? 'Failed to move task',
          },
        }));
      }
    },

    rollback: () => get().dndActions._clear(),
    _clear: () => set((s) => ({ ...INITIAL, commitVersion: s.commitVersion })),
  },
}));
