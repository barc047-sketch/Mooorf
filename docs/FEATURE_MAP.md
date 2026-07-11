# Feature Map

Purpose: map features to files, docs, and risk level for faster future phases.

Before a feature, check this map and `docs/COMPONENT_INVENTORY.md` so the implementation reuses existing ownership instead of creating duplicate controls or state.

## Dock / Rail / Widgets

- Purpose: command surfaces for quick actions and detailed controls.
- Main files: `src/ui/Dock.tsx`, `src/ui/Rail.tsx`, `src/ui/widgets/*`, `src/ui/controlMeta.ts`, `src/ui/shell.css`, `src/ui/widgets/widgets.css`.
- Related docs: `docs/DESIGN_UI_UPGRADE_V6K.md`, `docs/COMPONENT_INVENTORY.md`, `docs/DESIGN_SYSTEM_MEMORY.md`.
- Risk: high for layout/mobile regressions; medium for state wiring.

## Organism Shader

- Purpose: WebGL2 implicit-field renderer with one-pass per-nucleus spatial color weighting for production organism canvas and lab route.
- Main files: `src/experiments/organism-lab/organism-shader.ts`, `src/experiments/organism-lab/organism-types.ts`, `src/canvas/OrganismCanvasView.tsx`.
- Related docs: `docs/ORGANISM_ENGINE_LIMITS.md`, `docs/HANDOFF.md`.
- Risk: high; build can pass while visual behavior regresses.

## Void Nuclei

- Purpose: subtractive nuclei that carve/thin the organism.
- Main files: `src/types.ts`, `src/state/store.ts`, `src/canvas/organismAdapter.ts`, `src/design/colorMapping.ts`, `src/ui/Dock.tsx`, `src/views/TableView.tsx`, `src/canvas/renderer.ts`.
- Related docs: `docs/ORGANISM_ENGINE_LIMITS.md`, `docs/DECISIONS.md`, `docs/BUGS.md`.
- Risk: high for saved-view compatibility and shader stability.

## Palette Mapping

- Purpose: canonical Category/Privacy color source, Editorial Aurora categorical swatches, and shared nucleus/organism/export color language.
- Main files: `src/design/palettes.ts`, `src/design/colorMapping.ts`, `src/canvas/OrganismCanvasView.tsx`, `src/canvas/organismAdapter.ts`, `src/views/TableView.tsx`.
- Related docs: `docs/PALETTE_SYSTEM_SPEC.md`, `docs/DESIGN_UI_UPGRADE_V6K.md`.
- Risk: medium; avoid rainbow/random color drift.

## Direct Cell Editing (V8.1)

- Purpose: single activation selects without geometry changes; deliberate double activation opens one shared Name/Area editor for both renderers.
- Main files: `src/canvas/InlineCellEditor.tsx`, `src/canvas/cellActivation.ts`, `src/canvas/CanvasView.tsx`, `src/canvas/OrganismCanvasView.tsx`.
- Risk: high for drag-vs-double-tap arbitration and duplicate commit races.

## Saved Views

- Purpose: architecture design iterations stored locally.
- Main files: `src/types.ts`, `src/state/store.ts`, `src/ui/SavedViewsPanel.tsx`, `src/ui/widgets/SavedViewsWidget.tsx`, `src/ui/shell.css`.
- Related docs: `docs/HANDOFF.md`, `docs/DECISIONS.md`.
- Risk: high for data safety; loading must preserve table sync and old snapshot compatibility.

## Layout Presets

- Purpose: position-only arrangements for existing spaces.
- Main files: `src/canvas/layoutPresets.ts`, `src/state/store.ts`, `src/ui/widgets/LayoutWidget.tsx`, `src/ui/Dock.tsx`.
- Related docs: `docs/DECISIONS.md`, `docs/HANDOFF.md`.
- Risk: medium; must never replace/delete user program data.

## Annotation Modes

- Purpose: editorial/pill/technical/hidden labels and label detail controls.
- Main files: `src/types.ts`, `src/state/store.ts`, `src/canvas/OrganismCanvasView.tsx`, `src/canvas/organismCanvas.css`, `src/ui/widgets/AnnotationWidget.tsx`.
- Related docs: `docs/DESIGN_UI_UPGRADE_V6K.md`.
- Risk: medium; label alignment must track live camera/render loop.

## Table Sync

- Purpose: edit spaces through the same store as canvas.
- Main files: `src/views/TableView.tsx`, `src/state/store.ts`, `src/types.ts`, `src/lib/geometry.ts`.
- Related docs: `docs/HANDOFF.md`, `docs/DECISIONS.md`.
- Risk: high; never duplicate product data into UI-local state.

## Classic Fallback

- Purpose: old 2D canvas remains usable when organism mode is switched off or WebGL is unavailable.
- Main files: `src/canvas/CanvasView.tsx`, `src/canvas/renderer.ts`, `src/canvas/blob.ts`, `src/ui/Dock.tsx`, `src/App.tsx`.
- Related docs: `docs/HANDOFF.md`, `docs/BUGS.md`.
- Risk: high when touching shared types, colors, geometry, or renderer mode.

## Lab Route

- Purpose: isolated shader/debug prototype route.
- Main files: `src/App.tsx`, `src/experiments/organism-lab/*`.
- Related docs: `docs/ORGANISM_LAB_SPEC.md`, `docs/ORGANISM_ENGINE_LIMITS.md`.
- Risk: medium; keep route isolated and do not import production store into lab.

## Spatial Intelligence / Stats Widgets

- Purpose: live derived program metrics floating as diagnostic instruments. Project Pulse is the single rail gateway; four V7.1 instruments can coexist independently.
- Main files: `src/domain/stats/selectors.ts`, `src/ui/widgets/stats/*`, `src/ui/widgets/WidgetHost.tsx`, `src/ui/Rail.tsx`, `src/types.ts` (WidgetId), `src/ui/panels/widgetRegistry.ts`.
- Related docs: `docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md`, `docs/V6N_REFERENCE_STYLE_LOCK.md`.
- Risk: medium; metrics must stay pure/derived (no duplicated state), voids must never inflate program area, and data colors must stay token-driven.
- Status: V7.1B complete — Category Mix, Privacy Balance, Area Leaders, and Data Health are live with registry-owned semantic geometry and canonical icons; Relationship Health/Floor Summary await runtime graph data.

## Adaptive Interface / Readiness (V7.1B)

- Purpose: authored widget aspect ratios, persistent chrome scale, unbounded
  normal labels, first-render readiness, and one-line icon/title identity.
- Main files: `src/ui/panels/widgetRegistry.ts`, `src/ui/widgets/WidgetFrame.tsx`,
  `src/ui/widgets/WidgetHost.tsx`, `src/state/uiScale.ts`, `src/state/store.ts`,
  `src/App.tsx`, `src/ui/Loader.tsx`, `src/canvas/OrganismCanvasView.tsx`,
  `src/canvas/CanvasView.tsx`, `src/canvas/organismCanvas.css`.
- Risk: high for saved-view migration, mobile sheets, renderer error exits, and
  drag bounds; canvas world geometry and metric selectors must remain unchanged.

## Export / Presentation Pack (V7.2)

- Purpose: PNG, PDF, CSV, JSON, and ZIP presentation-pack export from the
  master graph/current canvas state, plus true-vector SVG for Classic mode.
- Main files: `src/export/*` (types, filenames, csv, projectSnapshot,
  manifest, pageLayout, resolution, svgExport, pdfExport, canvasComposite,
  exportService), `src/canvas/exportCapture.ts` (renderer-aware capture
  bridge), `src/canvas/CanvasView.tsx`/`OrganismCanvasView.tsx` (capture
  providers), `src/canvas/renderer.ts` (`drawScene` optional `includeLabels`),
  `src/ui/widgets/ExportWidget.tsx`, `src/ui/Dock.tsx` (existing Export
  placeholder activated), `src/ui/panels/widgetRegistry.ts`, `src/types.ts`
  (`WidgetId`), `src/components/ui/sonner.tsx` (Toaster mounted in App.tsx).
- Related docs: `docs/DECISIONS.md` (V7.2 architecture + SVG truthfulness),
  `docs/COMPONENT_INVENTORY.md`.
- Risk: high for renderer capture timing (WebGL `preserveDrawingBuffer:false`)
  and scale isolation; canvas world coordinates/camera and Interface/Widget
  Scale must never be touched by export generation.
- Status: V7.2 complete for desktop/laptop/iPad. Organism SVG is truthfully
  reported unavailable (no reusable vector membrane path); multi-frame/batch
  export remains deferred.

## Selection Feedback (V7.3)

- Status: the former partial orbit/selection arc and halo/influence modes were intentionally removed in V7.3. They are neither active nor planned.
- Current ownership: `src/canvas/OrganismCanvasView.tsx` keeps the existing MovingBorder, selected metadata, command menu, and rename/area edit surface; Classic uses an on-body boundary keyline only.
- Export rule: the removed arc is never captured or emitted. Clean selection still filters the moving keyline/details where applicable.
- Risk: keep the details shell pointer-transparent and actions leaf-interactive so canvas drag/pan/zoom remain available.

## File Intake / Project Transfer (V7.3)

- Purpose: local-only `.mooorf`, config, CSV, XLS, and XLSX review and atomic apply.
- Main files: `src/import/*`, `src/ui/widgets/FileIntakeWidget.tsx`, `src/ui/widgets/WidgetHost.tsx`, `src/ui/Dock.tsx`, `src/export/projectSnapshot.ts`.
- Ownership: one global drop queue, one import service, one File Intake WidgetFrame, central Zustand product data, V7.2 snapshot extension.
- Risk: high for destructive replacement; schema validation, recovery snapshot, one transaction, and Undo are mandatory.
