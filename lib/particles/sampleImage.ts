import { rampColor } from './palette';

export interface SampledImage {
  src: string;
  /** width / height of the source image */
  aspect: number;
  count: number;
  /** xyz per particle. xy in units of half the image height (centred, +y down); z = luminance - 0.5 */
  positions: Float32Array;
  /** rgb per particle, already mapped through GOLD_RAMP */
  colors: Float32Array;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Turn an image into `count` particles. Brighter pixels get proportionally more particles
 * (cumulative weights + binary search). Runs once per image on the CPU.
 */
export function sampleImage(img: HTMLImageElement, src: string, count: number, maxSide = 720): SampledImage {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.min(1, maxSide / Math.max(iw, ih));
  const w = Math.max(1, Math.round(iw * scale));
  const h = Math.max(1, Math.round(ih * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return fallbackCloud(src, count, iw / ih);
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const total = w * h;
  const lum = new Float32Array(total);
  const feather = new Float32Array(total);
  const cumulative = new Float64Array(total);
  let acc = 0;

  for (let y = 0; y < h; y++) {
    const fy = (y + 0.5) / h;
    const vy = smoothstep(0, 0.08, fy) * smoothstep(0, 0.08, 1 - fy);
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const p = i * 4;
      const l = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
      const fx = (x + 0.5) / w;
      const f = smoothstep(0, 0.12, fx) * smoothstep(0, 0.12, 1 - fx) * vy;
      const wgt = Math.pow(Math.max(0, (l - 0.1) / 0.9), 1.25) * f;
      lum[i] = l;
      feather[i] = f;
      acc += wgt;
      cumulative[i] = acc;
    }
  }

  if (acc <= 0) return fallbackCloud(src, count, w / h);

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const halfH = h / 2;
  const halfW = w / 2;

  for (let n = 0; n < count; n++) {
    const r = Math.random() * acc;
    let lo = 0;
    let hi = total - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    const x = lo % w;
    const y = (lo / w) | 0;
    const l = lum[lo];
    const o = n * 3;
    positions[o] = (x + 0.5 + (Math.random() - 0.5) - halfW) / halfH;
    positions[o + 1] = (y + 0.5 + (Math.random() - 0.5) - halfH) / halfH;
    positions[o + 2] = l - 0.5;
    rampColor(l, colors, o);
    // fade colour slightly along the feathered border so the image melts into the sky
    const fade = 0.35 + 0.65 * feather[lo];
    colors[o] *= fade;
    colors[o + 1] *= fade;
    colors[o + 2] *= fade;
  }

  return { src, aspect: w / h, count, positions, colors };
}

/** Soft gold nebula used when an image can't be loaded, so the particle mapping still works. */
export function fallbackCloud(src: string, count: number, aspect = 1): SampledImage {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let n = 0; n < count; n++) {
    const a = Math.random() * Math.PI * 2;
    const rad = Math.pow(Math.random(), 0.6) * 0.9;
    const l = 0.3 + 0.7 * (1 - rad);
    const o = n * 3;
    positions[o] = Math.cos(a) * rad * aspect;
    positions[o + 1] = Math.sin(a) * rad;
    positions[o + 2] = l - 0.5;
    rampColor(l * 0.8, colors, o);
  }
  return { src, aspect, count, positions, colors };
}
