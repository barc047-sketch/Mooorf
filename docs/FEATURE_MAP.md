# Feature Map

Purpose: map features to files, docs, and risk level for faster future phases.

Before a feature, check this map and `docs/COMPONENT_INVENTORY.md` so the implementation reuses existing ownership instead of creating duplicate controls or state.

## Dock / Rail / Widgets

- Purpose: command surfaces for quick actions and detailed controls.
- Main files: `src/ui/Dock.tsx`, `src/ui/Rail.tsx`, `src/ui/widgets/*`, `src/ui/controlMeta.ts`, `src/ui/shell.css`, `src/ui/widgets/widgets.css`.
- Related docs: `docs/DESIGN_UI_UPGRADE_V6K.md`, `docs/COMPONENT_INVENTORY.md`, `docs/DESIGN_SYSTEM_MEMORY.md`.
- Risk: high for layout/mobile regressions; medium for state wiring.

## Organism Shader

- Purpose: WebGL2 implicit-field renderer for production organism canvas and lab route.
- Main files: `src/experiments/organism-lab/organism-shader.ts`, `src/experiments/organism-lab/organism-types.ts`, `src/canvas/OrganismCanvasView.tsx`.
- Related docs: `docs/ORGANISM_ENGINE_LIMITS.md`, `docs/HANDOFF.md`.
- Risk: high; build can pass while visual behavior regresses.

## Void Nuclei

- Purpose: subtractive nuclei that carve/thin the organism.
- Main files: `src/types.ts`, `src/state/store.ts`, `src/canvas/organismAdapter.ts`, `src/design/colorMapping.ts`, `src/ui/Dock.tsx`, `src/views/TableView.tsx`, `src/canvas/renderer.ts`.
- Related docs: `docs/ORGANISM_ENGINE_LIMITS.md`, `docs/DECISIONS.md`, `docs/BUGS.md`.
- Risk: high for saved-view compatibility and shader stability.

## Palette Mapping

- Purpose: category/privacy/area-informed color language for nuclei and organism.
- Main files: `src/design/palettes.ts`, `src/design/colorMapping.ts`, `src/canvas/OrganismCanvasView.tsx`, `src/canvas/organismAdapter.ts`, `src/views/TableView.tsx`.
- Related docs: `docs/PALETTE_SYSTEM_SPEC.md`, `docs/DESIGN_UI_UPGRADE_V6K.md`.
- Risk: medium; avoid rainbow/random color drift.

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

## Selection Arc

- Purpose: future direct canvas selection/rename/area affordances.
- Main files likely: `src/canvas/OrganismCanvasView.tsx`, `src/canvas/organismCanvas.css`, `src/types.ts`, `src/state/store.ts`.
- Related docs: `docs/V4_5_SELECTION_ARC_SYSTEM.md`, `docs/NEXT_PHASES.md`.
- Risk: high; can conflict with drag/pan/label hit areas.
