/**
 * Light-mode hand choreography. Edit the path here.
 *
 * Each keyframe's `progress` is an anchor that is converted to overall page scroll progress
 * (scroll / maxScroll) every frame, so the path stays attached to the right sections on any
 * screen size:
 *   { section: 'about', at: 0.2 }  → the scroll position where 20% of #about has passed the top of
 *                                     the viewport (negative = before the section reaches the top)
 *   { end: 120 }                   → 120px before the bottom of the page
 *   0.5                            → plain overall page progress
 *
 * Pose fields:
 *   x, y          hand centre as a fraction of the viewport
 *   rotate        degrees (0 = fingers up, ±180 = fingers down; pick the sign that turns the short way)
 *   depth         0 = pressed against the glass … 1 = far away
 *   fingerSpread  0 = together … 1 = fully spread
 *   fingerCurl    0 = straight … 1 = curled toward the palm
 *   opacity       multiplier on the depth-based opacity (0 = gone)
 *   grip          0..1: blend toward gripping the About panel's top edge (clipped to the panel)
 *   trail         leave smear ghosts while moving from this keyframe to the next
 *   creep         idle creep toward the cursor (or screen centre on touch) on this stretch
 */

export type Anchor = number | { section: string; at: number } | { end: number };

export interface HandKeyframe {
  progress: Anchor;
  x: number;
  y: number;
  rotate: number;
  depth: number;
  fingerSpread: number;
  fingerCurl: number;
  opacity: number;
  grip?: number;
  trail?: boolean;
  creep?: boolean;
}

export const CHOREOGRAPHY: HandKeyframe[] = [
  // page load: far away, barely visible behind the right side of the hero title
  { progress: { section: 'home', at: 0 }, x: 0.4, y: 0.42, rotate: -18, depth: 1, fingerSpread: 0.35, fingerCurl: 0.25, opacity: 1 },
  // first 40% of the hero: it presses flat behind the title, fingers spread ("it heard you")
  { progress: { section: 'home', at: 0.4 }, x: 0.4, y: 0.4, rotate: -16, depth: 0.1, fingerSpread: 1, fingerCurl: 0, opacity: 1, trail: true },
  // leaving the hero: drags down and to the left, fingers trailing behind the palm
  { progress: { section: 'home', at: 0.85 }, x: 0.2, y: 0.66, rotate: -38, depth: 0.3, fingerSpread: 0.45, fingerCurl: 0.15, opacity: 1 },
  // About: pulls back near the left edge and grips the top edge of the About panel from behind
  { progress: { section: 'about', at: -0.35 }, x: 0.18, y: 0.3, rotate: -180, depth: 0.6, fingerSpread: 0.35, fingerCurl: 0.55, opacity: 1, grip: 1 },
  { progress: { section: 'about', at: 0.15 }, x: 0.18, y: 0.3, rotate: -180, depth: 0.6, fingerSpread: 0.35, fingerCurl: 0.6, opacity: 1, grip: 1 },
  // About → Projects: lets go and disappears; nothing on screen for a moment
  { progress: { section: 'about', at: 0.6 }, x: 0.15, y: 0.2, rotate: -190, depth: 1, fingerSpread: 0.3, fingerCurl: 0.3, opacity: 0 },
  { progress: { section: 'projects', at: -0.45 }, x: 0.86, y: 0.5, rotate: 12, depth: 1, fingerSpread: 0.6, fingerCurl: 0.2, opacity: 0 },
  // Projects: pressed against the opposite side; creeps toward the cursor when the reader stops
  { progress: { section: 'projects', at: -0.2 }, x: 0.84, y: 0.5, rotate: 14, depth: 0.15, fingerSpread: 0.8, fingerCurl: 0.1, opacity: 1, creep: true },
  { progress: { section: 'projects', at: 0.85 }, x: 0.84, y: 0.48, rotate: 10, depth: 0.15, fingerSpread: 0.8, fingerCurl: 0.1, opacity: 1, creep: true },
  // Contact: fingers fully spread, pressed hard
  { progress: { section: 'contact', at: -0.3 }, x: 0.8, y: 0.38, rotate: 4, depth: 0, fingerSpread: 1, fingerCurl: 0, opacity: 1 },
  { progress: { end: 320 }, x: 0.8, y: 0.42, rotate: 3, depth: 0, fingerSpread: 1, fingerCurl: 0, opacity: 1, trail: true },
  // reaching the bottom: slides down the glass, fingertips dragging, smudge trail
  { progress: { end: 60 }, x: 0.79, y: 0.86, rotate: 0, depth: 0.12, fingerSpread: 0.85, fingerCurl: 0.35, opacity: 0.6, trail: true },
  // very bottom: gone (the fingerprint by the button fades in instead)
  { progress: { end: 0 }, x: 0.79, y: 0.95, rotate: 0, depth: 0.5, fingerSpread: 0.7, fingerCurl: 0.4, opacity: 0 },
];

// ---- depth → appearance (spec) --------------------------------------------------------
export const blurForDepth = (d: number) => 6 + (38 - 6) * d; // palm blur, px
export const opacityForDepth = (d: number) => 0.38 + (0.06 - 0.38) * d;
export const scaleForDepth = (d: number) => 1 + 0.15 * d;
/** fingertips look pressed hardest: 40% less blur than the palm */
export const FINGER_BLUR_FACTOR = 0.6;
/** never more opaque than this while overlapping body text */
export const MAX_OPACITY_OVER_TEXT = 0.2;

export interface HandPose {
  x: number;
  y: number;
  rotate: number;
  depth: number;
  fingerSpread: number;
  fingerCurl: number;
  opacity: number;
  grip: number;
}

const POSE_KEYS = ['x', 'y', 'rotate', 'depth', 'fingerSpread', 'fingerCurl', 'opacity', 'grip'] as const;

export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

export interface ResolvedKeyframe extends HandKeyframe {
  /** overall page progress 0..1 */
  p: number;
}

/** Convert anchors to overall page progress for the current layout. */
export function resolveKeyframes(
  kfs: HandKeyframe[],
  layout: { maxScroll: number; sections: Record<string, { top: number; height: number }> },
): ResolvedKeyframe[] {
  const toScroll = (a: Anchor): number => {
    if (typeof a === 'number') return a * layout.maxScroll;
    if ('end' in a) return layout.maxScroll - a.end;
    const s = layout.sections[a.section];
    return s ? s.top + a.at * s.height : 0;
  };
  const out = kfs.map((k) => ({ ...k, p: Math.min(1, Math.max(0, toScroll(k.progress) / Math.max(1, layout.maxScroll))) }));
  // keep them ordered even if a short layout squeezes anchors together
  for (let i = 1; i < out.length; i++) out[i].p = Math.max(out[i].p, out[i - 1].p);
  return out;
}

/** Interpolate the pose at overall progress p (easeInOutSine between keyframes). */
export function poseAt(kfs: ResolvedKeyframe[], p: number): { pose: HandPose; segment: number } {
  let i = 0;
  while (i < kfs.length - 2 && p > kfs[i + 1].p) i++;
  const a = kfs[i];
  const b = kfs[Math.min(i + 1, kfs.length - 1)];
  const span = b.p - a.p;
  const t = span > 1e-6 ? easeInOutSine(Math.min(1, Math.max(0, (p - a.p) / span))) : p >= b.p ? 1 : 0;
  const pose = {} as HandPose;
  for (const k of POSE_KEYS) {
    const va = (a[k] as number | undefined) ?? 0;
    const vb = (b[k] as number | undefined) ?? 0;
    pose[k] = va + (vb - va) * t;
  }
  return { pose, segment: i };
}
