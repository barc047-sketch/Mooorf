# Decisions

## V8.2C0 canvas performance, contrast, and glass ownership

- Raw pointer and wheel events are coalesced by one renderer-local rAF scheduler. Drag previews derive from original positions without Zustand writes; pointer-up flushes the last sample and creates one transform history entry. Camera persists only after pan/zoom gestures.
- Screen/Adaptive/World label scale and canvas/client projection are pure shared contracts. Live Screen is the new default; legacy Classic maps to World and legacy Organism maps to Screen when the setting is absent.
- `getNucleusColor` remains fill authority. A pure label resolver applies the documented 0.36 relative-luminance threshold, explicit modes, Morph/sample hooks, and deterministic theme fallback; selection never changes text contrast.
- Cell Shadow is project appearance only, defaults off, persists as a normalized object, is disabled in Fast quality, and never affects area, radius, hit testing, selection, materials, relationships, Morph strength, or history. Classic draws a 2D visual layer; Organism keeps one shader draw.
- Existing `blobOn` is the Morph-enabled contract. Existing zeroed Organism drift/breathing/wobble values are Motion-off. New projects start plain; legacy projects retain known renderer behavior through migration.
- Stable glass is present at mount, retains both backdrop-filter prefixes, never animates blur, and uses borders/keylines instead of UI box/drop shadows. Stable widget keys preserve internal state/position; refocus changes only stack order.
- Object radials use the rendered/projected cell centre as semantic origin. Near edges, radius/orientation adapt and only action leaves clamp.
- Future shell, drawer, resource browsers, workspaces, export queue, background references, touch layouts, and high-density renderer remain deferred.

- Use Palmer as interaction/style reference, not brand clone.
- Build separate canvas lab, not V1 repo.
- First-class loading intro is required.
- Day mode uses cream/ink editorial style.
- Night mode uses Graph Noir Red.
- Motion must feel premium and restrained.
- Table and canvas use same central store.
- Organism blob remains under cells.
- No backend/auth/cloud/payment in lab.

## V8.2B expandable resource foundation

- Resource definitions are immutable serializable registries split by domain (`materials`, `grid`, `annotations`, `icons`). The aggregate catalogue is read-only discovery, not a mixed mutable state store.
- Persistent state is one nested `settings.resources` contract containing schema version, material binding IDs/sparse normalized overrides, grid settings, and future annotation/icon references. Registry definitions, palette arrays, functions, React nodes, renderer objects, binary data, Blob URLs, external URLs, and arbitrary shader source are never saved.
- Existing palettes are adapted, not replaced. Every nucleus/organism palette becomes a built-in material collection; `getNucleusColor` remains the current render authority so Category/Privacy modes, explicit colour precedence, deterministic uncategorized variation, void semantics, and V8.1 geometry remain unchanged.
- Material definitions declare compatible targets, renderer support, performance tier, licence/attribution, and an explicit export fallback. Manifest metadata may record active material IDs, active grid preset, and resource schema version without changing Classic SVG or Organism raster capture.
- The nested resource schema is version 1 inside existing project/config schema version 1. Missing fields migrate from `nucleusPaletteId`, `organismPaletteId`, and `showGrid`; future resource versions reject truthfully. A project major-version bump is unnecessary.
- Isometric/radial grids and all annotation creation tools remain metadata/future. Material Browser, circular shelf, Icon Library, Annotation Studio, Grid Shelf, Tools page, placement/rendering, and visual styling wait for Claude prototype review.

## Setup decisions (Prompt 01)
- **React upgraded 18 → 19.** `@pixi/react@8` peer-requires React ≥19; greenfield lab, no legacy constraint. All UI libs (motion/vaul/cmdk/floating-ui) support 19.
- **Full core stack installed now** (Prompt 01 directive), not deferred per-phase. 43 runtime + 16 dev deps.
- **No three/ogl/lenis/animejs/react-spring** — Prompt 01 says Canvas/Pixi + GSAP + Motion is enough. Blueprint's heavier list intentionally ignored.
- **Tailwind v4 + shadcn** via `@tailwindcss/vite`. This shadcn registry uses **Base UI** (`@base-ui/*`), not Radix. Editorial token system in `src/styles/tokens.css` is kept; shadcn vars live in `src/index.css`. Reconcile the two visual systems during UI phases (shadcn's `@apply bg-background/text-foreground` on body may need overriding by tokens).
- **fetch MCP omitted** — no npm package; canonical server is Python (`uvx mcp-server-fetch`) and `uv` isn't installed. Native WebFetch/WebSearch cover it.
- Path alias `@/*` → `src/*` (tsconfig + vite).

## Model / effort strategy
- Setup, audit, and review can use Opus 4.8.
- Normal execution should use Fable 5 at high effort.
- Do not use Ultracode/xhigh for simple setup, table sync, shell work, docs, or small UI fixes.
- Reserve Ultracode/xhigh only for: organism/blob renderer, difficult canvas performance work, final animation polish, complex visual bug fixing. Reason: Ultracode/xhigh burns usage faster — use only when the visual/canvas difficulty justifies it.

## Asset/library-first rule
For UI and animation, use approved component/resource libraries first: shadcn/ui, Radix UI, Skiper UI, Cult UI, Watermelon UI, Magic UI, Aceternity UI, React Bits, 21st.dev Magic, Lucide, Sonner, Motion, GSAP.
Custom design/code is allowed only when: the component is unique to the ZONUERT canvas, a library component cannot solve it cleanly, or it affects renderer/blob/graph-sync/camera/drag/import-export.
Do not copy Palmer branding or copyrighted assets — Palmer is interaction/style reference only.

## V4.5A visual/resource system (docs only)
- Visual target reaffirmed and expanded: Palmer editorial canvas + Rayon-style CAD toolbar/inspector usability + Superpower-style soft glass metric widgets + dark-scan dotted-grid/orbit-selection interaction pattern + Graph Noir Red identity.
- Full spec split across 10 docs (see docs/V4_5_RESOURCE_LINKS.md index in RESOURCE_INDEX.md) — CAD toolbar groups, component-library rules, glass/shader tokens, floating widget system, interaction shortcuts, canvas grid/scale, selection arc, metric text animation, resource links.
- No UI built this phase — spec/registry only, to prevent random UI drift before V4.5B (graph/floor/import) lands.
- Selection arc: custom SVG allowed if smaller than a circular-slider dependency; otherwise library-first per Ponytail rule.

## V4.5B master graph (architecture)
- **Dual-model transition, not a rewrite:** new `src/domain/graph/` layer (ZonuertProject + selectors + adapters) added alongside the working `SpaceCell` store. Existing canvas/store untouched in V4.5B; V5 migrates the store to the graph with `SpaceCell` as a render projection (path in CENTRAL_GRAPH_SCHEMA.md).
- Stats are selector-computed only; `meta.far`/`ground_coverage`/`total_built_up_area` are explicit targets/caches, never actuals.
- Counting rules: locked + hidden spaces count in all stats; built-up excludes OUT; divide-by-zero → 0.
- Legacy `Privacy` maps P0/P1→public, P2→shared, P3–P5→private (adapters.ts).

## Phase 5 table sync
- Table edits legacy `SpaceCell` directly (categories stay free strings, privacy public/shared/private) — no graph-code migration in V5, per readiness audit recommendation. Graph adapters remain ready.
- TanStack Table skipped for V5: plain row-map over shadcn Table primitives is smaller/simpler at ≤50 cells with no sorting/filtering. Adopt TanStack only when sort/filter/virtualization is actually needed.
- Area edits use a local string draft committing only valid parses (clamp ≥ 1 m²) — keeps the store numeric-safe while allowing the field to be cleared mid-typing.

## Visual direction (reaffirmed)
Final visual target: Palmer editorial object canvas + iOS glassmorphism controls + Graph Noir Red architecture tool + premium animated agency-level interface.
Must preserve: Palmer-style warm cream day canvas, Graph Noir Red night mode, top-center Canvas/Table pill, bottom glass dock, left vertical rail, bottom-right zoom controls, red corner loader countdown, ~30% colorful gradient loader, scattered editorial circular cells, premium restrained typography. Must avoid: generic SaaS UI, random neon, childish animation, pipe bridges, red halo spam.

## V6F.0B production canvas UI architecture
- Production UI is organized into replaceable zones: left rail for modes/tools, bottom dock for primary creation and organism controls, right inspector for selected nucleus properties, floating widgets for selector-backed metrics, and hidden advanced/lab panels for renderer tuning.
- The bottom dock's center action becomes a high-emphasis `+ NUCLEUS` button. It creates store-owned `SpaceCell` data, never renderer-only nuclei.
- Organism style and palette are separate systems: style controls rendering behavior; palette controls color language, highlights, warnings, and future category influence.
- Advanced Organism Lab controls are preserved conceptually but hidden from production MVP. Debug views stay debug-only.
- Palette metadata should eventually live in `src/design/palettes.ts`; CSS tokens remain the implementation surface. No package installs are needed for V6F.0B.

## V6F.0C reference folder
- Production canvas UI references live at `assets/references/01` and are mood/structure references only.

## V6F.0D GitHub-only workflow
- GitHub is the source of truth for code.
- Do not use Google Drive as the code workflow source of truth right now.
- Codex is responsible for code editing, implementation, and checks.
- ChatGPT is responsible for planning, prompts, audits, and product decisions.
- Claude is reserved for design-heavy coding when needed.
- No remote, commit, or push should happen without explicit instruction.

## V6F.1 production organism canvas
- Production canvas now defaults to the WebGL organism renderer.
- Classic `CanvasView` remains as a first-class fallback via the dock renderer toggle.
- The V6E Organism Lab route remains preserved for advanced/debug exploration.
- Zustand `SpaceCell` remains the runtime product-data source of truth; the organism renderer receives adapted nuclei only.
- TableView remains unchanged and continues to sync through the same store.

## V6H production dock UI
- Production dock controls are grouped left/center/right: renderer/style/attachment/reach, high-emphasis `+ NUCLEUS`, and palette/demo/import/export.
- `settings.paletteMode` is a UI-ready setting only; category color mapping and renderer palette behavior remain deferred to V6I or a later explicit palette phase.

## V6H.1 full organism control surface
- Organism Lab parameters enter production as one typed `settings.organism` object plus a resolver (`organismProductionSettings.ts`); the renderer never reads raw lab defaults directly.
- Reach (`settings.mergeDistance`) stays the simplified control and acts as a bounded trim around the advanced `connectionBias`/`edgeSoftness` values — the two control layers never stomp each other.
- Production nucleus count is data-owned (`spaces.length`, display-only). Lab count/radius generation semantics were deliberately not imported; radius min/max act as field-unit clamps and size variation is a deterministic per-id multiplier.
- Offsets (global/X/Y/radial/angular) are a visual layout transform about the space centroid; they never write space x/y. Drag inverts the transform delta-wise (same contract as the lab's `dragNucleusBy`).
- Motion defaults ship off so first load matches the stable V6G/V6H canvas; enabling motion switches the render loop from dirty-gated to continuous only while active.
- One floating control surface serves rail and dock launchers (store-held `orgPanelOpen`/`orgPanelFocus` with section focus); style/palette quick-switchers stay in the dock popovers.
- `AttachMode` gained `extreme`; classic blob fallback carries safe extreme entries under its existing 0.32 gap cap.

## V6H.2 command architecture cleanup
- Command ownership is split as: left rail = navigation/widget launchers, bottom dock = quick creation/mode controls, widget panel = detailed settings, canvas = direct editing.
- Full duplicate setting ownership is avoided. Renderer switching is dock-owned; rail opens panels. Palette/style quick changes can remain in the dock while detail controls live in the widget panel.
- Annotation and selection display are UI settings, not product data: `annotationMode` defaults to `editorial`, and `selectionDisplay` defaults to `tight`.
- The large red selection circle is preserved as `selectionDisplay: "influence"` for future measurement/influence mode, not normal selection.
- Palette prep is metadata-only in `src/design/palettes.ts`; no category color mapping or organism shader palette mapping is active yet.
- Saved views are prepared as a typed snapshot concept only; no runtime save/load feature was started.

## V6H.3 premium UI implementation
- Dock side-group expand/collapse uses a CSS mount animation instead of a nested Motion `AnimatePresence` wrapper: nesting added risk around the popovers' own presence animations and the preview harness's hidden-tab rAF freeze; conditional render + CSS keeps collapse instant and popover lifecycles independent.
- The Motion section master switch is stateless sugar over existing settings: on applies a gentle preset (drift 0.28 / breathing 0.30 / wobble 0.12, timeScale ≥ 1), off zeroes the three amounts only. No new store fields.
- A pockets master toggle is deferred: pockets have no non-destructive off state in the field model (threshold/softness always contribute); a future phase can add an explicit amount override if needed.
- Palette UI renders `src/design/palettes.ts` metadata visually (shade ramps, field strips, gradient previews) but stays presentation-only; renderer/category mapping remains V6I.
- Editorial annotation stays boxless even when selected — selection is communicated by red type + the tight ring, keeping the Palmer editorial read.

## V6H.4 layout presets
- Production layout presets are position-only transforms over existing `SpaceCell` records. They update `x/y` and store the active `settings.layoutPreset`, but they never generate a new program, delete spaces, rewrite table-owned fields, reset the camera, or alter classic fallback/lab route behavior.
- Dedicated Void layout remains disabled/future even after V6L because it is a layout language decision; normal presets preserve void records by spreading existing `SpaceCell` data and only changing `x/y`.

## V6H.4B quick creation and random layout
- Random layout is the only intentionally non-deterministic layout option. It remains a position-only transform: `x/y` changes, while ids, names, areas, categories, privacy, colors, table data, and camera are preserved.
- The five-dot cluster button creates normal store-owned `SpaceCell` records via `addSpaces(5)` near the current camera center. It does not use demo data and does not create renderer-only nuclei.

## V6I palette and program color mapping
- Category/privacy/area colors are derived at render time by `src/design/colorMapping.ts`; they do not mutate `SpaceCell.color` or product data.
- V6I maps per-space colors into labels, rings, table swatches, and the classic fallback, while the WebGL organism shader remains global body/ground color only.
- Per-nucleus shader gradients and multi-color organism fields are deferred to V6K or a later explicit shader phase.

## V6J saved views
- Saved views are architecture design iterations, not browser bookmarks. They snapshot store-owned canvas state: spaces, camera, theme, renderer mode, palette, layout, annotation, organism settings, morph style, attachment, reach, blob, and selection display.
- Saved views persist locally under `mooorf.savedViews.v1` with a 20-snapshot cap. Loading a snapshot replaces canvas state safely, clears selection, and restamps `born` values for smooth organism pop-in.
- Saved views are intentionally local-only for now. Cloud sharing, export, backend storage, and project-file serialization remain deferred.

## V6K premium visual system + control migration
- Detailed controls live in floating widgets, not popovers or a single mega-panel. `openWidgets: WidgetId[]` is UI state in the store; array order is stacking order. Widget drag offsets/minimize are component/session state only — never product data.
- Widget drag uses the CSS `translate` property so Motion's mount `transform` animation and pointer dragging never fight over one property.
- Widget frames are near-opaque (bg 86% + surface sheen): stacked widgets must not ghost through each other; translucency stays reserved for the dock/rail glass over the canvas.
- The nucleus palette family is a *tint* over the category mapping (58% toward the ramp shade at privacy+area depth), not a replacement — category hue identity survives every family.
- V6K organism palettes originally used body/ground uniforms only. V6L enables gradient/category/dual-layer palette rows through restrained body A/body B/accent shader uniforms, while true per-nucleus color textures remain deferred.
- `nucleusPaletteId`/`organismPaletteId`/`annotationDetail`/`showGrid` were added to `SavedCanvasSnapshot` as optional fields so pre-V6K snapshots keep validating and loading.
- `OrganismControlPanel.tsx` was deleted; dock/widget-shared labels live in `src/ui/controlMeta.ts` so quick switches and detail widgets cannot drift apart.

## V6L multi-color shader and void nuclei
- `SpaceCell.kind?: "space" | "void"` is optional for backward compatibility; missing kind always behaves as normal additive space data.
- Void nuclei are store-owned program rows, not renderer-only effects. They can be dragged, edited in the table, saved/loaded, and preserved through layout/random operations.
- Production void behavior uses negative signed strength in the existing uniform-packed field, with shader contribution clamps for stability.
- The current render cap is 96 nuclei because the shader still uses uniform arrays. Store/project data is not capped; a future high-density path should use texture/data-buffer nuclei input.
- V6L prepares layer naming (`outer-membrane`, `nucleus-body`, `inner-core`, `void`, `influence-ring`) but does not add dual-layer editing controls.

## V6M Codex workflow OS
- GitHub remains the source of truth; every phase starts with `git status --short`, `git pull --ff-only`, recent log, and diff stat.
- Future Codex prompts should reference `docs/PROJECT_MEMORY_INDEX.md` and `docs/FEATURE_MAP.md` instead of restating full project history.
- `docs/CODEX_PHASE_PROTOCOL.md` is the active Codex operating protocol for sync/read/edit/build/commit/final-report flow.
- `.claude/launch.json` remains local/unrelated and must not be staged unless explicitly requested.
- `npm run repo:health` is a local read-only helper for branch, latest commit, dirty files, scripts, and warning notes; it is not a substitute for build or QA.

## V6.5 selection arc and canvas editing
- Direct canvas editing extends the existing organism label overlay instead of adding a parallel inspector or second overlay system.
- Product data writes still go through the central Zustand store via `updateSpace`; inline rename/area drafts are temporary UI state only.
- Hidden annotation mode suppresses ordinary labels but keeps the selected arc/edit affordance reachable, because canvas editing belongs to the selected object.
- Classic canvas remains a fallback surface; the premium arc is organism-overlay behavior and does not require rewriting the 2D fallback renderer.

## V6N editorial glass refinement
- UI chrome moved from red identity accents to neutral smoke/ink/stone glass. `--zonuert-red` remains for product palette material, not rail/dock/widget/selection chrome.
- Label text shadow is an annotation detail setting (`annotationDetail.textShadow`) so it persists through saved views without adding a parallel label system.
- Camera-aware morph is an organism setting (`organism.cameraAwareMorph`) so the renderer can preserve or decouple radius response from camera zoom through the existing adapter path.
- Selection arc/edit polish stays inside the existing organism label overlay; no duplicate inspector, overlay framework, or second state system was added.

## V6N.1 reference-locked premium design system
- Attached premium UI references are visual grammar only. They set standards for dark scientific HUDs, frosted dashboard cards, spatial glass, cinematic overlays, and precise measurement arcs; no layouts, brands, medical content, or proprietary assets are copied.
- The canonical visual lock is `docs/V6N_REFERENCE_STYLE_LOCK.md`. Future UI must reuse `WidgetFrame`, `WidgetHost`, shared widget controls, existing dock/rail/canvas ownership, and shared glass/chrome tokens before adding new primitives.
- Shared tokens now include glass dark/light, border, inner highlight, blur, shadow, floating-card radius, pill radius, HUD text, muted text, dot-grid, selection-arc neutral, and warning-data colors. Warning yellow/acid is semantic data warning only, never brand chrome.

## V6N.2 reference-applied UI polish
- The V6.5 radial selection command menu (`src/canvas/SelectedCellCommandMenu.tsx`) is the single selected-cell command surface. It extends the existing label-overlay selection system and writes only through existing store actions (`updateSpace`, `addSpace`, `removeSpace`, `setCamera`); no parallel inspector or context-menu framework was added.
- The technical grid is a dot matrix (single radial-gradient background), not crossing lines. It stays camera-synced through the existing `syncGrid` background-size/position path; dot-grid tokens carry per-theme intensity.
- Selection affordances animate with CSS-only keyframes (arc sweep-in, chip slide, radial button bloom) so the render loop and Motion mount animations are untouched; all honor `prefers-reduced-motion`.
- Control chrome converges on two visual verbs: ink-gradient for active/confirm, hollow/dashed for subtractive (void button, void arc, delete command). No red chrome anywhere.

## V6N.3 premium primitives
- A local `MovingBorder` primitive was added because no existing project or installed component covered the selected-cell moving border without importing demo-heavy chrome. It is CSS-driven, neutral/palette-aware, reduced-motion safe, and reusable.
- MovingBorder is reserved for selected/active/editing emphasis. It should not wrap every cell, widget, card, palette row, or saved-view tile by default.
- The selected-cell moving border extends the existing organism label overlay and render-loop label sync. No parallel overlay, control surface, or store state was added.

## V7.0 spatial intelligence
- Live stats derive from the store-owned `SpaceCell[]` through pure selectors in `src/domain/stats/selectors.ts` — the Zustand array is the runtime master graph. Converting spaces to a `ZonuertProject` per render was rejected as heavier and lossy (no runtime floors/relationships); instead selector names/shapes mirror `src/domain/graph/selectors.ts` so the V9 graph migration swaps the data source, not the widgets.
- Metric ownership is exclusive: widgets never hold metric state, never compute in components, and never hardcode production numbers. All family widgets consume selectors via `useMemo` on the `spaces` reference, which makes table/canvas edits and saved-view loads update automatically.
- Voids are counted separately and excluded from programmed area. Non-finite/non-positive areas read 0 m² and surface through `missingAreaCount`; unknown categories fall back through `getCategoryToken`.
- Stats data colors come only from `CATEGORY_TOKENS` (category data) or neutral instrument tones (`--chrome-accent` / ink mixes for balance bands); `--warning-data` is reserved for true Data Health warnings. No red chrome, no chart packages.
- The stats family shares local presentation primitives (`src/ui/widgets/stats/primitives.tsx`) inside the existing `WidgetFrame`/`WidgetHost` system — no second widget framework, no dashboard page. The canonical family spec is `docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md`.

## V7.0B liquid glass shell correction
- Widget focus depth stays derived from the existing `openWidgets` order.
  `WidgetHost` passes one `focused` boolean and `WidgetFrame` exposes
  `data-depth="front|back"`; no parallel z-index or focus state is introduced.
- Shared glass is intentionally translucent (day front/back 0.58/0.36; dark
  theme equivalents 0.56/0.34) with 32px backdrop blur, WebKit support, and a
  stronger fallback only when backdrop filtering is unsupported.
- The dock container is layout-only and visually transparent. Left/right
  functional groups reuse `.glass` as independent islands; the center remains
  open canvas.
- Add and Add-5 are plain near-black/white actions. MovingBorder remains limited
  to selected/edit-active cells.
- The rail is permanently icon-only at 42px. Group names remain ARIA labels;
  buttons use accessible names and token-driven external glass tooltips.
- This is a presentation-layer correction only: no store, selector, shader,
  table, saved-view, graph, or Project Pulse metric ownership changed.

## V7.1 spatial intelligence widget family
- Project Pulse remains the sole Stats rail destination. A compact header popover opens four independent WidgetFrames through the existing `openWidget`/`openWidgets` lifecycle; no additional rail icons or manager state.
- `selectCategoryMix`, `selectPrivacyBalance`, `selectAreaLeaders`, and `selectDataHealth` are pure over `readonly SpaceCell[]`. Widgets subscribe to the stable `spaces` reference and derive with `useMemo` to avoid unstable Zustand snapshots.
- Additive spaces alone contribute to program totals. Voids are counted separately; invalid numeric areas contribute zero and produce blocking health evidence.
- Data Health classifications are deterministic only: numeric unreliability blocks, incomplete metadata attends. Relationship, floor, bylaw, and design-quality judgments remain deferred until real data/contracts exist.
- Area Leaders reuses `select`; Data Health reuses `select` + `setView("table")`. No camera focus, table filter, remediation state, dependencies, dashboard, or duplicate editing flow was added.

## V7.1B adaptive interface architecture
- `src/ui/panels/widgetRegistry.ts` is the presentation metadata owner for every
  widget: label, canonical Lucide icon, launcher role, and semantic authored
  geometry. `WidgetHost` keeps body rendering and stack ownership; no manager or
  icon store was added.
- Geometry is authored, not user-resizable. Mobile always uses the existing
  WidgetFrame sheet override.
- `settings.uiScale` is the sole interface-scale value. It is normalized by
  `src/state/uiScale.ts`, applied through root tokens/authored frame dimensions,
  persisted in `SavedCanvasSnapshot`, and defaults missing legacy values to 1.0.
  Canvas world coordinates, camera, area/radius logic, and shader inputs do not
  consume it.
- Loader completion is actual renderer readiness: first successful WebGL paint
  or first Classic paint after fallback. The existing loader owns the editorial
  transition; a short minimum prevents flash and a safety exit prevents lockout.
- Normal editorial/technical labels are unbounded text. The old bounding-box
  preference is honored only inside explicit Pill mode; selected metadata and
  edit surfaces keep their intentionally small glass.

## V7.1C continuous interface scale
- The Interface Scale control keeps the Compact/Standard/Comfortable presets and
  adds a continuous slider (82–118%, 1% step) in `DisplayWidget`. Both write the
  single canonical `settings.uiScale`; there is no second scale state.
- The slider reuses the existing `SliderRow` primitive (`controls.tsx`, extended
  only with an optional `aria-valuetext`) and clamps/rounds through the existing
  `normalizeUiScale`. Custom values persist unrounded to presets and restore
  exactly from saved views; a value that matches no preset shows no active chip
  and a subtle "Custom" header state.
- Mobile behavior is unchanged: rendered scale clamps to 100% at ≤640px while the
  stored preference, the `--ui-scale-user` token, and the slider readout keep the
  user's value. No browser zoom, no transform-based canvas scaling.

## V7.1D independent widget scale
- `settings.widgetScale` is a second canonical scale value, sharing
  `src/state/uiScale.ts`'s bounds/presets/normalization contract with
  `settings.uiScale` (identical 0.82–1.18 range and 88/100/112% presets, so one
  generic normalizer serves both — `normalizeUiScale`/`normalizeWidgetScale`
  and `getUiScalePreset`/`getWidgetScalePreset` are thin aliases over the same
  internal function). Changing one never mutates the other; both persist
  independently in `SavedCanvasSnapshot` and migrate missing values to 1.0.
- Ownership split, so each value is applied exactly once and never multiplied
  into the other twice: **outer widget-frame footprint** (width/minWidth/
  minHeight/max-height, minimized-chip width) reflects `uiScale * widgetScale`
  combined once in `WidgetFrame.tsx`/`widgets.css`. **Internal widget content**
  (header height/icon/title, section headers, sliders, chips, body padding) is
  Widget-Scale-owned only, via the new `--widget-scale` root token consumed by
  `widgets.css` and a `.wframe-body`-scoped override block. Rail, dock, canvas
  controls, and tooltips outside widgets read only `--ui-scale` and never
  `--widget-scale`. Where a shared shell.css primitive (`.pop-chip`,
  `.org-slider`) is also used outside widgets (Dock.tsx merge-distance
  control), the Widget Scale override is scoped under `.wframe-body` with
  matching or higher specificity so the non-widget instance is unaffected.
- Widget geometry stays authored: scaling multiplies each widget's own base
  width/height, so relative proportions (flagship vs. wide vs. tall) and
  `data-geometry`/`data-aspect` are preserved at every combination of the two
  scales — no widget is ever flattened to a uniform size.
- `WidgetFrame` reuses its existing drag-clamp formula (`dragBounds`, factored
  out of `onHeadMove`) in a new effect keyed on the combined scale: if a
  scale-driven size change pushes a dragged widget's position outside the same
  reachability bounds drag already enforces, it nudges the offset back in
  (animated); it never resets position and is a no-op when the widget is
  already reachable. No mobile clamp was added for Widget Scale — desktop/
  tablet is the V7.1D target and authored widget widths never approach
  768–834px viewport widths even at 118%.

## V7.3 file intake and canvas interaction architecture

- The V7.2 `ProjectExportSnapshot` remains the canonical persistent canvas snapshot. `.mooorf` wraps it with discriminator/version/app metadata and saved views; configuration reuses the same settings fields plus ID-keyed layout and never replaces semantic space data.
- One application-root `FileIntakeProvider` owns drag-depth, the maximum-five ephemeral queue, browse input, truthful local progress, retry/remove, and one-at-a-time apply lock. One File Intake WidgetFrame renders all project/config/table variants; no per-format widget or store-owned upload queue exists.
- Parsing/validation is pure and local: size gates run before allocation; JSON discriminators and unsafe keys/future versions/non-finite data are rejected; PapaParse preserves CSV quoting; XLSX is dynamically imported and formula evaluation is disabled; table apply plans target the existing `SpaceCell[]` model.
- Every destructive apply captures the full current recovery state, validates before mutation, commits via one Zustand `setState`, restores fully on error, and exposes toast Undo. No remote upload, eval, HTML injection, Blob URL, or temporary export state enters a project/config file.
- `getNucleusColor` is the one canvas/export resolver. Explicit valid color wins, then category/active-palette mapping, stable-ID fallback, and neutral. Generated cells carry no fake explicit color, so palette changes update them live; voids stay subtractive unless explicitly colored.
- The orbit/selection arc, halo/influence state and controls, Classic outer ring/tick, SVG selection arc, and dead CSS/export filter target are removed. MovingBorder + metadata/command/edit remain; Classic has only an on-body keyline.
- Widget launchers use `openWidget`: closed widgets mount once; already-open widgets only reorder within the widget band. Stable `WidgetId` keys and AnimatePresence remain. Canonical z tokens cap focused widgets below shell controls.
- Dock magnification adapts the existing independent-island Dock with `motion/react` distance transforms/springs; the 1.34× cap, 120px influence, keyboard focus, reduced motion, and mouse-only pointer tracking preserve tablet/touch behavior and the no-slab visual lock.

## V7.2 export architecture

- **One capture bridge, two providers.** `src/canvas/exportCapture.ts` is a
  tiny registry — whichever canvas view is mounted (Classic or Organism)
  registers exactly one capture provider on mount and unregisters on unmount.
  The export service never imports canvas/WebGL internals directly; it only
  calls `requestCanvasCapture({scale, includeLabels, includeSelection})`.
- **Classic capture is a pure re-render, not a live-canvas readback.**
  `CanvasView.tsx`'s provider calls the existing pure `drawScene` (unchanged
  signature except one new optional `{includeLabels}` — defaults to `true` so
  the live canvas's behavior is untouched) onto a fresh offscreen canvas sized
  to the requested resolution. This sidesteps all WebGL buffer-timing concerns
  and gives exact resolution control at any scale, including 4×.
- **Organism capture must happen inside the same render tick that draws it.**
  The organism WebGL context is created with `preserveDrawingBuffer:false`
  (unchanged — flipping it on would add a persistent per-frame copy cost to
  every live frame just to serve occasional exports). A capture request
  temporarily calls the existing `renderer.resize(w,h,scale)` to render at the
  export resolution, forces `dirty=true`, and waits for the render loop's next
  successful `renderer.render(frame)` call. Immediately after that call — same
  synchronous tick, before the buffer can be cleared or the DPR restored — the
  canvas is cloned via `drawImage` onto a new canvas and the promise resolves
  with the clone. Only then is `renderer.resize` restored to the live DPR.
  A 5s timeout rejects the request if a render frame never arrives (e.g. a
  backgrounded/throttled tab), and any pending request is rejected on renderer
  failure or unmount so a promise can never hang forever.
- **Labels are a second, independently captured layer for Organism.** They
  are a separate HTML overlay (`labelLayerRef`), not baked into the WebGL
  canvas, so they're captured via `html-to-image`'s `toCanvas` at a matching
  `pixelRatio`. Its `filter` option removes `.selection-command-wrap` (the
  three-dot command menu) and `.selection-edit-popover` (the rename/area
  edit form) unconditionally — those are interactive chrome, never export
  content, regardless of the Selection toggle — and additionally removes
  `.organism-moving-border`/`.organism-selection-system` when the Selection
  option is "Clean". This is DOM-filter-based exclusion, not a live-state
  mutation or CSS class toggle on the real UI, so there is no flash.
- **Compositing owns background/padding, not the renderer adapters.**
  `canvasComposite.ts` is the only place that resolves the Background option
  to a color (`--bg` token / `#fff` / transparent), validates dimensions
  (`resolution.ts`, hard 16384px/40MP ceilings, rejects NaN/Infinity/oversize
  before allocating), and draws the captured canvas + optional label layer
  onto one final flattened output canvas. Renderer adapters only ever supply
  raw captured pixels; format-specific logic never lives in a canvas view.
- **JSON export reuses the `SavedCanvasSnapshot` field set, not a new schema.**
  `projectSnapshot.ts`'s `ProjectExportSettings` mirrors the same fields
  `makeSnapshot`/`loadSavedView` already round-trip, wrapped in a versioned
  envelope (`schemaVersion`, `exportedAt`, `project.title`, `summary`).
  `openWidgets` and other session-only state are never included.
- **One shared capture per presentation pack.** `buildPresentationPack`
  captures/composites the canvas exactly once and reuses that same canvas for
  both the PNG and the PDF's embedded image — it never re-captures per format,
  avoiding redundant 4× WebGL/html-to-image work.
- **Heavy libraries are dynamically imported from the export service/adapters
  only**, never imported statically: `pdf-lib` (`pdfExport.ts`), `jszip` and
  `file-saver` (`exportService.ts`), `html-to-image` (the organism capture
  provider). They are absent from the initial canvas render path; the
  production build code-splits them into separate chunks.
- **SVG truthfulness.** Classic mode's `svgExport.ts` mirrors `drawScene`'s
  exact coordinate math (`toX`/`toY`, `areaToRadius`, `getNucleusColor`) to
  emit real `<circle>`/`<text>` elements — a genuine vector export. The
  blob/membrane merge layer (`src/canvas/blob.ts`) builds its silhouette as a
  `Path2D` from a d3-contour + Catmull-Rom spline pipeline with no exposed
  path-data API; extracting equivalent SVG `d` attributes was judged too large
  for this phase, so the merge visual is simply omitted from SVG (documented
  in the widget caption and here) rather than rasterized and mislabeled as
  vector. Organism mode has no reusable vector membrane path at all (implicit
  WebGL field), so `organismSvgAvailability()` reports it unavailable with a
  truthful reason instead of silently degrading to a raster PNG relabeled as
  `.svg`.
- **Export settings are widget-local `useState`, never store state.** Format,
  resolution, background, labels, selection, padding, page, orientation,
  title, and metadata toggles are export-run-scoped preferences, not project
  data — consistent with the existing rule that ephemeral UI state never
  enters the master graph/store or saved-view snapshot.
# V8.1 — Spatial color and direct editing ownership

- `settings.colorSource` is the one persisted Category/Privacy switch and migrates missing legacy values to `category`.
- `getNucleusColor` remains the canonical explicit override → source mapping → deterministic fallback resolver across renderers, labels, table, and exports.
- WebGL receives a reused `MAX_NUCLEI * 3` RGB buffer; positive nucleus influence weights spatial color in the existing one-draw fragment pass, while void RGB entries remain zero.
- Selection never enters radius, strength, position, camera, or membrane geometry. One shared `InlineCellEditor` replaces automatic metadata and command UI in both renderers.

# V8.2A — Interaction foundation ownership

- Canonical selection is an ordered `selectedIds: string[]` plus `primarySelectedId`; the deprecated `selectedId` field remains a synchronized compatibility mirror for existing canvas/table/widget consumers. Mutable Sets are never stored in Zustand or persistence.
- `selectAllVisible` follows renderer truth: Classic selects every runtime space; Organism selects the first `MAX_NUCLEI` entries it can render/hit-test. Marquee and camera-frustum selection remain deferred.
- Tool state (`activeTool`, `temporaryTool`) and context state (`contextSurface`, `contextPoint`, `contextTargetId`) are centralized session state. They are deliberately excluded from `LabSettings`, saved views, and project/export snapshots.
- Renderer views own only hit testing and gesture arbitration. The root `ContextSurfaceHost` owns the blank Base UI dropdown, the object radial presentation, and the shared `InlineCellEditor`; only one is primary at a time.
- `contextActionRegistry.ts` separates command metadata, icons, shortcuts, availability, danger, future status, and supported targets from `contextCommands.ts` product execution. `toolRegistry.ts` is the future Tools page source; the Dock/widget registries are unchanged.
- Object actions use only individual circular buttons around a transparent empty centre—no centre object, backdrop disc, enclosing ring, or large panel. Boundary, Lock, Group, and More remain truthfully disabled until real product state exists.
- Materials reuses `openWidget("palette")`, which focuses an existing stable widget key without remounting. Import reuses `FileIntakeProvider.browse`; View reuses the Display widget; duplicate/delete reuse central store mutations.
- Blank dropdown and object radial are desktop/laptop/iPad pointer foundations. iPad long-press/two-finger activation, the material shelf, detailed Tools page, and future sub-rails remain deferred.

# V8.2A.1 — Group translation ownership

- `groupDrag.ts` is the one shared, pure translation contract: it normalizes live selected IDs, captures original finite positions, and resolves every frame from the initial anchor delta to avoid drift. A dragged selected member becomes primary without reordering secondary IDs; an unselected drag resolves to that object alone.
- `store.ts` owns coordinated preview updates and a bounded ephemeral transform undo/redo stack. Pointer movement never records history; release commits one `{ before, after }` transform only when a finite position changed. Deleted/stale IDs are ignored and never recreated.
- Classic uses its existing world conversion; Organism applies `dragDeltaWorldToStore` once to the original anchor delta before sharing it with every selected member. No selection value enters organism radius, strength, colour/material, shader, or membrane inputs.
- This decision deliberately excludes marquee/lasso, scale, rotation, alignment, persistent groups, transform controls, keyboard movement, and a new snapping system.

# V8.2C0.1 — Single Canvas stabilization ownership

- Production presents one Canvas and mounts only one renderer strategy. WebGL is normal; Classic is automatic fallback/recovery and remains available internally with `organism-lab`.
- The shared demand loop is the sole scheduling contract: Motion Off sleeps after invalidation work; Motion On requests one continuous scheduler. Raw pointer events remain coalesced and never write persistent graph/history state.
- Organism caches area range, resolved Cell colours, palette, style, field, shadow, and selection derivations until their dependencies change. Morph Off and Shadow Off skip their optional work.
- Inline Name/Area edits reuse central graph ownership and the existing bounded Undo/Redo history as an edit variant; no second history or editor state system exists.
- ORG/CLS and renderer names are internal. SVG uses the existing Classic vector adapter for Cells/labels regardless of the live renderer; Membrane remains raster-only.
- V8.2C0.2 asset registry and V8.2C0.3 Icons & Symbols Inspector remain deferred; shortcut `I` remains unassigned here.

# V8.2C0.2 — Verified icon/grid registry ownership

- The production drawable registry contains only 77 source-verifiable Lucide symbols under the ISC licence. The audit inventory's conflicting 82-versus-95/96 counts and asserted proprietary prototype geometry are not treated as production evidence; no unverified prototype SVG is imported.
- Drawable symbols and UI command icons are separate resource classes. The current phase exposes only `drawable-symbol` entries with `space` placement targets; shell, navigation, tool, insert, and utility icons remain owned by existing UI registries.
- Canonical IDs are namespaced and stable. Six prior built-in IDs resolve through an alias boundary, while unknown IDs remain serialized for forward recovery rather than being replaced with a misleading fallback.
- The existing eight grid IDs remain the contract. Dotted is the sole live rendered preset in the current Organism path, None is the explicit active off state, and six additional presets are metadata-only Future entries. Snapping and grid export are compatibility declarations with `implemented: false`.
- The resource catalogue stays read-only, project/config formats store IDs only, and registry definitions never enter product persistence. C0.3 UI and every Canvas/grid runtime change remain deferred until independent audit and merge approval.

# C0.4F-A — Runtime presentation ownership

- Both live renderers consume one pure runtime projection built from the canonical C0.4.1 resolver and central store. Renderer adapters do not own appearance state, material registries, or fallback policy.
- Boundary width, offset, alignment displacement, dash/bar length, gap, double spacing, Void edge width, and Membrane Edge width are world-scaled. They never modify Cell area, radius, field strength, hit testing, clearance, or Void subtraction.
- Classic owns all six technical Boundary styles. Organism supports a solid Boundary overlay only; non-solid requests retain requested-style metadata, report `unsupported-organism-style`, and render solid. A major per-Cell shader-uniform redesign is explicitly deferred.
- Organism keeps the existing one-pass field shader for shared Membrane/Membrane Edge and uses one pointer-transparent Canvas2D overlay for per-Cell Boundary/Core/Void plus edge-only Cell fill. The overlay is composited into captures and cannot block drag, pan, or zoom.
- Selection is renderer-neutral temporary UI projected from session selection. It is not a presentation target and never enters Cell appearance, saved views, project/config data, copy/paste style, or clean export.
