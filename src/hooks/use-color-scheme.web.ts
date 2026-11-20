import { useSyncExternalStore } from 'react';

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? ('dark' as const) : ('light' as const);
}

/** Matches the server-rendered HTML so hydration succeeds, then React re-renders with the real scheme. */
function getServerSnapshot() {
  return 'light' as const;
}

export function useColorScheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
