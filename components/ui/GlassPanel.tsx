'use client';

import type { CSSProperties, ElementType, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type GlassTag = 'div' | 'section' | 'nav' | 'article';

const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  nav: motion.nav,
  article: motion.article,
} as const;

export interface GlassPanelProps {
  as?: GlassTag;
  className?: string;
  children?: ReactNode;
  /** Default padding: 22px on mobile, 32px × 36px from md up. */
  padded?: boolean;
  /** Disable the desktop hover lift (e.g. for the nav bar). */
  static?: boolean;
  /**
   * Fade/slide in when scrolled into view (a number sets the delay in seconds).
   * Animates the panel itself: a fading wrapper (opacity < 1 ancestor) would hide
   * the backdrop from the blur until the fade finished.
   */
  reveal?: boolean | number;
  id?: string;
  style?: CSSProperties;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** light theme: the hand grips this panel's top edge */
  'data-hand-grip'?: boolean;
}

/** The single dark frosted-glass panel style used for every card on the site. */
export default function GlassPanel({
  as = 'div',
  className = '',
  children,
  padded = true,
  static: isStatic = false,
  reveal = false,
  ...rest
}: GlassPanelProps) {
  const reduceMotion = useReducedMotion();
  const Comp = MOTION_TAGS[as] as typeof motion.div;

  const revealProps = reveal
    ? {
        initial: { opacity: 0, y: reduceMotion ? 0 : 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-50px' },
        transition: {
          duration: reduceMotion ? 0.3 : 0.8,
          delay: typeof reveal === 'number' ? reveal : 0,
          ease: [0.16, 1, 0.3, 1] as const,
        },
      }
    : {};

  return (
    <Comp
      className={`glass-panel ${isStatic ? 'glass-panel-static' : ''} ${padded ? 'p-[22px] md:px-9 md:py-8' : ''} ${className}`}
      {...revealProps}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** White heading with the muted-gold accent line underneath. */
export function GlassHeading({
  title,
  accent,
  as: Tag = 'h2',
  id,
}: {
  title: string;
  accent: string;
  as?: ElementType;
  id?: string;
}) {
  return (
    <div className="mb-6">
      {/* light theme: thin vertical divider as a section accent */}
      <span aria-hidden="true" className="mb-5 hidden h-10 w-px bg-[#c9c2bd] light:block" />
      <Tag
        id={id}
        className="font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.01em] text-(--glass-text) md:text-[48px]"
      >
        {title}
      </Tag>
      <p className="font-display text-[28px] font-light leading-tight text-(--glass-accent) md:text-[36px]">{accent}</p>
    </div>
  );
}
