export type Task = {
  id: string;
  day: string;
  bucket: string;
  title: string;
  order: number;
  dots: string[];
  allDay: boolean;
  timeMinutes: number;
  createdAt: string;
  updatedAt: string;
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
