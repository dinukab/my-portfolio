/**
 * GLSL (WebGL1) for the image-morph particles and the background starfield.
 * All positions are in device pixels with a top-left origin.
 */

export const MORPH_VERT = /* glsl */ `
precision highp float;

attribute vec3 aPosA;
attribute vec3 aPosB;
attribute vec3 aColA;
attribute vec3 aColB;
attribute vec4 aRand; // xy scatter dir, z phase, w delay

uniform vec2 uView;
uniform vec3 uLayoutA;   // cx, cy, px per unit (half displayed height)
uniform vec3 uLayoutB;
uniform float uT;
uniform float uTime;
uniform float uDpr;
uniform vec2 uMouse;     // device px
uniform float uMouseX;   // eased, -1..1
uniform float uRepel;    // radius in device px
uniform float uMotion;   // 1 = full motion, 0 = reduced motion
uniform float uMode;     // 0 = morph, 1 = A only, 2 = B only (reduced-motion cross-fade)
uniform float uGain;
uniform float uAlpha;
uniform float uPointSize;

varying vec3 vColor;

void main() {
  float e;
  if (uMode < 0.5) {
    float p = clamp(uT * 1.45 - aRand.w * 0.45, 0.0, 1.0);
    e = p * p * (3.0 - 2.0 * p);
  } else if (uMode < 1.5) {
    e = 0.0;
  } else {
    e = 1.0;
  }

  vec2 pa = uLayoutA.xy + aPosA.xy * uLayoutA.z;
  vec2 pb = uLayoutB.xy + aPosB.xy * uLayoutB.z;
  vec2 p = mix(pa, pb, e);

  float burst = sin(3.14159265 * e) * uMotion;
  p += aRand.xy * burst * 0.55 * min(uView.x, uView.y);

  float z = mix(aPosA.z, aPosB.z, e);
  float scale = mix(uLayoutA.z, uLayoutB.z, e);
  p.x += z * uMouseX * 0.05 * scale * uMotion;

  float ph = aRand.z * 6.2831853;
  p += vec2(sin(uTime * 0.9 + ph), cos(uTime * 1.1 + ph * 1.3)) * uDpr * uMotion;

  vec2 d = p - uMouse;
  float dist = length(d);
  if (dist < uRepel && dist > 0.001) {
    float f = 1.0 - dist / uRepel;
    p += (d / dist) * f * f * uRepel * 0.6;
  }

  vec2 clip = (p / uView) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = uPointSize * (1.0 + 0.6 * burst);

  float tw = 1.0 - 0.3 * uMotion * (0.5 + 0.5 * sin(uTime * (1.3 + aRand.z * 2.2) + aRand.w * 40.0));
  vColor = mix(aColA, aColB, e) * uGain * uAlpha * tw;
}
`;

export const STAR_VERT = /* glsl */ `
precision highp float;

attribute vec4 aSeed;  // x0, y0 (0..1), period (s), phase (0..1)
attribute vec4 aLook;  // peak opacity, size px, drift angle, drift speed px/s
attribute vec3 aColor;

uniform vec2 uView;
uniform float uTime;
uniform float uDpr;
uniform float uScroll; // device px
uniform vec4 uBox;     // current image bounds: x0, y0, x1, y1 (device px)
uniform float uMotion;
uniform float uGain;

varying vec3 vColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float period = aSeed.z;
  float tt = uTime / period + aSeed.w;
  float l = fract(tt);
  float cycle = floor(tt);

  vec2 base = aSeed.xy;
  float op = aLook.x * 0.4;
  if (uMotion > 0.5) {
    // respawn at a new random spot each cycle
    base = vec2(hash(aSeed.xy + cycle * 1.37), hash(aSeed.yx * 1.91 + cycle * 2.11 + 7.0));
    op = aLook.x * smoothstep(0.0, 0.4, l) * (1.0 - smoothstep(0.6, 1.0, l));
  }

  vec2 p = base * uView;
  vec2 dir = vec2(cos(aLook.z), sin(aLook.z));
  p += dir * aLook.w * uDpr * l * period * uMotion;
  p.y = mod(p.y - uScroll * 0.03 * uMotion, uView.y);

  // keep stars dim where the main image is
  float m = 40.0 * uDpr;
  vec2 inside = smoothstep(uBox.xy - m, uBox.xy + m, p) * (1.0 - smoothstep(uBox.zw - m, uBox.zw + m, p));
  op *= 1.0 - 0.75 * inside.x * inside.y;

  vec2 clip = (p / uView) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = (aLook.y + 1.5) * uDpr;
  vColor = aColor * op * uGain;
}
`;

/** Soft round point shared by both systems (additive blending, premultiplied output). */
export const POINT_FRAG = /* glsl */ `
precision mediump float;
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float a = 1.0 - smoothstep(0.12, 0.5, r);
  vec3 col = vColor * a;
  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('createShader failed');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

export function createProgram(gl: WebGLRenderingContext, vert: string, frag: string): WebGLProgram {
  const vs = compile(gl, gl.VERTEX_SHADER, vert);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  const program = gl.createProgram();
  if (!program) throw new Error('createProgram failed');
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${log}`);
  }
  return program;
}
