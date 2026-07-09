# ORGANISM LAB SPEC — V6E shader prototype

## Purpose

The d3-contour/path organism (V6A–V6D) extracts polygons from a sampled field
and can never be perfectly liquid. V6E prototypes the target renderer in
isolation: one continuous implicit scalar field evaluated **per pixel, per
frame** in a fragment shader, so merging, splitting, and internal voids are
emergent topology — never pairwise bridges, never path morphs, never keyframes.

## Where it lives

- Code: `src/experiments/organism-lab/`
- Route: `/experiments/organism-lab` (or `/#organism-lab`) — hidden URL wired in
  `src/App.tsx` as a lazy chunk before the main shell mounts. The main
  canvas/table app is otherwise untouched and pays zero bundle cost.
- Back link in the lab header returns to `/`.

## Renderer decision (Three.js note)

The phase brief preferred a Three.js plane + ShaderMaterial. **Three.js is not
installed** in this repo and installing was not allowed by default — but the
prescribed architecture (fullscreen quad, fragment shader, uniform array of
nuclei) needs no library at all. `organism-shader.ts` implements it as a raw
WebGL2 fullscreen triangle with zero new dependencies; the GLSL is exactly what
a Three.js `ShaderMaterial` would wrap and ports 1:1 if Codex prefers to add
Three.js for V6F. If WebGL2 is unavailable the lab shows a fallback note
instead of crashing.

## Field model

Per pixel `p` (field units: shorter viewport axis spans [-1, 1], origin center,
y up):

```
for each nucleus i:
  d²    = |p - pos_i|² + KEPS · r_i²          // KEPS = 0.09 clamps the core
  core  = (r_i² / d²)                          // max ≈ 11.1, ≈ 0.92 at r_i
  tail  = r_i / √d²                            // long 1/d reach
  f    += w_i · ( core^tension + bias · 0.38 · tail )
f *= mass

body    = smoothstep(iso − softness, iso + softness, f)   // AA floor: fwidth(f)
pocket  = smoothstep(pocketIso ± pocketSoft, f) · pocketAmount
organism = body · (1 − pocket)
```

- `w_i` = polarity · specStrength · nucleusStrength · radius taper
  (small satellites carry less energy, so pockets prefer cores/overlaps).
- **Negative nuclei** (`polarity: -1`) subtract field → natural carved voids.
- **Pocket band**: because the kernel core is clamped (finite interior), a
  second, higher iso band opens smooth cellular voids exactly where field
  energy stacks — deep overlaps and strong cores. Controlled, never random.
- `tension` (kernel falloff exponent) and `bias` (1/d tail amount) come from
  the attachment preset × fine-tune sliders — this is the merge character.

## Attachment mapping

| Mode | tension base | bias base |
|---|---|---|
| Tight | 1.30 | 0.03 |
| Soft | 1.00 | 0.18 |
| Long | 0.82 | 0.40 |
| Extreme | 0.60 | 0.72 |

`Surface Tension` multiplies the base; `Connection Bias` trims ± around it
(0.25 = neutral) — same preset-plus-fine-tune contract as the V6D dock.

## Motion model

Every animated quantity keeps **target + rendered value**; rendered follows via
frame-rate-independent smoothing `cur += (target − cur) · (1 − e^(−response·dt))`.
No CSS transitions, no SVG tweens, no per-frame React state.

- Layout: satellite homes are transformed around the core (largest positive
  nucleus) by Global Offset (scale), Radial Offset (push), Angular Offset
  (rotate), Offset X/Y (translate).
- Idle life: slow drift + faster small wobble + radius breathing, decorrelated
  per nucleus via phase seeds × Phase Variation; small nuclei move more.
- Drag: pointer hit-tests rendered positions; deltas are inverse-transformed
  through the offset layout onto the home anchor, so nuclei track the pointer
  1:1 while the membrane follows with inertia. Idle drift pauses on the
  dragged nucleus only. `setPointerCapture` is try/catch-guarded (CanvasView
  gotcha).
- Style/attachment switches cross-fade through the same smoother (colors at a
  slower rate) — liquid transitions, no jumps.
- Uniform smoothing state lives in the rAF closure; simulation in refs.

## Styles (all selectable, none destructive)

| Style | Ground | Body | Pockets |
|---|---|---|---|
| Cellular Reverse | lab theme (cream/near-black) | black / bone (theme-inverts) | on |
| Plain Black | forces cream | #0c0c0c | off (negative nuclei still work) |
| Plain White | forces #0b0b0b | #f4f4ee | off |
| Graphite | lab theme | #2f2f31 / #47474b | off |
| Wine | lab theme | #421015 / #5a1119 | off |
| Auto | lab theme | theme-adaptive black/bone | off |

Lab has its own day/night toggle (does not touch the app store). Panel tone
auto-flips to stay legible on style-forced grounds.

## Controls (full data model wired)

- **Organism**: Mass, Iso Level, Surface Tension, Edge Softness, Connection Bias
- **Nuclei**: Count (buds from / returns to the core organically), Radius
  Min/Max, Strength, Size Variation
- **Attachment/Offset**: Tight/Soft/Long/Extreme chips, Global Offset, Offset
  X/Y, Radial Offset, Angular Offset
- **Motion**: Time Scale, Response, Drift, Breathing, Wobble, Phase Variation
- **Style**: 6 style chips + Pocket Threshold / Pocket Softness sliders
- **Debug**: Field Debug (grayscale field, integer bands, red iso + pocket-iso
  lines), Nuclei Debug (rings; red = negative), Show/Hide nucleus dots
- **Dock** (required set): style selector, attachment selector, offset slider,
  show/hide nuclei, randomize, reset. Presets row top-center.

## Presets

Core · Colony · Division · Tendril · Void (negative nuclei) · Orbit ·
Asymmetry — authored in `organism-presets.ts` as starting arrangements
(positions/radii/strength/phase/style/attachment), all draggable afterward.
Randomize re-scatters satellites (voids stay inside the core); Reset re-applies
the active preset.

## Files

- `src/experiments/organism-lab/OrganismLab.tsx` — view, rAF loop, drag, panels
- `src/experiments/organism-lab/organism-types.ts` — data model + defaults
- `src/experiments/organism-lab/organism-shader.ts` — GLSL + WebGL2 renderer
- `src/experiments/organism-lab/organism-motion.ts` — simulation + smoothing
- `src/experiments/organism-lab/organism-controls.ts` — control schema, styles,
  attachment mapping
- `src/experiments/organism-lab/organism-lab.css` — compact monochrome UI
- `src/App.tsx` — hidden lazy route only

## Limits / notes

- `MAX_NUCLEI = 96` (uniform array render cap); count slider caps at 24. DPR ≤ 2.
- Fragment cost is O(pixels × count) — fine for a lab; V6F can add a bounding
  quad or tile culling if needed at canvas scale.
- WebGL context loss is handled (rebuild on restore).

## Codex verify (not run this phase, per V6E rules)

1. `npm run build` (tsc + vite) green.
2. `npm run dev` → open `/experiments/organism-lab`: organism renders, 60 fps.
3. Main app at `/` completely unaffected (loader, canvas, table, dock).
4. Drag nuclei; sweep all sliders; cycle 7 presets, 6 styles, 4 attachments,
   day/night; Void preset shows carved pockets; debug modes; narrow viewport.
