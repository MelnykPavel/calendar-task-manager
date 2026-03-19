import type { ObjectId } from 'mongodb';

export type TaskBucket = string; // validated: allDay | hour:0..23

export type TaskDocDb = {
  _id?: ObjectId;
  day: string;
  bucket: TaskBucket;
  title: string;
  order: number;
  dots: string[];
  allDay: boolean;
  timeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskDoc = TaskDocDb & { _id: ObjectId };

export type Task = {
  id: string;
  day: string;
  bucket: TaskBucket;
  title: string;
  order: number;
  dots: string[];
  allDay: boolean;
  timeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskDto = Omit<Task, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type ListTasksQuery = {
  from: string;
  to: string;
  search?: string;
};

export type CreateTaskBody = {
  day: string;
  title: string;
  dots?: string[];
  allDay?: boolean;
  timeMinutes: number;
};

export type UpdateTaskBody = {
  day?: string;
  title?: string;
  dots?: string[];
  allDay?: boolean;
  timeMinutes?: number;
};

export type MoveTaskBody = {
  toDay: string;
  toBucket: TaskBucket;
  beforeId?: string | null;
  afterId?: string | null;
};
