# ZONUERT Task Queue

Short gateway queue. Full details live in [docs/TASK_QUEUE.md](docs/TASK_QUEUE.md).

## Urgent / Next

- V6I palette/category color mapping or V6J saved views by explicit choice
- Keep `paletteMode` UI-ready until color mapping is intentionally started
- Keep Phase 6.5 selection arc and V7 floating widgets parked

## Workflow Complete

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

## Future Features

- Selection arc
- Cmd/Ctrl-scroll resize
- Floating widgets
- Floors
- Export
- Gallery/templates later
