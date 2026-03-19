import type { Db } from 'mongodb';

import { getDb } from './client';
import { COLLECTIONS } from './collections';

type EnsurePromise = Promise<void>;

declare global {
  var __ensureDbIndexesPromise: EnsurePromise | undefined;
}

const globalForIndexes = globalThis as typeof globalThis & {
  __ensureDbIndexesPromise?: EnsurePromise;
};

async function ensureTasksIndexes(db: Db) {
  const tasks = db.collection(COLLECTIONS.tasks);
  await tasks.createIndex(
    { day: 1, bucket: 1, order: 1 },
    { name: 'day_bucket_order', unique: true },
  );
}

async function runEnsure(db?: Db) {
  const resolvedDb = db ?? (await getDb());
  await ensureTasksIndexes(resolvedDb);
}

export async function ensureDbIndexes(db?: Db): Promise<void> {
  if (!globalForIndexes.__ensureDbIndexesPromise) {
    globalForIndexes.__ensureDbIndexesPromise = runEnsure(db).catch((err) => {
      globalForIndexes.__ensureDbIndexesPromise = undefined;
      throw err;
    });
  }

  return globalForIndexes.__ensureDbIndexesPromise;
}
