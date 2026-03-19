export type Task = {
  id: string;
  day: string; // YYYY-MM-DD
  bucket: string; // allDay | hour:0..23
  title: string;
  order: number;
  dots: string[];
  allDay: boolean;
  timeMinutes: number; // 0..1439
  createdAt: string; // ISO
  updatedAt: string; // ISO
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
  toBucket: string;
  beforeId?: string | null;
  afterId?: string | null;
};
