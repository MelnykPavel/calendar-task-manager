import type { Collection, Db } from 'mongodb';

import { getDb } from '../../db/client';
import { COLLECTIONS } from '../../db/collections';
import { ensureDbIndexes } from '../../db/indexes';
import { ApiError } from '../../utils/api-error';
import { toObjectId } from '../../utils/id';
import type {
  CreateTaskBody,
  ListTasksQuery,
  MoveTaskBody,
  Task,
  TaskDoc,
  TaskDocDb,
  UpdateTaskBody,
} from './tasks.types';

const ORDER_STEP = 1024;

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hourFromBucket(bucket: string): number | null {
  if (bucket === 'allDay') return null;
  const m = /^hour:(\d|1\d|2[0-3])$/.exec(bucket);
  if (!m) return null;
  return Number(m[1]);
}

function bucketFrom(allDay: boolean, timeMinutes: number): string {
  if (allDay) return 'allDay';
  const hour = Math.floor(timeMinutes / 60);
  return `hour:${hour}`;
}

function mapTask(doc: TaskDoc): Task {
  if (!doc._id) throw new Error('Task document missing _id');
  return {
    id: doc._id.toHexString(),
    day: doc.day,
    bucket: doc.bucket,
    title: doc.title,
    order: doc.order,
    dots: doc.dots ?? [],
    allDay: doc.allDay ?? true,
    timeMinutes: doc.timeMinutes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function tasksCollection(db?: Db): Promise<Collection<TaskDocDb>> {
  const resolvedDb = db ?? (await getDb());
  await ensureDbIndexes(resolvedDb);
  return resolvedDb.collection<TaskDocDb>(COLLECTIONS.tasks);
}

async function nextOrderForBucket(
  day: string,
  bucket: string,
  collection: Collection<TaskDocDb>,
): Promise<number> {
  const last = await collection
    .find({ day, bucket })
    .project({ order: 1 })
    .sort({ order: -1, _id: -1 })
    .limit(1)
    .next();
  const prev = last?.order ?? 0;
  return prev + ORDER_STEP;
}

export async function createTask(input: CreateTaskBody): Promise<Task> {
  const collection = await tasksCollection();
  const now = new Date();

  const allDay = input.allDay ?? true;
  const timeMinutes = allDay ? 0 : input.timeMinutes;
  const bucket = bucketFrom(allDay, timeMinutes);
  const order = await nextOrderForBucket(input.day, bucket, collection);

  const doc: Omit<TaskDocDb, '_id'> = {
    day: input.day,
    bucket,
    title: input.title,
    order,
    dots: input.dots ?? [],
    allDay,
    timeMinutes,
    createdAt: now,
    updatedAt: now,
  };

  const res = await collection.insertOne(doc);
  return mapTask({ ...doc, _id: res.insertedId } as TaskDoc);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const collection = await tasksCollection();
  const doc = await collection.findOne({ _id: toObjectId(id) });
  return doc ? mapTask(doc as TaskDoc) : null;
}

export async function listTasks(input: ListTasksQuery): Promise<Task[]> {
  const collection = await tasksCollection();

  const filter: Record<string, unknown> = {
    day: { $gte: input.from, $lte: input.to },
  };

  const search = input.search?.trim();
  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: 'i' };
  }

  const docs = await collection
    .find(filter)
    .sort({ day: 1, bucket: 1, order: 1, _id: 1 })
    .toArray();
  return docs.map((d) => mapTask(d as TaskDoc));
}

export async function updateTask(id: string, patch: UpdateTaskBody): Promise<Task | null> {
  const collection = await tasksCollection();
  const existing = await collection.findOne({ _id: toObjectId(id) });
  if (!existing) return null;

  const now = new Date();

  const prevAllDay = existing.allDay ?? true;
  const prevTimeMinutes = existing.timeMinutes;
  const prevBucket = existing.bucket;

  const nextDay = patch.day ?? existing.day;
  const nextTitle = patch.title ?? existing.title;
  const nextDots = patch.dots ?? existing.dots ?? [];

  const nextAllDay = patch.allDay ?? prevAllDay;
  let nextTimeMinutes = patch.timeMinutes ?? prevTimeMinutes;
  if (nextAllDay) nextTimeMinutes = 0;
  const nextBucket = bucketFrom(nextAllDay, nextTimeMinutes);

  const moved = nextDay !== existing.day || nextBucket !== prevBucket;
  const nextOrder = moved
    ? await nextOrderForBucket(nextDay, nextBucket, collection)
    : existing.order;

  const $set: Partial<TaskDocDb> = {
    day: nextDay,
    bucket: nextBucket,
    title: nextTitle,
    dots: nextDots,
    allDay: nextAllDay,
    timeMinutes: nextTimeMinutes,
    ...(moved ? { order: nextOrder } : {}),
    updatedAt: now,
  };

  const doc = await collection.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set },
    { returnDocument: 'after' },
  );

  return doc ? mapTask(doc as TaskDoc) : null;
}

export async function deleteTask(id: string): Promise<boolean> {
  const collection = await tasksCollection();
  const res = await collection.deleteOne({ _id: toObjectId(id) });
  return res.deletedCount === 1;
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === 11000
  );
}

async function rebalanceBucket(
  day: string,
  bucket: string,
  collection: Collection<TaskDocDb>,
): Promise<void> {
  const docs = await collection
    .find({ day, bucket })
    .project({ _id: 1 })
    .sort({ order: 1, _id: 1 })
    .toArray();

  const ids = docs.map((d) => d._id).filter(Boolean);
  if (ids.length === 0) return;

  const now = new Date();
  await collection.bulkWrite(
    ids.map((oid, i) => ({
      updateOne: {
        filter: { _id: oid },
        update: { $set: { order: (i + 1) * ORDER_STEP, updatedAt: now } },
      },
    })),
    { ordered: true },
  );
}

export async function moveTask(id: string, input: MoveTaskBody): Promise<Task | null> {
  const collection = await tasksCollection();
  const taskObjectId = toObjectId(id);

  const current = await collection.findOne({ _id: taskObjectId });
  if (!current) return null;

  const toDay = input.toDay;
  const toBucket = input.toBucket;

  const beforeObjectId = input.beforeId ? toObjectId(input.beforeId) : null;
  const afterObjectId = input.afterId ? toObjectId(input.afterId) : null;

  if (beforeObjectId && beforeObjectId.equals(taskObjectId)) {
    throw new ApiError({
      code: 'INVALID_MOVE',
      message: 'beforeId cannot be the moved task',
      status: 400,
    });
  }
  if (afterObjectId && afterObjectId.equals(taskObjectId)) {
    throw new ApiError({
      code: 'INVALID_MOVE',
      message: 'afterId cannot be the moved task',
      status: 400,
    });
  }

  let beforeDoc = beforeObjectId
    ? await collection.findOne({ _id: beforeObjectId })
    : null;
  let afterDoc = afterObjectId ? await collection.findOne({ _id: afterObjectId }) : null;

  if (beforeObjectId && !beforeDoc) {
    throw new ApiError({
      code: 'INVALID_MOVE',
      message: 'beforeId task not found',
      status: 400,
      details: { beforeId: input.beforeId },
    });
  }
  if (afterObjectId && !afterDoc) {
    throw new ApiError({
      code: 'INVALID_MOVE',
      message: 'afterId task not found',
      status: 400,
      details: { afterId: input.afterId },
    });
  }

  if (beforeDoc && (beforeDoc.day !== toDay || beforeDoc.bucket !== toBucket)) {
    throw new ApiError({
      code: 'INVALID_MOVE',
      message: 'beforeId is not in the target bucket',
      status: 400,
    });
  }
  if (afterDoc && (afterDoc.day !== toDay || afterDoc.bucket !== toBucket)) {
    throw new ApiError({
      code: 'INVALID_MOVE',
      message: 'afterId is not in the target bucket',
      status: 400,
    });
  }

  const isAllDayTarget = toBucket === 'allDay';
  const minutesPart = current.timeMinutes % 60;
  const normalizedAllDay = isAllDayTarget;
  const normalizedTimeMinutes = isAllDayTarget
    ? 0
    : (() => {
        const hour = hourFromBucket(toBucket);
        if (hour === null) {
          throw new ApiError({
            code: 'INVALID_MOVE',
            message: 'Invalid target bucket',
            status: 400,
            details: { toBucket },
          });
        }
        return hour * 60 + minutesPart;
      })();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (beforeDoc && afterDoc && beforeDoc.order >= afterDoc.order) {
      throw new ApiError({
        code: 'INVALID_MOVE',
        message: 'beforeId order must be < afterId order',
        status: 400,
        details: { beforeOrder: beforeDoc.order, afterOrder: afterDoc.order },
      });
    }

    let newOrder: number | null = null;

    if (beforeDoc && afterDoc) {
      const gap = afterDoc.order - beforeDoc.order;
      if (gap >= 2) newOrder = beforeDoc.order + Math.floor(gap / 2);
    } else if (beforeDoc) {
      newOrder = beforeDoc.order + ORDER_STEP;
    } else if (afterDoc) {
      if (afterDoc.order > 0) newOrder = Math.floor(afterDoc.order / 2);
    } else {
      const last = await collection
        .find({ day: toDay, bucket: toBucket, _id: { $ne: taskObjectId } })
        .project({ order: 1 })
        .sort({ order: -1, _id: -1 })
        .limit(1)
        .next();
      const prev = last?.order ?? 0;
      newOrder = prev + ORDER_STEP;
    }

    if (newOrder === null) {
      await rebalanceBucket(toDay, toBucket, collection);
      if (beforeObjectId) beforeDoc = await collection.findOne({ _id: beforeObjectId });
      if (afterObjectId) afterDoc = await collection.findOne({ _id: afterObjectId });
      continue;
    }

    try {
      const now = new Date();
      const updated = await collection.findOneAndUpdate(
        { _id: taskObjectId },
        {
          $set: {
            day: toDay,
            bucket: toBucket,
            order: newOrder,
            allDay: normalizedAllDay,
            timeMinutes: normalizedTimeMinutes,
            updatedAt: now,
          },
        },
        { returnDocument: 'after' },
      );

      return updated ? mapTask(updated as TaskDoc) : null;
    } catch (err) {
      if (!isDuplicateKeyError(err) || attempt === 2) throw err;
      await rebalanceBucket(toDay, toBucket, collection);
      if (beforeObjectId) beforeDoc = await collection.findOne({ _id: beforeObjectId });
      if (afterObjectId) afterDoc = await collection.findOne({ _id: afterObjectId });
    }
  }

  throw new ApiError({ code: 'MOVE_FAILED', message: 'Failed to move task', status: 500 });
}
