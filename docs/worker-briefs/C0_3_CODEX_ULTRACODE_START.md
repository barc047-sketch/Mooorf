# C0.3 Codex Ultracode Start Brief

CODER: Codex
MODEL: GPT-5.6 Ultracode
EFFORT: Very High
EFFORT REASON: This is the deepest production architecture pass for icon registry, inspector state, history, persistence, export, security and performance boundaries.
ROLE: Production architecture and implementation-readiness lead
WHY THIS MODEL: Use the remaining Ultracode allocation on high-value systems reasoning rather than visual prototyping or routine implementation.
PARALLEL AGENT: Antigravity audits assets; Claude prototypes the Inspector. Remain read-only and do not touch their branches or files.

## Start command

Execute the full task in:

`docs/worker-briefs/C0_3_GPT56_ULTRACODE_ICON_INSPECTOR_ARCHITECTURE.md`

This start brief overrides the outdated pre-merge source-state lines in that file.

## Verified source

- Repository: `/Users/tanisxq/Documents/ZONU0`
- Required source: `origin/main`
- Exact required SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`
- Artifact root: `/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS`

Fetch remotes and stop if `origin/main` differs from the exact SHA.

## Status before work

Follow:

`docs/worker-briefs/WORKER_STATUS_UPDATE_PROTOCOL.md`

Publish before starting:

- branch: `status/codex`
- file: `worker-status/CODEX.json`
- worker: `Codex`
- model: `GPT-5.6 Ultracode`
- status: `RUNNING`
- task: `C0.2/C0.3 production architecture`
- source SHA: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`

## Plain-language scope

Design the exact production contract for icons and the future Inspector:

- icon data model and canonical ownership,
- project defaults versus Cell-level overrides,
- one primary icon per Cell initially with future extensibility,
- multi-selection apply as one Undo transaction,
- hover preview that does not mutate saved state,
- keyboard `I`, Escape and accessibility behavior,
- renderer stacking and screen/world scaling rules,
- white/auto-contrast backing behavior,
- persistence, migration, import/export and snapshot behavior,
- SVG/PNG safety and validation,
- performance boundaries for dense projects,
- test-first implementation sequence for later Codex implementation.

Do not implement product code, build visible UI, alter main, create a competing store, or duplicate Antigravity/Claude work.

## Required outputs

Write read-only architecture artifacts to `/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS` and include:

- exact data/state contract,
- ownership map,
- command/history contract,
- renderer/export/migration/security contracts,
- test matrix,
- implementation slices ordered by dependency,
- conflicts or decisions requiring Owner approval.

Update `status/codex` at checkpoints and end at `WAITING_REVIEW` or `DONE` with exact artifact paths.

PONYTAIL:
- reused: Master Graph, resource registry, history, command and export systems
- adapted: icon-specific contracts only
- new files justified: external architecture artifacts and status telemetry
- duplication avoided: no parallel store, renderer or UI implementation