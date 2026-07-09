# ZONUERT Handoff

Short gateway handoff. Full details live in [docs/HANDOFF.md](docs/HANDOFF.md).

## Current Status

Complete:
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

Next:
- V6.5 selection arc or another explicit post-shader phase

Not started:
- Phase 6.5 Selection Arc
- V7 Floating Widgets

## Current Decision

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

## Workflow

GitHub is the source of truth for code. Do not use Google Drive as the code workflow source of truth right now.

- Remote: `origin`
- Repo: https://github.com/barc047-sketch/Mooorf
- Branch: `main`
