# Component Inventory

Purpose: identify reusable UI/runtime pieces so future phases do not duplicate controls.

## Widget System

### `WidgetHost`

- File: `src/ui/widgets/WidgetHost.tsx`
- Role: renders open widgets from `openWidgets` store state.
- Reuse: add new detailed control surfaces here through existing widget ids/patterns.
- Do not duplicate: separate floating panel frameworks.

### `WidgetFrame`

- File: `src/ui/widgets/WidgetFrame.tsx`
- Role: shared widget chrome: title, drag, minimize, close, focus, mobile sheet.
- Reuse: all floating widgets should use this frame.
- Do not duplicate: custom draggable card shells.

### Widget Controls

- File: `src/ui/widgets/controls.tsx`
- Role: `SliderRow`, `SwitchRow`, `WidgetSection`, `ChipRow`, `ChoiceRow`.
- Reuse: sliders, toggles, chips, and grouped sections.
- Do not duplicate: one-off slider rows or switch styling.

## Shell Components

### `Dock`

- File: `src/ui/Dock.tsx`
- Role: bottom quick actions only.
- Owns: renderer mode, quick style/attachment, density, add nucleus, add-5, void, quick palette/saved/random/import/export/system launchers.
- Do not add: large forms, inspectors, or full advanced controls.

### `Rail`

- File: `src/ui/Rail.tsx`
- Role: launcher/navigation rail only.
- Owns: canvas/table navigation and widget launch.
- Do not add: duplicate full controls already owned by widgets/dock.

### `SavedViewsPanel`

- File: `src/ui/SavedViewsPanel.tsx`
- Role: saved iteration list and actions.
- Reuse: saved views widget and any future saved-view entry point should embed/reuse this.

## Palette Components

- File: `src/ui/widgets/PaletteWidget.tsx`
- Role: nucleus palette family selection, organism palette selection, program mapping preview.
- Data: `src/design/palettes.ts`, `src/design/colorMapping.ts`.
- Reuse: do not create separate palette pickers until custom palette phase.

## Canvas Label / Selection Systems

- Files: `src/canvas/OrganismCanvasView.tsx`, `src/canvas/organismCanvas.css`.
- Role: HTML label overlay, label modes, selection ring size/display.
- Reuse: selection arc should extend this carefully instead of creating independent DOM overlays.

## Table Components

- File: `src/views/TableView.tsx`
- Role: direct store-backed table editor.
- Reuse: future table columns should write through existing store actions.
- Do not duplicate: local copies of `spaces`.

## Classic Fallback Components

- Files: `src/canvas/CanvasView.tsx`, `src/canvas/renderer.ts`, `src/canvas/blob.ts`.
- Role: 2D canvas fallback and older blob organism.
- Reuse: preserve fallback when changing types/colors/geometry.

## Guidance

- Rail = launcher.
- Dock = quick actions.
- Widget = detailed controls.
- Canvas = direct editing.
- Store = product data.
- Adapters/renderers = derived visuals.
