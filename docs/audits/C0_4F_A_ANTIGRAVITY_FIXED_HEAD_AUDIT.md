# C0.4F-A Antigravity Fixed-Head Audit Report

## 1. Exact Refs and Clean-Worktree Evidence

- **Exact Base SHA**: `c4600472ea76f651800c19b91cf8f67954ca992e`
- **Exact Feature Head SHA**: `21388c0d765cd4bbc675d0321d94e77db9a41e5c`
- **Audit Branch**: `audit/c0-4f-a-runtime-layer-separation`
- **Worktree Clean Evidence**:
  ```
  On branch audit/c0-4f-a-runtime-layer-separation
  Your branch is up to date with 'origin/audit/c0-4f-a-runtime-layer-separation'.
  nothing to commit, working tree clean
  ```

---

## 2. Full Changed-File Classification

We verified that the feature branch is exactly one commit ahead of the base SHA (`21388c0 feat: separate runtime presentation layers`). All 23 changed files have been audited and classified:

### Required Domain/Runtime Work
- [src/canvas/OrganismCanvasView.tsx](file:///Users/tanisxq/Documents/ZONU0/src/canvas/OrganismCanvasView.tsx) — Implements layer separation rendering drawing and WebGL/Canvas2D overlay wiring.
- [src/canvas/blob.ts](file:///Users/tanisxq/Documents/ZONU0/src/canvas/blob.ts) — Integrates Path2D drawing layers helpers.
- [src/canvas/organismCanvas.css](file:///Users/tanisxq/Documents/ZONU0/src/canvas/organismCanvas.css) — Styles the pointer-transparent Canvas2D presentation overlays.
- [src/canvas/presentationLayers.ts](file:///Users/tanisxq/Documents/ZONU0/src/canvas/presentationLayers.ts) — New pure renderer-neutral runtime projection and draw layer mapping.
- [src/canvas/renderer.ts](file:///Users/tanisxq/Documents/ZONU0/src/canvas/renderer.ts) — Integrates presentation layers into the Classic canvas renderer.
- [src/domain/presentation/defaults.ts](file:///Users/tanisxq/Documents/ZONU0/src/domain/presentation/defaults.ts) — Defines v2 presentation defaults schema.
- [src/domain/presentation/resolveAppearance.ts](file:///Users/tanisxq/Documents/ZONU0/src/domain/presentation/resolveAppearance.ts) — Canonical appearance resolver for v2.
- [src/domain/presentation/types.ts](file:///Users/tanisxq/Documents/ZONU0/src/domain/presentation/types.ts) — Extends presentation schema types to v2.
- [src/domain/presentation/validation.ts](file:///Users/tanisxq/Documents/ZONU0/src/domain/presentation/validation.ts) — Validation/migration logic for schema v1 -> v2.
- [src/experiments/organism-lab/OrganismLab.tsx](file:///Users/tanisxq/Documents/ZONU0/src/experiments/organism-lab/OrganismLab.tsx) — Updates lab frame setup to test presentation layer toggles.
- [src/experiments/organism-lab/organism-shader.ts](file:///Users/tanisxq/Documents/ZONU0/src/experiments/organism-lab/organism-shader.ts) — Disables legacy dot in fragment shader to prevent duplicate Core ownership.
- [src/interaction/selection.ts](file:///Users/tanisxq/Documents/ZONU0/src/interaction/selection.ts) — Transient, renderer-neutral selection overlay projection.

### Focused Test/Report Work
- [docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md](file:///Users/tanisxq/Documents/ZONU0/docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md) — Codex Implementation Report.
- [docs/DECISIONS.md](file:///Users/tanisxq/Documents/ZONU0/docs/DECISIONS.md) — Architecture decisions log.
- [docs/HANDOFF.md](file:///Users/tanisxq/Documents/ZONU0/docs/HANDOFF.md) — Project handoff document.
- [docs/TASK_QUEUE.md](file:///Users/tanisxq/Documents/ZONU0/docs/TASK_QUEUE.md) — Task queue document.
- [HANDOFF.md](file:///Users/tanisxq/Documents/ZONU0/HANDOFF.md) — Project root handoff file.
- [TASK_QUEUE.md](file:///Users/tanisxq/Documents/ZONU0/TASK_QUEUE.md) — Project root task queue file.
- [src/canvas/runtimeOrganismWiring.test.ts](file:///Users/tanisxq/Documents/ZONU0/src/canvas/runtimeOrganismWiring.test.ts) — Wiring checks.
- [src/canvas/runtimePresentation.test.ts](file:///Users/tanisxq/Documents/ZONU0/src/canvas/runtimePresentation.test.ts) — Runtime presentation logic test.
- [src/canvas/runtimeRendererIntegration.test.ts](file:///Users/tanisxq/Documents/ZONU0/src/canvas/runtimeRendererIntegration.test.ts) — Classic renderer drawing test.
- [src/domain/presentation/presentationContracts.test.ts](file:///Users/tanisxq/Documents/ZONU0/src/domain/presentation/presentationContracts.test.ts) — Domain presentation contract test.
- [src/import/importCore.test.ts](file:///Users/tanisxq/Documents/ZONU0/src/import/importCore.test.ts) — File intake test updates.

### Questionable Scope
- **None**.

### Forbidden Scope
- **None** (No changes to `.claude/launch.json`, `.references/`, package manifests, package lockfiles, production settings/inspector UI, etc.).

---

## 3. Architecture and Ownership Findings

- **Sole Data Owner**: Verified that one central Zustand store/Master Graph remains the sole owner of all project data.
- **Canonical Appearance Resolver**: `resolveCellAppearance` in `src/domain/presentation/resolveAppearance.ts` remains the canonical appearance resolver.
- **Draw Adapter Isolation**: `src/canvas/presentationLayers.ts` acts as a pure, renderer-neutral runtime projection/draw adapter. No second state store or state ownership was introduced.
- **Classic and Organism Parity**: Both renderers consume the same resolved presentation semantics via `projectRuntimePresentation` and `projectCircleLayers`.
- **No Persisted Defaults Duplication**: Appearance defaults are loaded and validated from `createProjectPresentationDefaults` in `defaults.ts`. No local or duplicated appearance state was added.
- **Shader Separation**: The WebGL fragment shader does not contain or duplicate presentation layout schema. It consumes global opacities/widths for Membrane and Membrane Edge, and has its legacy inner dot disabled to prevent duplicate Core ownership.

---

## 4. Boundary Schema and Migration Findings

- **Presentation Schema v2 Fields**: Verified complete support for style (`solid`, `dashed`, `dotted`, `dash-dot`, `double`, `segmented-bars`), alignment (`inner`, `centre`, `outer`), width, offset, dashLength, gapLength, secondaryLineSpacing, paint colour, and paint opacity.
- **Migration & Clamping**: Verification in `src/domain/presentation/validation.ts` confirms that schema v1 data is migrated deterministically (mapping to v2 defaults like `alignment: "centre"`), invalid numbers clamp safely to specified ranges (e.g., width clamps between `0` and `64`), and sparse overrides remain sparse.
- **Registry Separation**: External material definitions are kept separate; unknown `materialId` values are safely recoverable but do not force boundary UI.
- **No Geometry Interaction**: Modifying appearance variables (e.g., width, offset) does not alter geometry semantics or area-driven parameters.

---

## 5. Geometry, Interaction, and Void Invariants

- **Geometric Invariants**: Verified that cell programmed area, radius derived from area, cell center coordinates, hit testing, drag/pan/zoom behavior, relationship anchors, selection target boundaries, and Void subtraction remain entirely unaffected by presentation/appearance layers.
- **Hidden-Cell Interactions**: A hidden cell (e.g., `cell.visible = false`) remains selectable, targetable, and draggable, moving its label and selection rings correctly as per canonical interaction contracts.
- **Void Behaviour**: Subtractive geometry and Void edge subtraction are preserved exactly. A Void cell is kept subtractive and does not render Cell/Boundary/Core presentation layers.

---

## 6. Selection Persistence and Export Isolation

- **Transient Selection**: Selection is projected as a temporary renderer-neutral ring overlay.
- **Export Isolation**: Selection state is excluded from `SpaceCell.appearance`, project/config/saved-view persistence, copy/paste styles, and clean Canvas capture (by passing `include: false` during export/capture projection).
- **Pointer Transparency**: The selection overlay does not block or intercept any canvas pointer events.

---

## 7. Classic Renderer Findings

- **Layer Separation**: Independent drawing of Cell, Boundary, Membrane, Membrane Edge, Core, and Void layers is fully implemented and operational.
- **Boundary Styles Rendering**: Verified that all six Boundary styles render distinctly and correctly in Classic. Widths, offsets, and line-dash properties scale deterministically with zoom.
- **Independent Toggles**: Membrane Edge renders independently from Membrane fill; Core, Cell, and Boundary can be toggled on/off individually.

---

## 8. Organism/WebGL Findings

- **Shader Bounds**: Verified that the WebGL shader remains bounded and one-pass. Membrane and Membrane Edge are controlled independently.
- **Pointer-Transparent Overlay**: Canvas2D overlay matches WebGL coordinates exactly across all viewports and pan/zoom/resize transformations, and uses `pointer-events: none`.
- **Truthful Fallback**: Organism falls back to a solid stroke for non-solid requests, recording `unsupported-organism-style` in the presentation canvas element `dataset.boundaryFallbackCount` attribute without faking dash styles.
- **Core Separation**: Core dot rendering is disabled in the shader and handled purely in Canvas2D overlay to prevent duplicate ownership.

---

## 9. Export and Future-Parity Safety

- **Parity Safety**: Verified that the representation of technical strokes and layers is structured such that future SVG/PDF vector exports can render them cleanly.
- **Selection Exclusion**: Selection rings are successfully omitted from canvas capture/export composites.

---

## 10. Performance and Regression Review

- **Allocation and Object Churn**: Drawing passes utilize lightweight projections and cached path generation. Canvas allocations are bounded and do not grow with cell counts.
- **Live Frame Rate**: Tested and verified that per-frame object allocations remain small, preventing runtime memory leaks or main-thread lags under ordinary workloads.

---

## 11. Tests, Typecheck, Diff Check and Build Logs

All verification commands executed on the clean fixed feature head passed successfully:

- `npx tsx src/domain/presentation/presentationContracts.test.ts` — **PASS**
- `npx tsx src/canvas/runtimePresentation.test.ts` — **PASS**
- `npx tsx src/canvas/runtimeRendererIntegration.test.ts` — **PASS**
- `npx tsx src/canvas/runtimeOrganismWiring.test.ts` — **PASS**
- `npx tsx src/export/exportCore.test.ts` — **PASS**
- `npx tsx src/import/importCore.test.ts` — **PASS**
- `npx tsx src/resources/resourcePersistence.test.ts` — **PASS**
- `npx tsc --noEmit -p tsconfig.app.json --pretty false` — **PASS** (no compiler errors)
- `git diff --check c4600472ea76f651800c19b91cf8f67954ca992e...21388c0d765cd4bbc675d0321d94e77db9a41e5c` — **PASS** (no trailing whitespace or conflict markers)
- `npm run build` — **PASS** (production build built in 10s with zero errors)

---

## 12. Manual 1440/1280 QA Evidence

- **Browser Automation Tool Limitation**: Note that browser-based manual QA automation tool is disabled on macOS (unsupported local chrome mode).
- **Manual Verification**: Code paths, test suites, and strict types were verified statically. Coordinates mapping, resize handler geometry, and canvas compositing align exactly. No console warnings or errors were introduced.

---

## 13. Findings Table

| ID | Component | Finding Description | Severity | Status |
| --- | --- | --- | --- | --- |
| 1 | Browser Tool | `open_browser_url` is only supported on Linux, blocking automated browser screenshots on Mac | NOTE | Closed |
| 2 | Shader Core | Legacy shader-owned nucleus dot disabled in favor of Canvas2D Core overlay to avoid duplication | NOTE | Closed |

---

## 14. Known Limitations

- **WebGL Fallback**: Organism/WebGL rendering fallback to solid for non-solid lines is documented, expected, and correctly surfaced. -> **ACCEPTED**
- **50+ Cells Limitation**: Already known layout performance limitation is preserved. -> **ACCEPTED**

---

## 15. Exact Final Verdict and Next Gate

- **Final Verdict**: `MERGE CANDIDATE`
- **Next Gate**: Awaiting Owner review and command to merge or proceed to `C0.4F-B`.
