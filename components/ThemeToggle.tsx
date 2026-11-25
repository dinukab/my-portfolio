'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const subscribe = () => () => {};

/**
 * Top-right sun/moon toggle. next-themes follows prefers-color-scheme until the visitor picks a
 * theme, then remembers it in localStorage (its storage access is already wrapped in try/catch).
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="glass-panel glass-panel-static fixed right-4 top-4 z-[1000] flex size-11 items-center justify-center rounded-full text-(--tab-active) md:right-6 md:top-6 [--glass-bg:rgba(255,255,255,0.8)] dark:[--glass-bg:rgba(18,18,20,0.8)]"
    >
      {!mounted ? <span className="size-[18px]" /> : isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}
