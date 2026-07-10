# Component Inventory

Purpose: identify reusable UI/runtime pieces so future phases do not duplicate controls.

## Ponytail First

This is the first place to check before creating UI or control logic.

- Widgets must reuse `WidgetFrame`, `WidgetHost`, and shared controls from `src/ui/widgets/controls.tsx`.
- Dock, rail, widget, table, and canvas responsibilities must not be duplicated.
- New UI files are allowed only when existing components cannot own the behavior cleanly.
- Prefer adapters/extensions over rewrites.
- Avoid parallel state systems; product data stays in the store.
- If adding a new component, document why existing components were insufficient.

## Premium Primitive Rule

V6N.1 makes the shared visual primitives mandatory for production UI.

- Use `src/styles/tokens.css` for glass, chrome, radius, HUD text, muted text, dot grid, selection arc, and warning colors.
- Use `.glass`, `.wframe`, `.dock-*`, `.rail-*`, `.org-*`, `.pop-*`, `.saved-*`, `.pal-*`, and `.selection-*` classes before inventing new chrome.
- Use `src/ui/primitives/MovingBorder.tsx` for selected/active organism or future instrument borders that need subtle motion. It is not a generic wrapper for every card or every cell.
- Sliders, switches, segmented chips, choice rows, metadata pills, micro cards, saved-view rows, palette rows, and canvas edit popovers should inherit the shared premium language.
- New widget/card/control CSS is acceptable only when it extends these primitives or covers a genuinely new interaction.
- Future stats/data widgets should use compact micro-card patterns, tabular numerals, and glass surfaces from the existing widget system.

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

### MovingBorder

- File: `src/ui/primitives/MovingBorder.tsx`
- Role: neutral/palette-aware animated border primitive for selected, hover, or edit-active instrument states.
- Reuse: selected organism nuclei, future active metric widgets, or command surfaces that need a subtle moving perimeter.
- Do not overuse: do not wrap every cell, card, widget, or palette row by default. Motion is reserved for selected/active emphasis.
- Implementation note: CSS/SVG-free DOM primitive with CSS masks, reduced-motion support, and custom color/duration/radius props.

## Stats / Spatial Intelligence (V7)

### Stats Selectors

- File: `src/domain/stats/selectors.ts`
- Role: pure derived metrics over store `spaces` (program area, counts, category shares, privacy balance, leaders, data-health counts).
- Reuse: every stats widget must consume these; add new metrics here first.
- Do not duplicate: metric math inside components, metric state in the store, hardcoded numbers.

### Stats Primitives

- Files: `src/ui/widgets/stats/primitives.tsx`, `src/ui/widgets/stats/stats.css`
- Role: `MetricReadout`, `MicroDistribution`, `InsightRow` + `formatInt`/`formatShare`/`formatCount` — the shared instrument language for the V7 family.
- Reuse: extend this file for family needs (MiniRank, StatusDot); keep `pulse-*` CSS family.
- Do not duplicate: per-widget readout/band/format variants or chart libraries.

### ProjectPulseWidget

- File: `src/ui/widgets/stats/ProjectPulseWidget.tsx`
- Role: V7 flagship — the normative reference for structure, tone, and data flow of all stats widgets.
- Spec: `docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md`.

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
- Reuse: selection arc and moving cell border should extend this carefully instead of creating independent DOM overlays.

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
