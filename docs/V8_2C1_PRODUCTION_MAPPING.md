# V8.2C1 — Production Mapping

For every V2 prototype surface: probable production owner, what existing
production code to reuse/adapt, whether new production code is justified,
state persistence, z-layer, and risk. Written against the actual current
production tree (`src/`) as read from `docs/COMPONENT_INVENTORY.md` and
`docs/FEATURE_MAP.md` — not invented paths. **No prototype HTML/CSS/JS is
to be merged directly**, per `MOOORF_MASTER_PRODUCT_SCOPE.md` §36.

## GlobalDrawer

- **Owner:** new top-level shell component, e.g. `src/ui/ProjectDrawer.tsx`.
- **Reuse:** `src/ui/context/ContextSurfaceHost.tsx`'s pattern for one root
  owner of a transient overlay + Escape/outside-click convention; existing
  Zustand store for the project list is *not* built yet — this is new
  product data, not UI.
- **New component justified:** yes — nothing in the current shell owns a
  global cross-project surface.
- **State:** `settings.drawerOpen` (transient, excluded from saved views,
  matching the existing transient-state convention in
  `docs/DECISIONS.md` V8.2A).
- **z-layer:** new `--z-drawer-scrim` / `--z-drawer` tokens above
  `--z-shell`, below dialogs/toasts — extend `src/styles/tokens.css`'s
  existing z-index ladder rather than inventing a parallel one.
- **Performance:** must pause organism shader idle animation while open
  (`V8_2_PROJECT_DRAWER_ARCHITECTURE.md` §2.3) — hook into the existing
  render-loop pause mechanism used for widget drag, not a new one.
- **Accessibility:** needs a real focus trap (prototype gap, see
  `V8_2C1_ACCESSIBILITY_CONTRACT.md`).
- **Phase target:** Phase 5 in `MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md` §11.

## TopProjectCluster / TopFloorCluster / HistoryCluster

- **Owner:** `src/ui/shell/TopClusters.tsx` (new file) composing existing
  data: project name/save-state is new (no project metadata store yet);
  floor cluster needs the not-yet-built floor system (`V9 floor system` is
  listed as a deferred feature in `docs/PROJECT_MEMORY_INDEX.md`); History
  cluster reuses the store's existing undo/redo stack (`state/store.ts`)
  directly — no new state.
- **Reuse:** `src/ui/controlMeta.ts` label pattern for shared button
  metadata across cluster and any future command palette entry.
- **New component justified:** yes for layout; no new *state* for History.
- **Risk:** Floor cluster is blocked on the floor system existing at all —
  do not build the floor UI before the floor data model.

## QuickView

- **Owner:** extends the existing `src/ui/Dock.tsx`/rail pattern conceptually
  but is a new top cluster, not a dock addition.
- **Reuse:** `settings.showGrid`, `settings.organism.cameraAwareMorph`-style
  existing boolean settings for Grid/Morph/Motion toggles — these settings
  paths already exist in `state/store.ts`; QuickView is a new *view* onto
  them, not new state. Labels visibility likely maps to existing
  `annotationMode`/`selectionDisplay` settings.
- **Risk:** low — mostly a new read/write UI over settings that already
  exist.

## DownloadCenter / ExportBuilder / NotificationStack

- **Owner:** extends `src/ui/widgets/ExportWidget.tsx` (V7.2, already
  production) rather than replacing it — the widget currently owns
  run-local export settings (`useState`, per `COMPONENT_INVENTORY.md`
  V7.2 entry); DownloadCenter/NotificationStack are new *queue* UI around
  the same `exportService.ts` entry points.
- **Reuse:** `exportService.ts`, `canvasComposite.ts`, `exportCapture.ts`
  unchanged — this mapping only adds a queue/notification layer in front of
  already-working generation code. `jszip`/`file-saver`/`pdf-lib` stay
  dynamically imported exactly as V7.2 established.
- **New component justified:** yes for the queue/notification UI (does not
  exist yet — V7.2 is synchronous/one-shot); the underlying generation
  path is reused, not rebuilt.
- **Performance:** must move heavy work to a Web Worker per
  `V8_2_EXPORT_QUEUE_READINESS.md` §2 — current V7.2 `exportService.ts`
  runs on the main thread; this is real new engineering, not just UI.
- **Phase target:** Phase 11 (`MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md` §11).

## WorkspaceRail / ContextSubrail

- **Owner:** replaces `src/ui/Rail.tsx` (currently a 42px icon-only
  launcher with no subrail concept).
- **Reuse:** `Rail.tsx`'s existing 42px width, accessible-name/tooltip
  convention, and launcher click pattern; `contextActionRegistry.ts`-style
  registry approach for subrail item metadata (label/icon/shortcut/action)
  rather than the prototype's inline object literals.
- **New component justified:** yes — subrail is entirely new; Rail itself
  is adapted, not replaced wholesale (its 42px icon language survives).
- **Risk:** medium — the current Rail owns "canvas/table navigation and
  widget launch" per `COMPONENT_INVENTORY.md`; the new three-workspace
  switcher must not create a second, competing `viewMode` concept — reuse
  the existing `ViewToggle.tsx`/`setView` store action, extended to a third
  `dashboard` value, not a parallel switch.

## BottomLeftDock / AddSpaceControl / BottomRightDock / CommonContextRail

- **Owner:** replaces `src/ui/Dock.tsx`.
- **Reuse:** `Dock.tsx`'s existing `addSpace`/`addSpaces(5)` actions
  verbatim (`V6H.4B` decision — "creates normal store-owned `SpaceCell`
  records... does not use demo data"); `toolRegistry.ts` (V8.2A) already
  owns tool metadata and is the correct source for dock tool
  labels/icons/shortcuts instead of the prototype's inline arrays.
- **New component justified:** yes for the dual-dock split and common
  rail — current Dock is one unified bar; `contextActionRegistry.ts` +
  `contextCommands.ts` (V8.2A) are the right existing registries to drive
  common-rail content per selection, replacing this prototype's
  `renderCrContent()` switch statement.
- **Risk:** high per the existing Dock's own risk note in
  `COMPONENT_INVENTORY.md` ("high for layout/mobile regressions") — this
  is the highest-blast-radius surface in the whole mapping.

## MaterialRail / MaterialBrowser

- **Owner:** new, but must consume `src/resources/resourceCatalogue.ts`
  and `src/materials/materialRegistry.ts` (V8.2B, already production) —
  **do not** invent a second material list. The prototype's `M` array is a
  design-lab stand-in only.
- **Reuse:** `materialResolver.ts` for actual render output;
  `resourceCatalogue.ts`'s favourites/recent-ID normalization API instead
  of the prototype's plain `Set`.
- **New component justified:** yes for the vertical-rail and half-screen-
  browser UI; the underlying data layer already exists and is explicitly
  waiting on "Claude prototype review" per `docs/HANDOFF.md`'s V8.2B entry
  — this prototype *is* that review.
- **Risk:** medium — must not duplicate palette arrays already adapted into
  material collections (`builtInMaterials.ts`).

## Inspector

- **Owner:** new `src/ui/Inspector.tsx`, but must reuse
  `src/ui/widgets/controls.tsx`'s `SliderRow`/`SwitchRow`/`WidgetSection`/
  `ChipRow`/`ChoiceRow` primitives instead of the prototype's bespoke
  `.insp-row2` markup — this is the single biggest Ponytail violation risk
  in the whole prototype if implemented literally; the *visual* language
  (Essentials/Appearance/Behaviour/Data/Advanced) is the deliverable, the
  *control* implementation should not reinvent what `controls.tsx` already
  provides.
- **State:** writes through existing store actions (`updateSpace`, etc.),
  never local component state for product data.

## CompactTableWidget

- **Owner:** new `WidgetFrame`-hosted widget (`src/ui/widgets/
  CompactTableWidget.tsx`), reusing `WidgetFrame`/`WidgetHost` exactly as
  every other floating widget does — the prototype's custom drag
  implementation (`buildCompactTable()`'s manual pointer math) must **not**
  ship; `WidgetFrame` already owns drag/minimize/focus/z-order.
- **Risk:** low once routed through `WidgetFrame` — the only real
  complexity is the three-mode toggle, which is local UI state.

## CanvasWorkspace / DataWorkspace / DashboardWorkspace

- **Owner:** `CanvasWorkspace` = existing `OrganismCanvasView.tsx`/
  `CanvasView.tsx`, unchanged. `DataWorkspace` = new, but the Space
  Schedule table must reuse `TableView.tsx`'s existing store-backed pattern
  (`updateSpace`/`addSpace`/`removeSpace`) rather than the prototype's
  direct-array mutation. `DashboardWorkspace` = new, but every metric shown
  must come from `src/domain/stats/selectors.ts` (already the single
  metric owner per `COMPONENT_INVENTORY.md`) — the prototype's inline
  `totalArea()`/category-mix math is a stand-in for those selectors, not a
  second implementation to carry forward.
- **Risk:** high for Data/Dashboard specifically because both are brand new
  full-workspace surfaces; Canvas risk is low since it reuses production
  renderers unchanged.

## TemplateGallery

- **Owner:** new; no production template system exists yet (Templates is
  listed as `V8.2C` not-started work).
- **New component justified:** yes, entirely new feature.
- **Risk:** low for UI, high for the eventual template *data* model
  (out of this phase's scope).

## Cross-cutting notes

- **Every new component must go through `WidgetFrame`/`WidgetHost` where
  it is a movable/floating surface** (Inspector when unpinned, Material
  Browser, Export Builder, compact table) — per the Component Inventory's
  "Ponytail First" rule, this is non-negotiable, not a suggestion.
- **No second selection/tool/context state.** The prototype's `S.selected`/
  `S.activeDock`/`S.railContext` are design-lab stand-ins for the already-
  production `selectedIds`/`activeTool`/`contextSurface` (V8.2A). Production
  implementation must bind to those, not reintroduce parallel state.
- **Merge-conflict risk:** highest on `Dock.tsx`/`Rail.tsx`/`store.ts`
  since Codex's parallel `feature/v8-2c0-canvas-performance-reset` branch
  is actively touching Canvas performance/contrast/shadow in the same
  timeframe — coordinate before either lands.
