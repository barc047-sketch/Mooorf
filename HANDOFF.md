# ZONUERT Handoff

Short gateway handoff. Full details live in [docs/HANDOFF.md](docs/HANDOFF.md).

## Current Status

Complete:
- C0-M1 Production Inspector, Content and Layer Editing Recovery (feature branch complete; waiting Owner review; not merged)
- C0.4F-A Runtime Layer Separation (feature branch complete; waiting independent review; not merged)
- V8.2C0.2 Icon and Grid Asset Registry
- V8.2C0 Canvas Performance + Contrast Reset
- V8.2A.1 Multi-Selection Group Drag Foundation
- V8.2B Expandable Resource Registry Foundation
- V8.2A Interaction Foundation
- V8.1 Spatial Colour Field + Minimal Direct Editing
- V6F.0 Organism Production Integration Audit
- V6F.0B Production Canvas UI / Control Architecture
- V6F.0C Reference Folder Patch
- V6F.0D GitHub-only Coding Workflow Setup
- V6F.0F.3 GitHub Push / Doc Sync
- V6F.1 Production Organism Canvas Integration
- V6G QA / stabilization
- V6H Production Dock UI
- V6H.1 Full Organism Control Surface
- V6H.2 UI Command Architecture Cleanup + Resource Prep
- V6H.3 Claude Premium UI Implementation
- V6H.3Q Codex QA for Premium UI
- V6H.4 Layout Presets / Colony Arrangement
- V6H.4B Quick Add Cluster + Random Arrangement
- V6I Palette + Category / Privacy Mapping
- V6J Saved Views / Design Iterations
- V6K Premium Visual Widget System
- V6L Multi-Color Organism Shader + Negative Nuclei
- V6M Codex Workflow OS
- V6M.1 Ponytail Enforcement Patch
- V6LQ Shader / Void QA
- V6.5 Selection Arc + Canvas Rename
- V6N Interface Density / Editorial Glass Refinement
- V6N.1 Reference-Locked Premium Design System
- V6N.2 Reference-Applied UI Polish
- V6N.3 Premium Primitives + Moving Cell Border
- V7.0 Spatial Intelligence System + Project Pulse Flagship
- V7.0B Liquid Glass Shell Correction
- V7.1 Spatial Intelligence Widget Family
- V7.1B Adaptive Instrument Geometry + Interface Polish
- V7.1Q Independent QA + Stabilization (V7.0–V7.1B reviewed; no defects, no fixes)
- V7.1C Continuous Interface Scale slider
- V7.1D Independent Widget Scale (desktop/laptop/iPad)
- V7.2 Export & Presentation Pack (desktop/laptop/iPad)
- V7.3 File Intake + Canvas Interaction System (desktop/laptop/iPad)

Next:
- Owner review of combined C0.4F-A + C0-M1 fixed head; do not merge or start M2 without the exact next command
- Independent review of C0.4F-A; do not merge or start C0.4F-B without the Owner's exact command
- Antigravity delta audit of the pushed V8.2C0.2 registry branch; C0.3 remains blocked pending audit/merge approval
- Antigravity independent V8.2C0 reference/performance/migration audit on the pushed feature branch
- Antigravity independent V8.2B audit on the pushed feature branch
- Claude prototype review before resource browsers, shelves, or panels
- Relationship Health / Floor Summary (await live relationship/floor data)

Not started:
- V8.2C visual Material Browser / shelf / Grid Shelf / Icons & Symbols Inspector / Annotation Studio / Tools page
- V8.2A follow-ons: marquee and iPad context gesture
- Relationship Health / Floor Summary (await live relationship/floor data)

## Current Decision

C0-M1 restores one canonical Name/Area/Body editing path across Canvas, Inspector and minimal Table; adds a compact Content/Appearance Inspector with coordinated text defaults/overrides and six independent target widgets; and routes supported Morph/Fusion/Reach into the Membrane owner. Shared Membrane/Edge remain project-default fields, Body remains geometry-neutral, previews/selection remain ephemeral, and clean raster/Classic vector export uses canonical final values. Full evidence: `docs/C0_M1_INSPECTOR_LAYER_EDITING_REPORT.md`. The feature is `WAITING_REVIEW`; no merge or M2 is authorized.

C0.4F-A routes both live renderers through one canonical runtime presentation projection. Classic supports all six Boundary styles; Organism preserves the current field shader, adds bounded Membrane/Edge controls, and truthfully falls non-solid Boundary styles back to solid through a pointer-transparent overlay. Technical strokes are world-scaled and presentation-only. Selection remains temporary and clean-export-excluded. Full evidence: `docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md`. The branch is `WAITING_REVIEW`; no merge or C0.4F-B work is authorized.

V8.2C0.2 expands the existing immutable resource owners to exactly 77 active Lucide/ISC drawable symbols and eight canonical grid presets. UI command icons are not drawable resources; six legacy symbol IDs resolve canonically while unknown IDs remain recoverable. Dotted is the only current rendered grid, None is the explicit off state, and the other six presets remain Future metadata. No prototype asset, package, Canvas runtime, store schema, or UI was added. C0.3 waits for Antigravity delta audit and merge approval.

V8.2C0 keeps raw Canvas movement renderer-local and rAF-coalesced, committing one final transform/history transaction at release. It adds shared Screen/Adaptive/World labels, deterministic Auto Contrast, optional quality-gated Cell Shadow, plain-cell startup, stable no-shadow glass, instant widget refocus, and projected-centre radials across Classic/Organism without adding another camera, history, colour resolver, settings store, or shell system. Full detail: `docs/HANDOFF.md`.

V8.2B establishes immutable material/grid/annotation/icon registries and one read-only catalogue. Existing palettes are adapted into material collections while `getNucleusColor` remains the render authority. Project/config/saved-view persistence stores only resource IDs, sparse safe overrides, normalized grid settings, and future annotation/icon references; manifests record active resource metadata. No visual resource UI, renderer placement, package, or third-party asset was added pending Claude prototype review.

V8.2A.1 extends that interaction foundation with one shared group-translation contract: the dragged primary object's original-anchor delta moves every valid selected member in Classic and Organism, preserving relative offsets and geometry/material invariants. The store previews one batch and commits one ephemeral undo/redo transform record on release; group scale/rotate/marquee remain deferred. V8.2A otherwise retains its store-owned tool/context/multi-selection contract, root context host, action registry, and tool registry.

V8.1 makes Editorial Aurora the default colorful palette, persists one Category/Privacy color source through project formats, feeds stable per-nucleus RGB into the existing one-pass organism shader, and guarantees selection geometry invariance. Single click/tap selects; deliberate double activation opens one shared Name/Area editor. Automatic selection metadata and command UI no longer render.

V7.3 removes the orbit/selection arc and halo modes while retaining the MovingBorder, compact metadata/command menu, and direct rename/area edit flow. It adds real readiness-numeral milestones, one canonical explicit/category/palette/stable-ID color resolver shared by both renderers/exports, one local-only File Intake widget/queue for `.mooorf`/config/CSV/XLS/XLSX, atomic recovery+Undo, restrained dock magnification, canonical shell/widget z layers, and focus-only widget reselection. Build and 1440/1024/768 live QA are green; the browser harness could not attach a local file, while parsing/apply behavior is contract-tested. Full detail: `docs/HANDOFF.md`.

Organism Lab is the preferred production canvas direction. Spaces become nuclei in an organism field. The old canvas remains a fallback until the production organism canvas is fully stable.

V6F.1 integrated the production organism canvas and kept Classic canvas fallback through the dock renderer toggle. V6G stabilized label/camera sync, mobile dock fit, table sync, fallback switching, dense-canvas behavior, and the isolated organism lab route.

V6H rebuilt the bottom dock into grouped production controls: renderer/style/attachment/reach on the left, high-emphasis `+ NUCLEUS` in the center, and palette/demo/import/export on the right. Style, attachment, palette, reach, demo, table sync, fallback, mobile 390 px fit, and lab route were checked. `paletteMode` exists as UI-ready state only; category color mapping is deferred.

V6H.1 imported the full Organism Lab parameter model into production: typed `settings.organism` + resolver, a floating Organism Control Surface panel (Style / Organism / Nuclei / Attachment & Offset / Motion / Pockets / Display / resets), a captioned left rail (view / render / build / panels / system), attach Extreme, and premium style/palette/attach popovers. Defaults match the previous stable canvas; nucleus count stays data-owned; motion ships off. Table sync, classic fallback, lab route, 390 px, and night mode re-verified; build green with the known chunk warning.

V6H.2 cleaned command ownership: left rail is now navigation/widget launchers, bottom dock is quick creation/mode control, the right-side surface is the detailed widget panel, and the canvas remains direct editing. Annotation modes and selection display modes were added; default labels are editorial and default selection is tight. Palette and widget metadata plus `docs/UI_RESOURCE_AUDIT.md` prepare the Claude premium UI pass without adding packages or starting final widgets/color mapping.

V6H.3 made that architecture visually premium: tighter dock/rail scale with Mac-like hover motion, a liquid-hover `+` orb, a dashed void placeholder, palette-first dock utilities, a panel with grip/minimize affordances, a Motion master switch, an Advanced-debug disclosure, and a palette widget rendering shade ramps / field strips / gradient previews from `src/design/palettes.ts`. Editorial labels stay boxless when selected (red type accent) and technical labels read name · area · category. No store/renderer/table changes and no packages; build green with the known chunk warning.

V6H.4 added production layout presets in the Organism Control Surface panel: Organic, Core, Colony, Division, Tendril, Orbit, and Asymmetry. Presets update existing space `x/y` positions only; ids, names, areas, categories, privacy, colors, camera, table data, classic fallback, and the lab route remain intact. The dedicated Void layout stays disabled as a future arrangement language; V6L later added actual void nuclei. Build and preview QA passed with the known chunk warning.

V6H.4B added a Random arrangement chip to the Layout panel and a five-dot circular dock button beside `+ NUCLEUS`. Random is a fresh non-deterministic organic spread that updates positions only. The cluster button creates 5 neutral store-owned spaces around the current camera center without demo data or camera reset. Table sync, fallback, mobile dock fit, and lab route were checked; build green with the known chunk warning.

V6I added production palette/category mapping. `src/design/colorMapping.ts` derives restrained architectural colors from category, privacy, area, and palette mode. Palette mode affects the WebGL organism's body/ground colors; labels/rings, classic fallback cells, and table swatches use mapped per-space colors. V6L later added body B/accent blend uniforms; true per-nucleus color textures are still deferred. Add-5, Random, table sync, fallback, 390 px fit, and lab route were checked; build green with the known chunk warning.

V6J added Saved Views / Design Iterations. The dock Saved Views utility now opens a compact iteration panel with Save Current, Load, Rename, Duplicate, and Delete. Snapshots deep-copy spaces/camera and preserve theme, renderer mode, palette, layout, annotation, organism settings, morph style, attachment mode, reach, blob, and selection display. Saved views persist locally under `mooorf.savedViews.v1`, capped at 20, with guarded JSON/storage handling. Loading clears selection, restamps `born` values for smooth pop-in, and preserves table sync. Build and preview QA passed with the known chunk warning.

V6K upgraded the production shell to a premium floating-widget system. All detailed controls migrated out of the single Organism Control Surface into seven movable/minimizable widgets (Annotation, Organism, Layout, Palette, Saved Views, Display, Advanced) rendered by `WidgetHost`/`WidgetFrame` from `openWidgets` store state. The rail became launchers only; the dock tightened and gained Random arrangement; the palette system grew 12 curated nucleus families (functional ramp tinting) and 12 organism palettes (9 solid functional via shader uniforms, 3 gradient blends enabled later in V6L). Annotation gained text scale / field toggles / position modes / bounding box; a camera-synced technical grid was added; the default selection ring tightened with influence behind an advanced disclosure. Table sync, saved views, classic fallback, organism mode, and the lab route were preserved and preview-verified; build green with the known chunk warning (~673.75 kB). Spec: `docs/DESIGN_UI_UPGRADE_V6K.md`.

V6L added the multi-color organism shader path and production void nuclei. `SpaceCell.kind` is optional/backward-compatible; void nuclei are store-owned rows that can be dragged, table-edited, saved/loaded, and preserved through layouts/random. The dock void button is enabled. WebGL now uses negative signed strength for voids, clamped field contribution, and body A/body B/accent/ground/blend uniforms for restrained category/privacy/area-informed palette mixing. `MAX_NUCLEI` is now 96 as a renderer cap only; store/table data remains unlimited. Classic fallback draws voids as hollow dashed circles. Build passed with the known chunk warning (~677.09 kB). Engine notes: `docs/ORGANISM_ENGINE_LIMITS.md`.

V6M added the Codex workflow OS. Future Codex prompts should reference `docs/PROJECT_MEMORY_INDEX.md` and `docs/FEATURE_MAP.md` instead of repeating full history, and should follow `docs/CODEX_PHASE_PROTOCOL.md`. New docs also capture prompt rules, roadmap, component inventory, and design system memory. `npm run repo:health` is available as a read-only repo status helper. Runtime/product code was not changed.

V6M.1 made Ponytail mandatory in the workflow. Future prompts and reports must check reused existing components/utilities/packages, adapter-over-rewrite discipline, justified new files, and duplicate UI/state avoidance. Component inventory is the first UI/control reuse reference. Runtime/product code was not changed.

V6LQ QA passed with no code fixes needed. Build passed with the known chunk warning; void nuclei, shader signed strength, multi-color uniforms, saved-view preservation, table sync, classic fallback, mobile fit, and the lab route were verified.

V6.5 added the production selection arc and direct canvas editing. Selected organism nuclei now show a compact partial arc, handle dots, metadata, and an Edit chip in the existing label overlay. Rename and area edits commit through `updateSpace`, so table sync and saved views stay intact. Void nuclei use dashed/subtractive styling and support the same rename/area flow. Hidden annotation mode hides ordinary labels while preserving selected edit affordances. ORG/CLS fallback and the lab route remain intact; 390 px fit was checked.

V6N refined the existing V6K/V6.5 interface into a slimmer neutral glass system. Red is removed from UI chrome across rail/dock/widgets/sliders/chips/selection/loader/classic selection tick; `--zonuert-red` remains product/palette material only. Shared glass tokens now drive dock, rail, widgets, popovers, saved views, palette surfaces, and canvas edit overlays. Selection arc is smaller and calmer. New persisted toggles: Annotation `Text shadow` (`annotationDetail.textShadow`) and Organism `Camera-aware morph` (`organism.cameraAwareMorph`). Build passed with the known chunk warning. Details: `docs/V6N_GLASS_EDITORIAL_DIRECTION.md`.

V6N.2 applied the locked reference grammar directly to the live UI (visual/CSS only). Selection gained a thinner arc with a hairline leader and anchor dot, a polished radial command menu (rename/area/duplicate/convert/focus/delete through existing store actions), and a glass-instrument edit popover. The technical grid became a camera-synced dot matrix; labels, dock, rail, sliders, switches, saved-view tiles, and widget chrome were refined to the dark-HUD / frosted-dashboard standard. No red UI chrome; build green; canvas/table sync, saved views, ORG/CLS fallback, lab route, and 390 px fit preview-verified.

V6N.3 added the reusable `MovingBorder` primitive and upgraded the shared premium primitive layer. Selected/edit-active organism nuclei now use a subtle moving border through the existing label overlay only; voids get hollow/subtractive styling. Shared glass, widget, dock, rail, popover, saved/palette card, slider, switch, chip, and layout-card materials were strengthened with neutral edge light, grain, and instrument tokens. No product data, shader, table, saved-view, package, fallback, or lab-route rewrite. Build and focused preview QA passed.

V6N.1 locked the premium reference style into the design system. `docs/V6N_REFERENCE_STYLE_LOCK.md` is now the canonical reference grammar for dark scientific HUD, light frosted dashboard, spatial glass, cinematic overlay, selection arc, typography, density, color/chrome, data card, and future widget rules. Shared tokens/primitives were strengthened for glass dark/light, borders, inner highlights, shadows, card/pill radii, HUD/muted text, dot grid, neutral selection arcs, and warning-data color. References remain mood/structure/style only; no external images were moved or duplicated.

V7.0 defined the spatial intelligence system (`docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md`) and shipped the flagship Project Pulse widget. Pure selectors over the store `spaces` array (`src/domain/stats/selectors.ts`) own every metric: total program m² (voids excluded), space/void counts, category shares, privacy balance, largest space, and data-health counts. The widget composes shared instrument primitives (MetricReadout, MicroDistribution, InsightRow) inside the existing WidgetFrame, launches from a new rail Stats section, and updates live from table/canvas edits and saved-view loads. Build green; preview QA covered metrics sync, layout neutrality, day/night, 390 px sheet, ORG/CLS, and the lab route. V7.1 now completes the remaining runtime-backed family.

V7.0B corrected the global shell before expanding that widget family. Shared
day/night glass is now genuinely translucent with focused/background depth from
the existing `openWidgets` order; no parallel z-index state was added. The dock
has no outer slab: left/right controls are independent glass islands around
plain-black Add/Add-5 circles and the hollow Void action. The rail is a 42px
icon-only launcher with accessible glass tooltips. Widget headers/rows are denser,
Project Pulse inherits the material unchanged, and selectors/store/shader/table/
saved-view contracts remain intact. Build and focused preview QA passed.

V7.1 completes the runtime-backed family with Category Mix, Privacy Balance, Area Leaders, and Data Health. Pure selectors own all math and widgets derive from the stable `spaces` reference with `useMemo`; voids stay outside program totals. Project Pulse remains the sole rail Stats destination and exposes a compact Instruments popover that opens the four independent movable WidgetFrames. Area Leaders reuses selection, Data Health reuses the table/view flow, and no dashboard, compliance rules, package, manager state, or parallel editing path was added. Build is green at 733.00 kB; focused desktop/mobile QA passed with no console or finite-output failures. Terra receives the compact independent QA/fix handoff.

V7.1B refines the shared interface before that QA: registry-owned semantic
geometry makes the V7 instruments visibly wide/tall/flagship, the same canonical
icon now appears in rail/submenu/header, and headers are one line. Display owns a
saved 88/100/112% Interface Scale that changes chrome without touching canvas
geometry. Editorial/technical labels are fully unbounded; Pill/selection glass
remains intentional. The existing loader exits from the first usable WebGL or
Classic frame instead of a fake countdown. Build and focused live QA pass;
Terra now reviews V7.0 through V7.1B as one system.

V7.1Q ran that combined independent QA (static review, contract tests, live
regression) and found no reproducible defects, so no code changed. V7.1C then
adds a continuous Interface Scale slider (82–118%, 1% step) beside the presets in
Display, reusing the existing `SliderRow` primitive and `normalizeUiScale`.
Presets and slider share the single canonical `settings.uiScale`; custom values
persist and restore exactly from saved views; mobile still renders at 100% while
preserving the stored preference. No second scale state, component, or setter.
Build and focused live QA pass.

V7.1D (desktop/laptop/iPad scope) adds a second, independent canonical value —
`settings.widgetScale` — via a visually identical Display section, sharing
Interface Scale's presets/slider format and normalization contract. Widget
window footprint reflects `uiScale * widgetScale` combined once; internal
widget content (header, icon, controls, gaps) is Widget-Scale-owned only via a
new `--widget-scale` token, scoped so rail/dock/canvas/tooltips and the shared
pop-chip/org-slider primitives' non-widget callers stay untouched. All five V7
widgets keep their distinct authored geometry at every scale; a reused
drag-clamp safety net keeps dragged widgets reachable without resetting
position. Persists independently in saved views with 1.0 legacy migration.
Verified at 1440/1280/1024/768px; build and focused live QA pass.

V7.2 (desktop/laptop/iPad scope) activates the long-reserved Dock Export
placeholder into a full Export widget covering PNG, PDF, CSV, JSON, and a ZIP
presentation pack, plus true-vector SVG for Classic mode. One renderer-aware
capture bridge (`src/canvas/exportCapture.ts`) lets Classic re-render the
existing pure `drawScene` onto an offscreen canvas at any resolution, while
Organism captures the live WebGL canvas synchronously within the same render
tick it draws (required by `preserveDrawingBuffer:false`) plus the HTML label
overlay via `html-to-image`, with the command menu/edit form always excluded
and the selection ring/border excluded in Clean mode — no rail/dock/widget
chrome and no visible flash. `pdf-lib` builds a single-page A4/A3 presentation
with optional title/metadata; `jszip`/`file-saver` assemble the pack from one
shared capture reused across every artifact. JSON export reuses the existing
`SavedCanvasSnapshot` field set instead of a new schema. SVG is truthful:
Classic emits real vector circles/text (the blob/membrane merge layer is
documented as omitted, not faked); Organism reports SVG unavailable rather
than mislabeling a raster capture as vector. Interface Scale and Widget Scale
verified to never affect export pixel dimensions. Heavy libraries are
dynamically imported and code-split out of the main chunk. Build and focused
live QA pass.

## Workflow

GitHub is the source of truth for code. Do not use Google Drive as the code workflow source of truth right now.

- Remote: `origin`
- Repo: https://github.com/barc047-sketch/Mooorf
- Branch: `main`

## V8.2C0.1 — Canvas stabilization handoff

The child branch `feature/v8-2c0-1-canvas-stabilization` stabilizes the frozen
`c141ed7` performance foundation without merging. Production now exposes one
Canvas with one mounted renderer strategy; Classic stays automatic/internal.
Motion-Off rendering sleeps, Motion On owns one scheduler, stable Organism work
is cached, and inline Name/Area editing commits once through existing graph and
Undo/Redo ownership. Morph visibly controls the optional Membrane. Primary and
secondary selection use separate external keylines. ORG/CLS and Dock
magnification are removed. Focused contracts and exact 1440/1280 QA are recorded
in `docs/V8_2C0_1_CANVAS_STABILIZATION_REPORT.md` and the external artifact
directory. The Owner accepted the visible Morph/Membrane result and this stage
for progression. Dense-scene interaction slowdown at approximately 50+ Cells is
an accepted known limitation; deeper optimization is deferred and is not
claimed fixed. Next is C0.2 Icon and Grid Asset Registry, then C0.3 Icons &
Symbols Inspector.
