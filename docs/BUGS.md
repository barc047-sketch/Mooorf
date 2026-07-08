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
- V6G: production organism labels lagged/snapped during live pan/zoom because the shader used a live camera ref while the overlay used committed store camera; labels now sync from the render-loop camera without per-frame React state
- V6G: 390 px mobile dock overflowed slightly; narrow-viewport dock spacing and control widths now keep `ORG`/`CLS` reachable
- V6H: wider production dock crowded the bottom-left HUD at 390 px; narrow-viewport CSS now lifts the HUD above the dock while keeping zoom controls separate

Open (minor, deferred):
- main js chunk warning remains deferred; latest V6H build reported 616.09 kB (>500 kB) after production dock UI — code-split later, not urgent
- favicon 404 has been observed as non-breaking
- high-density labels are crowded at 60+ spaces; label-density/inspector design is deferred to the production UI phase, not a stabilization blocker
- forced WebGL context-loss simulation was not run in V6G; shared renderer context lost/restored handlers were inspected and organism/classic unmount/remount was verified
