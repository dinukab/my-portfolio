/**
 * Single warm-gold palette used to recolour every image (taken from the "halo" artwork).
 * Change the stops here and every section image + the background stars follow.
 */
export interface RampStop {
  /** Position on the luminance axis, 0..1 */
  at: number;
  /** Hex colour */
  color: string;
}

export const GOLD_RAMP: readonly RampStop[] = [
  { at: 0.0, color: '#000000' }, // transparent / no particle
  { at: 0.25, color: '#3a2a1a' }, // deep bronze
  { at: 0.5, color: '#9c6b32' }, // amber
  { at: 0.75, color: '#e8b56a' }, // warm gold
  { at: 1.0, color: '#fff3dc' }, // soft white-gold highlight
];

export const PAGE_BG = '#050506';
export const VIGNETTE_BG = '#0b0c10';

/** Cooler accent used for ~15% of the background stars. */
export const COOL_STAR = '#cfd8ff';

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const LUT_SIZE = 256;
let lut: Float32Array | null = null;
let lutSource: readonly RampStop[] | null = null;

function buildLut(ramp: readonly RampStop[]): Float32Array {
  const stops = [...ramp].sort((a, b) => a.at - b.at).map((s) => ({ at: s.at, rgb: hexToRgb(s.color) }));
  const out = new Float32Array(LUT_SIZE * 3);
  for (let i = 0; i < LUT_SIZE; i++) {
    const l = i / (LUT_SIZE - 1);
    let j = 0;
    while (j < stops.length - 2 && l > stops[j + 1].at) j++;
    const a = stops[j];
    const b = stops[Math.min(j + 1, stops.length - 1)];
    const span = b.at - a.at;
    const k = span > 0 ? Math.min(1, Math.max(0, (l - a.at) / span)) : 0;
    out[i * 3] = a.rgb[0] + (b.rgb[0] - a.rgb[0]) * k;
    out[i * 3 + 1] = a.rgb[1] + (b.rgb[1] - a.rgb[1]) * k;
    out[i * 3 + 2] = a.rgb[2] + (b.rgb[2] - a.rgb[2]) * k;
  }
  return out;
}

/**
 * Map a luminance value (0..1) onto GOLD_RAMP. Returns linear 0..1 RGB.
 * Pass `out`/`offset` to write straight into a typed array without allocating.
 */
export function rampColor(l: number): RGB;
export function rampColor(l: number, out: Float32Array, offset: number): Float32Array;
export function rampColor(l: number, out?: Float32Array, offset = 0): RGB | Float32Array {
  if (!lut || lutSource !== GOLD_RAMP) {
    lut = buildLut(GOLD_RAMP);
    lutSource = GOLD_RAMP;
  }
  const i = Math.round(Math.min(1, Math.max(0, l)) * (LUT_SIZE - 1)) * 3;
  if (out) {
    out[offset] = lut[i];
    out[offset + 1] = lut[i + 1];
    out[offset + 2] = lut[i + 2];
    return out;
  }
  return [lut[i], lut[i + 1], lut[i + 2]];
}
