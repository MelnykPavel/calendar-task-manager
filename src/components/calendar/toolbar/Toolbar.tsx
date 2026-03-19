'use client';

import { css } from '@emotion/react';

import Logo from '@/src/components/calendar/toolbar/Logo';
import MonthNav from '@/src/components/calendar/toolbar/MonthNav';
import TodayButton from '@/src/components/calendar/toolbar/TodayButton';
import Search from '@/src/components/calendar/toolbar/Search';
import ViewModeSwitcher from '@/src/components/calendar/toolbar/ViewModeSwitcher';
import Settings from '@/src/components/calendar/toolbar/Settings';

const styles = {
  root: css({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 12,
    alignItems: 'center',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: 10,
    },
  }),
  leftSection: css({
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  }),
  rightSection: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    '@media (max-width: 768px)': {
      width: '100%',
      justifyContent: 'stretch',
      gap: 8,
    },
  }),
  grow: css({
    '@media (max-width: 768px)': {
      flex: '1 1 auto',
    },
  }),
  desktopOnly: css({
    '@media (max-width: 768px)': {
      display: 'none',
    },
  }),
};

export default function CalendarToolbar() {
  return (
    <div css={styles.root}>
      <div css={styles.leftSection}>
        <Logo />
        <MonthNav />
        <TodayButton />
      </div>

      <div css={styles.rightSection}>
        <div css={styles.grow}>
          <Search />
        </div>
        <div css={styles.desktopOnly}>
          <ViewModeSwitcher />
        </div>
        <Settings />
      </div>
    </div>
  );
}
