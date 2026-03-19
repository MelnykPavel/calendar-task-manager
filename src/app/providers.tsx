'use client';

import {
  CacheProvider,
  Global,
  ThemeProvider,
  type EmotionCache,
} from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { useState, useEffect } from 'react';

import { globalStyles } from '@/src/styles/globalStyles';
import { themes } from '@/src/styles/theme';
import type { ThemeMode } from '@/src/lib/store/types/common';

import { useAppStore } from '../lib/store/app.store';

const selectThemeMode = (state: ReturnType<typeof useAppStore.getState>) =>
  state.themeMode;

function createEmotionCache(): EmotionCache {
  return createCache({ key: 'ctm' });
}

function useEmotionCache() {
  const [{ cache, flush }] = useState(() => {
    const cache = createEmotionCache();
    cache.compat = true;

    const prevInsert = cache.insert;
    let inserted: string[] = [];

    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = () => {
      const prev = inserted;
      inserted = [];
      return prev;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (!names.length) return null;

    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return cache;
}

const THEME_COOKIE = 'ctm-theme';

function ThemeWrapper({
  children,
  initialThemeMode,
}: {
  children: React.ReactNode;
  initialThemeMode: ThemeMode;
}) {
  const storeThemeMode = useAppStore(selectThemeMode);
  const [hydrated, setHydrated] = useState(
    () => useAppStore.persist?.hasHydrated() ?? false,
  );
  const themeMode = hydrated ? storeThemeMode : initialThemeMode;
  const theme = themes[themeMode];

  useEffect(() => {
    const unsubscribe = useAppStore.persist?.onFinishHydration(() => {
      setHydrated(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.cookie = `${THEME_COOKIE}=${themeMode}; path=/; max-age=31536000; samesite=lax`;
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <Global styles={globalStyles(theme)} />
      {children}
    </ThemeProvider>
  );
}

export default function Providers({
  children,
  initialThemeMode,
}: {
  children: React.ReactNode;
  initialThemeMode: ThemeMode;
}) {
  const cache = useEmotionCache();

  return (
    <CacheProvider value={cache}>
      <ThemeWrapper initialThemeMode={initialThemeMode}>
        {children}
      </ThemeWrapper>
    </CacheProvider>
  );
}
