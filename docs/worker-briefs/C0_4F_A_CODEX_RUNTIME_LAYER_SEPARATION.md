# Codex Brief — C0.4F-A Runtime Layer Separation

TASK: Implement the essential runtime separation of Organism presentation layers.
SESSION: NEW
STATUS: PREPARED — DO NOT START WITHOUT OWNER GO
WORKER: Codex only
BASE BRANCH: main
BASE SHA: c4600472ea76f651800c19b91cf8f67954ca992e
WORK BRANCH: feature/c0-4f-a-runtime-layer-separation

## Goal

Make Cell, Boundary, Membrane, Membrane Edge, Core, Void and temporary Selection UI independently owned in the live Classic and Organism/WebGL rendering paths while preserving current baseline appearance, geometry and interaction.

This is one larger bounded fast-track milestone. Do not split it into artificial micro-tasks, but do not expand it into Inspector, Material Browser, advanced Membrane or shell work.

## First reads

1. AGENTS.md
2. docs/worker-briefs/C0_4F_A_CODEX_RUNTIME_LAYER_SEPARATION.md
3. docs/MOOORF_ACCELERATION_MODE_2026_07_15.md
4. docs/C0_4_ARCHITECTURE_AUDIT_REVIEW.md
5. docs/C0_4_SAFE_IMPLEMENTATION_SLICES.md
6. src/domain/presentation/types.ts
7. src/domain/presentation/resolveAppearance.ts
8. the exact Classic and Organism renderer entry files proven by imports/search

After these, inspect only files required by concrete dependencies, renderer ownership, export projections, tests or a proven blocker. Record additional files read.

## Required implementation

### 1. Selection overlay isolation

- Selection/editing feedback becomes an explicit temporary overlay/projection.
- It may use clean keyline, dotted orbit hook or both.
- It must never enter Cell appearance, persistence, copy/paste style or export.
- Preserve existing selection and drag behaviour.

### 2. Classic renderer separation

- Consume the canonical resolved presentation domain.
- Separate draw ownership for Cell fill, Boundary, Core, Membrane, Membrane Edge and Void.
- Visual Boundary offset must not change Cell area, radius, hit testing or clearance.
- Preserve current visual output when all settings are defaults.

### 3. Organism/WebGL separation

- Provide semantic target parity with Classic.
- Reuse one canonical presentation resolver and existing store.
- Preserve current Organism appearance and performance profile.
- Unsupported stroke styles must use a documented truthful fallback rather than fake support or shader redesign.
- Keep Classic fallback intact.

### 4. Essential Boundary stroke domain and renderer support

Boundary is a technical stroke system. Production UI does not require a material choice.

Implement typed/default/override/resolved support as technically appropriate for:

- visibility: off/on
- style: solid, dashed, dotted, dash-dot, double, segmented-bars
- width
- offset
- alignment: inner, centre, outer where technically valid
- dash or bar length
- gap length
- secondary-line spacing for double
- colour
- opacity

Rules:

- Keep the already merged materialId only as an internal compatibility/fallback reference where removing it would create migration risk.
- Do not add Boundary gradients, textures, hatches, pattern fills or Material Browser dependency.
- Clamp numeric values deterministically.
- Decide and document screen-fixed versus world-scaled stroke behaviour for the baseline implementation.
- SVG/PDF vector parity may be completed in C0.4F-B, but this milestone must not create a renderer representation that cannot later export truthfully.

### 5. Other layer baseline

- Cell remains area-driven and always geometry-owned.
- Membrane fill and Membrane Edge remain separate appearance owners.
- Core remains separate from selection; keep dot baseline unless existing renderer support makes circle/ring trivial and parity-safe. Do not widen scope.
- Void appearance must not alter subtraction, area, hit testing or clearance.

## Allowed changes

- presentation domain types/defaults/validation/resolution
- existing central store wiring required to expose resolved presentation
- Classic renderer and its focused helpers/tests
- Organism/WebGL renderer/shader adapters only where required for semantic separation
- selection overlay owner/projection
- focused tests and implementation report
- minimal export projection hooks only when required to avoid architectural dead ends

## Forbidden changes

- second store, renderer state copy, material registry or colour resolver
- production Cell Inspector redesign
- target rail or full settings panel
- Material Browser
- advanced Membrane geometry, presets or animation
- connections, table, floors, dashboard or shell redesign
- broad history rewrite
- Area formula or hit-testing redesign
- package/dependency changes unless a proven blocker is documented and work stops for Owner review
- .claude/launch.json
- .references/

## Required checks

- focused presentation and renderer contracts
- selection persistence/export exclusion test
- Boundary style validation and fallback tests
- Cell area/radius/hit-test invariants
- Void semantic invariants
- Classic default visual-equivalence contract where feasible
- Organism default projection/fallback contract
- directly affected import/export/resource contracts
- git diff --check
- exactly one final production build

## Manual evidence

Capture or report deterministic QA at:

- 1440 desktop
- 1280 laptop
- default settings comparison against current main
- at least one Cell for every Boundary style in Classic
- Organism renderer fallback behaviour for unsupported styles
- independent toggles for Cell, Boundary, Membrane, Membrane Edge, Core and Void
- selection excluded from export/persistence

## Stop conditions

- main is not c4600472ea76f651800c19b91cf8f67954ca992e at task start
- required renderer ownership cannot be identified confidently
- implementation requires a second state owner or major shader redesign
- Cell area, hit testing, selection or current Organism behaviour regresses
- branch scope begins requiring Inspector, Material Browser or broad export/history redesign
- tests/build fail for reasons not caused and safely correctable inside this scope

## Output

- commit and push only to feature/c0-4f-a-runtime-layer-separation
- produce docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md
- update status/codex with exact source SHA, work SHA, tests, build and known limitations
- stop at WAITING_REVIEW
- do not merge
- do not start C0.4F-B
- fixed pushed head is then audited independently by Antigravity

## Acceptance gate

- every target changes independently
- selection is temporary and non-exported
- baseline appearance remains stable
- Boundary essential stroke settings work or fall back truthfully
- Cell area and hit testing are untouched
- one canonical resolver/store remains
- focused checks and production build pass
- independent audit required before merge
