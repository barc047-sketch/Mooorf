# Current Project State

**Last updated:** 2026-07-21

**Repository:** `barc047-sketch/Mooorf`

## Git truth

| Classification | Current truth |
|---|---|
| OFFICIAL PRODUCT LINEAGE | `main` contains the complete approved C0-M2 and PF1A–PF1D.3 lineage. |
| PRODUCT INTEGRATION COMMIT | `342022a64638aa143245ae763a88edee6eeec1fc` |
| C0-M2 INCLUDED COMMIT | `a537102f9a9b71d0397266b7a22daef20e49282d` is an ancestor of the product integration commit; it was not merged separately. |
| OWNER APPROVED | C0-M2 Correction 1 and PF1D.3 Owner QA passed. |
| ACTIVE FINALIZATION BRANCH | `work/next-feature`, based on `2c81c00fb4ef19acbb911acdd9ac402814ecb1da`. |
| FABLE RUN 1 | Four preserved commits from `0fd5658fc498c890683298a6d073cd9e5f5d8ae8` through `52293c4dff1fc9be05561935337e9846da1d4ce6`. |
| SOL PRODUCT COMMIT | `e18b2dd5b23a0610a570f9c5322630534cf379d6` |
| CORRECTION 2 PRODUCT COMMITS | `199eda0afaa1f10cce43de57ebeca3466611f22a`, `96ac4e38303d79bd1e9e84b4f97c16a2729819b5`, `b4e7a3ec04c8a6e14625cd241cbba23dc32e5a67`, `61fcb9d313b91d486d2287156d77e84eb972658a` |
| CORRECTION 3 PRODUCT COMMIT | `48611c285dac6c11583ba8df251da01237e561b0` |
| FINAL ICON PRODUCT COMMIT | `378301fe80b478f2ae5b9411a328efc2cbe52f97` |
| STATUS | ORGANISM CELL LABELS & CALLOUTS: COMPLETE / OWNER QA PASSED — READY FOR EXPLICIT MERGE. |
| NEXT AUTHORITY | Explicit Owner-authorized merge to `main`; Connections is planned next in a separate chat after merge. |
| BACKUP BRANCHES | Existing feature branches remain historical backup refs and are not active work. |

## Integrated product state

### C0-M2

- one Inspector with `Content | Appearance | Symbol`;
- 133 production symbols;
- Cell and Void symbol support;
- Auto Contrast and Custom tint;
- corrected arrangement and batch Add;
- complete current appearance controls and runtime power gates;
- central persistence, history and export ownership.

### PF1A–PF1D.3

- Canvas/runtime performance work;
- lazy Table workspace;
- Organism pause during Table;
- bounded 500-row virtualization;
- 35/65 workspace and 70/30 Upload/Download cards;
- full-width Search;
- CSV, XLS and XLSX upload;
- multirow review with validation and diagnostics;
- Add and Replace;
- XLSX template with `SPACES` and `README`;
- synchronized Canvas/Table/store data.

### Organism Cell Labels & Callouts — COMPLETE / OWNER QA PASSED

- Organism remains the sole production renderer; Classic remains compile-only legacy code.
- twelve production Cell Label layouts share one contract, preset registry and pure resolved projection: the original nine plus Dual Ring, Ring + Core and Technical Orbit.
- Ring retains the `ring` layout identity at every zoom; primary and secondary curved arcs support canonical Body content, bounded fitting/degradation, readable flip and an explicit user-controlled hide threshold.
- shared runtime inside-text fitting keeps fitted inside layouts within the configured Cell occupancy without authored-setting, store or history writes while zooming.
- Flag remains presentation-only and deterministic, with advanced placement, leader, panel and content controls; it never creates a Relationship.
- the compact Inspector and WidgetHost-based Label Studio edit the same Project Default, sparse local override and Mixed-state label owner.
- Display reuses the canonical camera and label-fit settings; camera shake is runtime-only and excluded from persistence, exports and camera history.
- Correction 3 adds direct Dock launchers for Label Studio and Membrane Detail through the existing `openWidget` lifecycle; the generic Membrane Detail launcher is suppressed when it would duplicate the dedicated control.
- selected-state camera shake now remains a bounded deterministic presentation signal while a Cell is selected, and its authored settle duration applies only after deselection.
- Membrane zoom preferences change sampling/detail only: camera zoom preserves authored geometry, fusion, reach and Cell-to-Membrane proportions.
- project files, Saved Views where applicable, migration and authored-history paths retain the correction settings; PNG, PDF and presentation ZIP use the shared detached Organism label projection.
- final Label Studio launcher correction uses the approved Lucide `MessageSquareText` callout icon at the existing Dock sizing/stroke; no dependency or asset-registry changes.

## Verification disposition

Correction 2 passed its focused correction contracts, `npx tsc -b --pretty false`, the final diff check, and exactly one production build. Codex browser checks were recorded at 1440×900 and 1280×800; Owner visual/interaction QA remains the active gate. The baseline Owner-QA failures were recorded before repair: Flag lost stable callout behaviour, Ring changed identity at low zoom, inside text overflowed, Membrane distorted across zoom, and the compact Inspector/Display lacked the requested controls.

Correction 3 passed focused Dock/widget and camera-shake contracts, TypeScript, final diff checks and one production build. Codex browser checks at 1440×900 and 1280×800 confirmed direct launchers, one Membrane Detail button when its family is active, persistent Soft selected-state feedback beyond ten seconds, bounded drag feedback, deselection settling and Off zero; no browser console errors were recorded.

Classic visual output and SVG were not audited or developed. Codex did not complete manual drag, reduced-motion/Table-shake, or downloaded-artifact comparison QA for this correction.

## Current gate

READY FOR EXPLICIT MERGE. No merge has occurred; Connections is NOT STARTED and must begin in a separate chat after merge.
