# Project Memory Index

Purpose: compact map of where project truth lives so future Codex phases read less.

Before a feature, check `docs/COMPONENT_INVENTORY.md` and `docs/FEATURE_MAP.md` to satisfy the Ponytail reuse rule.

## Core State Files

- `src/types.ts` — shared app/domain UI types: spaces, renderer mode, palettes, annotation, saved snapshots, organism settings.
- `src/state/store.ts` — Zustand source of truth: spaces, camera, settings, widgets, saved views, CRUD, layout, void creation.
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
- `src/ui/controlMeta.ts` — shared labels/descriptions for dock and widgets.

## Canvas / Engine Files

- `src/canvas/OrganismCanvasView.tsx` — production WebGL organism canvas, labels, drag/pan/zoom, render loop.
- `src/canvas/organismAdapter.ts` — `SpaceCell` to production nuclei mapping, motion, hit testing, void signed strength.
- `src/canvas/organismProductionSettings.ts` — production organism defaults/resolver.
- `src/canvas/organismCanvas.css` — organism canvas label/fallback/grid styling.
- `src/canvas/CanvasView.tsx` — classic 2D fallback.
- `src/canvas/renderer.ts` — classic 2D draw path.
- `src/canvas/blob.ts` — classic fallback blob/membrane layer.
- `src/canvas/layoutPresets.ts` — position-only layout/random arrangements.
- `src/lib/geometry.ts` — area-to-radius, scatter, hit test, clamp.
- `src/experiments/organism-lab/*` — isolated WebGL2 lab route and shader prototype.

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

## Current Limits

- WebGL organism render cap: 96 visible nuclei via uniform array.
- Saved views: localStorage only, capped at 20 snapshots.
- Known Vite main chunk warning remains accepted.
- High-density labels are crowded at 60+ spaces.
- Dedicated Void layout preset remains deferred.

## Deferred Features

- V6LQ shader/void QA.
- V6.5 selection arc and direct canvas rename.
- V6N interface density/design refinement.
- V7 stats widgets.
- V8 export/import polish.
- V9 floor system.
- V10 performance scaling with texture/data-buffer renderer.
