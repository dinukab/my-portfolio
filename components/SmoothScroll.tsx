'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

// ---- feel (tune here) ---------------------------------------------------------------
/** Lenis interpolation per frame. Lower = heavier, slower glide. */
export const LENIS_LERP = 0.075;
export const LENIS_WHEEL_MULTIPLIER = 0.9;
/** Seconds for anchor / tab navigation scrolls. */
export const ANCHOR_SCROLL_DURATION = 1.6;

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type FrameCallback = (time: number) => void;
type ScrollTarget = number | string | HTMLElement;

export interface SmoothScrollApi {
  /** The live Lenis instance, or null (reduced motion / not mounted yet). Safe to call every frame. */
  getLenis: () => Lenis | null;
  /** Current scroll position: Lenis' smoothed value when active, otherwise window.scrollY. */
  getScroll: () => number;
  /**
   * Register a callback on the site's single requestAnimationFrame loop.
   * It runs right after `lenis.raf(time)`, so it sees this frame's smoothed scroll.
   * Returns an unsubscribe function.
   */
  addFrameCallback: (cb: FrameCallback) => () => void;
  /**
   * Smooth-scroll to a target (px, '#id' / selector, or element). Jumps instantly when Lenis is off
   * (reduced motion). Pass `hash` to update the URL without a jump.
   */
  scrollTo: (target: ScrollTarget, opts?: { immediate?: boolean; hash?: string; onComplete?: () => void }) => void;
  /** Subscribe to Lenis being created/destroyed (used by useLenis). */
  subscribe: (listener: () => void) => () => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

/** Shared smooth-scroll API (scrollTo, frame loop, current scroll). Null outside the provider. */
export function useSmoothScroll(): SmoothScrollApi | null {
  return useContext(SmoothScrollContext);
}

/** The Lenis instance (re-renders when it is created/destroyed); null under reduced motion. */
export function useLenis(): Lenis | null {
  const api = useContext(SmoothScrollContext);
  return useSyncExternalStore(
    api?.subscribe ?? noopSubscribe,
    () => api?.getLenis() ?? null,
    () => null,
  );
}

/** Pause smooth scrolling while `locked` is true (modals, mobile menus). */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis || !locked) return;
    lenis.stop();
    return () => lenis.start();
  }, [lenis, locked]);
}

const noopSubscribe = () => () => {};

function resolveTarget(target: ScrollTarget): HTMLElement | number | null {
  if (typeof target === 'number' || target instanceof HTMLElement) return target;
  if (target === '#' || target === '#top') return 0;
  try {
    return document.querySelector<HTMLElement>(target);
  } catch {
    return null;
  }
}

function createApi(): SmoothScrollApi & {
  setLenis: (l: Lenis | null) => void;
  runFrame: (time: number) => void;
} {
  let lenis: Lenis | null = null;
  const frameCallbacks = new Set<FrameCallback>();
  const listeners = new Set<() => void>();

  return {
    getLenis: () => lenis,
    getScroll: () => lenis?.scroll ?? window.scrollY,
    addFrameCallback(cb) {
      frameCallbacks.add(cb);
      return () => frameCallbacks.delete(cb);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setLenis(l) {
      lenis = l;
      listeners.forEach((fn) => fn());
    },
    runFrame(time) {
      lenis?.raf(time);
      frameCallbacks.forEach((cb) => cb(time));
    },
    scrollTo(target, opts = {}) {
      const resolved = resolveTarget(target);
      if (resolved === null) return;
      if (opts.hash !== undefined) {
        // update the URL without the browser jumping to the anchor
        const url = opts.hash ? `#${opts.hash.replace(/^#/, '')}` : window.location.pathname + window.location.search;
        window.history.replaceState(window.history.state, '', url);
      }
      if (lenis) {
        lenis.scrollTo(resolved, {
          offset: 0,
          duration: ANCHOR_SCROLL_DURATION,
          easing: easeInOutCubic,
          immediate: opts.immediate,
          onComplete: () => opts.onComplete?.(),
        });
        return;
      }
      // reduced motion / no Lenis: instant native jump
      const top = typeof resolved === 'number' ? resolved : resolved.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'instant' });
      opts.onComplete?.();
    },
  };
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [api] = useState(createApi);
  const pathname = usePathname();
  const firstPath = useRef(true);

  // ---- one Lenis instance, only when motion is allowed ------------------------------
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;

    const create = () => {
      if (lenis) return;
      lenis = new Lenis({
        lerp: LENIS_LERP,
        wheelMultiplier: LENIS_WHEEL_MULTIPLIER,
        smoothWheel: true,
        syncTouch: false, // phones keep native momentum scrolling
        autoRaf: false, // driven by the shared loop below
        anchors: false, // handled by the click delegate below (custom duration/easing + hash)
      });
      api.setLenis(lenis);
    };
    const destroy = () => {
      if (!lenis) return;
      lenis.destroy();
      lenis = null;
      api.setLenis(null);
    };
    const apply = () => (mq.matches ? destroy() : create());

    apply();
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
      destroy(); // Strict Mode: the dev double-mount destroys the first instance here
    };
  }, [api]);

  // ---- the site's single requestAnimationFrame loop -----------------------------------
  useEffect(() => {
    let raf = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      api.runFrame(time);
    };
    const start = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    start();
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [api]);

  // ---- same-page anchor links (href="#id") glide instead of jumping -------------------
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !link.hash) return;
      const id = decodeURIComponent(link.hash.slice(1));
      const target = id === '' || id === 'top' ? 0 : document.getElementById(id);
      if (target === null) return;
      e.preventDefault();
      api.scrollTo(target, { hash: id === '' || id === 'top' ? '' : id });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [api]);

  // ---- route change: start the new page at the top ------------------------------------
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    api.scrollTo(0, { immediate: true });
  }, [pathname, api]);

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}
