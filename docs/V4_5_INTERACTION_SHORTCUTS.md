# V4.5A — Interaction Shortcuts (spec only)

## CAD-style shortcuts
Registry of tool shortcuts lives alongside the tool definitions in [V4_5_CAD_TOOLBAR_SYSTEM.md](V4_5_CAD_TOOLBAR_SYSTEM.md) (`shortcut` field per tool).

## Global interactions
- `Cmd/Ctrl+K` — command menu (cmdk), surfaces all tools/actions by name.
- `Cmd/Ctrl+scroll` (over a selected space) — resize selected space / adjust area.
- `Cmd/Ctrl+click` — multi-select.
- `Shift+drag` — constrain movement to axis (later phase).
- `Alt+drag` — duplicate while dragging (later phase).
- Hover tooltips on every toolbar icon, showing label + shortcut.
- Toolbar groups expand on hover (grouped clusters, not one flat row).
- `future_only` tools may appear visually disabled ahead of their implementation phase.

## Safety
- Keyboard-first workflow is a future goal, not a requirement of this doc phase.
- Shortcut conflicts must be checked against browser/OS defaults and existing app shortcuts before any binding is implemented (e.g. avoid clobbering browser zoom on `Cmd+scroll` outside canvas focus).

Not implemented this phase — registry/spec only.
