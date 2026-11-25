'use client';

import { useEffect, useRef } from 'react';
import { LENIS_LERP, useSmoothScroll } from '../SmoothScroll';
import HandShadow, { type HandShadowHandle } from './HandShadow';
import FrostedOverlay from './FrostedOverlay';
import {
  CHOREOGRAPHY,
  FINGER_BLUR_FACTOR,
  MAX_OPACITY_OVER_TEXT,
  blurForDepth,
  opacityForDepth,
  poseAt,
  resolveKeyframes,
  scaleForDepth,
  type HandPose,
} from '@/lib/hand/choreography';

const SECTION_IDS = ['home', 'about', 'projects', 'contact'];
/** scrolling back up: snap back in 0.6× the time ("it noticed you") */
const SNAP_BACK_FACTOR = 0.6;
const CREEP_IDLE_MS = 2000;
const CREEP_SPEED = 25; // px/s
const RECOIL_DEPTH = 0.4;
const RECOIL_RISE_MS = 250;
const LOAD_DRIFT_MS = 3000;
const FINGERPRINT_FADE_MS = 2000;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** per-60fps-frame lerp factor → this frame's factor */
const frameK = (k: number, dt: number) => 1 - Math.pow(1 - k, dt * 60);

/** Light-mode background: warm frosted page, the hand shadow behind the glass, and the grain film. */
export default function LightBackground() {
  const handRef = useRef<HandShadowHandle>(null);
  const smooth = useSmoothScroll();
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = reduceMq.matches;
    const onReduce = (e: MediaQueryListEvent) => (reduced = e.matches);
    reduceMq.addEventListener('change', onReduce);

    const fine = window.matchMedia('(pointer: fine)').matches;
    const mouse = { x: -1, y: -1 };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    // paragraphs the hand must not darken (document coords, refreshed periodically)
    let paragraphs: { l: number; t: number; r: number; b: number }[] = [];
    const measureText = () => {
      const y = window.scrollY;
      paragraphs = Array.from(document.querySelectorAll<HTMLElement>('main p')).map((el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left, t: r.top + y, r: r.right, b: r.bottom + y };
      });
    };
    measureText();
    const measureTimer = window.setInterval(measureText, 1000);
    window.addEventListener('resize', measureText);

    const start = performance.now();
    let last = 0;
    let lastScroll = smooth ? smooth.getScroll() : window.scrollY;
    let lastScrollTime = 0;
    let cur: HandPose | null = null;
    const creep = { x: 0, y: 0 };
    let recoil = 0;
    let recoilUntil = 0;
    let capK = 0;
    let wasIdle = false;
    let fingerprint = 0;
    const twitch = [0, 0, 0, 0, 0];
    let twitchFinger = -1;
    let twitchAmp = 0;
    let twitchAt = 0;
    let nextTwitch = start + 5000 + Math.random() * 7000;

    const frame = (now: number) => {
      const hand = handRef.current;
      if (!hand) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;
      const H = (mobile ? 0.4 : 0.55) * vh;
      const scroll = smooth ? smooth.getScroll() : window.scrollY;
      const lenis = smooth?.getLenis();
      const velocity = lenis ? lenis.velocity : (scroll - lastScroll) / Math.max(dt * 60, 1);
      if (Math.abs(scroll - lastScroll) > 0.5) lastScrollTime = now;
      lastScroll = scroll;

      // layout → keyframes in overall page progress
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const nativeY = window.scrollY;
      const sections: Record<string, { top: number; height: number }> = {};
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          sections[id] = { top: r.top + nativeY, height: r.height };
        }
      }
      const kfs = resolveKeyframes(CHOREOGRAPHY, { maxScroll, sections });
      const progress = clamp01(scroll / maxScroll);
      const { pose: target, segment } = poseAt(kfs, progress);
      const seg = kfs[segment];
      const heroH = sections.home?.height ?? vh;

      if (reduced) {
        // one static, faint pressed hand behind the hero; it only fades as the hero leaves
        const still = poseAt(kfs, kfs[1].p).pose;
        cur = { ...still, opacity: 0.5 * (1 - clamp01(scroll / (heroH * 0.8))) };
      } else {
        // on load it drifts a little closer on its own (only near the top)
        target.depth -= 0.15 * easeOut(clamp01((now - start) / LOAD_DRIFT_MS)) * (1 - clamp01(scroll / (heroH * 0.4)));

        // heavy follow with the Lenis lerp; scrolling up snaps back in 0.6× the time
        const k = velocity < -0.5 ? 1 - Math.pow(1 - LENIS_LERP, 1 / SNAP_BACK_FACTOR) : LENIS_LERP;
        if (!cur) cur = { ...target };
        else {
          const f = frameK(k, dt);
          for (const key of Object.keys(target) as (keyof HandPose)[]) cur[key] += (target[key] - cur[key]) * f;
        }
      }

      const pose = { ...cur };
      let x = pose.x * vw;
      let y = pose.y * vh;
      let scale = 1;
      let rotate = pose.rotate;
      let stretchY = 1;
      let extraBlur = 0;

      if (!reduced) {
        // fast scrolling: motion stretch + blur; very fast: it pulls away
        const av = Math.abs(velocity);
        stretchY = 1 + Math.min(0.08, av * 0.0016);
        extraBlur = Math.min(12, av * 0.25);
        pose.depth += Math.min(0.35, Math.max(0, av - 40) * 0.01);

        // idle "breathing" and a tiny sway
        scale *= 1 + 0.0075 * (1 - Math.cos(((now - start) / 4000) * Math.PI * 2));
        rotate += 0.6 * Math.sin(((now - start) / 6000) * Math.PI * 2);

        // a random finger twitches every 5–12s
        if (now >= nextTwitch) {
          twitchFinger = Math.floor(Math.random() * 5);
          twitchAmp = (3 + Math.random() * 3) * (Math.random() < 0.5 ? -1 : 1);
          twitchAt = now;
          nextTwitch = now + 5000 + Math.random() * 7000;
        }
        twitch.fill(0);
        const tt = (now - twitchAt) / 420;
        if (twitchFinger >= 0 && tt < 1) twitch[twitchFinger] = twitchAmp * Math.sin(Math.PI * tt);

        // Projects: after 2s without scrolling it creeps toward the cursor (screen centre on touch)
        const idle = now - lastScrollTime > CREEP_IDLE_MS;
        if (seg.creep && idle) {
          const tx = !fine || mouse.x < 0 ? vw / 2 : mouse.x;
          const ty = !fine || mouse.y < 0 ? vh / 2 : mouse.y;
          const dx = tx - (x + creep.x);
          const dy = ty - (y + creep.y);
          const dist = Math.hypot(dx, dy);
          const step = Math.min(dist * 0.35, CREEP_SPEED * dt); // lags behind, never faster than 25px/s
          if (dist > 1) {
            creep.x += (dx / dist) * step;
            creep.y += (dy / dist) * step;
          }
        } else if (!idle) {
          // the reader scrolls again after it crept: recoil (depth +0.4 within 250ms), snatch the creep back
          if (wasIdle && seg.creep && Math.hypot(creep.x, creep.y) > 2) recoilUntil = now + 600;
          const back = frameK(0.18, dt);
          creep.x -= creep.x * back;
          creep.y -= creep.y * back;
        }
        if (!seg.creep && idle) {
          const back = frameK(0.05, dt);
          creep.x -= creep.x * back;
          creep.y -= creep.y * back;
        }
        wasIdle = idle;
        const recoilTarget = now < recoilUntil ? RECOIL_DEPTH : 0;
        const rk = recoilTarget > recoil ? 1 - Math.exp((-dt * 1000) / (RECOIL_RISE_MS / 3)) : frameK(0.04, dt);
        recoil += (recoilTarget - recoil) * rk;
        x += creep.x;
        y += creep.y;
        pose.depth += recoil;
      }
      pose.depth = clamp01(pose.depth);

      // About: grip the top edge of the panel from behind — clip the hand to the panel's bounds
      let clip = 'none';
      let mask = 'none';
      const gripK = clamp01(pose.grip);
      let gripBand: { l: number; t: number; r: number; b: number } | null = null;
      if (gripK > 0.001) {
        const panel = document.querySelector<HTMLElement>('[data-hand-grip]');
        if (panel) {
          const r = panel.getBoundingClientRect();
          const g = gripK;
          x += (r.left + Math.min(r.width * 0.3, H * 0.45) - x) * g;
          // knuckles sit just above the panel's top edge; the fingers hook over it and their tips dip inside.
          // Clip = the panel's sides and bottom, plus a soft (feathered) top a little above the edge;
          // inside the panel alone, its frosting would wash the fingertips out completely.
          const hook = H * 0.12;
          y += (r.top - H * 0.14 - y) * g;
          const inset = [0, vw - r.right, vh - r.bottom, r.left].map((v) => (Math.max(0, v) * g).toFixed(1) + 'px');
          clip = `inset(${inset.join(' ')} round 22px)`;
          const top = Math.max(0, r.top - hook) * g;
          const feather = 28 * g;
          mask = `linear-gradient(to bottom, transparent ${(top - feather).toFixed(1)}px, #000 ${(top + feather).toFixed(1)}px)`;
          // only the curled fingertips show: a band across the panel's top edge
          if (g > 0.5) gripBand = { l: x - H * 0.3, r: x + H * 0.3, t: r.top - hook, b: r.top + H * 0.08 };
        }
      }
      // gripping: the fingertips press against the glass (closer than the waiting palm)
      const fingerDepth = pose.depth * (1 - 0.6 * gripK);

      scale *= scaleForDepth(pose.depth);
      let opacity = opacityForDepth(pose.depth + (fingerDepth - pose.depth) * gripK) * clamp01(pose.opacity);

      // never darker than 0.2 behind body text
      const W = (H * 2) / 3;
      const rad = (rotate * Math.PI) / 180;
      const bw = (Math.abs(Math.cos(rad)) * W + Math.abs(Math.sin(rad)) * H) * scale * 0.42;
      const bh = (Math.abs(Math.sin(rad)) * W + Math.abs(Math.cos(rad)) * H) * scale * 0.42;
      const box = gripBand ?? { l: x - bw, r: x + bw, t: y - bh, b: y + bh }; // visible part only
      let overlaps = false;
      for (const p of paragraphs) {
        const t = p.t - nativeY;
        const b = p.b - nativeY;
        if (p.r > box.l && p.l < box.r && b > box.t && t < box.b) {
          overlaps = true;
          break;
        }
      }
      capK += ((overlaps ? 1 : 0) - capK) * frameK(0.2, dt);
      opacity -= (opacity - Math.min(opacity, MAX_OPACITY_OVER_TEXT)) * capK;

      const palmBlur = blurForDepth(pose.depth) + extraBlur;
      hand.setPose(
        {
          x,
          y,
          height: H,
          rotate,
          scale,
          stretchY,
          palmBlur,
          fingerBlur: (blurForDepth(fingerDepth) + extraBlur) * FINGER_BLUR_FACTOR,
          opacity,
          fingerSpread: clamp01(pose.fingerSpread),
          fingerCurl: clamp01(pose.fingerCurl),
          twitch,
          clip,
          mask,
          trail: !reduced && !!seg.trail && Math.abs(velocity) > 0.3,
        },
        now,
      );

      // very bottom: one faint fingerprint fades in near the send button over 2s
      const atBottom = !reduced && scroll >= maxScroll - 6;
      fingerprint = atBottom ? Math.min(1, fingerprint + (dt * 1000) / FINGERPRINT_FADE_MS) : Math.max(0, fingerprint - dt * 3);
      const btn = document.querySelector<HTMLElement>('[data-fingerprint]');
      if (btn && fingerprint > 0) {
        const r = btn.getBoundingClientRect();
        hand.setFingerprint(Math.min(vw - 24, r.right + 30), r.top + r.height / 2, 0.22 * fingerprint);
      } else hand.setFingerprint(0, 0, 0);
    };

    let raf = 0;
    let unsubscribe: (() => void) | null = null;
    if (smooth) unsubscribe = smooth.addFrameCallback(frame);
    else {
      const loop = (t: number) => {
        raf = requestAnimationFrame(loop);
        if (!document.hidden) frame(t);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      unsubscribe?.();
      cancelAnimationFrame(raf);
      window.clearInterval(measureTimer);
      window.removeEventListener('resize', measureText);
      window.removeEventListener('pointermove', onPointer);
      reduceMq.removeEventListener('change', onReduce);
    };
  }, [smooth]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* warm off-white with a soft light from the top-left */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 100% at 8% 0%, #faf8f6 0%, #f2efed 45%, #e7e2df 100%)' }} />
      <HandShadow ref={handRef} ghosts={coarse ? 2 : 4} />
      <FrostedOverlay />
    </div>
  );
}
