import { ObjectId } from 'mongodb';

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

export function isObjectIdString(value: unknown): value is string {
  return typeof value === 'string' && OBJECT_ID_RE.test(value) && ObjectId.isValid(value);
}

export function toObjectId(id: string): ObjectId {
  if (!isObjectIdString(id)) throw new Error('Invalid ObjectId');
  return new ObjectId(id);
}

export function newObjectId(): ObjectId {
  return new ObjectId();
}
