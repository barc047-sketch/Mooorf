# Antigravity Brief — C0.4F-A Fixed-Head Independent Audit

TASK ID: C0.4F-A-AUDIT
SESSION: NEW
STATUS: START NOW
WORKER: Antigravity only
MODE: Independent read-only delta audit

## Exact refs

- Repository: `barc047-sketch/Mooorf`
- Production base: `main@c4600472ea76f651800c19b91cf8f67954ca992e`
- Feature branch: `feature/c0-4f-a-runtime-layer-separation`
- Fixed feature head: `21388c0d765cd4bbc675d0321d94e77db9a41e5c`
- Report branch: `audit/c0-4f-a-runtime-layer-separation`
- Report branch base: `c4600472ea76f651800c19b91cf8f67954ca992e`
- Implementation report: `docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md` on the feature head
- Output report: `docs/audits/C0_4F_A_ANTIGRAVITY_FIXED_HEAD_AUDIT.md`

Do not begin if any exact ref differs. Do not audit a later or moving head.

## Purpose

Independently determine whether C0.4F-A is safe to merge. Audit architecture, scope, migration, runtime ownership, rendering parity, geometry invariants, selection isolation, performance risk and verification evidence. Do not fix code and do not merge.

## Required first reads

1. `AGENTS.md`
2. `docs/worker-briefs/C0_4F_A_CODEX_RUNTIME_LAYER_SEPARATION.md` from `docs/mooorf-ai-team-operating-protocol`
3. `docs/MOOORF_ACCELERATION_MODE_2026_07_15.md` from `docs/mooorf-ai-team-operating-protocol`
4. `docs/C0_4_ARCHITECTURE_AUDIT_REVIEW.md`
5. `docs/C0_4_SAFE_IMPLEMENTATION_SLICES.md`
6. `docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md` at the fixed feature head
7. Every changed file between the exact base and fixed feature head
8. Existing canonical geometry, hit-testing, export, import and resource owners required to verify claims

Record every file and branch read.

## Hard branch rules

- Keep product code untouched.
- Never commit to `main` or the feature branch.
- Write only the audit report on `audit/c0-4f-a-runtime-layer-separation`.
- Update only `worker-status/ANTIGRAVITY.json` on `status/antigravity` after the report is pushed.
- Do not merge, rebase, cherry-pick, amend, force-push or open a production PR.
- The audit branch is report-only and must never be merged into `main`.

## Audit requirements

### 1. Exact delta and scope classification

Verify the feature is exactly one commit ahead of the base and classify every changed file as:

- required domain/runtime work,
- focused test/report work,
- questionable scope,
- forbidden scope.

Confirm there are no changes to:

- `.claude/launch.json`,
- `.references/`,
- package manifests or lockfiles,
- production Inspector/settings UI,
- Material Browser,
- table, floors, dashboard or connections,
- broad history architecture,
- a second store, registry, colour resolver or presentation resolver.

### 2. Canonical ownership and duplication audit

Verify:

- one central Zustand/Master Graph remains the sole data owner,
- `resolveCellAppearance` remains the canonical appearance resolver,
- `src/canvas/presentationLayers.ts` is a renderer-neutral runtime projection/draw adapter rather than a second state owner,
- Classic and Organism consume the same resolved presentation semantics,
- no renderer-local persisted defaults or duplicated appearance state were introduced,
- shader adapters do not become a second presentation schema.

### 3. Boundary schema and migration audit

Verify presentation schema v2 safely supports:

- `solid`, `dashed`, `dotted`, `dash-dot`, `double`, `segmented-bars`,
- width,
- visual offset,
- inner/centre/outer alignment where valid,
- dash/bar length,
- gap length,
- double-line spacing,
- colour,
- opacity.

Confirm:

- v1 and legacy data migrate deterministically,
- invalid numbers clamp safely,
- sparse overrides remain sparse,
- internal `materialId` compatibility does not force a Boundary material UI,
- appearance fields cannot alter geometry semantics.

### 4. Geometry and interaction invariants

Prove that presentation changes do not alter:

- Cell programmed area,
- radius derived from area,
- Cell centres/positions,
- hit testing,
- drag behaviour,
- selection targeting,
- clearance,
- relationship anchors,
- Void subtraction or area contribution.

Check hidden-Cell behaviour deliberately: a hidden fill must not unintentionally make the Cell impossible to select or drag unless the canonical interaction contract says so.

### 5. Selection isolation

Verify Selection is temporary renderer-neutral UI and is excluded from:

- `SpaceCell.appearance`,
- project/config/saved-view persistence,
- copy/paste style,
- clean Canvas capture,
- PNG/SVG/PDF exports and project files.

Check that selection overlay ownership does not intercept pointer events or duplicate selection state.

### 6. Classic renderer audit

Verify independent presentation ownership for:

- Cell,
- Boundary,
- Membrane,
- Membrane Edge,
- Core,
- Void.

Confirm all six Boundary styles render distinctly and truthfully in Classic. Check offset/alignment/double spacing and world-scaled widths at multiple zoom levels. Verify defaults preserve source-main visual appearance.

### 7. Organism/WebGL audit

Verify:

- existing one-pass field/shader architecture remains bounded,
- Membrane and Membrane Edge can be controlled independently,
- Canvas2D overlay is pointer-transparent and aligns exactly with WebGL at pan/zoom and both QA viewports,
- Core ownership is not duplicated between shader and overlay,
- Void appearance and field subtraction remain separate,
- non-solid Boundary requests record a truthful unsupported fallback and render solid,
- fallback metadata is deterministic and not silently lost,
- capture compositing includes architectural layers but excludes Selection UI.

Pay special attention to overlay/WebGL drift, device-pixel-ratio handling, resize behaviour and hidden-Cell interaction.

### 8. Export and future-parity safety

C0.4F-B may complete full SVG/PDF technical-stroke parity, but verify C0.4F-A has not created a representation that cannot be exported truthfully later. Confirm existing exports do not accidentally include Selection and existing project/import/export contracts remain compatible.

### 9. Performance and regression review

Review the new per-frame work and draw-call implications for:

- 10–15 Cells,
- approximately 50 Cells,
- multiple Boundary and Core overlays,
- Organism pan/zoom/drag,
- capture/export.

Do not require C0.4F-A to solve the known 50+ Cell limitation, but flag any material regression, unbounded allocation, duplicate projection work or avoidable per-frame object churn introduced by this delta.

## Independent verification commands

Run from a clean checkout of the fixed feature head:

```bash
npx tsx src/domain/presentation/presentationContracts.test.ts
npx tsx src/canvas/runtimePresentation.test.ts
npx tsx src/canvas/runtimeRendererIntegration.test.ts
npx tsx src/canvas/runtimeOrganismWiring.test.ts
npx tsx src/export/exportCore.test.ts
npx tsx src/import/importCore.test.ts
npx tsx src/resources/resourcePersistence.test.ts
npx tsc --noEmit -p tsconfig.app.json --pretty false
git diff --check c4600472ea76f651800c19b91cf8f67954ca992e...21388c0d765cd4bbc675d0321d94e77db9a41e5c
npm run build
```

Run exactly one final production build after all audit investigation. The known Vite large-chunk warning alone is not a failure.

## Manual deterministic QA

Independently verify at minimum:

- 1440×900,
- 1280×800,
- source-main default appearance comparison,
- all six Classic Boundary styles,
- Organism non-solid fallback matrix,
- Cell/Boundary/Membrane/Membrane Edge/Core/Void independent toggles,
- pan, zoom, single drag and selection,
- overlay alignment after resize and zoom,
- Selection exclusion from clean export/capture,
- no new console errors.

Screenshots/evidence may be recorded in the report, but do not add binary assets unless already supported and necessary. Textual deterministic evidence is sufficient.

## Stop conditions

Stop and report the blocker without continuing if:

- `main` is not the exact base SHA,
- the feature branch is not the exact fixed head,
- the worktree is dirty before audit work,
- product-code modifications are required to complete the audit,
- a second state/resolver owner is discovered,
- geometry/hit-testing/selection/Void invariants regress,
- the feature head advances,
- required files or scripts are missing,
- the audit branch ancestry is not the exact production base.

## Required report structure

1. Exact refs and clean-worktree evidence
2. Full changed-file classification
3. Architecture and ownership findings
4. Boundary schema/migration findings
5. Geometry, interaction and Void invariants
6. Selection persistence/export isolation
7. Classic renderer findings
8. Organism/WebGL and fallback findings
9. Export/future-parity findings
10. Performance/regression findings
11. Tests, typecheck, diff check and build logs
12. Manual 1440/1280 QA evidence
13. Findings table with severity: BLOCKER / HIGH / MEDIUM / LOW / NOTE
14. Known limitations accepted or rejected
15. Exact final verdict and next gate

## Verdict

Use exactly one:

- `MERGE CANDIDATE`
- `CORRECTION REQUIRED`
- `REJECT`

A `MERGE CANDIDATE` requires no unresolved BLOCKER or HIGH finding, exact-SHA verification, passing required checks, stable baseline appearance, truthful Organism fallback and preserved geometry/selection/Void invariants.

## Output

- Commit and push only `docs/audits/C0_4F_A_ANTIGRAVITY_FIXED_HEAD_AUDIT.md` to `audit/c0-4f-a-runtime-layer-separation`.
- Update `status/antigravity` with exact base, feature head, audit branch head, commands, findings summary and verdict.
- Stop at `DONE — C0.4F-A FIXED-HEAD AUDIT COMPLETE`.
- Never merge.
