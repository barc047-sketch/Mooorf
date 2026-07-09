# ZONUERT Task Queue

Short gateway queue. Full details live in [docs/TASK_QUEUE.md](docs/TASK_QUEUE.md).

## Urgent / Next

- V7 stats/widgets or another explicit phase
- Keep V6L shader/void behavior stable; do not start per-nucleus color textures unless explicitly requested
- Keep V7 floating widgets parked
- Future prompts should reference `docs/PROJECT_MEMORY_INDEX.md` and `docs/FEATURE_MAP.md`
- Future prompts must include the Ponytail checklist

## Current Feature Complete

- V6N.2 Reference-Applied UI Polish
- Selection arc thinned with leader line + anchor dot; radial command menu integrated (rename/area/duplicate/convert/focus/delete via existing store actions)
- Edit popover, dot-matrix grid, labels, dock, rail, sliders, switches, saved-view tiles, and widget chrome polished to the V6N.1 reference standard
- No red UI chrome; CSS-only animations honoring reduced motion
- Preview QA: selection/edit/menu, table sync, toggles, saved views, ORG/CLS, lab route, 390 px
- Build passed with known chunk warning
- V6N.1 Reference-Locked Premium Design System
- Canonical style lock added at `docs/V6N_REFERENCE_STYLE_LOCK.md`
- References are visual grammar only: dark scientific HUD, light frosted dashboard, spatial glass, cinematic overlay, architecture translation, selection arcs, typography, density, chrome, data cards, and future widget rules
- Shared tokens/primitives strengthened for glass surfaces, HUD text, muted text, dot grid, neutral selection arc, warning-data color, card radius, and pill radius
- Future UI must reuse `WidgetFrame`, `WidgetHost`, shared controls, dock/rail/widget ownership, and premium primitives before custom styles
- Build passed with known chunk warning
- V6N Interface Density / Editorial Glass Refinement
- Neutral smoke/ink/stone chrome replaces red rail/dock/widget/slider/chip/selection accents
- Shared glass tokens added; widgets, popovers, saved/palette surfaces, canvas edit popovers refined
- Selection arc redesigned smaller and calmer in the existing organism overlay
- Annotation Text shadow toggle and Organism Camera-aware morph toggle added and saved-view persisted
- Classic fallback selection tick neutralized; build passed with known chunk warning
- V6.5 Selection Arc + Canvas Rename
- Selected nuclei show a compact premium arc, handle dots, and metadata
- Canvas rename and area edit commit through existing `updateSpace`
- Void nuclei use dashed/subtractive selection styling and share the same edit flow
- Hidden annotation mode keeps the selected edit affordance available
- Table sync, saved views, ORG/CLS fallback, lab route, and 390 px fit checked
- Build passed with known chunk warning
- V6LQ Shader / Void QA
- No code fixes needed
- Build passed; void/shader/palette/table/saved/fallback/mobile/lab paths verified

## Workflow Complete

- V6M.1 Ponytail Enforcement Patch
- Ponytail is now mandatory: reuse first, installed package/library first, adapter before rewrite, avoid duplicate UI/state, justify new files
- Handoff/final reports include reused, adapted, new files justified, and duplication avoided
- Docs-only; runtime/product code untouched
- V6M Codex Workflow OS
- Added Codex phase protocol, project memory index, feature map, prompt rules, next phases, component inventory, and design system memory
- Added read-only `npm run repo:health`
- GitHub remains source of truth; `.claude/launch.json` remains unstaged/local unless explicitly requested
- Runtime/product code untouched
- V6L Multi-Color Organism Shader + Negative Nuclei
- Void nuclei are store-owned rows via optional `SpaceCell.kind`
- Dock void button creates subtractive nuclei; table/edit/save/load/layout/random preserve them
- Shader uses negative signed strength, clamped field contribution, and body A/body B/accent/ground/blend uniforms
- Category/privacy/area-informed organism color mixing and staged blend palettes are active
- `MAX_NUCLEI` raised to 96 as a renderer cap only; docs/ORGANISM_ENGINE_LIMITS.md added
- Classic fallback renders voids as hollow/dashed circles
- Build passed with known chunk warning
- V6K Premium Visual Widget System + Full Control Migration
- Seven floating widgets, launcher-only rail, tightened dock, palette families, annotation detail, grid, saved views, table sync, fallback, and lab route preserved
- Build passed with known chunk warning
- V6J Saved Views / Design Iterations
- Dock Saved Views utility now opens compact iteration panel
- Snapshots preserve spaces, camera, theme, renderer, palette, layout, annotation, organism settings, morph/attachment/reach/blob/selection display
- Load, rename, duplicate, delete, localStorage persistence, table sync, fallback, lab route, and 390 px fit checked
- Build passed with known chunk warning
- V6I Palette + Category / Privacy Mapping
- Semantic color resolver added for category/privacy/area/palette mode
- Palette mode now affects organism global body/ground colors
- Organism labels/rings, classic fallback, and table swatches use mapped colors
- Palette panel shows live program-mapping token previews
- Add-5, Random, table sync, ORG/CLS fallback, lab route, and 390 px fit checked
- Build passed with known chunk warning
- V6H.4B Quick Add Cluster + Random Arrangement
- Random layout added to the Layout panel; fresh organic spread, position-only
- Five-dot dock button added beside `+ NUCLEUS`; creates 5 neutral spaces around the current camera center
- Table sync, ORG/CLS fallback, lab route, and 390 px dock fit checked
- Build passed with known chunk warning
- V6H.4 Layout Presets / Colony Arrangement
- Production layout presets: Organic, Core, Colony, Division, Tendril, Orbit, Asymmetry
- Presets rearrange existing spaces only by `x/y`; table data, ids, names, areas, categories, privacy, colors, and camera are preserved
- Void preset remains disabled/future until negative production nuclei are explicitly built
- Layout section added to the Organism Control Surface panel; bottom dock unchanged
- Build and preview QA passed with known chunk warning
- V6H.3 Claude Premium UI Implementation
- Premium dock/rail scale + hover motion; liquid `+` orb; void placeholder styled
- Panel grip/minimize, motion master toggle, advanced-debug disclosure
- Palette widget: shade ramps, organism field strips, gradient previews, custom placeholder
- Editorial/technical label cleanup; tight ring kept; 390 px, table sync, fallback, lab route re-verified
- Build passed with known chunk warning
- V6H.2 UI Command Architecture Cleanup + Resource Prep
- Left rail launcher/nav split; dock quick control split; widget panel detail split
- Annotation modes and tight/halo/influence selection display added
- Palette metadata, widget registry, saved-view snapshot type, and UI resource audit prepared
- Build passed with known chunk warning
- V6H.1 Full Organism Control Surface
- Typed `settings.organism` + production resolver; defaults match the stable canvas
- Floating control surface panel: style/organism/nuclei/attachment-offset/motion/pockets/display + resets
- Captioned left rail (view/render/build/panels/system); attach Extreme; premium popovers
- Sliders/toggles verified live against the renderer; table sync, fallback, lab route, 390 px, night mode re-checked
- V6H Production Dock UI
- Grouped dock controls: renderer/style/attachment/reach, `+ NUCLEUS`, palette/demo/import/export
- Style, attachment, palette, reach, add nucleus, demo, ORG/CLS, table sync, fallback, lab route checked
- Mobile 390 px dock and popovers fit; HUD lifted above dock
- V6G QA / stabilization
- Production organism label/camera sync stabilized
- Mobile 390 px dock overflow fixed
- Table sync, fallback toggle, lab route, and 31/61-space stress checked
- V6F.0F.3 GitHub Push / Doc Sync
- Remote: `origin`
- Repo: https://github.com/barc047-sketch/Mooorf
- Branch: `main`
- GitHub is source of truth

## Urgent Bugs

- Known Vite chunk warning remains deferred
- High-density labels are crowded at 60+ spaces; defer label-density design to production UI work
- Forced WebGL context-loss simulation not run; renderer handlers inspected

## UI Polish

- Production bottom dock refinement complete
- Central `+ NUCLEUS` button polish complete
- Style / attachment / palette panel polish complete
- Right inspector later
- Floating widgets later

## Performance

- WebGL lifecycle
- DPR clamp
- Known Vite chunk warning around 500-580 kB
- 30-60 nuclei performance
- Avoid per-frame React state

## Refactor

- SpaceCell -> nucleus adapter
- Renderer modularization
- Share production/lab shader utilities only where safe

## Done recently

- V6M Codex workflow OS (see docs/CODEX_PHASE_PROTOCOL.md, docs/PROJECT_MEMORY_INDEX.md, docs/FEATURE_MAP.md)
- V6L multi-color organism shader + negative nuclei (see docs/ORGANISM_ENGINE_LIMITS.md)
- V6K premium widget system + control migration (see docs/DESIGN_UI_UPGRADE_V6K.md)

## Future Features

- Selection arc
- Cmd/Ctrl-scroll resize
- Floating stat widgets (metrics/warnings)
- Floors
- Export
- Gallery/templates later
