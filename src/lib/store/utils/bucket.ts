import { DayKey, Bucket, BucketKey } from '../types/common';

export function bucketKey(day: DayKey, bucket: Bucket | string): BucketKey {
  return `${day}|${bucket}` as BucketKey;
}

export function parseBucketKey(key: string): { day: DayKey; bucket: Bucket } {
  const idx = key.indexOf('|');
  return { day: key.slice(0, idx), bucket: key.slice(idx + 1) as Bucket };
}

export function hourFromBucket(bucket: Bucket): number | null {
  if (bucket === 'allDay') return null;
  const m = /^hour:(\d|1\d|2[0-3])$/.exec(bucket);
  return m ? Number(m[1]) : null;
}

export function normalizeTimeForBucket(
  prev: { timeMinutes: number },
  toBucket: Bucket,

  originalMinutes?: number,
): { allDay: boolean; timeMinutes: number; bucket: Bucket } {
  if (toBucket === 'allDay')
    return { allDay: true, timeMinutes: 0, bucket: 'allDay' };
  const h = hourFromBucket(toBucket);

  const minuteSource =
    originalMinutes !== undefined ? originalMinutes : prev.timeMinutes;
  const minutes = minuteSource % 60;
  return {
    allDay: false,
    timeMinutes: (h ?? 0) * 60 + minutes,
    bucket: toBucket,
  };
}
