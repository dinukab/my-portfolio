'use client';

import { useImperativeHandle, useRef, type Ref } from 'react';

/** Everything needed to draw one frame of the hand (screen px / degrees). */
export interface HandFrame {
  /** centre of the hand in viewport px */
  x: number;
  y: number;
  /** drawn height in px (width follows the 2:3 viewBox) */
  height: number;
  rotate: number;
  scale: number;
  /** motion stretch from fast scrolling (1 … 1.08) */
  stretchY: number;
  palmBlur: number;
  fingerBlur: number;
  opacity: number;
  fingerSpread: number;
  fingerCurl: number;
  /** extra rotation per finger (twitches), degrees: thumb, index, middle, ring, pinky */
  twitch: readonly number[];
  /** CSS clip-path for the whole hand layer, or 'none' */
  clip: string;
  /** CSS mask-image for the whole hand layer (soft clip edges), or 'none' */
  mask: string;
  /** leave smear ghosts while moving */
  trail: boolean;
}

export interface HandShadowHandle {
  setPose(frame: HandFrame, now: number): void;
  /** faint fingerprint smudge (viewport px), opacity 0 hides it */
  setFingerprint(x: number, y: number, opacity: number): void;
}

const VIEW_W = 400;
const VIEW_H = 600;
const SHADOW = 'rgb(70,55,50)';

/** knuckle position, length, width, and angle when together (a0) / fully spread (a1) */
const FINGERS = [
  { k: [122, 410], len: 125, w: 46, a0: -40, a1: -70, curl: 0.3 }, // thumb
  { k: [142, 300], len: 150, w: 40, a0: -6, a1: -20, curl: 0.5 }, // index
  { k: [186, 290], len: 168, w: 42, a0: -1, a1: -5, curl: 0.5 }, // middle
  { k: [230, 294], len: 155, w: 40, a0: 4, a1: 11, curl: 0.5 }, // ring
  { k: [270, 310], len: 120, w: 34, a0: 9, a1: 25, curl: 0.5 }, // pinky
] as const;

const GHOST_LIFE_MS = 1200;

/**
 * The hand shadow: palm + wrist in one SVG and the five fingers in another, so each part can carry
 * its own CSS blur (fingers are pressed harder → less blur). Fingers are capsules in their own <g>,
 * transformed around their knuckle. Ghost smears are a fixed pool of <use> clones (no DOM churn).
 */
export default function HandShadow({ ref, ghosts = 4 }: { ref?: Ref<HandShadowHandle>; ghosts?: number }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const palmRef = useRef<SVGSVGElement>(null);
  const fingersRef = useRef<SVGSVGElement>(null);
  const fingerRefs = useRef<(SVGGElement | null)[]>([]);
  const ghostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const state = useRef({
    ghostBorn: [] as number[],
    ghostStart: [] as number[],
    nextGhost: 0,
    lastGhostX: NaN,
    lastGhostY: NaN,
    lastKey: '',
    stillFrames: 0,
  });

  useImperativeHandle(ref, () => ({
    setPose(f, now) {
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage) return;
      const s = state.current;
      const H = f.height;
      const W = (H * VIEW_W) / VIEW_H;

      const transform = `translate3d(${(f.x - W / 2).toFixed(1)}px, ${(f.y - H / 2).toFixed(1)}px, 0) rotate(${f.rotate.toFixed(2)}deg) scale(${f.scale.toFixed(4)}, ${(f.scale * f.stretchY).toFixed(4)})`;
      root.style.width = `${W}px`;
      root.style.height = `${H}px`;
      root.style.transform = transform;
      root.style.opacity = f.opacity.toFixed(3);
      palmRef.current!.style.filter = `blur(${f.palmBlur.toFixed(1)}px)`;
      fingersRef.current!.style.filter = `blur(${f.fingerBlur.toFixed(1)}px)`;
      stage.style.clipPath = f.clip;
      stage.style.maskImage = f.mask;
      stage.style.setProperty('-webkit-mask-image', f.mask);

      FINGERS.forEach((fg, i) => {
        const g = fingerRefs.current[i];
        if (!g) return;
        const angle = fg.a0 + (fg.a1 - fg.a0) * f.fingerSpread + (f.twitch[i] ?? 0);
        const len = 1 - fg.curl * f.fingerCurl;
        g.setAttribute('transform', `translate(${fg.k[0]} ${fg.k[1]}) rotate(${angle.toFixed(2)}) scale(1 ${len.toFixed(3)})`);
      });

      // will-change only while something is actually moving
      const key = `${transform}|${f.palmBlur.toFixed(1)}|${f.opacity.toFixed(3)}`;
      s.stillFrames = key === s.lastKey ? s.stillFrames + 1 : 0;
      s.lastKey = key;
      root.style.willChange = s.stillFrames > 20 ? 'auto' : 'transform, filter, opacity';

      // smear ghosts: snapshot the current pose every ~22% of the hand's height of travel
      const pool = ghostRefs.current;
      if (f.trail && f.opacity > 0.01 && pool.length) {
        const moved = Number.isNaN(s.lastGhostX) ? Infinity : Math.hypot(f.x - s.lastGhostX, f.y - s.lastGhostY);
        if (moved > H * 0.22) {
          const i = s.nextGhost++ % pool.length;
          const el = pool[i];
          if (el) {
            el.style.width = root.style.width;
            el.style.height = root.style.height;
            el.style.transform = transform;
            el.style.filter = `blur(${(f.palmBlur * 1.5 + 4).toFixed(1)}px)`;
            s.ghostBorn[i] = now;
            s.ghostStart[i] = f.opacity * 0.5;
          }
          s.lastGhostX = f.x;
          s.lastGhostY = f.y;
        }
      } else {
        s.lastGhostX = NaN;
      }
      pool.forEach((el, i) => {
        if (!el) return;
        const age = now - (s.ghostBorn[i] ?? -Infinity);
        const o = age >= 0 && age < GHOST_LIFE_MS ? (s.ghostStart[i] ?? 0) * (1 - age / GHOST_LIFE_MS) : 0;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o > 0.002 ? 'visible' : 'hidden';
      });
    },
    setFingerprint(x, y, opacity) {
      const el = printRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${(x - 13).toFixed(1)}px, ${(y - 17).toFixed(1)}px, 0) rotate(-14deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.visibility = opacity > 0.002 ? 'visible' : 'hidden';
    },
  }));

  const viewBox = `0 0 ${VIEW_W} ${VIEW_H}`;
  const layer = 'absolute inset-0 h-full w-full overflow-visible';

  return (
    <div ref={stageRef} data-hand-stage aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-multiply">
      {/* ghost smears: <use> clones of the live hand parts */}
      {Array.from({ length: ghosts }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            ghostRefs.current[i] = el;
          }}
          data-hand-ghost
          className="absolute left-0 top-0 origin-center"
          style={{ visibility: 'hidden', opacity: 0 }}
        >
          <svg viewBox={viewBox} className={layer}>
            <use href="#hand-palm" />
            <use href="#hand-fingers" />
          </svg>
        </div>
      ))}

      <div ref={rootRef} data-hand-root className="absolute left-0 top-0 origin-center" style={{ opacity: 0 }}>
        <svg ref={palmRef} viewBox={viewBox} className={layer}>
          <defs>
            <linearGradient id="hand-wrist-grad" x1="0" y1="470" x2="0" y2="600" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </linearGradient>
            <mask id="hand-wrist-fade" maskUnits="userSpaceOnUse" x="0" y="0" width={VIEW_W} height={VIEW_H}>
              <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#hand-wrist-grad)" />
            </mask>
          </defs>
          <g id="hand-palm" fill={SHADOW}>
            <path d="M128 292 C170 278 250 278 290 296 C304 330 308 400 300 448 C290 500 232 516 200 516 C160 516 116 498 110 450 C104 400 108 330 128 292 Z" />
            <rect x="148" y="456" width="112" height="144" rx="44" mask="url(#hand-wrist-fade)" />
          </g>
        </svg>
        <svg ref={fingersRef} viewBox={viewBox} className={layer}>
          <g id="hand-fingers" fill={SHADOW}>
            {FINGERS.map((fg, i) => (
              <g
                key={i}
                ref={(el) => {
                  fingerRefs.current[i] = el;
                }}
                transform={`translate(${fg.k[0]} ${fg.k[1]}) rotate(${fg.a0})`}
              >
                <rect x={-fg.w / 2} y={-fg.len} width={fg.w} height={fg.len + 26} rx={fg.w / 2} />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* the fingerprint left behind at the very bottom */}
      <div
        ref={printRef}
        data-hand-print
        className="absolute left-0 top-0 h-[34px] w-[26px] rounded-[50%]"
        style={{
          visibility: 'hidden',
          opacity: 0,
          background: `radial-gradient(closest-side, ${SHADOW} 0%, rgba(70,55,50,0.55) 55%, transparent 100%)`,
          filter: 'blur(3px)',
        }}
      />
    </div>
  );
}
