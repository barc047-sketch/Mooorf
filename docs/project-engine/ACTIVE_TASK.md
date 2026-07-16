# Active Task

## PF1C Correction 5 — Restore Theme Background, Restore Membrane and Fix Quick Controls Position

**Status:** NOT STARTED / WAITING IMPLEMENTATION

**Branch:** `feature/pf1c-auto-performance-governor`

**Base:** `5b3a34a630da30eb60ede6f4e82095e0985f72ca`

## Goal

Repair the three Owner-visible PF1C regressions without changing authored product data, renderer architecture, performance ownership, or unrelated controls.

## Observed defects

1. Day and Night both show an always-black Canvas background instead of the canonical theme background.
2. The authored Organism Membrane is invisible.
3. Quick Controls move when Inspector state changes instead of staying fixed at the shared top-right shell anchor.

## Likely task owners

Read these first and write only the minimum confirmed set:

- `src/canvas/OrganismCanvasView.tsx` — Membrane invalidation/presentation and theme transitions.
- `src/experiments/organism-lab/organism-shader.ts` — transparent Membrane target, framebuffer presentation, and alpha output.
- `src/canvas/organismCanvas.css` — canonical theme background beneath the transparent Organism surface.
- `src/ui/QuickToggleBar.tsx` — the single Quick Controls mount and state independence.
- `src/ui/quickToggleBar.css` — fixed top-right geometry.
- `src/runtime/pf1cContracts.test.ts` — focused regression contracts.

Supporting read-only evidence when necessary: `src/App.tsx`, `src/styles/tokens.css`, `src/ui/shell.css`, `src/canvas/presentationLayers.ts`, and `src/runtime/performanceProfiles.ts`.

## Budgets

- Maximum targeted source reads: 12 files.
- Maximum production writes: 6 files.
- One focused test file may be among those six writes.
- No broad repository scan.

## Forbidden areas

- No store, schema, persistence, history, Master Graph, import, export-format, Arrangement V2, Classic renderer, widget-registry, or package changes.
- No new renderer, Canvas, theme system, Membrane state owner, Quick Controls surface, breakpoint, or Inspector coupling.
- Do not implement Magnet/snapping; it remains disabled until M3C.
- Do not rewrite PF1C Corrections 1–4 or alter authored performance settings.
- Do not build, commit, push, merge, or run broad browser automation during implementation unless the Owner separately authorizes finalization.

## Focused automated checks

- Run the PF1C focused contract file only.
- Run the existing PF1B runtime-status contract only if Runtime Status ownership is touched.
- Run the relevant TypeScript no-emit/app typecheck command already used by the repository.
- Run `git diff --check` for the written files.
- Confirm the diff contains no store/schema/export/Classic/product-data changes.

Expected contract coverage:

- Day and Night resolve to the canonical `--bg` surface beneath a transparent Organism Canvas.
- Membrane ON renders a non-zero visible surface; Membrane OFF clears it without recreating the renderer.
- Theme or selection invalidation preserves/presents the last completed frame correctly.
- Quick Controls remain fixed to the shared top/right tokens and contain no Inspector-state selector or right-position transition.

## Owner visual QA checklist

At both 1440px desktop and 1280px laptop:

- Day shows the intended light Canvas background.
- Night shows the intended dark Canvas background.
- Switching Day/Night does not flash or settle to black incorrectly.
- Membrane ON is visible and preserves authored colour/opacity.
- Membrane OFF clears only the Membrane surface; Cells, overlays, labels, selection, and controls remain visible.
- Preview-quality changes do not make the Membrane disappear.
- Opening, moving, minimizing, restoring, and closing Inspector never moves Quick Controls.
- Quick Controls remain accessible and do not collide with the top shell.
- No new console error appears.

## Completion condition

Implementation is ready for Owner review only when focused contracts and typecheck pass, the diff stays within the six-file cap and forbidden-area rules, a live preview URL is provided, limitations are stated, and the Owner receives the visual QA checklist. Finalization begins only after explicit Owner PASS.

## Task closing section

Replace the placeholders below when this task closes; do not append a second history narrative.

- Result: —
- Root cause: —
- Changed files: —
- Focused checks: —
- Preview: —
- Owner QA: —
- Limitations: —
- Commit/push: —
- Next task: —
