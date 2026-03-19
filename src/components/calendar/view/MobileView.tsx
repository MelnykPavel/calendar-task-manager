'use client';

import { useTheme } from '@emotion/react';
import { useMemo, useState } from 'react';

import MobileDayPanel from '@/src/components/calendar/view/mobile/MobileDayPanel';
import MobileMonthGrid from '@/src/components/calendar/view/mobile/MobileMonthGrid';
import {
  selectMonth,
  type Month,
} from '@/src/lib/store/selectors/calendar.selectors';
import { useAppStore } from '@/src/lib/store/app.store';
import { mobileViewStyles as styles } from '@/src/components/calendar/view/mobile/mobile-view.styles';
import { useDaySummariesSelector } from '@/src/hooks/useDaySummariesSelector';

function getInitialSelectedDay(month: Month) {
  return (
    month.days.find((day) => day.isToday && day.inMonth)?.dayKey ??
    month.days.find((day) => day.inMonth)?.dayKey ??
    month.days[0]?.dayKey ??
    ''
  );
}

export default function MobileView() {
  const theme = useTheme();
  const month = useAppStore(selectMonth);
  const [selectedDayKey, setSelectedDayKey] = useState(() =>
    getInitialSelectedDay(month),
  );

  const activeSelectedDayKey = useMemo(() => {
    const hasSelection = month.days.some((day) => day.dayKey === selectedDayKey);
    return hasSelection ? selectedDayKey : getInitialSelectedDay(month);
  }, [month, selectedDayKey]);

  const selectDaySummaries = useDaySummariesSelector(month.days.map((day) => day.dayKey));

  const daySummaries = useAppStore(selectDaySummaries);

  const themeVars = useMemo(
    () => ({
      ['--radii-lg' as string]: theme.radii.lg,
      ['--border-default' as string]: theme.borders.default,
      ['--color-paper-light' as string]: theme.colors.paperLight,
      ['--color-paper' as string]: theme.colors.paper,
      ['--color-paper-dark' as string]: theme.colors.paperDark,
      ['--color-accent' as string]: theme.colors.accent,
      ['--color-accent-light' as string]: theme.colors.accentLight,
      ['--color-ink' as string]: theme.colors.ink,
      ['--color-ink-muted' as string]: theme.colors.inkMuted,
      ['--font-display' as string]: theme.font.display,
      ['--font-mono' as string]: theme.font.mono,
    }),
    [
      theme.borders.default,
      theme.colors.accent,
      theme.colors.accentLight,
      theme.colors.ink,
      theme.colors.inkMuted,
      theme.colors.paper,
      theme.colors.paperDark,
      theme.colors.paperLight,
      theme.font.display,
      theme.font.mono,
      theme.radii.lg,
    ],
  );

  return (
    <div css={styles.root} style={themeVars}>
      <MobileMonthGrid
        month={month}
        selectedDayKey={activeSelectedDayKey}
        daySummaries={daySummaries}
        onSelectDay={setSelectedDayKey}
      />

      <MobileDayPanel
        dayKey={activeSelectedDayKey}
      />
    </div>
  );
}
