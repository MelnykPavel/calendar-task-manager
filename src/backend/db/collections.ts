export const COLLECTIONS = {
  tasks: 'tasks',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
