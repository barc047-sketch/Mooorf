# Project Memory Index

Purpose: compact map of where project truth lives so future Codex phases read less.

Before a feature, check `docs/COMPONENT_INVENTORY.md` and `docs/FEATURE_MAP.md` to satisfy the Ponytail reuse rule.

## Core State Files

- `src/types.ts` — shared app/domain UI types: spaces, renderer/readiness mode, palettes, annotation, saved snapshots, organism settings.
- `src/state/store.ts` — Zustand source of truth: spaces, camera, settings, widgets, saved views, CRUD, layout, void creation.
- `src/state/uiScale.ts` — normalized 82–118% interface-scale contract and 88/100/112 presets; canvas geometry never consumes it.
- `src/App.tsx` — route split, main app shell, canvas/table rendering, lab route.

## UI Files

- `src/ui/Dock.tsx` — bottom quick actions: renderer, style, attachment, density, add nucleus, add-5, void, palette/saved/random/import/export/system launchers.
- `src/ui/Rail.tsx` — left launcher rail only.
- `src/ui/ViewToggle.tsx` — Canvas/Table switch.
- `src/ui/ZoomControls.tsx` and `src/ui/Hud.tsx` — canvas navigation/status.
- `src/ui/shell.css` — dock, rail, widgets, table-adjacent UI styling.
- `src/styles/tokens.css` — canonical visual tokens.

## Widget Files

- `src/ui/widgets/WidgetHost.tsx` — renders open widgets from store state.
- `src/ui/widgets/WidgetFrame.tsx` — shared floating widget chrome, drag, minimize, close, mobile sheet behavior.
- `src/ui/widgets/controls.tsx` — reusable slider/switch/chip/choice sections.
- `src/ui/widgets/AnnotationWidget.tsx` — label modes and annotation detail.
- `src/ui/widgets/OrganismWidget.tsx` — organism/style/field/motion/debug controls.
- `src/ui/widgets/LayoutWidget.tsx` — layout presets, random, visual spread.
- `src/ui/widgets/PaletteWidget.tsx` — nucleus families and organism palettes.
- `src/ui/widgets/SavedViewsWidget.tsx` and `src/ui/SavedViewsPanel.tsx` — saved iterations.
- `src/ui/widgets/DisplayWidget.tsx` — theme, grid, label/nuclei display.
- `src/ui/widgets/AdvancedWidget.tsx` — diagnostics and staged controls.
- `src/ui/widgets/widgets.css` — widget-specific layout.
- `src/ui/panels/widgetRegistry.ts` — canonical widget labels, icons, launcher ownership, and semantic authored geometry.
- `src/ui/widgets/stats/ProjectPulseWidget.tsx` — V7 flagship spatial intelligence widget.
- `src/ui/widgets/stats/InstrumentLauncher.tsx` — compact Project Pulse gateway for the four independent instruments.
- `src/ui/widgets/stats/CategoryMixWidget.tsx`, `PrivacyBalanceWidget.tsx`, `AreaLeadersWidget.tsx`, `DataHealthWidget.tsx` — live V7.1 family.
- `src/ui/widgets/stats/primitives.tsx` — shared stats readout/distribution/ranking/health primitives + metric formatting.
- `src/domain/stats/selectors.ts` — pure derived program metrics (single metric owner).
- `src/domain/stats/selectors.test.ts` — dependency-free malformed/empty/void selector edge cases.
- `src/ui/controlMeta.ts` — shared labels/descriptions for dock and widgets.

## Canvas / Engine Files

- `src/canvas/OrganismCanvasView.tsx` — production WebGL organism canvas, labels, drag/pan/zoom, render loop.
- `src/ui/Loader.tsx` — existing startup surface, now driven by first usable WebGL/Classic frame readiness.
- `src/canvas/organismAdapter.ts` — `SpaceCell` to production nuclei mapping, motion, hit testing, void signed strength.
- `src/canvas/organismProductionSettings.ts` — production organism defaults/resolver.
- `src/canvas/organismCanvas.css` — organism canvas label/fallback/grid styling.
- `src/canvas/CanvasView.tsx` — classic 2D fallback.
- `src/canvas/renderer.ts` — classic 2D draw path.
- `src/canvas/blob.ts` — classic fallback blob/membrane layer.
- `src/canvas/layoutPresets.ts` — position-only layout/random arrangements.
- `src/lib/geometry.ts` — area-to-radius, scatter, hit test, clamp.
- `src/experiments/organism-lab/*` — isolated WebGL2 lab route and shader prototype.

## Export Files (V7.2)

- `src/export/exportService.ts` — single generation entry point: `exportPng`, `exportPdf`, `exportCsv`, `exportJson`, `exportSvg`, `buildPresentationPack`.
- `src/export/canvasComposite.ts` — background/padding compositing over a renderer-supplied capture.
- `src/export/pdfExport.ts`, `svgExport.ts`, `csv.ts`, `projectSnapshot.ts`, `manifest.ts`, `pageLayout.ts`, `resolution.ts`, `filenames.ts`, `types.ts` — one pure module per format/concern.
- `src/canvas/exportCapture.ts` — the one renderer-aware capture bridge Classic/Organism register into.
- `src/ui/widgets/ExportWidget.tsx` — Format/Visual/Presentation/Generate instrument; run-local `useState` only.

## Palette Files

- `src/design/palettes.ts` — curated nucleus families and organism palette metadata.
- `src/design/colorMapping.ts` — category/privacy/area color resolver, void colors, organism color mixing.
- `docs/PALETTE_SYSTEM_SPEC.md` — design intent and V6I/V6L behavior.

## Table Files

- `src/views/TableView.tsx` — store-backed table editor for name, area, category, privacy, type display, delete.
- Table sync uses `updateSpace`, `addSpace`, `removeSpace`, and shared `spaces` state.

## Docs

- `HANDOFF.md` and `TASK_QUEUE.md` — short gateway state.
- `docs/HANDOFF.md` — canonical phase history and current state.
- `docs/TASK_QUEUE.md` — canonical roadmap and phase checklist.
- `docs/DECISIONS.md` — architecture decisions.
- `docs/BUGS.md` — known risks and fixed bugs.
- `docs/DESIGN_UI_UPGRADE_V6K.md` — premium widget system.
- `docs/V6N_GLASS_EDITORIAL_DIRECTION.md` — neutral editorial glass, text-shadow toggle, camera-aware morph, selection polish.
- `docs/V6N_REFERENCE_STYLE_LOCK.md` — reference-locked dark HUD / frosted dashboard / spatial glass visual grammar.
- `docs/ORGANISM_ENGINE_LIMITS.md` — shader cap and future scaling path.
- `docs/CODEX_PHASE_PROTOCOL.md` — Codex operating protocol.
- `docs/FEATURE_MAP.md` — feature-to-file map.

## Feature Phases

- V6F.1: production organism canvas.
- V6G: organism QA/stabilization.
- V6H-V6K: production dock, controls, widgets, visual system.
- V6H.4/V6H.4B: layout presets, random, add-5.
- V6I: palette/category/privacy mapping.
- V6J: saved views.
- V6L: multi-color shader and void nuclei.
- V6M: Codex workflow OS.
- V6N: interface density and neutral editorial glass refinement.
- V6N.1: reference-locked premium design system and shared primitive hardening.
- V7.0/V7.1: Project Pulse gateway and complete runtime-backed spatial intelligence widget family.
- V7.1B: adaptive instrument geometry, canonical icons/headers, persistent UI scale, unbounded labels, and renderer-readiness intro.
- V7.1C/V7.1D: continuous Interface Scale slider; independent Widget Scale (desktop/laptop/iPad).
- V7.2: Export & Presentation Pack — PNG/PDF/CSV/JSON/ZIP, true-vector SVG for Classic only (desktop/laptop/iPad).

## Current Limits

- WebGL organism render cap: 96 visible nuclei via uniform array.
- Saved views: localStorage only, capped at 20 snapshots.
- Known Vite main chunk warning remains accepted.
- High-density labels are crowded at 60+ spaces.
- Dedicated Void layout preset remains deferred.
- Organism SVG export is unavailable (no reusable vector membrane path); the Classic blob/membrane merge layer is omitted from SVG (Path2D contour, not vector-extractable this phase).

## Deferred Features

- Relationship Health / Floor Summary widgets (need graph/floor runtime data).
- Project JSON import (export schema is import-ready; import UI not built this phase).
- Multi-frame/batch export.
- Organism vector SVG (true membrane path export).
- V9 floor system.
- V10 performance scaling with texture/data-buffer renderer.
