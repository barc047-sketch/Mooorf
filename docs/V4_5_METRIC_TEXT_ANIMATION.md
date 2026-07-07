# V4.5A — Metric Text Animation (spec only)

## Animated values (future)
Total area, area left, FAR, floor totals, category totals, public/private ratio, warning count, selected cell area.

Key numbers (Superpower/dark-scan reference — bigger treatment, animate on change): total area, area left, selected cell area, FAR, warnings count.

## Rules
- Numbers animate smoothly when underlying graph data changes (value tween, not instant jump).
- Use Motion / GSAP / React Bits / shadcn text-animation resources first — no from-scratch counter engine.
- No "casino counter" slot-machine spam — restrained, premium easing only.
- Compact technical typography; only key numbers are enlarged.
- Must respect `prefers-reduced-motion` (instant value, no tween) — matches the Loader's existing reduced-motion pattern.
- All animated values are computed from graph selectors only, never local/duplicated state.

Not implemented this phase — spec only, informs floating-widget build in a later phase.
