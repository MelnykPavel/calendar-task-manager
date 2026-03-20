import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from '@/src/lib/api/tasks.client';
import type { Task } from '@/src/types/task';

import { bucketKey } from '../utils/bucket';
import { removeFromArray, insertIntoArray } from '../utils/task-order';
import type { TasksSlice } from '../types/tasks.types';
import type { Slice } from '../types/app.types';
import type { TaskId, Bucket } from '../types/common';
import { HttpError } from '../../api/http';

export const createTasksSlice: Slice<TasksSlice> = (set, get) => ({
  entities: {},
  orderByBucket: {},
  bucketByTaskId: {},
  bucketRev: {},
  tasksRev: 0,
  hydratedRange: null,
  tasksRequest: { loading: false, error: null, inflightId: 0 },

  taskActions: {
    hydrateRange: async ({ from, to, signal }) => {
      const nextInflight = get().tasksRequest.inflightId + 1;
      set({
        tasksRequest: { loading: true, error: null, inflightId: nextInflight },
        hydratedRange: { from, to },
      });

      try {
        const tasks = await listTasks({ from, to }, signal);
        if (get().tasksRequest.inflightId !== nextInflight) return;

        const entities: Record<TaskId, Task> = {};
        const orderByBucket: Record<string, TaskId[]> = {};
        const bucketByTaskId: Record<TaskId, string> = {};
        const bucketRev: Record<string, number> = {};

        for (const t of tasks) {
          entities[t.id] = t;
          const k = bucketKey(t.day, t.bucket as Bucket);
          (orderByBucket[k] ??= []).push(t.id);
          bucketByTaskId[t.id] = k;
        }

        for (const k of Object.keys(orderByBucket)) {
          orderByBucket[k].sort(
            (a, b) => (entities[a]?.order ?? 0) - (entities[b]?.order ?? 0),
          );
          bucketRev[k] = 1;
        }

        set((s) => {
          const pendingTemps: Record<TaskId, Task> = {};
          const pendingTempBuckets: Record<TaskId, string> = {};

          for (const id of Object.keys(s.entities) as TaskId[]) {
            if ((id as string).startsWith('temp_')) {
              pendingTemps[id] = s.entities[id]!;
              const bk = s.bucketByTaskId[id];
              if (bk) pendingTempBuckets[id] = bk;
            }
          }

          const mergedEntities = { ...entities, ...pendingTemps };
          const mergedBucketByTaskId = {
            ...bucketByTaskId,
            ...pendingTempBuckets,
          };

          const mergedOrderByBucket = { ...orderByBucket };
          for (const [tempId, bk] of Object.entries(pendingTempBuckets)) {
            const bucket = mergedOrderByBucket[bk] ?? [];
            if (!bucket.includes(tempId as TaskId)) {
              mergedOrderByBucket[bk] = [...bucket, tempId as TaskId];
            }
          }

          return {
            entities: mergedEntities,
            orderByBucket: mergedOrderByBucket,
            bucketByTaskId: mergedBucketByTaskId,
            bucketRev,
            tasksRev: s.tasksRev + 1,
            tasksRequest: {
              loading: false,
              error: null,
              inflightId: nextInflight,
            },
          };
        });
      } catch (err) {
        if (err instanceof HttpError && err.code === 'ABORTED') {
          set((s) => ({ tasksRequest: { ...s.tasksRequest, loading: false } }));
          return;
        }

        set((s) => ({
          tasksRequest: {
            ...s.tasksRequest,
            loading: false,
            error: (err as Error).message ?? 'Failed to load tasks',
          },
        }));
      }
    },

    create: async ({ day, title, dots, allDay, timeMinutes }) => {
      const normalizedMinutes = allDay ? 0 : timeMinutes;
      const bucket = (
        allDay ? 'allDay' : `hour:${Math.floor(normalizedMinutes / 60)}`
      ) as Bucket;
      const k = bucketKey(day, bucket);

      const tempId = `temp_${Date.now()}` as TaskId;
      const tempTask: Task = {
        id: tempId,
        day,
        title,
        dots: dots ?? [],
        allDay,
        timeMinutes: normalizedMinutes,
        bucket,
        order: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((s) => {
        const ids = [...(s.orderByBucket[k] ?? []), tempId];
        return {
          entities: { ...s.entities, [tempId]: tempTask },
          orderByBucket: { ...s.orderByBucket, [k]: ids },
          bucketByTaskId: { ...s.bucketByTaskId, [tempId]: k },
          bucketRev: { ...s.bucketRev, [k]: (s.bucketRev[k] ?? 0) + 1 },
          tasksRev: s.tasksRev + 1,
        };
      });

      try {
        const created = await createTask({
          day,
          title,
          dots,
          allDay,
          timeMinutes: normalizedMinutes,
        });

        set((s) => {
          const realK = bucketKey(created.day, created.bucket as Bucket);

          const entities = { ...s.entities, [created.id]: created };
          delete entities[tempId];

          const bucketByTaskId = { ...s.bucketByTaskId, [created.id]: realK };
          delete bucketByTaskId[tempId];

          const withoutTemp = removeFromArray(
            s.orderByBucket[realK] ?? [],
            tempId,
          );
          const ids = [...withoutTemp, created.id];
          ids.sort(
            (a, b) => (entities[a]?.order ?? 0) - (entities[b]?.order ?? 0),
          );

          return {
            entities,
            orderByBucket: { ...s.orderByBucket, [realK]: ids },
            bucketByTaskId,
            bucketRev: {
              ...s.bucketRev,
              [realK]: (s.bucketRev[realK] ?? 0) + 1,
            },
            tasksRev: s.tasksRev + 1,
          };
        });

        return created;
      } catch (err) {
        set((s) => {
          const entities = { ...s.entities };
          delete entities[tempId];

          const bucketByTaskId = { ...s.bucketByTaskId };
          delete bucketByTaskId[tempId];

          return {
            entities,
            orderByBucket: {
              ...s.orderByBucket,
              [k]: removeFromArray(s.orderByBucket[k] ?? [], tempId),
            },
            bucketByTaskId,
            bucketRev: { ...s.bucketRev, [k]: (s.bucketRev[k] ?? 0) + 1 },
            tasksRev: s.tasksRev + 1,
          };
        });

        throw err;
      }
    },

    update: async (id, patch) => {
      try {
        const updated = await updateTask(id, patch);

        set((s) => {
          if (!s.entities[id] && !s.bucketByTaskId[id]) return s;

          const prev = s.entities[id];
          const prevKey = prev
            ? bucketKey(prev.day, prev.bucket as Bucket)
            : s.bucketByTaskId[id];
          const nextKey = bucketKey(updated.day, updated.bucket as Bucket);

          const entities = { ...s.entities, [id]: updated };
          const orderByBucket = { ...s.orderByBucket };
          const bucketByTaskId = { ...s.bucketByTaskId };
          const bucketRev = { ...s.bucketRev };

          if (prevKey && prevKey !== nextKey) {
            orderByBucket[prevKey] = removeFromArray(
              orderByBucket[prevKey] ?? [],
              id,
            );
            bucketRev[prevKey] = (bucketRev[prevKey] ?? 0) + 1;
          }

          const nextIds = [...(orderByBucket[nextKey] ?? [])];
          if (!nextIds.includes(id)) nextIds.push(id);
          nextIds.sort(
            (a, b) => (entities[a]?.order ?? 0) - (entities[b]?.order ?? 0),
          );
          orderByBucket[nextKey] = nextIds;
          bucketByTaskId[id] = nextKey;
          bucketRev[nextKey] = (bucketRev[nextKey] ?? 0) + 1;

          return {
            entities,
            orderByBucket,
            bucketByTaskId,
            bucketRev,
            tasksRev: s.tasksRev + 1,
          };
        });

        return updated;
      } catch (err) {
        set((s) => ({
          tasksRequest: {
            ...s.tasksRequest,
            error: (err as Error).message ?? 'Failed to update task',
          },
        }));
        throw err;
      }
    },

    remove: async (id) => {
      try {
        await deleteTask(id);
      } catch (err) {
        set((s) => ({
          tasksRequest: {
            ...s.tasksRequest,
            error: (err as Error).message ?? 'Failed to delete task',
          },
        }));
        throw err;
      }

      set((s) => {
        const prev = s.entities[id];
        const prevKey = prev
          ? bucketKey(prev.day, prev.bucket as Bucket)
          : s.bucketByTaskId[id];
        if (!prevKey) return s;

        const entities = { ...s.entities };
        delete entities[id];

        const bucketByTaskId = { ...s.bucketByTaskId };
        delete bucketByTaskId[id];

        return {
          entities,
          bucketByTaskId,
          orderByBucket: {
            ...s.orderByBucket,
            [prevKey]: removeFromArray(s.orderByBucket[prevKey] ?? [], id),
          },
          bucketRev: {
            ...s.bucketRev,
            [prevKey]: (s.bucketRev[prevKey] ?? 0) + 1,
          },
          tasksRev: s.tasksRev + 1,
        };
      });
    },

    _applyMove: (moved, fromBucketKey, toBucketKey, toIndex) => {
      set((s) => {
        const entities = {
          ...s.entities,
          [moved.id]: { ...s.entities[moved.id], ...moved },
        };

        const orderByBucket = { ...s.orderByBucket };

        if (fromBucketKey !== toBucketKey) {
          orderByBucket[fromBucketKey] = removeFromArray(
            orderByBucket[fromBucketKey] ?? [],
            moved.id,
          );
        }

        const base = removeFromArray(
          orderByBucket[toBucketKey] ?? [],
          moved.id,
        );
        orderByBucket[toBucketKey] = insertIntoArray(
          base,
          moved.id,
          Math.min(toIndex, base.length),
        );

        const bucketByTaskId = { ...s.bucketByTaskId, [moved.id]: toBucketKey };

        const bucketRev = { ...s.bucketRev };
        bucketRev[toBucketKey] = (bucketRev[toBucketKey] ?? 0) + 1;
        if (fromBucketKey !== toBucketKey) {
          bucketRev[fromBucketKey] = (bucketRev[fromBucketKey] ?? 0) + 1;
        }

        return {
          entities,
          orderByBucket,
          bucketByTaskId,
          bucketRev,
          tasksRev: s.tasksRev + 1,
        };
      });
    },
  },
});
