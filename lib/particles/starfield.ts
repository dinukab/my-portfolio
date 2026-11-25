import { COOL_STAR, hexToRgb, rampColor } from './palette';

export interface StarfieldData {
  count: number;
  /** x0, y0 (0..1), period (6–14 s), phase (0..1) */
  seed: Float32Array;
  /** peak opacity (0.15–0.6), size (1–2.2 px), drift angle, drift speed (px/s) */
  look: Float32Array;
  /** rgb */
  color: Float32Array;
}

/**
 * Independent background star layer. Positions/opacity are animated entirely in the
 * vertex shader (see STAR_VERT); this only creates the per-star random parameters.
 */
export function createStarfield(count: number): StarfieldData {
  const seed = new Float32Array(count * 4);
  const look = new Float32Array(count * 4);
  const color = new Float32Array(count * 3);
  const cool = hexToRgb(COOL_STAR);

  for (let i = 0; i < count; i++) {
    const s = i * 4;
    seed[s] = Math.random();
    seed[s + 1] = Math.random();
    seed[s + 2] = 6 + Math.random() * 8;
    seed[s + 3] = Math.random();

    look[s] = 0.15 + Math.random() * 0.45;
    look[s + 1] = 1 + Math.random() * 1.2;
    look[s + 2] = Math.random() * Math.PI * 2;
    look[s + 3] = 1 + Math.random() * 3;

    const c = i * 3;
    if (Math.random() < 0.15) {
      color[c] = cool[0];
      color[c + 1] = cool[1];
      color[c + 2] = cool[2];
    } else {
      rampColor(0.5 + Math.random() * 0.5, color, c);
    }
  }

  return { count, seed, look, color };
}
