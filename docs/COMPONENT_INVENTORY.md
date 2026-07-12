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

- Use `src/styles/tokens.css` for glass, chrome, radius, HUD text, muted text, dot grid, selection keyline, warning colors, and canonical z layers.
- Use `.glass`, `.wframe`, `.dock-*`, `.rail-*`, `.org-*`, `.pop-*`, `.saved-*`, `.pal-*`, and `.selection-*` classes before inventing new chrome.
- Use `src/ui/primitives/MovingBorder.tsx` for selected/active organism or future instrument borders that need subtle motion. It is not a generic wrapper for every card or every cell.
- Sliders, switches, segmented chips, choice rows, metadata pills, micro cards, saved-view rows, palette rows, and canvas edit popovers should inherit the shared premium language.
- New widget/card/control CSS is acceptable only when it extends these primitives or covers a genuinely new interaction.
- Future stats/data widgets should use compact micro-card patterns, tabular numerals, and glass surfaces from the existing widget system.

## Resource Registry Foundation (V8.2B)

- `src/materials/materialRegistry.ts` owns canonical serializable material definitions; `builtInMaterials.ts` adapts the existing palette library into collections and `materialResolver.ts` preserves current colour output.
- Material targets cover space/core/boundary, organism/edge, void/edge, canvas/grid, line/relationship, text/background, and frame. Parameter metadata supports colour, numeric/range/angle/percentage, boolean, enum, gradient, and project-asset texture references.
- `src/grid/gridRegistry.ts` owns dotted, fine-line, technical, architectural, major-minor, isometric, radial, and none presets. Current `showGrid` remains the render switch through a legacy migration adapter.
- `src/annotations/annotationRegistry.ts` owns 18 truthful future annotation definitions. It does not claim canvas tools are live.
- `src/icons/iconRegistry.ts` owns small Lucide/local/uploaded metadata contracts only. Uploaded icons must use `asset:` references; raw/base64 assets are forbidden.
- `src/resources/resourceCatalogue.ts` is the read-only cross-resource discovery API for get/list/category/target/search/status and favourites/recent-ready ID normalization. Static registries must never become one giant mutable store.
- Future resource UI must consume these registries and reuse `WidgetFrame`, `WidgetHost`, shared controls, and the V8.2A context host rather than duplicating definitions or product state.

## V8.2C0 Shared Performance / Appearance Contracts

- `frameScheduler.ts` is the one raw-input to rAF boundary; renderers keep previews local and flush the final sample before one pointer-up commit.
- `groupDrag.ts` owns immutable preview projection plus the existing exact group-translation math; the store owns only final positions and one undo/redo transaction.
- `labelPresentation.ts` owns Screen/Adaptive/World scale and shared canvas/client projection used by labels, inline editing, and context anchors.
- `labelContrast.ts` adapts `getNucleusColor` output into deterministic Auto/Black/White/Custom text without framebuffer reads.
- `cellShadow.ts` normalizes the project appearance contract and quality fallback. Renderers consume it visually; geometry/hit tests never do.
- `widgetLifecycle.ts` makes focus-vs-mount explicit while `WidgetHost` retains stable keys and `WidgetFrame` retains session position/state.
- Existing `AnnotationWidget`, `DisplayWidget`, snapshot/import/export services, `.glass`, and semantic tokens are extended; no parallel panel, history, camera, colour resolver, or settings store exists.

## Widget System

### `WidgetHost`

- File: `src/ui/widgets/WidgetHost.tsx`
- Role: renders open widgets from `openWidgets` store state.
- Reuse: add new detailed control surfaces here through existing widget ids/patterns.
- Do not duplicate: separate floating panel frameworks.

### `WidgetFrame`

- File: `src/ui/widgets/WidgetFrame.tsx`
- Role: shared widget chrome: canonical icon + one-line title, semantic geometry,
  drag, minimize, close, focus, mobile sheet, and V7.0B front/back liquid-glass
  depth through `data-depth`.
- Reuse: all floating widgets should use this frame.
- Do not duplicate: custom draggable card shells, stacking managers, or opaque
  per-widget material.

### Widget Registry

- File: `src/ui/panels/widgetRegistry.ts`
- Role: canonical widget label, Lucide icon, launcher role, status, and semantic
  authored geometry. Rail, Instruments submenu, and WidgetFrame consume it.
- Reuse: add presentation metadata here; keep widget body rendering in
  `WidgetHost` and open/focus state in the existing store.
- Do not duplicate: icon maps, width maps, per-widget responsive managers, or
  separate geometry CSS.

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
- Role: pure derived metrics over store `spaces` (program area, counts, category mix, normalized privacy groups, valid leaders, deterministic data health).
- Reuse: every stats widget must consume these; add new metrics here first.
- Do not duplicate: metric math inside components, metric state in the store, hardcoded numbers.

### Stats Primitives

- Files: `src/ui/widgets/stats/primitives.tsx`, `src/ui/widgets/stats/stats.css`
- Role: `MetricReadout`, `MicroDistribution`, `InsightRow`, `RankedMetricRow`, `HealthSignal` + format helpers — the shared instrument language for the V7 family.
- Reuse: compose these primitives inside WidgetFrame; keep the `pulse-*` CSS family.
- Do not duplicate: per-widget readout/band/format variants or chart libraries.

### ProjectPulseWidget

- File: `src/ui/widgets/stats/ProjectPulseWidget.tsx`
- Role: V7 flagship — the normative reference for structure, tone, and data flow of all stats widgets.
- Spec: `docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md`.

### V7.1 Instrument Family

- Files: `CategoryMixWidget.tsx`, `PrivacyBalanceWidget.tsx`, `AreaLeadersWidget.tsx`, `DataHealthWidget.tsx`, `InstrumentLauncher.tsx` under `src/ui/widgets/stats/`.
- Role: four independent movable instruments opened from Project Pulse's compact Instruments popover.
- Ownership: Category Mix uses category tokens; Privacy Balance stays neutral; Area Leaders delegates to existing selection; Data Health delegates to existing table/view actions.
- Do not duplicate: rail launchers, widget manager state, camera focus, table filtering, compliance thresholds, or remediation state.

## Shell Components

### InlineCellEditor

- File: `src/canvas/InlineCellEditor.tsx`
- Role: the only canvas Name/Area edit surface for Organism and Classic; Enter/outside commits once, Escape cancels, Tab stays inside the form.
- Reuse: renderer views request `inline-editor` through the canonical context state; `ContextSurfaceHost` supplies the target space and screen-clamped anchor position.
- Do not duplicate: renderer-specific forms, save buttons, command menus, or edit state in the product store.

### ContextSurfaceHost

- Files: `src/ui/context/ContextSurfaceHost.tsx`, `src/ui/context/contextSurfaces.css`, `src/canvas/SelectedCellCommandMenu.tsx`.
- Role: one root owner for the blank dropdown, empty-centre object radial actions, shared inline editor, Escape/outside dismissal, select-all, and temporary pan-key state.
- Reuse: both renderers contribute only their native hit target and viewport point through `openContextSurface`; product commands delegate through `contextCommands.ts`.
- Layer: `--z-context` sits above shell/widgets and below tooltips/dialogs/toasts/loader. Do not add local z-index managers or mount contextual menus inside renderer label layers.
- Do not duplicate: renderer-local context menus, editor host state, radial command definitions, or new Palette/Import/View launch paths.

### Interaction Registries

- Files: `src/interaction/toolRegistry.ts`, `src/interaction/contextActionRegistry.ts`, `src/interaction/contextCommands.ts`, `src/interaction/selection.ts`, `src/interaction/radialLayout.ts`.
- Role: canonical tool metadata, context action metadata/availability, product command execution, selection invariants, and adaptive 6/7/8-node radial geometry.
- Reuse: future Tools page, material shelf, keyboard shortcut layer, and sub-rails consume these definitions rather than inventing labels/icons/actions.
- Do not duplicate: mutable `Set` selection state, command switch statements in UI components, or per-renderer shortcut/action registries.

### `Dock`

- File: `src/ui/Dock.tsx`
- Role: bottom quick actions only.
- Owns: renderer mode, quick style/attachment, density, add nucleus, add-5, void, quick palette/saved/random/import/export/system launchers.
- V7.0B material: no outer dock capsule; left/right are independent `.glass`
  islands and the plain-black Add/Add-5 circles float in the center.
- Do not add: large forms, inspectors, or full advanced controls.

### `Rail`

- File: `src/ui/Rail.tsx`
- Role: 42px icon-only launcher/navigation rail with accessible names and
  external shared-glass tooltips.
- Owns: canvas/table navigation and widget launch.
- Do not add: permanent section captions or duplicate full controls already
  owned by widgets/dock.

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

- Files: `src/state/store.ts`, `src/interaction/selection.ts`, `src/interaction/groupDrag.ts`, `src/canvas/OrganismCanvasView.tsx`, `src/canvas/CanvasView.tsx`, `src/canvas/renderer.ts`, `src/canvas/organismCanvas.css`.
- Role: central multi-selection contract, shared group translation, and renderer-native visual feedback. Organism labels render selected MovingBorders; Classic draws selected on-body keylines. The former orbit/arc and automatic metadata command surfaces remain removed.
- Reuse: hit testing and world conversion stay renderer-specific; `groupDrag.ts` captures original positions and provides one exact delta for both renderers. The store batches preview updates and owns one ephemeral undo/redo transform record; selection never feeds organism geometry.

## File Intake System (V7.3)

- `FileIntakeProvider`: application-root file drag-depth overlay and the only ephemeral queue (maximum five).
- `FileIntakeWidget`: one WidgetFrame body for project/config/table review, mapping, modes, diagnostics, and apply.
- `projectFiles.ts` / `tableImport.ts`: pure versioned validation and import planning; parsing never lives in components.
- `projectTransfer.ts`: automatic recovery snapshot, one atomic store mutation, full restore/Undo; extends V7.2 project snapshot rather than creating another project model.
- Do not duplicate: per-format upload widgets, parser state in the store, a second table model, a second saved-view system, or a second export launcher.
- V7.1B: editorial/technical labels are unbounded text; only Pill mode and the
  selected metadata/edit surfaces may use glass.

## Interface Scale / Readiness

- Files: `src/state/uiScale.ts`, `src/state/store.ts`, `src/App.tsx`,
  `src/ui/widgets/DisplayWidget.tsx`, `src/ui/Loader.tsx`.
- Role: one normalized `settings.uiScale`, saved-view migration/persistence,
  root `--ui-scale` application, and first-frame renderer readiness.
- V7.1C: DisplayWidget adds a continuous Interface Scale slider (82–118%, 1%
  step) beside the existing presets, reusing the `SliderRow` control primitive
  (`controls.tsx`) and `normalizeUiScale`. Presets and slider share one store
  value; no second scale state, no new slider component.
- V7.1D: DisplayWidget adds a second, visually identical Widget Scale section
  (same presets/slider/format) writing `settings.widgetScale` via the new
  `setWidgetScale` store action. `WidgetFrame.tsx` combines
  `uiScale * widgetScale` once for outer frame dimensions; `widgets.css` and a
  `.wframe-body`-scoped override block own internal widget-content density via
  the new `--widget-scale` root token — scoped so shell.css's shared control
  primitives (`.pop-chip`, `.org-slider`) stay untouched for their non-widget
  callers (Dock.tsx merge-distance chip/slider). No second widget manager, no
  duplicated slider CSS, no new package.
- Do not duplicate: local scale state, browser zoom, transformed canvas shells,
  countdown loaders, or renderer-specific overlay loaders.

## Export / Presentation Pack (V7.2)

- Files: `src/export/*`, `src/canvas/exportCapture.ts`, `src/ui/widgets/ExportWidget.tsx`.
- Role: `ExportWidget` owns run-local settings only (format/resolution/
  background/labels/selection/padding/page/orientation/title/metadata
  toggles — plain `useState`, never persisted to the store). `exportService.ts`
  is the single generation entry point for PNG/PDF/CSV/JSON/SVG/ZIP pack;
  format-specific logic (page fit, manifest, filenames) lives in its own pure
  module, never inline in the widget. `exportCapture.ts` is the one
  renderer-aware bridge — Classic re-renders the existing pure `drawScene`
  onto an offscreen canvas at any resolution; Organism captures the live
  WebGL canvas synchronously within the render tick it draws (required since
  the context uses `preserveDrawingBuffer:false`) plus the HTML label-layer
  overlay via `html-to-image`, composited by `canvasComposite.ts`.
- Reuse: `ChipRow`/`SwitchRow`/`WidgetSection` (`controls.tsx`), the existing
  Dock Export placeholder (now activated), `widgetRegistry.ts` ownership
  pattern, `sonner`'s `Toaster` (mounted for the first time in `App.tsx`,
  reusing the existing unused `components/ui/sonner.tsx` wrapper), PapaParse's
  `unparse` for CSV, the already-installed `pdf-lib`/`jszip`/`file-saver`/
  `html-to-image`.
- Do not duplicate: a second widget manager, a second slider/chip CSS
  language (new `.wexport-*` rules are additive, `.pop-chip`/`.org-slider`
  reused as-is), a second project-state schema (the JSON export mirrors
  `SavedCanvasSnapshot`'s field set instead of inventing one), or export
  option state in the global store.

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

## V8.2C0.1 Canvas runtime ownership

- `src/interaction/frameScheduler.ts`: shared demand loop plus existing coalesced pointer scheduler; no permanent idle rAF.
- `src/canvas/OrganismCanvasView.tsx`: normal WebGL renderer, one pointer/camera/label/capture owner, dependency-cached derived visual data, external selection keyline.
- `src/canvas/CanvasView.tsx`: automatic Classic fallback using the same demand-loop contract.
- `src/canvas/InlineCellEditor.tsx` + `src/ui/context/ContextSurfaceHost.tsx`: one editor and one event-isolation owner; commits through `commitSpaceEdit` into existing history.
- `src/export/exportService.ts`: active raster capture plus internal Classic vector adapter for SVG Cells/labels; no user renderer choice.
- Do not duplicate: camera, pointer owner, render loop, label projector, selection store, editor, Morph/Motion state, contrast resolver, history, or resource registry.
