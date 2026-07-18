# Active Task

## WAITING OWNER QA — Organism Cell Label finalization

**Status:** FINALIZED / NOT MERGED / WAITING OWNER QA

**Branch:** `work/next-feature`

**Remote base:** `2c81c00fb4ef19acbb911acdd9ac402814ecb1da`

**Preserved Fable head:** `52293c4dff1fc9be05561935337e9846da1d4ce6`

**Sol product commit:** `e18b2dd5b23a0610a570f9c5322630534cf379d6`

Completed scope:

- nine Organism Cell Label layouts finalized through one shared projection;
- deterministic Ring fitting, readable flip, ellipsis and fallback;
- deterministic Flag placement, bounded geometry and presentation-only semantics;
- single Inspector with Project Default, sparse Local Override and Mixed state;
- project/save/load/Saved View/history contracts retained;
- Organism PNG/PDF/presentation ZIP parity through the shared Canvas2D label adapter;
- CSV/JSON retained and Organism SVG explicitly excluded;
- persistent Organism mounting and Table pause/resume ownership retained.

Verification passed:

- ordered focused label, migration/history, Inspector, Organism renderer and Organism export suites;
- `npx tsc -b --pretty false`;
- browser QA at 1440×900 and 1280×800;
- real PNG, PDF, presentation ZIP, CSV, JSON and `.mooorf` round-trip artifacts;
- practical 20/51/101/251/501 authored-space probes with 96 rendered nuclei;
- exactly one `npm run build`.

## Next safe action

Owner QA of the finalized Organism-only branch.

Do not merge, modify `main`, start a later feature phase, delete backup branches or modify AG3 without a separate explicit Owner command.
