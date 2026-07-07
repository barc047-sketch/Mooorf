# Bugs

Known risk areas:
- loader over-animation slowing first paint
- blob field lag at 50+ cells — measured OK in 6A (60 cells @ 61 fps worst-case per-frame rebuild); re-test if grid caps change
- fullscreen DPR causing lag
- view switch resetting if store is local component state
- CSV duplicate IDs
- too many animation libs used at once

Fixed:
- canvas-only controls no longer float over table view; rail, dock, zoom cluster, and HUD mount only when view = canvas
- over-inflated blob/global black island — inverse-square field replaced by tight 8–12% circle envelopes and pairwise 0–20% edge-gap metaball necks

Open (minor, deferred):
- main js chunk warning remains deferred; latest V6F.0D build reported 596.32 kB (>500 kB) after Base UI select/table joined the bundle — code-split later, not urgent
- favicon 404 has been observed as non-breaking
- V6F.1 production organism canvas is not implemented yet
- old/new canvas integration can affect camera, labels, and fallback behavior
- WebGL lifecycle risks: context loss, DPR, resize, cleanup, and fallback
- table sync must be rechecked after V6F.1
- mobile dock/label/right-panel layout remains a risk
