export type TaskDragData = {
  type: 'task';
  taskId: string;
  bucketKey: string; // `${dayKey}|${bucket}`
};

export type DayDropData = {
  type: 'day';
  dayKey: string;
};

export type HourDropData = {
  type: 'hour';
  dayKey: string;
  hour: number;
};

export const taskDragId = (taskId: string) => `task:${taskId}`;
export const dayDropId = (dayKey: string) => `day:${dayKey}`;
export const hourDropId = (dayKey: string, hour: number) =>
  `hour:${dayKey}:${hour}`;
