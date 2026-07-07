# Animation and Loading Spec

## Loading Screen

Required:

```text
full-screen overlay
corner countdown number
red timer/link text
colorful gradient mass covering around 30% of screen
smooth reveal into canvas
```

## Suggested layout

Top-left:
- tiny `zonuert`
- maybe `spatial graph studio`

Top-right or bottom-left:
- gradient mass, 30% viewport
- liquid blur
- subtle noise
- animated morphing

Bottom-right:
- red countdown: `000 → 100`
- link-like text: `enter canvas`
- status line: `loading spatial graph`

## Visual style

- expensive
- minimal
- editorial
- cinematic
- not gaming
- not childish rainbow

## Animation sequence

1. Fade in cream/black base.
2. Gradient mass blooms into corner.
3. Countdown starts.
4. Micro status text changes:
   - loading graph
   - preparing cells
   - building canvas
   - ready
5. Cells faintly appear behind/after loader.
6. Loader clips/fades away.
7. Canvas cells stagger in.
8. Bottom dock slides/fades up.
9. Left rail slides/fades in.
10. User can interact.

## Libraries

Use:
- GSAP for loader timeline
- Motion for React UI transitions
- Canvas/Pixi rAF for cell movement

## Required UI animations

- dock hover
- button press
- mode switch
- table transition
- cell select
- drag lift/drop
- add cells stagger
- day/night crossfade
- blob settle
- import success toast

## Reduced motion

If easy:
- skip long loader
- fade instead of morph
- no infinite gradient motion
