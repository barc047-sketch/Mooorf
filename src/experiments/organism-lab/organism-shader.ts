/* V6E Organism Lab — raw WebGL2 implicit-field renderer.
   One fullscreen triangle; the fragment shader evaluates a continuous scalar
   field from a uniform array of nuclei every pixel, every frame. Topology
   (merge / split / internal voids) emerges from the field — never decided
   per-pair on the CPU.

   Three.js is not installed in this repo, so this module is the ShaderMaterial
   equivalent with zero dependencies: the GLSL below ports 1:1 into a Three.js
   fullscreen-quad ShaderMaterial if V6F chooses to adopt it. */

import { MAX_NUCLEI, type RGB } from "./organism-types";

export const ORGANISM_VERT = `#version 300 es
/* fullscreen triangle from gl_VertexID — no buffers, no attributes */
void main() {
  vec2 v = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const ORGANISM_FRAG = `#version 300 es
precision highp float;

#define MAX_NUCLEI ${MAX_NUCLEI}

uniform vec2 uResolution;
uniform int uCount;
/* xy = position (field units), z = radius, w = signed strength */
uniform vec4 uNuclei[MAX_NUCLEI];

uniform float uMass;
uniform float uIso;
uniform float uSoftness;
uniform float uTension;
uniform float uBias;

uniform float uPocketIso;
uniform float uPocketSoft;
uniform float uPocketAmount;

uniform vec3 uBodyColor;
uniform vec3 uBgColor;
uniform float uNucleusDots;

uniform float uFieldDebug;
uniform float uNucleiDebug;

out vec4 outColor;

/* Kernel core clamp: k(0) = 1/KEPS ~ 11.1, k(r) ~ 0.92, so iso 1.0 sits just
   inside the authored radius and stacked cores stay finite (pocket bands rely
   on this bounded interior). */
const float KEPS = 0.09;
const float TAU = 6.28318530718;

float fieldAt(vec2 p) {
  float f = 0.0;
  for (int i = 0; i < MAX_NUCLEI; i++) {
    if (i >= uCount) break;
    vec4 n = uNuclei[i];
    vec2 d = p - n.xy;
    float r2 = n.z * n.z;
    float d2 = dot(d, d) + KEPS * r2;
    float core = r2 / d2;
    /* long 1/d tail — promotes merging without inflating the lone surface */
    float tail = n.z * inversesqrt(d2);
    f += n.w * (pow(core, uTension) + uBias * 0.38 * tail);
  }
  return f * uMass;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / (0.5 * min(uResolution.x, uResolution.y));
  float f = fieldAt(p);

  /* pixel-exact anti-aliasing floor under the artistic softness */
  float aa = fwidth(f);
  float wBody = max(uSoftness, aa * 0.9);
  float body = smoothstep(uIso - wBody, uIso + wBody, f);

  /* inner field band opens controlled cellular voids where field energy stacks */
  float wPocket = max(uPocketSoft, aa * 0.9);
  float pocket = smoothstep(uPocketIso - wPocket, uPocketIso + wPocket, f) * uPocketAmount;

  float organism = body * (1.0 - pocket);

  vec3 col = mix(uBgColor, uBodyColor, organism);

  /* nuclei rendered as embedded reverse-tone dots (skipped for void nuclei) */
  if (uNucleusDots > 0.001) {
    float dots = 0.0;
    for (int i = 0; i < MAX_NUCLEI; i++) {
      if (i >= uCount) break;
      vec4 n = uNuclei[i];
      if (n.w <= 0.0) continue;
      float dN = length(p - n.xy);
      float rr = n.z * 0.34;
      float w = max(fwidth(dN) * 1.2, 0.0035);
      dots = max(dots, 1.0 - smoothstep(rr - w, rr + w, dN));
    }
    vec3 dotCol = mix(uBodyColor, uBgColor, organism);
    col = mix(col, dotCol, dots * uNucleusDots * 0.9);
  }

  if (uFieldDebug > 0.5) {
    float fp = max(f, 0.0);
    float g = 1.0 - exp(-fp * 0.32);
    vec3 dbg = mix(vec3(0.95), vec3(0.08), g);
    float band = pow(0.5 + 0.5 * cos(TAU * fp), 24.0);
    dbg = mix(dbg, vec3(0.5), band * 0.3);
    float isoLine = 1.0 - smoothstep(0.0, max(aa * 1.6, 0.004), abs(f - uIso));
    dbg = mix(dbg, vec3(0.765, 0.086, 0.086), isoLine);
    if (uPocketAmount > 0.001) {
      float pocketLine = 1.0 - smoothstep(0.0, max(aa * 1.6, 0.004), abs(f - uPocketIso));
      dbg = mix(dbg, vec3(0.45, 0.07, 0.12), pocketLine);
    }
    col = dbg;
  }

  if (uNucleiDebug > 0.5) {
    for (int i = 0; i < MAX_NUCLEI; i++) {
      if (i >= uCount) break;
      vec4 n = uNuclei[i];
      float dN = length(p - n.xy);
      float w = max(fwidth(dN) * 1.6, 0.0035);
      float ring = 1.0 - smoothstep(w, w * 2.0, abs(dN - n.z));
      float centerDot = 1.0 - smoothstep(0.006, 0.006 + w, dN);
      vec3 mark = n.w >= 0.0 ? vec3(0.35, 0.35, 0.36) : vec3(0.765, 0.086, 0.086);
      col = mix(col, mark, max(ring * 0.85, centerDot));
    }
  }

  outColor = vec4(col, 1.0);
}
`;

export interface OrganismRenderFrame {
  count: number;
  /** packed [x, y, r, signedStrength] × MAX_NUCLEI */
  nuclei: Float32Array;
  mass: number;
  iso: number;
  softness: number;
  tension: number;
  bias: number;
  pocketIso: number;
  pocketSoft: number;
  pocketAmount: number;
  bodyColor: RGB;
  bgColor: RGB;
  /** 0..1 embedded nucleus dot visibility */
  nucleusDots: number;
  fieldDebug: boolean;
  nucleiDebug: boolean;
}

export interface OrganismRenderer {
  render(frame: OrganismRenderFrame): void;
  resize(cssWidth: number, cssHeight: number, dpr: number): void;
  isLost(): boolean;
  dispose(): void;
}

const UNIFORM_NAMES = [
  "uResolution",
  "uCount",
  "uNuclei[0]",
  "uMass",
  "uIso",
  "uSoftness",
  "uTension",
  "uBias",
  "uPocketIso",
  "uPocketSoft",
  "uPocketAmount",
  "uBodyColor",
  "uBgColor",
  "uNucleusDots",
  "uFieldDebug",
  "uNucleiDebug",
] as const;

type UniformName = (typeof UNIFORM_NAMES)[number];

/** Returns null when WebGL2 is unavailable — caller shows a fallback note. */
export function createOrganismRenderer(canvas: HTMLCanvasElement): OrganismRenderer | null {
  const gl = canvas.getContext("webgl2", {
    antialias: true,
    alpha: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  let lost = false;
  let program: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  let loc: Partial<Record<UniformName, WebGLUniformLocation | null>> = {};

  function compile(type: number, src: string): WebGLShader {
    const g = gl as WebGL2RenderingContext;
    const shader = g.createShader(type);
    if (!shader) throw new Error("organism-lab: createShader failed");
    g.shaderSource(shader, src);
    g.compileShader(shader);
    if (!g.getShaderParameter(shader, g.COMPILE_STATUS)) {
      const log = g.getShaderInfoLog(shader) ?? "unknown";
      g.deleteShader(shader);
      throw new Error(`organism-lab shader compile failed: ${log}`);
    }
    return shader;
  }

  function init(): void {
    const g = gl as WebGL2RenderingContext;
    const vs = compile(g.VERTEX_SHADER, ORGANISM_VERT);
    const fs = compile(g.FRAGMENT_SHADER, ORGANISM_FRAG);
    const prog = g.createProgram();
    if (!prog) throw new Error("organism-lab: createProgram failed");
    g.attachShader(prog, vs);
    g.attachShader(prog, fs);
    g.linkProgram(prog);
    g.deleteShader(vs);
    g.deleteShader(fs);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
      const log = g.getProgramInfoLog(prog) ?? "unknown";
      g.deleteProgram(prog);
      throw new Error(`organism-lab program link failed: ${log}`);
    }
    program = prog;
    loc = {};
    for (const name of UNIFORM_NAMES) loc[name] = g.getUniformLocation(prog, name);
    /* some drivers require a bound VAO even for attribute-less draws */
    vao = g.createVertexArray();
    g.bindVertexArray(vao);
  }

  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
  };
  const onRestored = () => {
    init();
    lost = false;
  };
  canvas.addEventListener("webglcontextlost", onLost, false);
  canvas.addEventListener("webglcontextrestored", onRestored, false);

  init();

  return {
    render(frame: OrganismRenderFrame): void {
      if (lost || !program) return;
      gl.useProgram(program);
      gl.uniform2f(loc["uResolution"] ?? null, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform1i(loc["uCount"] ?? null, Math.min(frame.count, MAX_NUCLEI));
      gl.uniform4fv(loc["uNuclei[0]"] ?? null, frame.nuclei);
      gl.uniform1f(loc["uMass"] ?? null, frame.mass);
      gl.uniform1f(loc["uIso"] ?? null, frame.iso);
      gl.uniform1f(loc["uSoftness"] ?? null, frame.softness);
      gl.uniform1f(loc["uTension"] ?? null, frame.tension);
      gl.uniform1f(loc["uBias"] ?? null, frame.bias);
      gl.uniform1f(loc["uPocketIso"] ?? null, frame.pocketIso);
      gl.uniform1f(loc["uPocketSoft"] ?? null, frame.pocketSoft);
      gl.uniform1f(loc["uPocketAmount"] ?? null, frame.pocketAmount);
      gl.uniform3f(loc["uBodyColor"] ?? null, frame.bodyColor[0], frame.bodyColor[1], frame.bodyColor[2]);
      gl.uniform3f(loc["uBgColor"] ?? null, frame.bgColor[0], frame.bgColor[1], frame.bgColor[2]);
      gl.uniform1f(loc["uNucleusDots"] ?? null, frame.nucleusDots);
      gl.uniform1f(loc["uFieldDebug"] ?? null, frame.fieldDebug ? 1 : 0);
      gl.uniform1f(loc["uNucleiDebug"] ?? null, frame.nucleiDebug ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    resize(cssWidth: number, cssHeight: number, dpr: number): void {
      const w = Math.max(1, Math.round(cssWidth * dpr));
      const h = Math.max(1, Math.round(cssHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    },

    isLost(): boolean {
      return lost;
    },

    dispose(): void {
      canvas.removeEventListener("webglcontextlost", onLost, false);
      canvas.removeEventListener("webglcontextrestored", onRestored, false);
      if (program) gl.deleteProgram(program);
      if (vao) gl.deleteVertexArray(vao);
      program = null;
      vao = null;
    },
  };
}
