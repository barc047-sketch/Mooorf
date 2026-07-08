# ZONUERT Task Queue

Short gateway queue. Full details live in [docs/TASK_QUEUE.md](docs/TASK_QUEUE.md).

## Urgent / Next

- V6I palette/category color mapping or the next explicitly requested UI phase
- Keep `paletteMode` UI-ready until color mapping is intentionally started
- Keep Phase 6.5 selection arc and V7 floating widgets parked

## Workflow Complete

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

## Future Features

- Selection arc
- Cmd/Ctrl-scroll resize
- Floating widgets
- Floors
- Export
- Gallery/templates later
