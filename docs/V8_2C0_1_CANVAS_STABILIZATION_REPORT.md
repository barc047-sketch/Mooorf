# V8.2C0.1 Canvas Stabilization Report

Date: 2026-07-13

Branch: `feature/v8-2c0-1-canvas-stabilization`

Foundation: `c141ed79da5674248cc71b9602effcb6293c883f`

## Outcome

- Production exposes one Canvas. `App.tsx` mounts exactly one renderer strategy;
  WebGL remains normal and Classic remains an automatic internal fallback.
- Both renderer strategies now use the shared demand loop. Motion Off sleeps;
  invalidation wakes one bounded frame sequence; Motion On owns one continuous
  scheduler.
- Ordinary UI no longer exposes ORG, CLS, renderer names, or a renderer switch.
- Inline Name/Area editing commits through the existing graph store and the
  existing transform history stack as one edit transaction.
- Morph is still the canonical `settings.blobOn` switch and visibly adds or
  removes the Membrane. Motion remains store-owned organism motion data.
- Organism and Classic use the same primary, secondary, and hover selection
  language. Bottom controls no longer magnify, shift, or bounce.

## Proven root causes and corrections

| Area | Before | Correction |
| --- | --- | --- |
| frame lifecycle | Classic and Organism maintained permanent rAF chains | adapted `frameScheduler` to sleep while idle and wake on invalidation |
| Organism cost | motion advance, adapter mapping, range/palette/field resolution, label traversal and uniforms ran before the dirty exit | dependency caches moved stable work off idle frames; label projection and uniforms run only on an actual frame |
| pointer hover | raw hover could rebuild nuclei outside the frame scheduler | hover uses the existing coalesced frame scheduler and last rendered nuclei |
| editing | parent outside-pointer close could unmount before commit; Name was focused but not selected; edits had no Undo record | editor owns commit/cancel isolation, selects Name, and records one edit in existing Undo/Redo history |
| selection | animated inner MovingBorder read as Cell/Core/debug geometry | one fixed external keyline: solid primary, dashed secondary, subtle unselected hover |
| bottom controls | proximity MotionValues and CSS scale/lift altered geometry | stable dimensions with tint/keyline/signal-dot feedback only |

## Runtime ownership

- Pointer, wheel, camera, selection projection, labels, and capture are owned by
  the currently mounted renderer only.
- Inactive fallback has no DOM, listeners, ResizeObserver, subscription, label
  traversal, capture provider, or rAF.
- Movement preview remains ephemeral; pointer-up performs the canonical commit.
  History is absent during pointermove and zero movement creates no transaction.
- Stable Organism data cached by dependency: area range, Cell colour map, style,
  palette, effective field, shadow parameters, and selected-ID Set.
- Morph Off skips the Membrane shader branch. Shadow Off skips shadow work.

## Performance evidence

Exact-size system Chrome was instrumented with a requestAnimationFrame counter.
Each state used one mounted Canvas, Motion Off, labels visible, Cell Shadow Off,
and settled before the one-second idle sample.

| Cells | Label anchors | plain idle rAF | widget-open idle rAF | Morph-On idle rAF | mounted Canvases |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | 0 | 0 | 0 | 1 |
| 10 | 10 | 0 | 0 | 0 | 1 |
| 15 | 15 | 0 | 0 | 0 | 1 |
| 30 | 30 | 0 | 0 | 0 | 1 |
| 42 | 42 | 0 | 0 | 0 | 1 |

The foreground in-app browser separately measured Motion Off at 0 callbacks/s
and Motion On at 20 callbacks/s. That browser throttles background animation,
so this is lifecycle evidence, not an absolute FPS claim. Visual Motion was
also checked live; it did not mutate graph positions and stopped immediately
when disabled.

Pan, wheel zoom, single drag, and a 10-Cell group drag use the inherited
coalesced one-update-per-frame contract. Group offsets remain invariant and one
Undo/Redo transaction restores the group.

## Editing and visual evidence

- Body double-click opened the shared editor; label/body activation share the
  same cell-activation contract.
- Name opened focused with the complete prior text selected.
- Tab moved Name to Area in exact-size Chrome; Shift+Tab remains native.
- Enter committed `Studio` / `48 m²`; Cmd/Ctrl+Z restored `New Space` / `20 m²`;
  Shift+Cmd/Ctrl+Z restored the edit once.
- Escape cancelled; outside-pointer commit and invalid-Area normalization remain
  in the shared editor contract.
- Morph Off/On, Motion On, primary selection, secondary selection, 30/42 Cells,
  and 1280 editing are captured in the external screenshot directory.

## Compatibility

- Legacy `rendererMode` remains readable for migration and fallback.
- Auto Contrast, label scale modes, materials, resource registries, icons,
  grids, saved views, project intake, snapshots, and central graph ownership are
  unchanged.
- PNG/PDF capture still uses the active Canvas. SVG now always uses the existing
  internal Classic vector adapter for Cells and labels; Membrane remains
  raster-only and is never mislabeled as vector.
- No shortcut `I` was added or consumed.

## Focused verification

- Passed: V8.2C0.1 stabilization, V8.2C0, inline editing, group drag,
  Auto Contrast, context/radial, resources, icons, grids, materials,
  import/export/SVG, and widget lifecycle contracts.
- `npm run audit:summary`: completed; its retained dependency report contains
  four pre-existing review violations and no dead-code finding. The summary's
  underlying audit inputs predate this branch, so it is not presented as a
  fresh dependency audit.
- `git diff --check`: passed.
- Single production build: passed in 7.16 s. Main entry changed from
  917.63 kB to 914.68 kB (-2.95 kB); gzip is 297.55 kB. The existing Vite
  chunk-size warning remains; no new warning appeared.

## Limitations

- Exact-size headless Chrome throttles background animation; no absolute FPS or
  GPU-timing claim is made. Foreground lifecycle and visual Motion were checked
  separately.
- The early six-Cell CDP delta sample was invalid after a metric reset and was
  discarded rather than reported. The final required 1/10/15/30/42 matrix is
  exact.
- Forced WebGL context loss was not executed; the automatic fallback path and
  unmount ownership were covered by source and contract checks.
- Post-fix pan, zoom, single drag, 10-Cell group drag, Void selection, radial,
  and hover transitions were contract-verified but not exhaustively repeated
  as manual visual QA after the user's fast-execution update.

## PONYTAIL

- Reused: existing frame scheduler, group drag, camera, selection store,
  Organism renderer, Classic fallback, inline editor, contrast/label resolvers,
  history, migration, export capture, and resource settings.
- Adapted: frame lifecycle, Organism derived-data cache, editor commit history,
  selection projection, Dock feedback, internal SVG adapter routing.
- New files justified: one focused stabilization contract test, this evidence
  report, and the bounded manual-QA checklist.
- Duplication avoided: no second camera, store, renderer loop, editor, Morph or
  Motion state, resolver, registry, or history system.
