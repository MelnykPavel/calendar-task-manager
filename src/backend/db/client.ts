import { MongoClient } from 'mongodb';

import { getMongoEnv } from '../config/env';

type MongoClientPromise = Promise<MongoClient>;

declare global {
  var __mongoClientPromise: MongoClientPromise | undefined;
}

const globalForMongo = globalThis as typeof globalThis & {
  __mongoClientPromise?: MongoClientPromise;
};

function createMongoClientPromise(): MongoClientPromise {
  const { MONGODB_URI } = getMongoEnv();
  const client = new MongoClient(MONGODB_URI);
  return client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!globalForMongo.__mongoClientPromise) {
    globalForMongo.__mongoClientPromise = createMongoClientPromise();
  }
  return globalForMongo.__mongoClientPromise;
}

export async function getDb() {
  const client = await getMongoClient();
  const { MONGODB_DB } = getMongoEnv();
  return client.db(MONGODB_DB || 'calendar_task_manager');
}

export async function pingMongo() {
  const client = await getMongoClient();
  const res = await client.db('admin').command({ ping: 1 });
  return res;
}
