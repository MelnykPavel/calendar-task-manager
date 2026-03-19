import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
export type DateType = Dayjs;

type DateInput = Date | string | DateType;

export function addDays(input: DateInput, days: number): DateType {
  return dayjs(input).add(days, 'day');
}
export function addMonths(input: DateInput, months: number): DateType {
  return dayjs(input).add(months, 'month');
}
export function getMonth(input: DateInput): number {
  return dayjs(input).month();
}
export function isToday(input: DateInput): boolean {
  return dayjs(input).isSame(dayjs(), 'day');
}
export function formatDate(input: DateInput, fmt: string): string {
  return parseDate(input).format(fmt);
}

export function toDayKey(input: DateInput): string {
  return formatDate(input, 'YYYY-MM-DD');
}

export function parseDate(input: DateInput): DateType {
  return dayjs(input);
}

export function toDate(input: DateInput): Date {
  return dayjs(input).toDate();
}
export function startOfMonth(input: DateInput): DateType {
  return dayjs(input).startOf('month');
}

export function endOfMonth(input: DateInput): DateType {
  return dayjs(input).endOf('month');
}

export function startOfDay(input: DateInput): DateType {
  return dayjs(input).startOf('day');
}

export function endOfDay(input: DateInput): DateType {
  return dayjs(input).endOf('day');
}
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function isValidTimeMinutes(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 0 && minutes <= 1439;
}

export function isValidTimeString(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export type WeekRange = {
  start: DateType;
  end: DateType;
  days: Array<{ key: string; date: DateType }>;
};

export function getWeekRange(
  anchor: DateType,
  { weekStartsOn }: { weekStartsOn: 'sun' | 'mon' },
): WeekRange {
  const startDay = weekStartsOn === 'sun' ? 0 : 1;
  const diff = (anchor.day() - startDay + 7) % 7;
  const start = startOfDay(addDays(anchor, -diff));
  const end = endOfDay(addDays(start, 6));
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return { key: formatDate(date, 'YYYY-MM-DD'), date };
  });
  return { start, end, days };
}
export type MonthGridDay = {
  key: string;
  date: DateType;
  inMonth: boolean;
};

export function getMonthGrid(
  month: DateType,
  opts?: { weekStartsOn?: 'mon' | 'sun' },
) {
  const weekStartsOn = opts?.weekStartsOn ?? 'mon';
  const m = startOfMonth(month);
  const offset = weekStartsOn === 'mon' ? (m.day() + 6) % 7 : m.day();
  const start = startOfDay(addDays(m, -offset));

  const days: MonthGridDay[] = Array.from({ length: 42 }, (_, i) => {
    const date = addDays(start, i);
    return {
      key: formatDate(date, 'YYYY-MM-DD'),
      date,
      inMonth: date.month() === m.month(),
    };
  });

  return {
    start,
    end: endOfMonth(addDays(start, 41)),
    days,
  };
}
export function getWeekLabels(weekStartsOn: 'sun' | 'mon'): string[] {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return weekStartsOn === 'mon' ? [...labels.slice(1), labels[0]] : labels;
}
