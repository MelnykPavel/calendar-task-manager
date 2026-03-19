import { useTheme } from '@emotion/react';

import type { Month } from '@/src/lib/store/selectors/calendar.selectors';
import { mobileViewStyles as styles } from './mobile-view.styles';

type DaySummary = { taskCount: number; hasHoliday: boolean };

export default function MobileMonthGrid({
  month,
  selectedDayKey,
  daySummaries,
  onSelectDay,
}: {
  month: Month;
  selectedDayKey: string;
  daySummaries: Record<string, DaySummary>;
  onSelectDay: (dayKey: string) => void;
}) {
  const theme = useTheme();

  return (
    <section css={styles.monthCard}>
      <div css={styles.weekdays}>
        {month.weekLabels.map((label) => (
          <div key={label} css={styles.weekdayCell}>
            {label}
          </div>
        ))}
      </div>

      <div css={styles.monthGrid}>
        {month.days.map((day) => {
          const isSelected = day.dayKey === selectedDayKey;
          return (
            <button
              key={day.dayKey}
              type="button"
              css={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
                day.isToday && styles.dayButtonToday,
                daySummaries[day.dayKey]?.hasHoliday && styles.dayButtonHoliday,
              ]}
              style={{
                ['--day-bg' as string]: day.inMonth
                  ? theme.colors.paper
                  : theme.colors.paperDark,
                ['--day-color' as string]: day.inMonth
                  ? theme.colors.ink
                  : theme.colors.inkMuted,
                ['--task-count-bg' as string]: day.isToday
                  ? 'rgba(255,255,255,0.18)'
                  : theme.colors.accentLight,
                ['--task-count-color' as string]: day.isToday
                  ? '#ffffff'
                  : theme.colors.accent,
                ['--holiday-mark' as string]: theme.colors.holiday,
                ['--holiday-border' as string]: theme.colors.holiday,
              }}
              onClick={() => onSelectDay(day.dayKey)}
              aria-pressed={isSelected}
            >
              {day.dateNumber}
              {(daySummaries[day.dayKey]?.taskCount ?? 0) > 0 && (
                <span css={styles.dayButtonTaskCount}>
                  {Math.min(daySummaries[day.dayKey].taskCount, 9)}
                </span>
              )}
              {daySummaries[day.dayKey]?.hasHoliday && (
                <span css={styles.dayButtonHolidayMark} />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
