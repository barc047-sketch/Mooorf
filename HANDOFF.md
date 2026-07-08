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

Next:
- Codex QA of V6H.3, then V6H.4 layout presets or V6I palette mapping

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

## Workflow

GitHub is the source of truth for code. Do not use Google Drive as the code workflow source of truth right now.

- Remote: `origin`
- Repo: https://github.com/barc047-sketch/Mooorf
- Branch: `main`
