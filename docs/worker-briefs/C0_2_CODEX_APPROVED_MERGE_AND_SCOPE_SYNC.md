# Codex Brief — C0.2 Approved Merge and Canonical Scope Sync

WORKER: Codex  
MODEL: Sol / GPT-5 Codex  
TYPE: Narrow verified merge and documentation sync  
OWNER AUTHORITY: Approved after manual Cell Inspector audit and prior independent C0.2 Antigravity audit

## Goal

Advance the production baseline safely by:

1. merging the already audited C0.2 Icon/Grid Registry into `main`,
2. syncing only the newly approved canonical roadmap/change-control/Annotation Card documents into `main`,
3. verifying tests and one final production build,
4. leaving C0.4 and Annotation Card implementation unstarted.

## Verified source state

Repository:

`/Users/tanisxq/Documents/ZONU0`

Current production main:

- branch: `origin/main`
- exact SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`

C0.2 audited feature:

- branch: `origin/feature/c0-2-icon-grid-asset-registry`
- exact head: `028c90541481b07a185e768fae921a7108a4e5d2`
- independent audit verdict: `MERGE CANDIDATE`

Approved canonical documentation commits from:

`origin/docs/mooorf-ai-team-operating-protocol`

Cherry-pick only these exact commits, in this order:

1. `b657652e19782bd9fc716a92e63cd8adb30b92d6` — canonical phase roadmap
2. `366f738be8e8b7b7d10871730a8b719bacd0631f` — change-control protocol
3. `f5ce38ee824749d0fa32d5408599b141d6bb5c44` — Annotation Card and Cell Label Layout scope
4. `a037ae1fb4e8cbb1b05af7ffc4e49dcf04489a55` — roadmap amendment removing Linked Callout
5. `db0500eaa22ffdd8b1bb48f51be6f5e9882423df` — Project Memory Index entries

Do not cherry-pick worker-brief-only or status commits.

## Status protocol

Before work, publish:

- branch: `status/codex`
- file: `worker-status/CODEX.json`
- status: `RUNNING`
- task: `C0.2 approved merge and canonical scope sync`
- source SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`
- work branch: `main`

Update at source verification, after C0.2 integration, after documentation sync, before final build and after push.

## Safety

- `git fetch --all --prune` first.
- Stop if `origin/main` is not the exact expected SHA.
- Use an isolated integration worktree; do not modify the primary checkout.
- Preserve `.claude/launch.json`.
- Preserve local-only `.references/`.
- Never force-push.
- Do not rebase shared branches.
- Do not modify prototype branches.
- Do not include status branches in main.
- Do not add packages.
- Do not implement C0.4, C0.5, Annotation Card, Cell Label Layout, Flag, or any UI.

## Integration method

Create an isolated worktree from exact `origin/main`.

Integrate the C0.2 feature commit using the least risky exact-history method:

- preferred: cherry-pick exact commit `028c90541481b07a185e768fae921a7108a4e5d2`,
- acceptable: fast-forward/merge only if Git proves the same single audited diff with no extra commits.

Then cherry-pick only the five approved documentation commits listed above.

No unrelated cleanup.

## Required verification

### Structural verification

Confirm:

- 77 verified drawable symbols,
- UI command icons remain separate,
- eight canonical grid entries,
- six legacy icon aliases canonicalize,
- unknown IDs remain recoverable,
- persistence stores IDs rather than registry objects,
- no Canvas runtime, shader, package or store-schema regression.

### Tests

Run the focused C0.2 contracts documented in:

`docs/C0_2_ICON_GRID_REGISTRY_IMPLEMENTATION_REPORT.md`

Also run any directly affected resource/persistence tests required by the final integrated tree.

### Build

Run exactly one final production build after all cherry-picks.

The known unchanged Vite chunk warning is acceptable. Any new error or materially worse warning is a blocker.

### Diff hygiene

Run:

- `git diff --check`,
- final history review from old main to new main,
- verify no prototype files or status metadata entered main.

## Documentation truth

The approved roadmap amendment must state:

- Cell Inspector prototype approved with production adjustments,
- Linked Callout removed,
- Annotation Card is standalone,
- C0.4 layer separation remains before C0.5 production Inspector,
- Annotation Card implementation remains later at C0.13A,
- Area edits must resize Cells in production,
- table projections remain central-state views.

Do not mark C0.4, C0.5 or Annotation Card implemented.

## Completion

After successful verification:

- push the integrated commit history to `origin/main`,
- do not create a PR unless direct push is blocked,
- publish final `status/codex` as `DONE`.

Final response begins with the required worker status block and includes:

- old main SHA,
- new main SHA,
- C0.2 commit integrated,
- exact documentation commits integrated,
- tests,
- one final build,
- diff check,
- package changes,
- confirmation prototype/status branches were excluded,
- next recommended phase: C0.4 architecture audit/implementation planning.

PONYTAIL:

- reused: exact audited C0.2 commit and approved documentation commits
- adapted: none
- new code: none beyond audited C0.2
- duplication avoided: no new registries, stores, renderers or UI systems
