# Current Project State

**Last updated:** 2026-07-16

**Repository:** `barc047-sketch/Mooorf`

**Worktree:** `/Users/tanisxq/Documents/ZONU0`

## Git truth

| Classification | Current truth |
|---|---|
| COMMITTED | `HEAD` is `5b3a34a630da30eb60ede6f4e82095e0985f72ca` on `feature/pf1c-auto-performance-governor`. This commit is PF1B Runtime Status. |
| PUSHED | `origin/feature/pf1b-global-runtime-status` is `5b3a34a630da30eb60ede6f4e82095e0985f72ca`. `origin/feature/arrangement-v2-foundation` is `adaff5acef5602f231b663fcb2e0037451acb788`. |
| REMOTE MAIN | `origin/main` is `bd160b8c615cdafbbdd8a76332be46b69a6e765e`. No merge is authorized by this state record. |
| LOCAL UNCOMMITTED | PF1C Corrections 1–4 are implemented in the working tree but are not product-committed or pushed. There are 35 modified/untracked `src/` files. |
| OWNER APPROVED | The Project Engine docs-only bootstrap was approved with `GO CODEX`. This does not authorize PF1C Correction 5 implementation or any merge. |
| WAITING OWNER QA | PF1C visual QA cannot resume until Correction 5 is implemented, focused checks pass, and a live preview is handed to the Owner. |
| BLOCKED | PF1C finalization, PF1D, and later dependent milestones are blocked on Correction 5 and subsequent Owner PASS. |

## Active milestone

**PF1C Auto Performance Governor**

- Corrections 1–4: **LOCAL UNCOMMITTED**.
- Correction 5: **NOT STARTED / WAITING IMPLEMENTATION**.
- Current unresolved task: restore the Day/Night Canvas background, restore visible Membrane rendering, and keep Quick Controls fixed when Inspector state changes.
- Do not describe any PF1C product work as pushed until a product commit and remote verification exist.

## Working-tree state

The 35 product-modified files comprise 28 tracked modifications and 7 untracked additions under `src/`.

Tracked PF1C work currently touches the application shell, both Canvas strategies, presentation/shadow/export paths, interaction/store/runtime contracts, Runtime Status, widget controls, and shared styles. New PF1C files are:

- `src/export/backgroundExportContracts.test.ts`
- `src/export/organismExport.ts`
- `src/runtime/performanceGovernor.ts`
- `src/runtime/performanceProfiles.ts`
- `src/runtime/pf1cContracts.test.ts`
- `src/ui/QuickToggleBar.tsx`
- `src/ui/quickToggleBar.css`

All PF1C product changes must remain local and uncommitted during Project Engine work.

## Completed and integration state

| Milestone | Product state | Git/integration state |
|---|---|---|
| M1 Inspector recovery | COMPLETE | Present in history/main lineage; no new merge authority. |
| M2 Advanced Inspector/Symbol runtime gates | COMPLETE | Pushed at `a410b894338f8e2a8cdb29dc070b7c911de6cc05`; unmerged as an independent feature branch. |
| PF1A Static Organism runtime | COMPLETE | Included at pushed `a410b894338f8e2a8cdb29dc070b7c911de6cc05`; no merge authority. |
| Arrangement V2 foundation | COMPLETE | Pushed at `adaff5acef5602f231b663fcb2e0037451acb788`; unmerged as an independent feature branch. |
| PF1B Global Runtime Status | COMPLETE | Pushed at `5b3a34a630da30eb60ede6f4e82095e0985f72ca`; current committed base. |
| PF1C Auto Performance Governor | LOCAL | Corrections 1–4 are uncommitted; Correction 5 remains unresolved. |

`PUSHED` never means `MERGED`. No feature listed here has merge authority merely because its commit exists remotely.

## Current regressions

- **BUG-001:** Day/Night Canvas background is always black.
- **BUG-002:** Membrane is invisible.
- **BUG-003:** Quick Controls shift when Inspector state changes.

See `LEDGER.md` for durable issue IDs and `ACTIVE_TASK.md` for the bounded correction.

## Next required action

After this docs-only Project Engine commit is pushed, prepare a bounded implementation start for **PF1C Correction 5 — Restore Theme Background, Restore Membrane and Fix Quick Controls Position**. Implementation requires a separate explicit Owner GO command. Do not merge or finalize PF1C first.
