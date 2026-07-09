# Decisions

- Use Palmer as interaction/style reference, not brand clone.
- Build separate canvas lab, not V1 repo.
- First-class loading intro is required.
- Day mode uses cream/ink editorial style.
- Night mode uses Graph Noir Red.
- Motion must feel premium and restrained.
- Table and canvas use same central store.
- Organism blob remains under cells.
- No backend/auth/cloud/payment in lab.

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
