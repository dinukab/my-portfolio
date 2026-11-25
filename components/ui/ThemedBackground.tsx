'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import ParticleBackground from '../ParticleBackground';
import LightBackground from '../light/LightBackground';

const subscribe = () => () => {};
/** Cross-fade between the two theme backgrounds. */
export const THEME_FADE_MS = 600;

/**
 * Fixed full-screen layer behind the page that fades in/out. It starts at opacity 0 and turns
 * on a frame after mounting, so a newly shown background fades in instead of popping.
 */
function FadeLayer({ show, children }: { show: boolean; children: ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(show));
    return () => cancelAnimationFrame(id);
  }, [show]);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 transition-opacity ease-out motion-reduce:transition-none"
      style={{ opacity: on && show ? 1 : 0, transitionDuration: `${THEME_FADE_MS}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Dark: gold star particles (kept mounted once seen and paused while hidden; unchanged behaviour).
 * Light: the frosted page with the hand shadow. It is mounted only while the light theme is on and
 * unmounted after fading out, so it costs nothing in dark mode.
 */
export default function ThemedBackground() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const theme = !mounted ? null : resolvedTheme === 'light' ? 'light' : 'dark';

  const [darkSeen, setDarkSeen] = useState(false);
  const [lightAlive, setLightAlive] = useState(false);
  // adjust state during render (React pattern)
  if (theme === 'dark' && !darkSeen) setDarkSeen(true);
  if (theme === 'light' && !lightAlive) setLightAlive(true);

  useEffect(() => {
    if (theme !== 'dark' || !lightAlive) return;
    const id = window.setTimeout(() => setLightAlive(false), THEME_FADE_MS + 50);
    return () => window.clearTimeout(id);
  }, [theme, lightAlive]);

  if (!theme) return null;
  return (
    <>
      {darkSeen && (
        <FadeLayer show={theme === 'dark'}>
          <ParticleBackground active={theme === 'dark'} />
        </FadeLayer>
      )}
      {lightAlive && (
        <FadeLayer show={theme === 'light'}>
          <LightBackground />
        </FadeLayer>
      )}
    </>
  );
}
