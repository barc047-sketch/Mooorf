# V4.5A — Floating Widget System (spec only)

## Behavior
Movable, collapsible, glassmorphism panels that float over the canvas (never a docked dashboard page). Compact metrics with animated key numbers, technical scroll area for lists, warning-row support, affected-cell highlight support, source/fix action buttons (later). All values computed from graph selectors only — never duplicated/local state.

## Future widgets
- Total Area
- Area Left
- FAR
- Ground Coverage
- Public/Private Ratio
- Service Ratio
- Floor Totals
- Category Totals
- Missing Data
- Bylaw Warnings
- Selected Space Inspector

## Rules
- No duplicate stat data — one source of truth via selectors (defined in V4.5B).
- No boring generic card dashboard.
- Widgets float over canvas; positions are stored separately from graph data (UI-only state, not persisted into the graph model).
- Graph selectors provide all displayed numbers; widgets are pure presentation.

## Dark scan + Superpower widget behavior
- Compact metric panels (Superpower-style): rounded modular cards, soft blurred gradient fill, big key number + small trend/delta line, matching the reference's biomarker-card layout.
- Warning chips (dark-scan-style): small floating pill/chip (e.g. "Reduced Density", "High Risk") anchored near the affected cell, muted yellow/red accent only.
- Animated key numbers per [V4_5_METRIC_TEXT_ANIMATION.md](V4_5_METRIC_TEXT_ANIMATION.md).
- Affected-cell highlight (later phase): selecting a warning chip highlights its source cell on canvas — deferred, not built this phase.
- Widgets float over the canvas (dark-scan/Superpower pattern), never collapse into a docked dashboard page.

Not implemented this phase — spec only, informs V4.5B selector design and later widget build.
