# Acceptance Tests

## Loader
- [x] Full-screen loader exists. (fixed inset 0, z-100, token bg)
- [x] Countdown appears in a corner. (bottom-right, 000→100)
- [x] Countdown/timer text is red. (verified computed rgb(195,22,22) = --zonuert-red)
- [x] Colorful animated gradient covers around 30% of screen. (58vw×54vh ≈ 31% + blur bleed)
- [x] Loader exits smoothly. (clip-path wipe, verified unmount)
- [x] Canvas reveals smoothly. (stage revealed under wipe; cell stagger lands in Phase 3)

## Visual
- [x] Day mode resembles Palmer-style gallery canvas. (cream #f5f6ee verified; cells land P3)
- [x] Night mode uses Graph Noir Red. (#070707 + red accents verified)
- [ ] Cells feel like editorial floating objects. (P3)
- [x] Bottom dock exists. (glass, Motion entrance)
- [x] Left rail exists. (theme/blob/fit)
- [x] Top-center view toggle exists. (layout-animated thumb)
- [x] Bottom-right zoom exists. (buttons wire P4)
- [x] UI is not generic SaaS. (hairline glass pills, editorial type, edge-only controls)

## Interaction
- [ ] Pan works.
- [ ] Zoom works.
- [ ] Drag works.
- [ ] Add cell works.
- [ ] Add 10 demo cells works.
- [ ] Merge distance affects blob.
- [ ] Day/night toggle works.
- [ ] Export PNG works or is documented if deferred.

## Sync
- [ ] Table and canvas use same store.
- [ ] Table edit updates canvas.
- [ ] Canvas drag persists.
- [ ] Switching views does not reset.
- [ ] CSV import updates both.

## Performance
- [ ] 20 cells smooth.
- [ ] 50 cells acceptable.
- [ ] Adding demo cells does not freeze.

## Build
- [ ] npm run build passes.
- [ ] HANDOFF.md updated.
