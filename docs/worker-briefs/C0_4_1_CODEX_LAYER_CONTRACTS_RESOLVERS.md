# Codex Brief — C0.4.1 Layer Contracts, Defaults and Resolvers

WORKER: Codex
MODEL: Sol / GPT-5 Codex
TYPE: Production architecture foundation
EFFORT: High
OWNER STATUS: Approved next implementation slice

## Goal

Implement only the typed, modular presentation-layer foundation required before renderer separation and the production Cell Inspector.

This slice must add explicit contracts, project defaults, sparse per-Cell overrides, pure resolvers and safe migration/validation while preserving the exact current visual output.

There must be no visible UI or renderer redesign in this task.

## Verified source

Repository:

`/Users/tanisxq/Documents/ZONU0`

Required base:

- branch: `origin/main`
- exact SHA: `a0f7b33d4e13ad72d5203141d7688794ad377446`

Create:

- branch: `feature/c0-4-1-layer-contracts-resolvers`
- preferred worktree: `/Users/tanisxq/Documents/ZONU0-CODEX-C0-4-1`

Commit:

`feat: add modular layer contracts and resolvers`

Push the feature branch. Do not merge.

## Status protocol

Before work, publish:

- branch: `status/codex`
- file: `worker-status/CODEX.json`
- status: `RUNNING`
- task: `C0.4.1 layer contracts, defaults and resolvers`
- source branch: `main`
- source SHA: `a0f7b33d4e13ad72d5203141d7688794ad377446`
- work branch: `feature/c0-4-1-layer-contracts-resolvers`

Update after source verification, type design, resolver implementation, migration tests and final validation.

Finish at `WAITING_REVIEW`, not self-approved.

## Safety

- Run `git fetch --all --prune` first.
- Stop if `origin/main` differs from the exact source SHA.
- Use an isolated worktree.
- Preserve `.claude/launch.json`.
- Preserve local-only `.references/`.
- Never switch, reset, clean, stash or modify the primary checkout.
- Never force-push.
- Do not install packages.
- Do not touch prototype or status branches except the required Codex status update.

## Required reading

Read in order:

1. `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`
2. `docs/MOOORF_FINAL_SCOPE.md`
3. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
4. `docs/MOOORF_CANONICAL_PHASE_ROADMAP.md`
5. `docs/MOOORF_CHANGE_CONTROL_PROTOCOL.md`
6. `docs/C0_4_ARCHITECTURE_AUDIT_REVIEW.md`
7. `docs/C0_4_SAFE_IMPLEMENTATION_SLICES.md`
8. `docs/MOOORF_ANNOTATION_CARD_AND_LABEL_LAYOUT_SCOPE.md`
9. `docs/later-scope/README.md`
10. `docs/later-scope/2D_TECHNICAL_ILLUSTRATION_STYLES.md`
11. `docs/COMPONENT_INVENTORY.md`
12. `docs/FEATURE_MAP.md`
13. current `src/types.ts`
14. current `src/state/store.ts`
15. current project/config/saved-view persistence and migration files
16. current material/resource target types and resolvers
17. current Classic and Organism renderer adapters only to understand compatibility; do not redesign them

## Canonical architecture rules

### Architectural data and presentation overrides stay separate

Do not add a large flat list of styling fields directly to `SpaceCell`.

Use a nested, optional, sparse structure conceptually equivalent to:

```text
SpaceCell
├── architectural data
└── appearance?: CellAppearanceOverrides
```

Project defaults live separately:

```text
ProjectPresentationDefaults
├── Cell
├── Boundary
├── Membrane
├── Membrane Edge
├── Core
└── Void
```

Exact TypeScript names may be adjusted to fit existing ownership, but the separation is mandatory.

### One source and one resolver path

- Existing central store remains the product-data source.
- Existing material registry remains the material source.
- Existing project/config/saved-view migration paths remain canonical.
- Resolvers are pure and deterministic.
- Renderers later consume resolved appearance; they do not own defaults.
- No second store, material registry, camera, history path or persistence system.

## Required target contracts

Create canonical target typing for:

- Cell
- Boundary
- Membrane
- Membrane Edge
- Core
- Void

Selection UI must not be part of persisted architectural appearance.

Cell Labels, Flags and Annotation Cards require future extension seams only. Do not implement their schemas or objects in this task unless an existing canonical persistence type requires a minimal non-active placeholder. Document any such placeholder clearly.

## Baseline settings only

### Cell

Preserve current fill/colour/material ownership and current renderer behaviour.

### Boundary

Baseline contract may contain only currently supportable fields such as:

- visible,
- style: solid only,
- width,
- offset,
- colour/material reference.

Do not activate:

- dashed,
- dotted,
- double,
- technical,
- chain/dash-dot,
- gradients,
- patterns,
- hatches.

These remain approved in `docs/later-scope/2D_TECHNICAL_ILLUSTRATION_STYLES.md`.

### Core

Baseline contract:

- visible,
- shape: dot only,
- size,
- colour/material reference.

Do not activate additional Core shapes.

### Membrane and Membrane Edge

Define separate semantic ownership and safe current-default representation without changing existing Morph output.

Do not add advanced geometry, motion or materials.

### Void

Preserve current subtractive semantics and current display behaviour. Appearance must not modify subtraction or clearance behaviour.

## Sparse overrides

Requirements:

- absent override means inherit project default/current legacy value,
- only changed values persist,
- no registry definitions or material objects persist inside Cells,
- IDs/reference values only where appropriate,
- invalid numbers clamp or fall back deterministically,
- unknown IDs remain recoverable or use existing truthful fallback behaviour,
- resolved results are complete and renderer-ready.

Avoid deep-partial ambiguity where `undefined`, omitted and explicit reset cannot be distinguished. Use existing project conventions or a clearly documented canonical reset command.

## Backward compatibility

The current visual result at source main must remain the default after this slice.

Old projects, configs and saved views with no appearance data must:

- validate,
- load without migration errors,
- resolve to current production appearance,
- preserve legacy colour/palette precedence,
- preserve Void semantics,
- preserve current Membrane/Morph defaults.

Do not bump a major project schema version unless existing migration architecture proves it is required. Prefer an optional nested field and existing versioned migration path.

## Runtime integration boundary

This slice may add minimal adapters so current code can compile and tests can resolve appearance.

Do not:

- visually change Classic renderer,
- visually change Organism/WebGL renderer,
- add new draw calls,
- add Inspector controls,
- add target rails,
- add Material Browser UI,
- add Cell Label Layout,
- add Flags,
- add Annotation Cards,
- change Area editing,
- change hit testing,
- refactor all history/drag interactions.

If a renderer import is needed only for typing or a no-op resolver adapter, keep it minimal and document why.

## Suggested modular file ownership

Inspect current structure first. Prefer a small domain module rather than adding everything to `src/types.ts` or `store.ts`.

A production-safe result may use a structure such as:

```text
src/domain/presentation/
├── types.ts
├── defaults.ts
├── resolveAppearance.ts
├── validation.ts
└── *.test.ts
```

Persistence adapters stay with the existing persistence owners.

This is a suggested shape, not permission to duplicate existing modules. Reuse an existing canonical presentation/resource domain when it already exists.

## Required tests

Add focused contracts for:

- target ID uniqueness/validity,
- project default completeness,
- sparse override resolution,
- legacy Cell with no appearance data,
- Boundary default resolution,
- Core default resolution,
- Membrane/Membrane Edge independent ownership,
- Void semantic preservation,
- invalid numeric fallback/clamping,
- unknown material/reference fallback through existing resolver,
- project/config/saved-view migration or round-trip where affected,
- no registry object persistence,
- current default visual values remain equivalent to source main.

Do not add a broad unrelated test suite.

## Documentation

Create:

`docs/C0_4_1_LAYER_CONTRACTS_IMPLEMENTATION_REPORT.md`

Report:

- exact files and owners,
- type hierarchy,
- default hierarchy,
- override/reset semantics,
- migration behaviour,
- current visual-equivalence proof,
- fields intentionally deferred,
- future extension points,
- renderer/UI files deliberately untouched.

Update `docs/FEATURE_MAP.md` or `docs/COMPONENT_INVENTORY.md` only when needed to truthfully register new canonical owners.

Do not mark C0.4.2–C0.4.6 or C0.5 implemented.

## Validation

Run:

- focused presentation/default/resolver tests,
- directly affected persistence/migration tests,
- `git diff --check`,
- exactly one final production build after all changes.

The known unchanged Vite chunk warning is acceptable. New warnings or regressions are blockers.

Review the final diff and confirm:

- no visible UI change,
- no renderer redesign,
- no packages,
- no prototype/status files,
- no accidental later-scope implementation.

## Completion

Commit and push:

`origin/feature/c0-4-1-layer-contracts-resolvers`

Do not merge.

Finish Codex status at `WAITING_REVIEW`.

Final response begins with the required worker status block, then includes:

- source SHA,
- branch/head SHA,
- files changed,
- canonical types/defaults/resolvers created,
- migration/compatibility behaviour,
- tests,
- one final build,
- packages changed,
- visual/runtime changes: expected none,
- deferred advanced styles confirmation,
- exact implementation report path,
- next: independent C0.4.1 audit.

PONYTAIL:

- reused: existing central store, materials/resources, persistence, migration and project schemas
- adapted: current appearance values into pure defaults/resolvers
- new files justified: one modular presentation domain and focused tests/report
- duplication avoided: no new store, renderer, registry, Inspector or export system
