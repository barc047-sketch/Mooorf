# Antigravity Brief — Essential Product Reuse and Dependency Atlas

TASK ID: C0-FAST-TRACK-ATLAS
SESSION: NEW
STATUS: START NOW
WORKER: Antigravity only
MODE: Read-only architecture, reuse and dependency research
PRODUCTION BASE: main@c4600472ea76f651800c19b91cf8f67954ca992e
REPORT BRANCH: research/c0-fast-track-essential-product-atlas

## Purpose

Prepare the exact architecture, provenance, reuse, dependency and verification map needed to move MOOORF rapidly from the current C0.4F-A runtime-layer work through the next essential product milestones without rediscovering the repository, duplicating owners or importing stale prototype assumptions.

This is a parallel research task. Codex remains the only production-code worker. Do not modify product code, Codex branches, main or any existing feature/prototype branch.

## Canonical context

- GitHub is the source of truth.
- Production main is `c4600472ea76f651800c19b91cf8f67954ca992e` at task dispatch.
- Codex owns C0.4F-A production implementation.
- Do not inspect or judge a moving Codex feature head as an audit target. Final C0.4F-A audit is a separate fixed-head task.
- Existing verified icon/grid registry: `feature/c0-2-icon-grid-asset-registry@028c90541481b07a185e768fae921a7108a4e5d2`.
- Existing symbol expansion research: `research/c0-2-symbol-asset-expansion@9aa52779deac12701ba30eed1ff6e919e88091f4`.
- Existing Cell Inspector V2 prototype branch must be discovered and verified live before use; never assume prototype code is production-safe.
- Master Graph / central Zustand store remains the sole architectural data owner.

## Read first

1. `AGENTS.md`
2. `docs/MOOORF_ACCELERATION_MODE_2026_07_15.md` from `docs/mooorf-ai-team-operating-protocol`
3. `docs/MOOORF_CANONICAL_PHASE_ROADMAP.md`
4. `docs/C0_4_ARCHITECTURE_AUDIT_REVIEW.md`
5. `docs/C0_4_SAFE_IMPLEMENTATION_SLICES.md`
6. `docs/FEATURE_MAP.md`
7. `docs/COMPONENT_INVENTORY.md`
8. `docs/HANDOFF.md`
9. `docs/TASK_QUEUE.md`
10. `custom-gpt/state/CURRENT_PROJECT_STATE.json` from `docs/mooorf-ai-team-operating-protocol`
11. Existing C0.3 Cell Inspector prototype brief/report and exact live branch
12. C0.2 icon/grid registry implementation and audit evidence
13. C0.2 symbol expansion report and manifest
14. Existing store, history, import, export, table, floor, statistics, relationship and renderer owners proven through imports/search

Record every additional file and branch read.

## Scope

Build a complete evidence-based atlas for the essential product path after C0.4F-A:

1. C0.4F-B essential editing, history and export parity
2. Production Cell Inspector essentials
3. Canonical Area editing and Cell resizing
4. Table/Canvas synchronization and reliable CSV/Excel import
5. Floor system
6. Derived statistics and compact Dashboard
7. Essential semantic Connections and basic visible lines
8. Reliable project, PNG, SVG and PDF export
9. Dense-scene and Canvas/export hardening

Do not design city packs, AI assistance, accounts, cloud, collaboration, phone/tablet expansion, advanced Membrane motion, advanced connection animation or broad shell redesign.

## Required work

### 1. Live provenance inventory

For every relevant implementation, prototype, report and branch:

- resolve exact branch and head SHA,
- identify its source/base SHA,
- classify it as production main, merged, audited merge candidate, prototype, research-only, stale, abandoned or unknown,
- identify whether it can be reused directly, adapted, selectively ported, reimplemented or rejected,
- flag divergent ancestry and branches that must never be merged,
- do not rely on local worktree names or timestamps without GitHub verification.

### 2. Exact ownership map

Map canonical file/module ownership for:

- Master Graph / Cell data,
- project settings and presentation defaults,
- selection and temporary editing state,
- bounded Undo/Redo transactions,
- Classic renderer,
- Organism/WebGL renderer,
- Cell Inspector / widget primitives,
- Area/radius conversion,
- hit testing and drag transforms,
- Table data and editing,
- CSV/Excel/file intake,
- project save/load/recovery,
- floor entities and filtering,
- derived selectors/statistics,
- dashboard/widget rendering,
- relationships/connections,
- PNG/SVG/PDF/project export,
- icon/grid/annotation/material registries.

For each owner, record:

- exact files,
- state source,
- consumers,
- mutation boundary,
- persistence boundary,
- history boundary,
- renderer/export implications,
- known duplicate or stale owners.

### 3. Prototype reuse audit

Audit the Cell Inspector prototype and other useful non-main branches without editing them.

For every meaningful component or interaction, classify:

- `REUSE_AS_IS`
- `ADAPT`
- `SELECTIVE_PORT`
- `REIMPLEMENT`
- `DEFER`
- `REJECT`

Include precise reasons covering architecture, accessibility, responsive behavior, visual quality, state ownership, history integration, renderer coupling and current-main compatibility.

Do not recommend merging a prototype branch wholesale.

### 4. Essential milestone dependency graph

Produce a dependency graph showing:

- hard prerequisites,
- safe parallel preparation,
- merge gates,
- audit gates,
- Owner QA gates,
- blockers,
- data-schema dependencies,
- renderer/export dependencies,
- branches that must be based only on merged main.

Recommend the smallest number of substantial bounded Codex milestones that can safely complete the essential product. Prefer larger coherent batches, not artificial micro-slices.

Evaluate this candidate grouping and improve it when evidence supports a better plan:

- Batch 1: C0.4F-B + minimal production Inspector layer editing
- Batch 2: Area editing + Table/Canvas sync + reliable import
- Batch 3: Floors + derived statistics + compact Dashboard
- Batch 4: Essential Connections + export parity + hardening

### 5. Exact future Codex contract inputs

For every recommended batch, provide:

- goal,
- exact required base condition,
- likely work branch name,
- allowed file families,
- forbidden scope,
- data/store invariants,
- history transaction requirements,
- migration requirements,
- renderer/export requirements,
- focused automated tests,
- manual QA at 1440 and 1280,
- stop conditions,
- independent audit checklist,
- Owner acceptance checklist.

These are contract inputs only. Do not implement the batches.

### 6. Data-flow and state-preservation analysis

Trace representative flows end to end:

- Cell Inspector edit -> Master Graph -> renderer -> history -> save/load -> export
- Area edit -> radius -> Canvas/Table -> Undo/Redo -> import/export
- Table bulk edit -> Cells -> derived stats -> floors -> Canvas
- Floor change -> visibility/filtering -> statistics -> export
- Relationship edit -> graph -> visible line -> statistics/export

Identify every place where duplicate data, stale selectors, snapshot loops, reference sharing, reset-on-view-change or import-reset regressions could occur.

### 7. Performance and complexity budget

Identify:

- current 50+ Cell bottlenecks,
- high-frequency selectors,
- render-loop work,
- history snapshot cost,
- import normalization cost,
- table virtualization needs,
- dashboard recomputation risks,
- connection rendering risks,
- export bottlenecks.

Separate must-fix blockers from accepted limitations and later optimization.

### 8. Asset and registry integration plan

Use the verified C0.2 registry and symbol expansion study to define:

- which 15 essential symbols should be ingested first,
- which aliases can be added without geometry duplication,
- which 8 custom plan symbols need original MOOORF vector design,
- when symbol ingestion should occur relative to Inspector work,
- how IDs, licences, accessibility labels and unknown-ID recovery remain safe,
- why UI command icons remain separate from drawable symbols.

Do not edit the registry.

### 9. Risk and deferred-scope register

Create a durable register of:

- architectural risks,
- migration risks,
- renderer parity risks,
- export risks,
- performance risks,
- prototype reuse risks,
- licensing/provenance risks,
- unresolved decisions,
- explicitly deferred features.

Each entry must include severity, affected milestone, evidence, mitigation and decision owner.

## Required outputs

Write only these report files on `research/c0-fast-track-essential-product-atlas`:

1. `docs/research/MOOORF_ESSENTIAL_PRODUCT_REUSE_ATLAS.md`
2. `docs/research/MOOORF_FAST_TRACK_DEPENDENCY_GRAPH.json`
3. `docs/research/MOOORF_CODEX_CONTRACT_INPUTS_C0_4F_B_TO_HARDENING.md`
4. `docs/research/MOOORF_FAST_TRACK_RISK_AND_DEFERRED_REGISTER.md`

Update only `status/antigravity` after the report branch is pushed.

## Forbidden changes

- no product-code modifications,
- no changes to main,
- no changes to Codex work branches,
- no changes to existing prototype/feature/research branches,
- no package/dependency changes,
- no renderer, shader, store, schema, UI, CSS, import, export or test edits,
- no merge or PR,
- no C0.4F-A delta-audit verdict against a moving head,
- no invention of missing branch state,
- no unverified local-file claims.

## Verification

- verify every cited branch/head against GitHub,
- verify every recommended owner through imports/search,
- verify report JSON parses,
- run `git diff --check`,
- a production build is not required because product code must remain unchanged; if run, record it as informational only and do not claim it validates future implementation.

## Stop conditions

Stop and report `BLOCKED` if:

- production main differs from the recorded task base before the report branch is created,
- the report branch contains product-code changes,
- required branch provenance cannot be verified,
- the task begins requiring fixes rather than research,
- a recommendation would require assuming an unpushed Codex state,
- another worker modifies the same report branch.

## Completion

Commit and push only to `research/c0-fast-track-essential-product-atlas`.

Final status:

`DONE — ESSENTIAL PRODUCT ATLAS READY FOR PM/CODEX CONTRACT GENERATION`

Do not merge. Do not start implementation. Do not start the fixed-head C0.4F-A audit unless separately assigned.