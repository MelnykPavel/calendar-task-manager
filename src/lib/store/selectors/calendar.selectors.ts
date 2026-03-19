import {
  formatDate,
  getMonthGrid,
  getWeekLabels,
  getWeekRange,
  parseDate,
} from '@/src/lib/date/utils';
import type { AppState } from '../types/app.types';
import { monthCache, weekCache } from './cache/selector-caches';

export type MonthDay = {
  dayKey: string;
  dateNumber: number;
  inMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
};

export type Month = {
  from: string;
  to: string;
  weekLabels: string[];
  days: MonthDay[];
};

export type WeekDay = {
  dayKey: string;
  label: string;
  dateNumber: number;
  isToday: boolean;
};

export type Week = {
  from: string;
  to: string;
  weekLabels: string[];
  days: WeekDay[];
};

export type VisibleRange = {
  from: string;
  to: string;
};

const todayKey =
  typeof window === 'undefined' ? '' : formatDate(new Date(), 'YYYY-MM-DD');
const thisMonthKey =
  typeof window === 'undefined' ? '' : formatDate(new Date(), 'YYYY-MM');

let visibleRangeCache: { key: string; value: VisibleRange } | undefined;
let visibleYearsCache: { key: string; value: number[] } | undefined;
let visibleLabelCache: { key: string; value: string } | undefined;

export function selectMonth(s: AppState): Month {
  const cached = monthCache.get('month');
  if (
    cached &&
    cached.monthKey === s.monthKey &&
    cached.weekStartsOn === s.weekStartsOn
  ) {
    return cached.vm;
  }

  const month = parseDate(`${s.monthKey}-01`);
  const grid = getMonthGrid(month, { weekStartsOn: s.weekStartsOn });
  const weekLabels = getWeekLabels(s.weekStartsOn);

  const from = formatDate(grid.start, 'YYYY-MM-DD');
  const to = formatDate(grid.end, 'YYYY-MM-DD');

  const days: MonthDay[] = grid.days.map((day) => ({
    dayKey: day.key,
    dateNumber: day.date.date(),
    inMonth: day.inMonth,
    isWeekend: day.date.day() === 6,
    isToday: day.key === todayKey,
  }));

  const vm: Month = { from, to, weekLabels, days };
  monthCache.set('month', {
    monthKey: s.monthKey,
    weekStartsOn: s.weekStartsOn,
    vm,
  });
  return vm;
}

export function selectWeek(s: AppState): Week {
  const cached = weekCache.get('week');
  if (
    cached &&
    cached.weekAnchor === s.weekAnchor &&
    cached.weekStartsOn === s.weekStartsOn
  ) {
    return cached.vm;
  }

  const week = getWeekRange(parseDate(s.weekAnchor), {
    weekStartsOn: s.weekStartsOn,
  });
  const weekLabels = getWeekLabels(s.weekStartsOn);

  const from = formatDate(week.start, 'YYYY-MM-DD');
  const to = formatDate(week.end, 'YYYY-MM-DD');

  const days: WeekDay[] = week.days.map((day, index) => ({
    dayKey: day.key,
    label: weekLabels[index] ?? '',
    dateNumber: day.date.date(),
    isToday: day.key === todayKey,
  }));

  const vm: Week = { from, to, weekLabels, days };
  weekCache.set('week', {
    weekAnchor: s.weekAnchor,
    weekStartsOn: s.weekStartsOn,
    vm,
  });
  return vm;
}

export function selectVisibleRange(s: AppState): VisibleRange {
  const period = s.viewMode === 'week' ? selectWeek(s) : selectMonth(s);
  const key = `${s.viewMode}|${period.from}|${period.to}`;

  if (visibleRangeCache?.key === key) return visibleRangeCache.value;

  const value = { from: period.from, to: period.to };
  visibleRangeCache = { key, value };
  return value;
}

export function selectVisibleYears(s: AppState): number[] {
  const days = s.viewMode === 'week' ? selectWeek(s).days : selectMonth(s).days;
  const key = `${s.viewMode}|${days[0]?.dayKey ?? ''}|${days[days.length - 1]?.dayKey ?? ''}`;

  if (visibleYearsCache?.key === key) return visibleYearsCache.value;

  const value = Array.from(
    new Set(days.map((day) => Number(day.dayKey.slice(0, 4)))),
  );
  visibleYearsCache = { key, value };
  return value;
}

export function selectVisibleLabel(s: AppState): string {
  if (s.viewMode === 'month') {
    const key = `month|${s.monthKey}`;
    if (visibleLabelCache?.key === key) return visibleLabelCache.value;

    const value = formatDate(`${s.monthKey}-01`, 'MMMM YYYY');
    visibleLabelCache = { key, value };
    return value;
  }

  const week = selectWeek(s);
  const key = `week|${week.from}|${week.to}`;
  if (visibleLabelCache?.key === key) return visibleLabelCache.value;

  const value = `${formatDate(week.from, 'MMM D')} - ${formatDate(week.to, 'MMM D, YYYY')}`;
  visibleLabelCache = { key, value };
  return value;
}

export function selectIsCurrentPeriod(s: AppState): boolean {
  if (s.viewMode === 'month') return s.monthKey === thisMonthKey;

  const week = selectWeek(s);
  return todayKey >= week.from && todayKey <= week.to;
}
