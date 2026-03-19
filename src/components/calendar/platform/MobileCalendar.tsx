import { css } from '@emotion/react';
import MobileView from '../view/MobileView';
import { MOBILE_BREAKPOINT_PX } from '@/src/components/calendar/layout.constants';

const styles = {
  mobileOnly: css({
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minWidth: 0,
    maxWidth: '100%',
    minHeight: 0,
    overflow: 'hidden',
    borderRadius: 'inherit',
    [`@media (min-width: ${MOBILE_BREAKPOINT_PX + 1}px)`]: {
      display: 'none',
    },
  }),
};
export default function MobileCalendar() {
  return (
    <div css={styles.mobileOnly}>
      <MobileView />
    </div>
  );
}
