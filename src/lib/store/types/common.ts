export type DayKey = string;
export type MonthKey = string;
export type CountryCode = string;

export type ThemeMode = 'light' | 'dark';
export type ViewMode = 'month' | 'week';

export type Bucket = 'allDay' | `hour:${number}`;
export type BucketKey = `${DayKey}|${Bucket}`;
export type TaskId = string;
