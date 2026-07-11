# V4.5A — Selection Arc System (historical only; removed V7.3)

> V7.3 intentionally removed this orbit/arc and all halo/influence modes from runtime, exports, controls, and current planning. Keep this file only as historical design context; do not reimplement it. Current selection uses the subtle MovingBorder/keyline plus metadata/command/edit affordance.

Directly inspired by the dark-scan UI reference's curved orbit/arc selection control around an anchor point (glowing anchor dots + thin arc path) — translated from a body-scan anchor to a selected space-cell anchor.

The historical concept proposed a premium orbital/arc control around a selected space-cell. It is not a future feature after V7.3:

- Curved arc near the selected circle's edge.
- Small handle dots on the arc.
- Radius/area control via the arc handles.
- Relationship quick-action affordance.
- Warning marker if the cell is flagged by a bylaw/adjacency check.
- `Cmd/Ctrl+click` for multi-select.
- `Cmd/Ctrl+scroll` changes the selected circle's size/area.
- `Shift+drag` constrains movement (later phase).
- `Alt+drag` duplicates (later phase).
- Arc reveal/dismiss is smoothly animated.

## Explicitly avoid
- Bulky bounding boxes.
- Cheap generic resize handles.
- Anything that breaks the editorial "object" feel of a cell.

## Future selected-cell controls (surfaced via the arc)
Radius/area, lock, hide, duplicate, connect, danger/warning, floor assignment, category color.

## Build note
Custom SVG arc is acceptable per [V4_5_COMPONENT_LIBRARY_RULES.md](V4_5_COMPONENT_LIBRARY_RULES.md) if it stays smaller/simpler than adding a circular-slider dependency (see [V4_5_RESOURCE_LINKS.md](V4_5_RESOURCE_LINKS.md)). **Not built in this phase.**
