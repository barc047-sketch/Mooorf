# Feature Map

Purpose: map features to files, docs, and risk level for faster future phases.

Before a feature, check this map and `docs/COMPONENT_INVENTORY.md` so the implementation reuses existing ownership instead of creating duplicate controls or state.

## Icon and Grid Asset Registry (V8.2C0.2)

- Purpose: provide audited, immutable symbol and grid metadata for the future inspector without adding placement UI or changing Canvas runtime behavior.
- Main files: `src/icons/types.ts`, `src/icons/iconRegistry.ts`, `src/icons/iconValidation.ts`, `src/grid/types.ts`, `src/grid/gridRegistry.ts`, `src/resources/resourceCatalogue.ts`, and focused registry/persistence contracts.
- Icon ownership: exactly 77 installed Lucide/ISC drawable symbols use canonical `icon:<category>:<name>` IDs, approved provenance/validation metadata, accessibility/search fields, and explicit `space` targets. Existing shell/navigation/tool command registries remain separate presentation owners.
- Grid ownership: the eight established IDs remain stable. Dotted reflects the one live Organism grid path, None is active/off, and the other six presets are Future metadata; snap/export fields describe compatibility but remain explicitly unimplemented.
- Persistence: resource settings store canonical IDs and sparse values only. Six known legacy icon IDs normalize at catalogue/placement boundaries; unknown IDs are retained for recovery.
- Deferred: C0.3 inspector UI, placement/transform/tint/backing, shortcut `I`, grid renderer/snapping/export work, target rails, and prototype/custom asset ingestion.
- Risk: source/licence drift and falsely claiming metadata-only grids as rendered. Keep registry validation deterministic and runtime support truthful.

## Canvas Performance Reset (V8.2C0)

- Purpose: one rAF-scheduled input boundary, renderer-local drag previews, fixed/adaptive/world label presentation, deterministic Auto Contrast, optional Cell Shadow, stable glass, immediate widget refocus, and projected-centre radials.
- Main files: `src/interaction/frameScheduler.ts`, `src/interaction/groupDrag.ts`, `src/canvas/labelPresentation.ts`, `src/design/labelContrast.ts`, `src/canvas/cellShadow.ts`, both production canvas views/renderers, `src/state/store.ts`, `src/export/*`, `src/import/*`, and existing widget/context/token surfaces.
- Ownership: raw pointer/wheel samples coalesce in the active renderer; canonical positions commit once through `commitSpaceTransform`. `labelScaleMode`, `labelColourMode`, `cellShadow`, and `performanceQuality` persist through the existing snapshot/config/recovery path.
- Defaults: Morph (`blobOn`) off, motion amounts zero, screen labels, Auto Contrast, Cell Shadow off, Automatic quality. Legacy renderer-specific label/shadow behavior migrates conservatively.
- Deferred: floating desktop shell, Project Drawer, Material Browser, Dashboard/Data redesign, export queue, background references, touch layouts, and 200+ Organism rendering.
- Risk: high for input finalization, renderer parity, shader cost, and project migration; selection/history/material/resource ownership must remain invariant.

## Resource Registry Foundation (V8.2B)

- Purpose: one serializable, read-only catalogue foundation for materials, grid presets, annotation metadata, and icon asset metadata without shipping their visual browsers.
- Main files: `src/materials/*`, `src/grid/*`, `src/annotations/*`, `src/icons/*`, `src/resources/*`, `src/types.ts`, `src/state/store.ts`, `src/export/projectSnapshot.ts`, `src/export/manifest.ts`, `src/import/projectFiles.ts`, `src/import/projectTransfer.ts`.
- Ownership: registries own immutable definitions; `settings.resources` stores only resource schema version, material IDs/sparse overrides, normalized grid settings, and future annotation/icon references. No React nodes, renderer objects, functions, binary data, Blob URLs, or duplicated palette arrays enter snapshots.
- Compatibility: `materialResolver.ts` delegates current cell colour output to `getNucleusColor`; palette collections adapt every existing nucleus/organism palette, including Editorial Aurora. Legacy `paletteMode`, `nucleusPaletteId`, `colorSource`, explicit `space.color`, `showGrid`, and current renderer/export paths remain authoritative.
- Export policy: each material declares `preserve`, `rasterize`, `approximate-solid`, `omit`, or `unsupported`; manifests record active material IDs, grid preset ID, and resource schema version while Classic SVG and Organism PNG/PDF behavior remain unchanged.
- Deferred UI: Material Browser, circular shelf, Grid Shelf, Icon Library, Annotation Studio, Tools page, and renderer placement are deferred until Claude prototype review.
- Risk: high for project/config migration and palette parity; never persist registry objects or arbitrary shader source.

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

- Purpose: single activation selects without geometry changes; deliberate double activation opens one root-hosted Name/Area editor shared by both renderers.
- Main files: `src/canvas/InlineCellEditor.tsx`, `src/canvas/cellActivation.ts`, `src/ui/context/ContextSurfaceHost.tsx`, `src/canvas/CanvasView.tsx`, `src/canvas/OrganismCanvasView.tsx`.
- Risk: high for drag-vs-double-tap arbitration and duplicate commit races.

## Interaction Foundation (V8.2A)

- Purpose: one canonical tool/selection/context contract, multi-selection, blank-canvas commands, and explicit object radial actions across Classic and Organism.
- Main files: `src/types.ts`, `src/state/store.ts`, `src/interaction/*`, `src/ui/context/*`, `src/canvas/SelectedCellCommandMenu.tsx`, `src/canvas/CanvasView.tsx`, `src/canvas/OrganismCanvasView.tsx`, `src/App.tsx`.
- Ownership: product selection is `selectedIds` + `primarySelectedId`; legacy `selectedId` mirrors the primary. Tool/context state is store-owned session state but excluded from saved views and project exports. Renderer code owns hit testing only.
- Presentation: blank targets use the Base UI dropdown; space/void targets use 6–8 individual 40px action circles with a transparent empty centre. The root `ContextSurfaceHost` ensures only one primary contextual surface is open.
- Registries: `toolRegistry.ts` owns tool metadata/status; `contextActionRegistry.ts` owns labels/icons/shortcuts/availability/target support; `contextCommands.ts` owns product command execution.
- Deferred: marquee selection, iPad long-press/two-finger context activation, material shelf, detailed Tools page, line/relationship/text/paragraph/frame behavior, Boundary/Lock/Group/More.
- Risk: high for modifier-click/drag arbitration, Escape/outside-click ordering, context target invalidation, and selection geometry invariance.

## Multi-Selection Group Drag (V8.2A.1)

- Purpose: translate a selected group as one world-space delta without introducing a grouping model, resize, rotation, or canvas UI.
- Main files: `src/interaction/groupDrag.ts`, `src/state/store.ts`, `src/canvas/CanvasView.tsx`, `src/canvas/OrganismCanvasView.tsx`.
- Ownership: the shared utility captures finite live positions; the store batches preview positions and owns one ephemeral transform undo/redo entry on release. Saved views and project exports continue to persist final `spaces` positions only.
- Compatibility: Classic and Organism retain their renderer-specific hit testing and world conversion; Organism inverts its existing layout transform once from the drag anchor. Selection remains outside radius, strength, colour, material, and membrane inputs.
- Deferred: marquee/lasso, resize, rotation, alignment, persistent group data, transform UI, keyboard movement, iPad context gestures, and snapping work where no existing snapping contract exists.

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
- Current ownership: selected IDs live in the central store; both active renderer strategies project one external keyline (solid primary, dashed secondary, subtle unselected hover), and the root context host owns explicit right-click actions plus the shared editor. No automatic metadata/command panel renders on selection.
- Export rule: the removed arc is never captured or emitted. Clean selection omits the selected keylines; root context/editor chrome is outside renderer capture layers.
- Risk: selection must remain absent from organism radius/strength/position inputs; contextual action leaves alone may receive pointer events so canvas drag/pan/zoom remain available.

## File Intake / Project Transfer (V7.3)

- Purpose: local-only `.mooorf`, config, CSV, XLS, and XLSX review and atomic apply.
- Main files: `src/import/*`, `src/ui/widgets/FileIntakeWidget.tsx`, `src/ui/widgets/WidgetHost.tsx`, `src/ui/Dock.tsx`, `src/export/projectSnapshot.ts`.
- Ownership: one global drop queue, one import service, one File Intake WidgetFrame, central Zustand product data, V7.2 snapshot extension.
- Risk: high for destructive replacement; schema validation, recovery snapshot, one transaction, and Undo are mandatory.

## Canvas Stabilization (V8.2C0.1)

- Status: complete on `feature/v8-2c0-1-canvas-stabilization` for 1440 desktop and 1280 laptop.
- One user-facing Canvas mounts one active renderer strategy. WebGL remains normal; Classic and `organism-lab` remain internal fallback/experiment paths.
- Shared demand scheduling sleeps with Motion Off, while Motion On owns one continuous scheduler. Stable Organism derivations are dependency-cached.
- Inline Name/Area editing uses the existing graph store and Undo/Redo stack. Morph creates the optional Membrane; selection remains an external visual layer.
- Ordinary UI has no ORG/CLS choice and Dock hover keeps stable geometry.
- Next architecture-only phases: V8.2C0.2 asset registry, then V8.2C0.3 Icons & Symbols Inspector.
