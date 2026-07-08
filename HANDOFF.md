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

Next:
- V6I palette/category color mapping or the next explicitly requested UI phase

Not started:
- Phase 6.5 Selection Arc
- V7 Floating Widgets

## Current Decision

Organism Lab is the preferred production canvas direction. Spaces become nuclei in an organism field. The old canvas remains a fallback until the production organism canvas is fully stable.

V6F.1 integrated the production organism canvas and kept Classic canvas fallback through the dock renderer toggle. V6G stabilized label/camera sync, mobile dock fit, table sync, fallback switching, dense-canvas behavior, and the isolated organism lab route.

V6H rebuilt the bottom dock into grouped production controls: renderer/style/attachment/reach on the left, high-emphasis `+ NUCLEUS` in the center, and palette/demo/import/export on the right. Style, attachment, palette, reach, demo, table sync, fallback, mobile 390 px fit, and lab route were checked. `paletteMode` exists as UI-ready state only; category color mapping is deferred.

## Workflow

GitHub is the source of truth for code. Do not use Google Drive as the code workflow source of truth right now.

- Remote: `origin`
- Repo: https://github.com/barc047-sketch/Mooorf
- Branch: `main`
