# V4.5A — Canvas Grid & Scale System (spec only)

## Grid
- Dotted canvas background, inspired by the dark-scan UI reference's dotted technical background (pattern only, not its content).
- Optional 1m × 1m grid scale — conceptual guide, not construction-accurate.
- Grid density adapts with zoom level (fewer/larger dots when zoomed out, finer when zoomed in).
- Grid is user-toggleable: dotted / line / off.
- Day mode grid: soft fog grey.
- Night mode grid: low-contrast graphite dots (must not compete with Graph Noir Red identity).
- Grid must never visually overpower the space cells — it is a background aid.

## Future additions
- Scale ruler (edge of canvas).
- Coordinate readout (cursor position in canvas units).
- Floor-plan image underlay support (import reference plan, grid aligns to it).

Not implemented this phase — spec only, informs CanvasView renderer work in a later phase.
