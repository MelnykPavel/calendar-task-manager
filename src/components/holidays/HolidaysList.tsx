'use client';

import HolidayLine from '@/src/components/holidays/HolidayLine';
import { useMemo } from 'react';

export default function DayCellHolidaysList({
  texts,
}: {
  texts: string[];
}) {
  const shownHolidays = useMemo(
    () =>
      texts.map((text, i) => ({ text: text.trim(), key: `holiday:${i}` }))
        .filter((x) => x.text.length > 0)
        .slice(0, 2),
    [texts],
  );

  const holidayTexts = useMemo(() => texts.map((t) => t.trim()).filter(Boolean), [texts]);

  const hiddenCount = Math.max(0, holidayTexts.length - 2);

  return (
    <>
      {shownHolidays.map((h) => (
        <HolidayLine key={h.key} text={h.text} />
      ))}
      {hiddenCount > 0 && (
        <HolidayLine
          text={`+${hiddenCount} more`}
          title={holidayTexts.join('; ')}
        />
      )}
    </>
  );
}
