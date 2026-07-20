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
/* Target-pixel derivative → visible-pixel derivative. When the detached
   membrane target is downscaled, raw fwidth() is too broad after upsampling. */
uniform float uTargetToVisibleSamplingScale;
uniform int uCount;
/* xy = position (field units), z = radius, w = signed strength */
uniform vec4 uNuclei[MAX_NUCLEI];
uniform vec3 uNucleusColors[MAX_NUCLEI];

uniform float uMass;
uniform float uIso;
uniform float uSoftness;
uniform float uTension;
uniform float uBias;

uniform float uPocketIso;
uniform float uPocketSoft;
uniform float uPocketAmount;

uniform vec3 uBodyColor;
uniform vec3 uBodyColorB;
uniform vec3 uAccentColor;
uniform vec3 uBgColor;
uniform float uColorMix;
uniform float uSpatialColorMix;
uniform float uNucleusDots;
uniform float uMembraneOpacity;
uniform float uMembraneEdgeOpacity;
uniform float uMembraneEdgeWidth;
uniform float uMembraneEdgeSoftness;
uniform float uMorphEnabled;
uniform float uShadowEnabled;
uniform vec3 uShadowColor;
uniform float uShadowOpacity;
uniform float uShadowSoftness;
uniform vec2 uShadowOffset;
uniform float uShadowSpread;

uniform float uFieldDebug;
uniform float uNucleiDebug;
uniform float uNucleiDebugCenterDots;

out vec4 outColor;

/* Kernel core clamp: k(0) = 1/KEPS ~ 11.1, k(r) ~ 0.92, so iso 1.0 sits just
   inside the authored radius and stacked cores stay finite (pocket bands rely
   on this bounded interior). */
const float KEPS = 0.09;
const float TAU = 6.28318530718;

/* Keep AA widths stable in visible pixels even when the membrane is rendered
   into a lower-resolution target. This affects smoothing only, never the
   implicit field or nucleus geometry. */
float visibleSampleWidth(float rawDerivative) {
  return rawDerivative * clamp(uTargetToVisibleSamplingScale, 0.05, 1.0);
}

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
    float contribution = n.w * (pow(core, uTension) + uBias * 0.38 * tail);
    f += clamp(contribution, -12.0, 18.0);
  }
  return clamp(f * uMass, -24.0, 48.0);
}

vec3 spatialColorAt(vec2 p, out float totalWeight) {
  vec3 accumulated = vec3(0.0);
  totalWeight = 0.0;
  for (int i = 0; i < MAX_NUCLEI; i++) {
    if (i >= uCount) break;
    vec4 n = uNuclei[i];
    if (n.w <= 0.0) continue;
    vec2 d = p - n.xy;
    float r2 = n.z * n.z;
    float d2 = dot(d, d) + KEPS * r2;
    float core = r2 / d2;
    float tail = n.z * inversesqrt(d2);
    float weight = n.w * (pow(core, max(uTension * 0.78, 0.45)) + uBias * 0.18 * tail);
    weight = clamp(weight, 0.0, 18.0);
    accumulated += uNucleusColors[i] * weight;
    totalWeight += weight;
  }
  return totalWeight > 0.0001 ? accumulated / totalWeight : uBodyColor;
}

float plainBodyAt(vec2 p, float spread, float softness) {
  float mask = 0.0;
  for (int i = 0; i < MAX_NUCLEI; i++) {
    if (i >= uCount) break;
    vec4 n = uNuclei[i];
    if (n.w <= 0.0) continue;
    float radius = max(n.z + spread, 0.001);
    float d = length(p - n.xy);
    float edge = max(softness, visibleSampleWidth(fwidth(d)) * 1.2);
    mask = max(mask, 1.0 - smoothstep(radius - edge, radius + edge, d));
  }
  return mask;
}

float plainVoidRingAt(vec2 p) {
  float ring = 0.0;
  for (int i = 0; i < MAX_NUCLEI; i++) {
    if (i >= uCount) break;
    vec4 n = uNuclei[i];
    if (n.w >= 0.0) continue;
    float d = length(p - n.xy);
    float edge = max(visibleSampleWidth(fwidth(d)) * 1.4, 0.003);
    ring = max(ring, 1.0 - smoothstep(edge, edge * 2.2, abs(d - n.z)));
  }
  return ring;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / (0.5 * min(uResolution.x, uResolution.y));
  float f = 0.0;
  float aa = 0.0;
  float body = 0.0;
  float pocket = 0.0;
  if (uMorphEnabled > 0.5) {
    f = fieldAt(p);
    /* pixel-exact anti-aliasing floor under the artistic softness */
    aa = visibleSampleWidth(fwidth(f));
    float wBody = max(uSoftness, aa * 0.9);
    body = smoothstep(uIso - wBody, uIso + wBody, f);
    /* inner field band opens controlled cellular voids where field energy stacks */
    float wPocket = max(uPocketSoft, aa * 0.9);
    pocket = smoothstep(uPocketIso - wPocket, uPocketIso + wPocket, f) * uPocketAmount;
  } else {
    body = plainBodyAt(p, 0.0, 0.0025);
    f = body;
    aa = visibleSampleWidth(fwidth(body));
  }

  float organism = body * (1.0 - pocket);
  float surfaceBand = uMorphEnabled > 0.5
    ? 1.0 - smoothstep(
        0.0,
        max(max(aa, 0.0015) * max(uMembraneEdgeWidth, 0.5) * mix(0.5, 4.0, clamp(uMembraneEdgeSoftness, 0.0, 1.0)), 0.0015),
        abs(f - uIso)
      )
    : 1.0 - smoothstep(0.18, 0.48, abs(body - 0.5));

  float fp = max(f, 0.0);
  float depth = 1.0 - exp(-fp * 0.28);
  float screenBlend = 0.5 + 0.5 * sin(p.x * 1.55 + p.y * 0.8);
  float edge = body * (1.0 - smoothstep(uIso + 0.12, uIso + 1.2, fp));
  float colorMix = clamp(uColorMix, 0.0, 1.0);
  vec3 bodyMix = mix(uBodyColor, uBodyColorB, colorMix * (0.28 * screenBlend + 0.72 * depth));
  bodyMix = mix(bodyMix, uAccentColor, colorMix * edge * 0.22);
  float spatialWeight = 0.0;
  vec3 spatialColor = spatialColorAt(p, spatialWeight);
  float spatialDominance = spatialWeight > 0.0001 ? 0.88 * clamp(uSpatialColorMix, 0.0, 1.0) : 0.0;
  bodyMix = mix(bodyMix, spatialColor, spatialDominance);
  vec3 col = uBgColor;
  float surfaceAlpha = 0.0;
  if (uShadowEnabled > 0.5) {
    float shadowMask = 0.0;
    if (uMorphEnabled > 0.5) {
      float sf = fieldAt(p - uShadowOffset);
      float sw = max(uSoftness + uShadowSoftness, visibleSampleWidth(fwidth(sf)));
      float spreadBias = uShadowSpread * 6.0;
      shadowMask = smoothstep(uIso - spreadBias - sw, uIso - spreadBias + sw, sf);
    } else {
      shadowMask = plainBodyAt(p - uShadowOffset, uShadowSpread, max(uShadowSoftness, 0.0025));
    }
    float shadowAlpha = shadowMask * uShadowOpacity * (1.0 - organism);
    col = mix(col, uShadowColor, shadowAlpha);
    surfaceAlpha = max(surfaceAlpha, shadowAlpha);
  }
  float surfaceOpacity = uMorphEnabled > 0.5 ? uMembraneOpacity : 1.0;
  float membraneAlpha = organism * surfaceOpacity;
  float edgeAlpha = surfaceBand * uMembraneEdgeOpacity;
  col = mix(col, bodyMix, membraneAlpha);
  col = mix(col, uAccentColor, edgeAlpha);
  surfaceAlpha = 1.0 - (1.0 - surfaceAlpha) * (1.0 - membraneAlpha) * (1.0 - edgeAlpha);
  if (uMorphEnabled < 0.5) {
    float voidRingAlpha = plainVoidRingAt(p) * 0.82;
    col = mix(col, mix(uBgColor, uAccentColor, 0.62), voidRingAlpha);
    surfaceAlpha = max(surfaceAlpha, voidRingAlpha);
  }

  /* nuclei rendered as embedded reverse-tone dots (skipped for void nuclei) */
  if (uNucleusDots > 0.001) {
    for (int i = 0; i < MAX_NUCLEI; i++) {
      if (i >= uCount) break;
      vec4 n = uNuclei[i];
      if (n.w <= 0.0) continue;
      float dN = length(p - n.xy);
      float rr = n.z * 0.34;
      float w = max(visibleSampleWidth(fwidth(dN)) * 1.2, 0.0035);
      float dot = 1.0 - smoothstep(rr - w, rr + w, dN);
      float dotAlpha = dot * uNucleusDots * 0.92;
      col = mix(col, uNucleusColors[i], dotAlpha);
      surfaceAlpha = max(surfaceAlpha, dotAlpha);
    }
  }

  if (uFieldDebug > 0.5) {
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
    surfaceAlpha = 1.0;
  }

  if (uNucleiDebug > 0.5) {
    for (int i = 0; i < MAX_NUCLEI; i++) {
      if (i >= uCount) break;
      vec4 n = uNuclei[i];
      float dN = length(p - n.xy);
      float w = max(visibleSampleWidth(fwidth(dN)) * 1.6, 0.0035);
      float ring = 1.0 - smoothstep(w, w * 2.0, abs(dN - n.z));
      float centerDot = uNucleiDebugCenterDots > 0.5
        ? 1.0 - smoothstep(0.006, 0.006 + w, dN)
        : 0.0;
      vec3 mark = n.w >= 0.0 ? vec3(0.35, 0.35, 0.36) : vec3(0.765, 0.086, 0.086);
      float debugAlpha = max(ring * 0.85, centerDot);
      col = mix(col, mark, debugAlpha);
      surfaceAlpha = max(surfaceAlpha, debugAlpha);
    }
  }

  outColor = vec4(col, surfaceAlpha);
}
`;

export interface OrganismRenderFrame {
  count: number;
  /** packed [x, y, r, signedStrength] × MAX_NUCLEI */
  nuclei: Float32Array;
  /** packed [r, g, b] × MAX_NUCLEI; void entries are zero */
  nucleusColors: Float32Array;
  mass: number;
  iso: number;
  softness: number;
  tension: number;
  bias: number;
  pocketIso: number;
  pocketSoft: number;
  pocketAmount: number;
  bodyColor: RGB;
  bodyColorB: RGB;
  bgColor: RGB;
  accentColor: RGB;
  colorMix: number;
  /** 1 = Cell Gradient; 0 = truthful Solid with no spatial Cell patches. */
  spatialColorMix: number;
  /** 0..1 embedded nucleus dot visibility */
  nucleusDots: number;
  /** Shared field/path presentation controls; per-Cell layers remain outside the shader. */
  membraneOpacity: number;
  membraneEdgeOpacity: number;
  membraneEdgeWidth: number;
  membraneEdgeSoftness: number;
  morphEnabled: boolean;
  shadowEnabled: boolean;
  shadowColor: RGB;
  shadowOpacity: number;
  shadowSoftness: number;
  shadowOffset: [number, number];
  shadowSpread: number;
  fieldDebug: boolean;
  nucleiDebug: boolean;
  /** Production keeps debug geometry ring-only so it cannot impersonate Core. */
  nucleiDebugCenterDots: boolean;
}

export interface OrganismRenderer {
  render(frame: OrganismRenderFrame): void;
  clear(): void;
  /** Re-presents the last completed target without rerunning the membrane shader. */
  present(): void;
  /** Changes only the detached low-resolution render target. */
  resizeTarget(cssWidth: number, cssHeight: number, dpr: number): void;
  setFilter(filter: "smooth" | "pixel"): void;
  /** Changes the browser-visible backing store only for real host resizes. */
  resize(cssWidth: number, cssHeight: number, dpr: number): void;
  isLost(): boolean;
  dispose(): void;
}

const UNIFORM_NAMES = [
  "uResolution",
  "uTargetToVisibleSamplingScale",
  "uCount",
  "uNuclei[0]",
  "uNucleusColors[0]",
  "uMass",
  "uIso",
  "uSoftness",
  "uTension",
  "uBias",
  "uPocketIso",
  "uPocketSoft",
  "uPocketAmount",
  "uBodyColor",
  "uBodyColorB",
  "uAccentColor",
  "uBgColor",
  "uColorMix",
  "uSpatialColorMix",
  "uNucleusDots",
  "uMembraneOpacity",
  "uMembraneEdgeOpacity",
  "uMembraneEdgeWidth",
  "uMembraneEdgeSoftness",
  "uMorphEnabled",
  "uShadowEnabled",
  "uShadowColor",
  "uShadowOpacity",
  "uShadowSoftness",
  "uShadowOffset",
  "uShadowSpread",
  "uFieldDebug",
  "uNucleiDebug",
  "uNucleiDebugCenterDots",
] as const;

type UniformName = (typeof UNIFORM_NAMES)[number];

/** Returns null when WebGL2 is unavailable — caller shows a fallback note. */
export function createOrganismRenderer(canvas: HTMLCanvasElement): OrganismRenderer | null {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: true,
    premultipliedAlpha: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;
  gl.disable(gl.BLEND);

  let lost = false;
  let program: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  let loc: Partial<Record<UniformName, WebGLUniformLocation | null>> = {};
  let membraneEdgeGate = false;
  let shadowGate = false;
  let targetFramebuffer: WebGLFramebuffer | null = null;
  let targetTexture: WebGLTexture | null = null;
  let targetWidth = 1;
  let targetHeight = 1;
  let visibleCssWidth = 1;
  let visibleCssHeight = 1;
  let visibleDpr = 1;
  let targetDpr = 1;
  let targetFilter: "smooth" | "pixel" = "smooth";

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
    membraneEdgeGate = false;
    shadowGate = false;
  }

  const disposeTarget = () => {
    if (targetTexture) gl.deleteTexture(targetTexture);
    if (targetFramebuffer) gl.deleteFramebuffer(targetFramebuffer);
    targetTexture = null;
    targetFramebuffer = null;
  };

  const allocateTarget = () => {
    const previousFramebuffer = targetFramebuffer;
    const previousTexture = targetTexture;
    const previousWidth = targetWidth;
    const previousHeight = targetHeight;
    const nextWidth = Math.max(1, Math.round(visibleCssWidth * targetDpr));
    const nextHeight = Math.max(1, Math.round(visibleCssHeight * targetDpr));
    const nextTexture = gl.createTexture();
    const nextFramebuffer = gl.createFramebuffer();
    if (!nextTexture || !nextFramebuffer) {
      if (nextTexture) gl.deleteTexture(nextTexture);
      if (nextFramebuffer) gl.deleteFramebuffer(nextFramebuffer);
      throw new Error("organism-lab: render target allocation failed");
    }
    gl.bindTexture(gl.TEXTURE_2D, nextTexture);
    const filter = targetFilter === "pixel" ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, nextWidth, nextHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, nextFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, nextTexture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteTexture(nextTexture);
      gl.deleteFramebuffer(nextFramebuffer);
      throw new Error("organism-lab: framebuffer is incomplete");
    }
    if (previousFramebuffer) {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, previousFramebuffer);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, nextFramebuffer);
      gl.blitFramebuffer(
        0, 0, previousWidth, previousHeight,
        0, 0, nextWidth, nextHeight,
        gl.COLOR_BUFFER_BIT,
        targetFilter === "pixel" ? gl.NEAREST : gl.LINEAR,
      );
    } else {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    targetWidth = nextWidth;
    targetHeight = nextHeight;
    targetTexture = nextTexture;
    targetFramebuffer = nextFramebuffer;
    if (previousTexture) gl.deleteTexture(previousTexture);
    if (previousFramebuffer) gl.deleteFramebuffer(previousFramebuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };

  const presentTarget = () => {
    if (lost || !targetFramebuffer) return;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, targetFramebuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(
      0, 0, targetWidth, targetHeight,
      0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight,
      gl.COLOR_BUFFER_BIT,
      targetFilter === "pixel" ? gl.NEAREST : gl.LINEAR,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  };

  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
  };
  const onRestored = () => {
    init();
    allocateTarget();
    lost = false;
  };
  canvas.addEventListener("webglcontextlost", onLost, false);
  canvas.addEventListener("webglcontextrestored", onRestored, false);

  init();

  return {
    render(frame: OrganismRenderFrame): void {
      if (lost || !program || !targetFramebuffer) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, targetFramebuffer);
      gl.viewport(0, 0, targetWidth, targetHeight);
      gl.useProgram(program);
      gl.uniform2f(loc["uResolution"] ?? null, targetWidth, targetHeight);
      /* fwidth() is evaluated in target pixels. Convert it to the browser's
         visible backing-store sampling so low-quality target scaling does not
         broaden the membrane edge or soften nearby contours. */
      gl.uniform1f(
        loc["uTargetToVisibleSamplingScale"] ?? null,
        Math.min(
          targetWidth / Math.max(1, gl.drawingBufferWidth),
          targetHeight / Math.max(1, gl.drawingBufferHeight),
        ),
      );
      gl.uniform1i(loc["uCount"] ?? null, Math.min(frame.count, MAX_NUCLEI));
      gl.uniform4fv(loc["uNuclei[0]"] ?? null, frame.nuclei);
      gl.uniform3fv(loc["uNucleusColors[0]"] ?? null, frame.nucleusColors);
      gl.uniform1f(loc["uMass"] ?? null, frame.mass);
      gl.uniform1f(loc["uIso"] ?? null, frame.iso);
      gl.uniform1f(loc["uSoftness"] ?? null, frame.softness);
      gl.uniform1f(loc["uTension"] ?? null, frame.tension);
      gl.uniform1f(loc["uBias"] ?? null, frame.bias);
      gl.uniform1f(loc["uPocketIso"] ?? null, frame.pocketIso);
      gl.uniform1f(loc["uPocketSoft"] ?? null, frame.pocketSoft);
      gl.uniform1f(loc["uPocketAmount"] ?? null, frame.pocketAmount);
      gl.uniform3f(loc["uBodyColor"] ?? null, frame.bodyColor[0], frame.bodyColor[1], frame.bodyColor[2]);
      gl.uniform3f(loc["uBodyColorB"] ?? null, frame.bodyColorB[0], frame.bodyColorB[1], frame.bodyColorB[2]);
      gl.uniform3f(loc["uAccentColor"] ?? null, frame.accentColor[0], frame.accentColor[1], frame.accentColor[2]);
      gl.uniform3f(loc["uBgColor"] ?? null, frame.bgColor[0], frame.bgColor[1], frame.bgColor[2]);
      gl.uniform1f(loc["uColorMix"] ?? null, frame.colorMix);
      gl.uniform1f(loc["uSpatialColorMix"] ?? null, frame.spatialColorMix);
      gl.uniform1f(loc["uNucleusDots"] ?? null, frame.nucleusDots);
      gl.uniform1f(loc["uMembraneOpacity"] ?? null, frame.membraneOpacity);
      const membraneEdgeEnabled = frame.membraneEdgeOpacity > 0;
      if (membraneEdgeEnabled) {
        gl.uniform1f(loc["uMembraneEdgeOpacity"] ?? null, frame.membraneEdgeOpacity);
        gl.uniform1f(loc["uMembraneEdgeWidth"] ?? null, frame.membraneEdgeWidth);
        gl.uniform1f(loc["uMembraneEdgeSoftness"] ?? null, frame.membraneEdgeSoftness);
      } else if (membraneEdgeGate) {
        gl.uniform1f(loc["uMembraneEdgeOpacity"] ?? null, 0);
      }
      membraneEdgeGate = membraneEdgeEnabled;
      gl.uniform1f(loc["uMorphEnabled"] ?? null, frame.morphEnabled ? 1 : 0);
      if (frame.shadowEnabled) {
        gl.uniform1f(loc["uShadowEnabled"] ?? null, 1);
        gl.uniform3f(loc["uShadowColor"] ?? null, frame.shadowColor[0], frame.shadowColor[1], frame.shadowColor[2]);
        gl.uniform1f(loc["uShadowOpacity"] ?? null, frame.shadowOpacity);
        gl.uniform1f(loc["uShadowSoftness"] ?? null, frame.shadowSoftness);
        gl.uniform2f(loc["uShadowOffset"] ?? null, frame.shadowOffset[0], frame.shadowOffset[1]);
        gl.uniform1f(loc["uShadowSpread"] ?? null, frame.shadowSpread);
      } else if (shadowGate) {
        gl.uniform1f(loc["uShadowEnabled"] ?? null, 0);
      }
      shadowGate = frame.shadowEnabled;
      gl.uniform1f(loc["uFieldDebug"] ?? null, frame.fieldDebug ? 1 : 0);
      gl.uniform1f(loc["uNucleiDebug"] ?? null, frame.nucleiDebug ? 1 : 0);
      gl.uniform1f(loc["uNucleiDebugCenterDots"] ?? null, frame.nucleiDebugCenterDots ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      presentTarget();
    },

    clear(): void {
      if (lost) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, targetFramebuffer);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      presentTarget();
    },

    present(): void {
      presentTarget();
    },

    resizeTarget(cssWidth: number, cssHeight: number, dpr: number): void {
      const nextWidth = Math.max(1, Math.round(cssWidth * dpr));
      const nextHeight = Math.max(1, Math.round(cssHeight * dpr));
      visibleCssWidth = Math.max(1, cssWidth);
      visibleCssHeight = Math.max(1, cssHeight);
      targetDpr = Math.max(0.1, dpr);
      if (nextWidth !== targetWidth || nextHeight !== targetHeight || !targetFramebuffer) allocateTarget();
    },

    setFilter(filter: "smooth" | "pixel"): void {
      if (targetFilter === filter) return;
      targetFilter = filter;
      if (!targetTexture) return;
      gl.bindTexture(gl.TEXTURE_2D, targetTexture);
      const glFilter = filter === "pixel" ? gl.NEAREST : gl.LINEAR;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, glFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, glFilter);
      gl.bindTexture(gl.TEXTURE_2D, null);
    },

    resize(cssWidth: number, cssHeight: number, dpr: number): void {
      visibleCssWidth = Math.max(1, cssWidth);
      visibleCssHeight = Math.max(1, cssHeight);
      visibleDpr = Math.max(0.1, dpr);
      const w = Math.max(1, Math.round(cssWidth * dpr));
      const h = Math.max(1, Math.round(cssHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      if (!targetFramebuffer) {
        targetDpr = visibleDpr;
        allocateTarget();
      }
    },

    isLost(): boolean {
      return lost;
    },

    dispose(): void {
      canvas.removeEventListener("webglcontextlost", onLost, false);
      canvas.removeEventListener("webglcontextrestored", onRestored, false);
      if (program) gl.deleteProgram(program);
      if (vao) gl.deleteVertexArray(vao);
      disposeTarget();
      program = null;
      vao = null;
    },
  };
}
