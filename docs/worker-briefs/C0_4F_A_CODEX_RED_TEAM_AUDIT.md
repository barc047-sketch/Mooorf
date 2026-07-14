# Codex Brief — C0.4F-A Fresh-Session Red-Team Audit

TASK ID: C0.4F-A-CODEX-RED-TEAM
SESSION: NEW AND ISOLATED
STATUS: START NOW
WORKER: Codex reviewer only
MODE: Supplemental read-only fixed-head audit

## Exact refs

- Repository: `barc047-sketch/Mooorf`
- Production base: `main@c4600472ea76f651800c19b91cf8f67954ca992e`
- Feature branch: `feature/c0-4f-a-runtime-layer-separation`
- Fixed feature head: `21388c0d765cd4bbc675d0321d94e77db9a41e5c`
- Report branch: `audit/c0-4f-a-codex-red-team`
- Report branch base: `c4600472ea76f651800c19b91cf8f67954ca992e`
- Implementation report: `docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md` on the fixed feature head
- Output report: `docs/audits/C0_4F_A_CODEX_RED_TEAM_AUDIT.md`

Do not begin if any exact ref differs. Audit only this exact fixed feature head.

## Independence rules

This must not be the implementation session or implementation worktree.

- Start from a fresh Codex conversation/session.
- Use a separate clean checkout/worktree.
- Do not read private implementation-session notes, scratchpads or hidden reasoning.
- Treat the implementation report as an untrusted claim to verify.
- Do not fix code, amend the feature, merge or begin C0.4F-B.
- The Antigravity fixed-head audit remains the primary cross-model independent audit. This Codex audit is a supplemental technical red-team review.

## Purpose

Attempt to disprove that C0.4F-A is safe. Search aggressively for architecture duplication, schema/migration errors, renderer divergence, geometry regressions, selection leakage, export contamination, overlay/WebGL drift, performance regressions and misleading fallback behaviour.

## Required first reads

1. `AGENTS.md`
2. `docs/worker-briefs/C0_4F_A_CODEX_RUNTIME_LAYER_SEPARATION.md` from `docs/mooorf-ai-team-operating-protocol`
3. `docs/MOOORF_ACCELERATION_MODE_2026_07_15.md`
4. `docs/C0_4_ARCHITECTURE_AUDIT_REVIEW.md`
5. `docs/C0_4_SAFE_IMPLEMENTATION_SLICES.md`
6. `docs/C0_4F_A_RUNTIME_LAYER_SEPARATION_REPORT.md` at the fixed feature head
7. Every changed file between the exact base and feature head
8. Canonical geometry, hit-testing, selection, export, import, resource and renderer owners needed to verify the delta

Record every file and branch read.

## Hard branch rules

- Keep all product code untouched.
- Never commit to `main` or the feature branch.
- Write only `docs/audits/C0_4F_A_CODEX_RED_TEAM_AUDIT.md` on `audit/c0-4f-a-codex-red-team`.
- Do not update or overwrite `status/codex`; it must remain the implementation record at `WAITING_REVIEW`.
- Do not modify `status/antigravity`.
- Do not merge, rebase, cherry-pick, amend, force-push or open a production PR.
- The report branch must never be merged into `main`.

## Required audit

### 1. Exact delta and scope

Verify the feature is exactly one commit ahead of base. Classify every changed file as required runtime/domain work, focused test/report work, questionable scope or forbidden scope.

Confirm absence of changes to `.claude/`, `.references/`, packages/lockfiles, production Inspector UI, Material Browser, Table, Floors, Dashboard, Connections and broad history architecture.

### 2. Canonical ownership

Verify one Zustand/Master Graph owner, one canonical appearance resolver, no duplicated persisted defaults, no renderer-local schema and no shader-owned second presentation contract.

Determine whether `src/canvas/presentationLayers.ts` is a pure projection/adapter or has accidentally become a second business-logic owner.

### 3. Boundary schema and migration

Verify all six styles and every numeric field, deterministic clamps, v1/legacy migration, sparse overrides, compatibility-only material ID behaviour and geometry independence.

Test malformed, partial, unknown and future-version inputs. Look for silent data loss and inconsistent defaults between runtime/import/export.

### 4. Geometry and interaction invariants

Prove presentation cannot alter area, radius, centres, hit testing, drag, selection targeting, clearance, relationship anchors, Void subtraction or area contribution.

Explicitly test hidden Cell fill with drag/selection and pan/zoom.

### 5. Selection isolation

Verify Selection is absent from appearance, project/config/saved-view files, copy/paste style and clean PNG/SVG/PDF/capture output. Confirm the overlay is pointer-transparent and does not duplicate state.

### 6. Classic renderer

Verify all six styles are visually distinct and truthful. Check inner/centre/outer alignment, width, offset, dash/bar length, gap and double spacing at multiple zooms. Compare default appearance against exact base.

### 7. Organism/WebGL

Verify bounded one-pass field ownership, independent Membrane/Edge controls, no duplicate Core ownership, correct Void separation and deterministic fallback metadata for all unsupported non-solid Boundaries.

Stress overlay/WebGL alignment across zoom, pan, resize and device-pixel-ratio changes. Verify captures composite architectural overlays but exclude Selection.

### 8. Export/future parity

Verify the runtime representation remains expressible by later SVG/PDF parity and existing exports do not silently lie, drop persisted settings or include Selection.

### 9. Performance red-team

Inspect allocations, projections and draw calls for 10–15 and approximately 50 Cells. Flag repeated resolver work, per-frame object churn, duplicate Path2D construction, redundant overlay redraws, capture leaks or unbounded caches.

The known 50+ Cell limitation is accepted, but new material regressions are not.

## Verification commands

Run from a clean checkout of the exact fixed feature head:

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

Run exactly one final production build after investigation. The existing Vite chunk warning alone is not a failure.

## Manual QA

Verify at minimum:

- 1440×900 and 1280×800,
- exact-base default comparison,
- six Classic Boundary styles,
- Organism fallback matrix,
- independent Cell/Boundary/Membrane/Membrane Edge/Core/Void toggles,
- pan, zoom, drag, hidden Cell selection,
- overlay alignment after resize and zoom,
- clean export/capture Selection exclusion,
- console errors and warnings.

## Required report

1. Exact refs and clean-worktree evidence
2. Changed-file classification
3. Architecture/ownership findings
4. Schema and migration adversarial cases
5. Geometry and interaction findings
6. Selection/export isolation
7. Classic findings
8. Organism/fallback findings
9. Export/future-parity findings
10. Performance findings
11. Test/typecheck/diff/build logs
12. 1440/1280 QA evidence
13. Findings table: BLOCKER / HIGH / MEDIUM / LOW / NOTE
14. Agreement or disagreement with implementation claims
15. Exact verdict

## Verdict

Use exactly one:

- `MERGE CANDIDATE`
- `CORRECTION REQUIRED`
- `REJECT`

A merge candidate requires no unresolved BLOCKER or HIGH issue, exact refs, passing checks, stable defaults, truthful fallback and preserved geometry/selection/Void invariants.

## Output

- Commit and push only the report file to `audit/c0-4f-a-codex-red-team`.
- Stop at `DONE — C0.4F-A CODEX RED-TEAM AUDIT COMPLETE`.
- Never merge and never begin C0.4F-B.