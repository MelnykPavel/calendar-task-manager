import { css } from '@emotion/react';
import MonthView from '../view/MonthView';
import WeekView from '../view/WeekView';
import { useAppStore } from '@/src/lib/store/app.store';
import { MOBILE_BREAKPOINT_PX } from '@/src/components/calendar/layout.constants';

const selectViewMode = (state: ReturnType<typeof useAppStore.getState>) =>
  state.viewMode;

const styles = {
  desktopOnly: css({
    display: 'none',
    height: '100%',
    minHeight: 0,
    [`@media (min-width: ${MOBILE_BREAKPOINT_PX + 1}px)`]: {
      display: 'flex',
      flexDirection: 'column',
    },
  }),
};
export default function DesktopCalendar() {
  const viewMode = useAppStore(selectViewMode);
  return (
    <div css={styles.desktopOnly}>
      {viewMode === 'month' && <MonthView />}
      {viewMode === 'week' && <WeekView />}
    </div>
  );
}
