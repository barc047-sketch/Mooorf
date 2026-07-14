# C0.4F-A Independent Baseline Pre-Audit Report

**Status:** Completed  
**Audit Branch:** `audit/c0-4f-a-baseline-preaudit`  
**Exact Base Commit:** `c4600472ea76f651800c19b91cf8f67954ca992e` (`origin/main`)  
**Auditor:** Antigravity (Gemini 3.5 Flash)  
**Date:** 2026-07-15  

---

## 1. Executive Summary

This pre-audit report establishes the independent visual, architectural, and validation baseline for the **C0.4F-A Runtime Layer Separation** milestone. 

The baseline is captured at commit `c4600472ea76f651800c19b91cf8f67954ca992e` (the post-C0.4.1 merge head) to prepare the ground for auditing Codex's implementation of C0.4F-A. All product code remains unmodified on this audit branch.

---

## 2. Current Layer Ownership Map

The table below maps the current architectural and presentation owners for the six canonical targets plus the ephemeral Selection UI.

| Target Layer | CPU/State Owner | Classic Renderer Owner (`src/canvas/renderer.ts`) | Organism WebGL Renderer Owner (`src/experiments/organism-lab/organism-shader.ts`) |
| :--- | :--- | :--- | :--- |
| **Cell (Fill/Body)** | `SpaceCell.area`, `SpaceCell.color` (or mapped colors from active palette) | Solid circular fill with a subtle ceramic shading gradient (`drawScene`). | Fullscreen triangle implicit field rendering via `uNuclei` & `uNucleusColors` (`ORGANISM_FRAG`). |
| **Boundary** | `settings.presentationDefaults.boundary` (Not consumed yet) | None for normal cells. Void cells render a dashed circle at their boundary radius. | None. Boundary lines are not rendered inside the WebGL fragment shader. |
| **Membrane** | `settings.blobOn`, `settings.mergeDistance` | CPU-calculated metaball contours drawn in 2D canvas context via `drawBlobLayer`. | Evaluated pixel-by-pixel in the fragment shader based on field energy (`fieldAt`). |
| **Membrane Edge**| `settings.presentationDefaults.membraneEdge` (Not consumed yet) | None. No separate edge boundary layer is rendered. | Blended implicitly via the accent color mix around metaball boundaries. |
| **Core** | `settings.organism.showNuclei` | Cell fills are drawn directly (no separate core layer). | Rendered as reverse-tone central dots (`uNucleusDots`) inside the fragment shader. |
| **Void** | `SpaceCell.kind === "void"` | Subtractive geometry drawn as a dashed double ring with a faint dark fill. | Calculated as a negative field contributor (`n.w < 0.0`) forming physical implicit pockets. |
| **Selection UI** | `selectedId`, `selectedIds`, `primarySelectedId` in store | Circular outline rings drawn at `Math.max(1, r + 6)` directly on the 2D canvas. | Rendered as high-performance DOM overlays (`.organism-cell-keyline`, selection metadata widgets). |

---

## 3. Persistence & Export Mapping

The table below traces where layout and presentation state is saved, cloned, or written.

| Path | File | Description | Selection Leakage Risk |
| :--- | :--- | :--- | :--- |
| **Project Save/Load** | [projectFiles.ts](file:///Users/tanisxq/Documents/ZONU0/src/import/projectFiles.ts) | Parses/validates `MooorfProjectEnvelope` JSON files. Normalizes and deep-copies cell appearance overrides. | **No risk.** Selection state is completely excluded from the file schemas. |
| **View Snapshots** | [store.ts](file:///Users/tanisxq/Documents/ZONU0/src/state/store.ts) | Captures and loads saved views into `SavedCanvasSnapshot[]` arrays stored in Local Storage. | **No risk.** Snapshot mapper explicitly ignores selection identifiers. |
| **Session Recovery** | [projectTransfer.ts](file:///Users/tanisxq/Documents/ZONU0/src/import/projectTransfer.ts) | Serializes current workspace state to `RecoverySnapshot` in-memory. | **Moderate (Safe).** Saves selection state to restore the user's focus upon recovery; however, this is strictly in-memory and never written to disk or configuration files. |
| **Vector Export** | [svgExport.ts](file:///Users/tanisxq/Documents/ZONU0/src/export/svgExport.ts) | Serializes the current spaces list directly to an SVG vector document. | **High.** If the export options set `includeSelection = true`, the selection rings are rendered as vector circles. In C0.4F-A, we must verify that this behavior remains optional and does not write frozen selection lines by default. |

---

## 4. Current Renderer Baselines

### 4.1 Classic (Canvas 2D) Renderer
*   **Visual Baseline:** Cells are drawn as simple filled circles with a radial ceramic lighting gradient. The background page body color shows through. 
*   **Void Behavior:** Subtractive void cells render a dashed outer ring and an inner concentric dashed ring (radius ratio `0.42`).
*   **Selection:** The primary selected cell renders a thick solid circle offset from the cell border. Secondary selected cells render a dashed circle. Hovering renders a faint neutral keyline.
*   **Labels:** Rendered as inline black/white text directly on the canvas context with a light border stroke.

### 4.2 Organism/WebGL Renderer
*   **Visual Baseline:** Implements liquid metaball rendering that dynamically merges and splits cells. Central nucleus dots are drawn inside the fragment shader based on a fixed `0.34` radius multiplier.
*   **Void Behavior:** Creates pockets of empty background space by subtracting energy from the metaball field.
*   **Selection:** Rendered as absolute-positioned DOM element overlays positioned directly above the canvas coordinate anchors.
*   **Labels:** Rendered as HTML elements inside a CSS-managed overlay layer.

---

## 5. Expected Boundary Stroke Matrix

The C0.4F-A milestone introduces the essential Boundary stroke properties. The matrix below defines the expected behavior, constraints, and fallback strategies for the 6 target styles.

| Style | Classic Expected Support | Organism/WebGL Expected Support or Fallback | Width & Offset Behavior | Scaling Expectation | Later SVG/PDF Implications |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`solid`** | Full support using `ctx.stroke()`. | Fallback to DOM overlay keylines (reusing the selection style architecture) or basic WebGL lines. | Width scales with zoom; offset expands/contracts the stroke radius. | World-scaled (size adjusts dynamically with viewport zoom). | Direct export as `<circle>` stroke or standard vector line paths. |
| **`dashed`** | Supported using `ctx.setLineDash([dash, gap])`. | Fallback to solid boundary or DOM dashed border. | Scales with zoom; offset expands/contracts the path. | World-scaled. | Mapped to `stroke-dasharray` attribute in SVG and PDF dash parameters. |
| **`dotted`** | Supported using `ctx.setLineDash([dot, gap])` with a round cap. | Fallback to solid boundary or DOM dotted border. | Scales with zoom; offset expands/contracts the path. | World-scaled. | Mapped to dot-pattern arrays with `stroke-linecap="round"` in vectors. |
| **`dash-dot`** | Supported using `ctx.setLineDash([dash, gap, dot, gap])`. | Fallback to solid boundary or DOM dashed border. | Scales with zoom; offset expands/contracts the path. | World-scaled. | Mapped to custom dash arrays in vector exports. |
| **`double`** | Supported by rendering two concentric circles offset by a spacing gap. | Fallback to a single solid outer circle. | Inner/outer circles scale proportionally. | World-scaled. | Exported as two concentric vector circles or nested paths. |
| **`segmented-bars`** | Supported by drawing radial tick strokes or computed dash/gap rings. | Fallback to a single solid circle or DOM border. | Segment width and count remain proportional to radius. | World-scaled. | Exported as individual radial path strokes. |

---

## 6. Verification Plan for Delta Audit

The future delta audit of Codex's fixed C0.4F-A branch must run and verify:

### 6.1 Automated Tests
Run the following test commands to ensure no contract regressions:
```bash
npx tsx src/domain/presentation/presentationContracts.test.ts
npx tsx src/export/exportCore.test.ts
npx tsx src/import/importCore.test.ts
npx tsx src/resources/resourcePersistence.test.ts
```
Additionally, check for any newly added tests covering the Boundary stroke validation.

### 6.2 Code Quality & Build Checks
*   **Git Check:** Run `git diff --check` to ensure no whitespace leaks or formatting regressions.
*   **Clean Build:** Run `npm run build` to confirm successful TypeScript compilation and production packaging.

### 6.3 Manual QA Guidelines
*   **Independent Toggles:** Verify that enabling/disabling a layer (e.g., turning off Boundary or Membrane Edge) affects that target only.
*   **Selection Isolation:** Verify that copying a cell style, saving the project, or executing a JSON export does not contain selection markers.
*   **Invariants:** Confirm that changing Boundary width, style, or offset does not alter the cell hit-test radius, cell area calculations, or metaball physics.

---

## 7. Existing Architectural Risks

*   **HTML Overlay Drift:** Organism renderer labels and selection rings are positioned as HTML elements over WebGL coordinates. High-velocity zooming or dragging can create visible layout lag (drift) between the canvas content and the overlay.
*   **Vite Chunk size:** The application main chunk is already exceeding `500 kB`, triggering Vite production warnings. This is accepted for the current phase but must be monitored.
*   **Performance Limits:** Implicit WebGL metaball evaluation scales quadratically with the cell count on the CPU. The 50+ Cell performance limitation is present and must not be worsened.

---

## 8. Deterministic Layout Evidence (1440 & 1280)

At both 1440px desktop and 1280px laptop widths, the baseline layout follows these properties:

### 8.1 Spacing and Scale Variables
*   **Density Modifier:** `--ui-scale` defaults to `1`. Spacing scales proportionally:
    *   `--sp-6`: `calc(6px * var(--ui-scale))` (6px)
    *   `--sp-12`: `calc(12px * var(--ui-scale))` (12px)
    *   `--sp-18`: `calc(18px * var(--ui-scale))` (18px)
    *   `--sp-24`: `calc(24px * var(--ui-scale))` (24px)
*   **Widget Scale:** `--widget-scale` defaults to `1`. Exclusively controls the size of widgets without affecting core navigation rails.

### 8.2 Position and Geometry Anchors
*   **Left Workspace Rail:** Occupies a fixed vertical strip on the left viewport edge. Buttons have a fixed footprint of `calc(30px * var(--ui-scale))`.
*   **Bottom Docks:** Absolute positioned with a spacing offset of `bottom: var(--sp-24)`. Centered horizontally via CSS transforms (`left: 50%`, `translate: -50% 0`).
*   **Inspector Panel:** Occupies the right sidebar with floating layouts, preventing collision with the central canvas.

---

## Verdict Summary

**`DONE — READY FOR FIXED-HEAD DELTA AUDIT`**

The baseline measurements are recorded, all current baseline tests pass, and the audit branch is prepared for the upcoming pre-audit review.
