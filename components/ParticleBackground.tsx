'use client';

import { useEffect, useRef, useState } from 'react';
import { useSmoothScroll } from './SmoothScroll';
import { PAGE_BG, VIGNETTE_BG } from '@/lib/particles/palette';
import { fallbackCloud, loadImage, sampleImage, type SampledImage } from '@/lib/particles/sampleImage';
import { MORPH_VERT, POINT_FRAG, STAR_VERT, createProgram } from '@/lib/particles/shaders';
import { createStarfield } from '@/lib/particles/starfield';

type Status = 'loading' | 'ready' | 'fallback';

interface SectionRef {
  el: HTMLElement;
  src: string;
}

const MOBILE_BREAKPOINT = 760;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function getSections(): SectionRef[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-img]'))
    .map((el) => ({ el, src: el.dataset.img ?? '' }))
    .filter((s) => s.src);
}

/**
 * Easing applied to the section progress each frame (defined at 60fps).
 * Lenis already smooths the scroll, so this only needs to take the edge off.
 * Without Lenis (reduced motion) the scroll is raw, so the original, heavier easing is used.
 */
export const PARTICLE_SCROLL_EASE = 0.18;
export const PARTICLE_SCROLL_EASE_NATIVE = 0.08;

/**
 * f = sectionIndex + progress, measured between the vertical centres of consecutive sections.
 * `scroll` is the smoothed Lenis scroll (or window.scrollY without Lenis).
 */
function computeF(sections: SectionRef[], scroll: number): number {
  const n = sections.length;
  if (n < 2) return 0;
  const vc = scroll + window.innerHeight / 2;
  const nativeY = window.scrollY;
  // document-space centres (rect + the native scroll at the same instant)
  const centers = sections.map(({ el }) => {
    const r = el.getBoundingClientRect();
    return r.top + nativeY + r.height / 2;
  });
  if (vc <= centers[0]) return 0;
  for (let i = 0; i < n - 1; i++) {
    if (vc < centers[i + 1]) {
      const span = centers[i + 1] - centers[i];
      return i + (span > 0 ? clamp01((vc - centers[i]) / span) : 1);
    }
  }
  return n - 1;
}

/** Where an image sits on screen: centre (device px) and px per unit (= half displayed height). */
function layoutFor(aspect: number, W: number, H: number, mobile: boolean): [number, number, number] {
  let cx: number;
  let cy: number;
  let dispH: number;
  if (aspect >= 1) {
    if (mobile) {
      dispH = Math.min(W / aspect, H * 0.6);
      cx = W * 0.5;
      cy = H * 0.36;
    } else {
      dispH = Math.min(H * 0.78, (W * 0.82) / aspect);
      cx = W * 0.58;
      cy = H * 0.6;
    }
  } else if (mobile) {
    dispH = Math.min(H * 0.86, (W * 0.96) / aspect);
    cx = W * 0.5;
    cy = H * 0.46;
  } else {
    dispH = Math.min(H * 0.94, (W * 0.6) / aspect);
    cx = W * 0.68;
    cy = H * 0.5;
  }
  return [cx, cy, dispH / 2];
}

function getGL(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  const opts: WebGLContextAttributes = {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  };
  try {
    return (
      (canvas.getContext('webgl', opts) as WebGLRenderingContext | null) ??
      (canvas.getContext('experimental-webgl', opts) as WebGLRenderingContext | null)
    );
  } catch {
    return null;
  }
}

/** Dark-theme background. `active=false` pauses rendering (light theme shown instead). */
export default function ParticleBackground({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // read by the running frame loop
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  const fallbackRef = useRef<HTMLDivElement>(null);
  // the site's single rAF loop (Lenis runs first each frame, then this renderer)
  const smooth = useSmoothScroll();
  const [status, setStatus] = useState<Status>('loading');
  const [fallbackSrcs, setFallbackSrcs] = useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ---- environment -------------------------------------------------------------
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = reduceMq.matches;
    const onReduceChange = (e: MediaQueryListEvent) => {
      reduced = e.matches;
    };
    reduceMq.addEventListener('change', onReduceChange);

    const mobileAtStart = window.innerWidth < MOBILE_BREAKPOINT;
    const N = mobileAtStart ? 34000 : 70000;
    const GAIN = mobileAtStart ? 0.55 : 0.42;
    const STAR_COUNT = mobileAtStart ? 300 : 600;

    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let disposed = false;
    let raf = 0;
    let mode: 'gl' | 'fallback' = 'gl';
    let sections = getSections();
    let fShown = -1;
    const start = performance.now();

    // ---- input -------------------------------------------------------------------
    const OFF = -1e5;
    const mouseTarget = { x: OFF, y: OFF, nx: 0 };
    const mouse = { x: OFF, y: OFF, nx: 0 };
    const onPointerMove = (e: PointerEvent) => {
      mouseTarget.x = e.clientX * dpr;
      mouseTarget.y = e.clientY * dpr;
      mouseTarget.nx = (e.clientX / window.innerWidth) * 2 - 1;
      if (mouse.x === OFF) {
        mouse.x = mouseTarget.x;
        mouse.y = mouseTarget.y;
      }
    };
    const onPointerAway = (e: PointerEvent) => {
      if (e.type === 'pointerout' && e.relatedTarget) return;
      if (e.type === 'pointerup' && e.pointerType === 'mouse') return;
      mouseTarget.x = mouseTarget.y = mouse.x = mouse.y = OFF;
      mouseTarget.nx = 0;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerout', onPointerAway, { passive: true });
    window.addEventListener('pointerup', onPointerAway, { passive: true });

    // ---- image sampling ----------------------------------------------------------
    const cache = new Map<string, SampledImage>();
    const pending = new Set<string>();
    let announcedReady = false;

    const checkReady = () => {
      if (announcedReady || disposed || mode !== 'gl') return;
      if (sections.every((s) => cache.has(s.src))) {
        announcedReady = true;
        setStatus('ready');
      }
    };

    const ensureSampled = () => {
      if (mode !== 'gl') return;
      for (const { src } of sections) {
        if (cache.has(src) || pending.has(src)) continue;
        pending.add(src);
        loadImage(src)
          .then((img) => sampleImage(img, src, N))
          .catch(() => fallbackCloud(src, N))
          .then((sampled) => {
            pending.delete(src);
            if (disposed) return;
            cache.set(src, sampled);
            checkReady();
          });
      }
    };

    // ---- fallback (no WebGL / context lost) --------------------------------------
    const enterFallback = () => {
      mode = 'fallback';
      const srcs = Array.from(new Set(sections.map((s) => s.src)));
      Promise.resolve().then(() => {
        if (disposed) return;
        setFallbackSrcs(srcs);
        setStatus('fallback');
      });
    };

    const updateFallback = () => {
      const root = fallbackRef.current;
      if (!root) return;
      const imgs = root.querySelectorAll<HTMLImageElement>('img');
      const weights = new Map<string, number>();
      sections.forEach((s, k) => {
        const w = Math.max(0, 1 - Math.abs(fShown - k));
        weights.set(s.src, Math.max(weights.get(s.src) ?? 0, w));
      });
      imgs.forEach((img) => {
        img.style.opacity = String((weights.get(img.dataset.src ?? '') ?? 0) * 0.55);
      });
    };

    // ---- WebGL setup -------------------------------------------------------------
    let gl = getGL(canvas);
    let morphProg: WebGLProgram | null = null;
    let starProg: WebGLProgram | null = null;
    if (gl) {
      try {
        morphProg = createProgram(gl, MORPH_VERT, POINT_FRAG);
        starProg = createProgram(gl, STAR_VERT, POINT_FRAG);
      } catch (err) {
        console.warn('[ParticleBackground] WebGL program failed, using image fallback.', err);
        gl = null;
      }
    }

    const buffers: WebGLBuffer[] = [];
    const makeBuffer = (data: Float32Array | number, usage: number): WebGLBuffer => {
      const g = gl!;
      const b = g.createBuffer()!;
      g.bindBuffer(g.ARRAY_BUFFER, b);
      if (typeof data === 'number') g.bufferData(g.ARRAY_BUFFER, data, usage);
      else g.bufferData(g.ARRAY_BUFFER, data, usage);
      buffers.push(b);
      return b;
    };

    type Attr = { loc: number; buf: WebGLBuffer; size: number };
    let morphAttrs: Attr[] = [];
    let starAttrs: Attr[] = [];
    let mu: Record<string, WebGLUniformLocation | null> = {};
    let su: Record<string, WebGLUniformLocation | null> = {};
    let bufPosA: WebGLBuffer | null = null;
    let bufPosB: WebGLBuffer | null = null;
    let bufColA: WebGLBuffer | null = null;
    let bufColB: WebGLBuffer | null = null;

    const uniforms = (prog: WebGLProgram, names: string[]) =>
      Object.fromEntries(names.map((n) => [n, gl!.getUniformLocation(prog, n)]));

    if (gl && morphProg && starProg) {
      const bytes = N * 3 * 4;
      bufPosA = makeBuffer(bytes, gl.DYNAMIC_DRAW);
      bufPosB = makeBuffer(bytes, gl.DYNAMIC_DRAW);
      bufColA = makeBuffer(bytes, gl.DYNAMIC_DRAW);
      bufColB = makeBuffer(bytes, gl.DYNAMIC_DRAW);

      const rand = new Float32Array(N * 4);
      for (let i = 0; i < N; i++) {
        const a = Math.random() * Math.PI * 2;
        const m = 0.35 + 0.65 * Math.random();
        rand[i * 4] = Math.cos(a) * m;
        rand[i * 4 + 1] = Math.sin(a) * m;
        rand[i * 4 + 2] = Math.random();
        rand[i * 4 + 3] = Math.random();
      }
      const bufRand = makeBuffer(rand, gl.STATIC_DRAW);

      const stars = createStarfield(STAR_COUNT);
      const bufSeed = makeBuffer(stars.seed, gl.STATIC_DRAW);
      const bufLook = makeBuffer(stars.look, gl.STATIC_DRAW);
      const bufStarCol = makeBuffer(stars.color, gl.STATIC_DRAW);

      const ml = (n: string) => gl!.getAttribLocation(morphProg!, n);
      const sl = (n: string) => gl!.getAttribLocation(starProg!, n);
      morphAttrs = [
        { loc: ml('aPosA'), buf: bufPosA, size: 3 },
        { loc: ml('aPosB'), buf: bufPosB, size: 3 },
        { loc: ml('aColA'), buf: bufColA, size: 3 },
        { loc: ml('aColB'), buf: bufColB, size: 3 },
        { loc: ml('aRand'), buf: bufRand, size: 4 },
      ];
      starAttrs = [
        { loc: sl('aSeed'), buf: bufSeed, size: 4 },
        { loc: sl('aLook'), buf: bufLook, size: 4 },
        { loc: sl('aColor'), buf: bufStarCol, size: 3 },
      ];
      mu = uniforms(morphProg, [
        'uView', 'uLayoutA', 'uLayoutB', 'uT', 'uTime', 'uDpr', 'uMouse', 'uMouseX',
        'uRepel', 'uMotion', 'uMode', 'uGain', 'uAlpha', 'uPointSize',
      ]);
      su = uniforms(starProg, ['uView', 'uTime', 'uDpr', 'uScroll', 'uBox', 'uMotion', 'uGain']);
      ensureSampled();
      if (sections.length === 0) checkReady();
    } else {
      enterFallback();
    }

    const bindAttrs = (attrs: Attr[]) => {
      const g = gl!;
      for (const a of attrs) {
        if (a.loc < 0) continue;
        g.bindBuffer(g.ARRAY_BUFFER, a.buf);
        g.enableVertexAttribArray(a.loc);
        g.vertexAttribPointer(a.loc, a.size, g.FLOAT, false, 0, 0);
      }
    };
    const unbindAttrs = (attrs: Attr[]) => {
      for (const a of attrs) if (a.loc >= 0) gl!.disableVertexAttribArray(a.loc);
    };

    // Only the current A → B pair lives on the GPU.
    let pairKey = '';
    let pairA: SampledImage | null = null;
    let pairB: SampledImage | null = null;
    const uploadPair = (a: SampledImage, b: SampledImage) => {
      const key = `${a.src}|${b.src}`;
      if (key === pairKey) return;
      const g = gl!;
      g.bindBuffer(g.ARRAY_BUFFER, bufPosA);
      g.bufferSubData(g.ARRAY_BUFFER, 0, a.positions);
      g.bindBuffer(g.ARRAY_BUFFER, bufColA);
      g.bufferSubData(g.ARRAY_BUFFER, 0, a.colors);
      g.bindBuffer(g.ARRAY_BUFFER, bufPosB);
      g.bufferSubData(g.ARRAY_BUFFER, 0, b.positions);
      g.bindBuffer(g.ARRAY_BUFFER, bufColB);
      g.bufferSubData(g.ARRAY_BUFFER, 0, b.colors);
      pairKey = key;
      pairA = a;
      pairB = b;
    };

    // ---- resize ------------------------------------------------------------------
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Sections may change (route change, lazy content) — rescan periodically.
    const rescan = window.setInterval(() => {
      const next = getSections();
      const changed =
        next.length !== sections.length || next.some((s, i) => s.el !== sections[i].el || s.src !== sections[i].src);
      if (!changed) return;
      sections = next;
      if (mode === 'gl') ensureSampled();
      else enterFallback();
    }, 1000);

    // ---- frame loop --------------------------------------------------------------
    let lastNow = 0;
    const frame = (now: number) => {
      if (!activeRef.current) {
        fShown = -1; // snap to the current section when shown again
        lastNow = 0;
        return; // hidden theme: don't render
      }
      // per-frame easing factors are defined at 60fps; convert so speed is frame-rate independent
      const dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 1 / 60;
      lastNow = now;
      const ease = (k: number) => 1 - Math.pow(1 - k, dt * 60);
      const scroll = smooth ? smooth.getScroll() : window.scrollY;
      const f = computeF(sections, scroll);
      const scrollEase = smooth?.getLenis() ? PARTICLE_SCROLL_EASE : PARTICLE_SCROLL_EASE_NATIVE;
      fShown = fShown < 0 ? f : fShown + (f - fShown) * ease(scrollEase);

      if (mode === 'fallback') {
        updateFallback();
        return;
      }
      const g = gl;
      if (!g || !morphProg || !starProg) return;

      const time = ((now - start) / 1000) % 10000;
      const W = canvas.width;
      const H = canvas.height;
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      const motion = reduced ? 0 : 1;

      mouse.x += (mouseTarget.x - mouse.x) * ease(0.25);
      mouse.y += (mouseTarget.y - mouse.y) * ease(0.25);
      mouse.nx += (mouseTarget.nx - mouse.nx) * ease(0.05);

      // pick the current pair
      const n = sections.length;
      let i = 0;
      let raw = 0;
      if (n >= 2) {
        i = Math.min(n - 2, Math.max(0, Math.floor(fShown)));
        raw = clamp01(fShown - i);
      }
      const t = clamp01((raw - 0.12) / 0.76);
      if (n > 0) {
        const a = cache.get(sections[i].src);
        const b = cache.get(sections[Math.min(i + 1, n - 1)].src);
        if (a && b) uploadPair(a, b);
      }
      const visible = n > 0 && pairA !== null && pairB !== null && pairKey === `${sections[i].src}|${sections[Math.min(i + 1, n - 1)].src}`;

      g.viewport(0, 0, W, H);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.enable(g.BLEND);
      g.blendFunc(g.ONE, g.ONE);

      let la: [number, number, number] = [0, 0, 0];
      let lb: [number, number, number] = [0, 0, 0];
      let box: [number, number, number, number] = [OFF, OFF, OFF, OFF];
      if (visible && pairA && pairB) {
        la = layoutFor(pairA.aspect, W, H, mobile);
        lb = layoutFor(pairB.aspect, W, H, mobile);
        const ba = [la[0] - pairA.aspect * la[2], la[1] - la[2], la[0] + pairA.aspect * la[2], la[1] + la[2]];
        const bb = [lb[0] - pairB.aspect * lb[2], lb[1] - lb[2], lb[0] + pairB.aspect * lb[2], lb[1] + lb[2]];
        box = [0, 1, 2, 3].map((k) => ba[k] + (bb[k] - ba[k]) * t) as typeof box;
      }

      // 1) background stars (independent of the morph)
      g.useProgram(starProg);
      g.uniform2f(su.uView, W, H);
      g.uniform1f(su.uTime, time);
      g.uniform1f(su.uDpr, dpr);
      g.uniform1f(su.uScroll, scroll * dpr);
      g.uniform4f(su.uBox, box[0], box[1], box[2], box[3]);
      g.uniform1f(su.uMotion, motion);
      g.uniform1f(su.uGain, 0.85);
      bindAttrs(starAttrs);
      g.drawArrays(g.POINTS, 0, STAR_COUNT);
      unbindAttrs(starAttrs);

      // 2) image particles
      if (visible) {
        g.useProgram(morphProg);
        g.uniform2f(mu.uView, W, H);
        g.uniform3f(mu.uLayoutA, la[0], la[1], la[2]);
        g.uniform3f(mu.uLayoutB, lb[0], lb[1], lb[2]);
        g.uniform1f(mu.uT, t);
        g.uniform1f(mu.uTime, time);
        g.uniform1f(mu.uDpr, dpr);
        g.uniform2f(mu.uMouse, mouse.x, mouse.y);
        g.uniform1f(mu.uMouseX, mouse.nx);
        g.uniform1f(mu.uRepel, reduced ? 0 : 120 * dpr);
        g.uniform1f(mu.uMotion, motion);
        g.uniform1f(mu.uGain, GAIN);
        g.uniform1f(mu.uPointSize, 2.2 * dpr);
        bindAttrs(morphAttrs);
        if (reduced) {
          // cross-fade only: A fades out in place, B fades in in place
          g.uniform1f(mu.uMode, 1);
          g.uniform1f(mu.uAlpha, 1 - t);
          if (t < 1) g.drawArrays(g.POINTS, 0, N);
          g.uniform1f(mu.uMode, 2);
          g.uniform1f(mu.uAlpha, t);
          if (t > 0) g.drawArrays(g.POINTS, 0, N);
        } else {
          g.uniform1f(mu.uMode, 0);
          g.uniform1f(mu.uAlpha, 1);
          g.drawArrays(g.POINTS, 0, N);
        }
        unbindAttrs(morphAttrs);
      }
    };

    // Prefer the shared loop (SmoothScroll pauses it while the tab is hidden).
    // Standalone fallback only if this component is ever rendered outside <SmoothScroll>.
    let unsubscribeFrame: (() => void) | null = null;
    const standalone = (now: number) => {
      raf = requestAnimationFrame(standalone);
      frame(now);
    };
    const startLoop = () => {
      lastNow = 0;
      if (smooth) {
        unsubscribeFrame ??= smooth.addFrameCallback(frame);
      } else if (!raf && !document.hidden) {
        raf = requestAnimationFrame(standalone);
      }
    };
    const stopLoop = () => {
      unsubscribeFrame?.();
      unsubscribeFrame = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => {
      if (!smooth) (document.hidden ? stopLoop : startLoop)();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      enterFallback();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    startLoop();

    // ---- cleanup -----------------------------------------------------------------
    return () => {
      disposed = true;
      stopLoop();
      window.clearInterval(rescan);
      ro.disconnect();
      reduceMq.removeEventListener('change', onReduceChange);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerAway);
      window.removeEventListener('pointerup', onPointerAway);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      if (gl && !gl.isContextLost()) {
        for (const b of buffers) gl.deleteBuffer(b);
        if (morphProg) gl.deleteProgram(morphProg);
        if (starProg) gl.deleteProgram(starProg);
      }
      cache.clear();
    };
  }, [smooth]);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none">
        {/* page background + subtle vignette */}
        <div
          className="fixed inset-0 -z-30"
          style={{ background: `radial-gradient(ellipse at 55% 45%, ${VIGNETTE_BG} 0%, ${PAGE_BG} 75%)` }}
        />
        <canvas
          ref={canvasRef}
          className="fixed inset-0 -z-10 h-full w-full"
          style={{ opacity: status === 'fallback' ? 0 : 1 }}
        />
        {status === 'fallback' && (
          <div ref={fallbackRef} className="fixed inset-0 -z-10">
            {fallbackSrcs.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                data-src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-contain md:object-right"
                style={{ opacity: 0 }}
              />
            ))}
          </div>
        )}
        {/* readability gradient behind text: bottom on mobile, left on desktop */}
        <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#050506]/80 via-[#050506]/30 via-30% to-transparent md:bg-linear-to-r md:from-[#050506]/75 md:via-[#050506]/25" />
      </div>
      <div
        role="status"
        aria-hidden={status !== 'loading'}
        className={`pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-[#e8b56a]/80 md:bottom-8 transition-opacity duration-1000 ${
          status === 'loading' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Gathering stars…
      </div>
    </>
  );
}
