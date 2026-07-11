# V4.5A — Glass / Shader Tokens (spec only)

Not wired into `src/styles/tokens.css` yet — this defines the intended token set for the V4.5B/V5 UI build to consume. Reconcile with existing tokens per [DECISIONS.md](DECISIONS.md) at implementation time.

## Core tone tokens
cream canvas · white surface · soft grey surface · fog border · graphite text · near-black night · deep black · wine red · oxblood · muted rose · steel grey · warning yellow · danger red · muted success green (only if truly necessary)

## Suggested CSS token names
```
--z-canvas-cream
--z-surface-white
--z-surface-soft
--z-fog-border
--z-graphite
--z-night
--z-night-grid
--z-wine
--z-oxblood
--z-warning
--z-danger
--z-glass-bg
--z-glass-border
--z-grid-dot
--z-grid-line
--selection-keyline-neutral
--z-metric-gradient-a
--z-metric-gradient-b
```

## Superpower-style grey/white glass metric palette
- Metric card surfaces: `--z-surface-white` / `--z-surface-soft` with soft blurred gradient fills restricted to the metric's own background (e.g. score cards), never the page chrome.
- Grey/white/black premium tone — no colorful chrome outside metric fills.

## Dark scan high-contrast night palette
- Night mode gets a high-contrast black/grey variant alongside Graph Noir Red: `--z-night` (near-black) / `--z-deep-black` for true-black panels, `--z-night-grid` for dotted background dots.
- Warning chips use `--z-warning` (muted yellow) fill on a translucent dark chip background; danger/critical uses `--z-danger`.
- New token: `--z-warning-muted` for the dark-scan-style muted yellow warning chip (distinct from full-saturation `--z-warning` used on light surfaces).

## Dotted-grid token notes
- `--z-grid-dot` / `--z-grid-line` (already defined above) drive the canvas dotted/line background — see [V4_5_CANVAS_GRID_AND_SCALE_SYSTEM.md](V4_5_CANVAS_GRID_AND_SCALE_SYSTEM.md).
- Day mode: soft fog grey dot. Night mode: low-contrast graphite dot (dark-scan reference), never brighter than UI chrome.

## Gradient rules
- Gradients only inside: metric widgets, active-tool states, warning states, organism category blend.
- No random colorful UI outside those contexts.
- Grayscale first everywhere else.
- Red = identity/action/warning accent only.
- Muted yellow = warning only.
- Floating widgets use soft blurred glass panels, not heavy blur stacking.
- Prefer CSS `radial-gradient`/`conic-gradient` before any custom shader.
- ShaderGradient (or similar) only if a future animation need justifies the extra dependency weight — not by default.
