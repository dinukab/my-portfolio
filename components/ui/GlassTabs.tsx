'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { LayoutGroup, MotionConfig, motion } from 'framer-motion';
import { useSmoothScroll } from '../SmoothScroll';

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** Sections without their own tab highlight the closest related tab. */
const SECTION_TO_TAB: Record<string, TabId> = {
  home: 'home',
  about: 'about',
  education: 'about',
  projects: 'projects',
  contact: 'contact',
};

/** Clock for the scroll lock (only called from event handlers / observer callbacks). */
const now = () => performance.now();

const focusRing = 'outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c9a27a]';

export default function GlassTabs() {
  const [active, setActive] = useState<TabId>('home');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lockUntil = useRef(0);
  const smooth = useSmoothScroll();

  // Active tab follows scroll: a section is "current" when it crosses a line at 45% of the viewport.
  useEffect(() => {
    const els = Object.keys(SECTION_TO_TAB)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        if (now() < lockUntil.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(SECTION_TO_TAB[entry.target.id]);
        }
      },
      { rootMargin: '-45% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const select = (id: TabId, focus = false) => {
    setActive(id);
    if (focus) tabRefs.current[id]?.focus();
    const el = document.getElementById(id);
    if (!el) return;
    // ignore observer updates while the glide passes through other sections
    // (released on completion; the timeout is a safety net if the scroll is interrupted)
    lockUntil.current = now() + 2500;
    const release = () => {
      lockUntil.current = 0;
    };
    if (smooth) {
      smooth.scrollTo(el, { hash: id === 'home' ? '' : id, onComplete: release });
    } else {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      release();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === active);
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    select(TABS[next].id, true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-[1000] flex justify-center px-2 md:bottom-auto md:top-6">
        {/* The bar uses the same glass panel; its fill is raised to 0.8 in both themes because it
            floats over everything (incl. the profile photo), where the normal fill fails contrast. */}
        <motion.nav
          aria-label="Primary"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel glass-panel-static pointer-events-auto flex max-w-full items-center gap-0.5 rounded-full p-1 sm:gap-1 sm:p-1.5 [--glass-bg:rgba(255,255,255,0.8)] dark:[--glass-bg:rgba(18,18,20,0.8)]"
        >
          <LayoutGroup id="glass-tabs">
            <div
              role="tablist"
              aria-label="Page sections"
              aria-orientation="horizontal"
              onKeyDown={onKeyDown}
              className="flex items-center gap-0.5 sm:gap-1"
            >
              {TABS.map((tab) => {
                const selected = tab.id === active;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[tab.id] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={tab.id}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(tab.id)}
                    className={`relative min-h-11 whitespace-nowrap rounded-full px-2.5 text-[14px] font-medium sm:px-4 md:px-5 md:text-[15px] ${focusRing}`}
                    style={{ color: selected ? 'var(--tab-active)' : 'var(--tab-inactive)' }}
                  >
                    {selected && (
                      <motion.span
                        layoutId="glass-tab-thumb"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-(--glass-thumb) shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_4px_rgba(60,48,52,0.16)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="relative">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

        </motion.nav>
      </div>
    </MotionConfig>
  );
}
