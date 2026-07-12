# V8.2C0.1 Terra Repair Brief

CODER: Codex
MODEL: Terra / GPT-5 Codex
EFFORT: High
ROLE: Canvas performance repair engineer and Morph discoverability stabilizer
PARALLEL AGENT: None

## Source state

- Repository: `/Users/tanisxq/Documents/ZONU0`
- Target branch: `feature/v8-2c0-1-canvas-stabilization`
- Expected target head: `222dc7aa5e4bd4536aed9709abe45a94c758f857`
- Expected main: `70f593dffc38b8f37160567a4a18238f32fcf8ee`
- Corrective commit: `fix: improve dense canvas interaction and expose morph`
- Push but do not merge.
- Preserve `.claude/launch.json`; never stage, reset, delete or overwrite it.

## Read first

1. `docs/MOOORF_FINAL_SCOPE.md`
2. `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
3. `docs/PROJECT_MEMORY_INDEX.md`
4. `docs/V8_2C0_1_CANVAS_STABILIZATION_REPORT.md`
5. `docs/V8_2C0_1_MANUAL_QA.md`
6. `docs/ORGANISM_ENGINE_LIMITS.md`
7. `/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/V8_2C0_1_QUICK_AUDIT_50_CELL_AND_MORPH.md`
8. `git show origin/docs/mooorf-ai-team-operating-protocol:docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`

Treat audit timings as hypotheses until verified in foreground runtime.

## Scope

Repair only:

1. Dense Canvas interaction around 50–60 Cells.
2. Per-frame label/selection-overlay DOM work.
3. Morph master-control discoverability.
4. Clear immediate visual confirmation when Morph is On.

Do not implement target rails, materials UI, icon inspector, grids, connections, new shader effects, shell work, Dashboard or Data changes.

## Safety check

Run:

```bash
cd /Users/tanisxq/Documents/ZONU0
git status --short
git fetch --all --prune
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git rev-parse origin/feature/v8-2c0-1-canvas-stabilization
df -h /
```

Proceed only when the branch and SHA match exactly and no unknown production files are dirty. Do not rebase or force-push.

## Reproduce before repair

Use foreground Chrome at 15, 30, 50 and 60 Cells.

For each count test:

- labels on, Morph off
- labels off, Morph off
- labels on, Morph on
- labels off, Morph on

Test single drag, ten-Cell group drag, pan and zoom.

Record actual interaction frame duration, worst frame, visible stutter, React commits, DOM mutations/layout work and renderer duration where measurable. Idle zero-rAF is not proof of smooth interaction.

## Overlay performance repair

Inspect `src/canvas/OrganismCanvasView.tsx` and verify the audited hotspot.

Required result:

- no per-frame `querySelectorAll(".organism-label-anchor")`
- no nested per-frame `querySelector`
- cache direct anchor and keyline references by Cell ID
- remove stale references safely
- no per-frame keyline width/height writes
- use fixed intrinsic geometry plus compositor-friendly translate/scale transforms
- skip identical transform/opacity/state writes through cached last-applied values
- no `getBoundingClientRect`
- no React commit per pointer movement
- preserve solid primary, dashed secondary, hover, editing gap and Auto Contrast

Do not create another label store, selection system or render loop.

## Morph discoverability repair

Modify `src/ui/widgets/OrganismWidget.tsx`.

Add a master switch at the top:

- Label: `Morph`
- Supporting text: `Creates the shared Membrane around nearby Cells.`
- Reads and writes existing canonical `settings.blobOn`

Keep the Display-widget switch synchronized through the same state. Do not create another Morph state. Do not restore ORG/CLS.

When Off, detailed Membrane controls may remain but must be visually subordinate or disabled while preserving values. When On, Canvas must invalidate immediately and nearby clustered Cells must show a clearly visible Membrane without another interaction.

Verify day and night themes. Adjust only an existing default/contrast value if the Membrane is rendered but genuinely indistinguishable.

## GPU gate

First implement and measure the overlay repair.

Do not rewrite the shader pre-emptively.

If 50 Cells remain visibly laggy after the DOM repair, the only allowed additional optimization is an internal interaction-only render-scale reduction for dense scenes:

- active only during drag, pan or zoom
- restore full quality when interaction settles
- full quality for export
- no data changes
- no user setting
- no silent Morph disable
- no silent Classic switch
- no visible Canvas resize

Do not lower engine capacity or remove Cell, Core, Void, Membrane or spatial colouring.

## Focused tests — maximum eight

1. Morph & Motion exposes the Morph switch.
2. OrganismWidget and DisplayWidget share `settings.blobOn`.
3. Morph change invalidates immediately.
4. No per-frame DOM tree selector in overlay sync.
5. No keyline width/height mutation during movement.
6. Identical overlay values skip writes.
7. Deleted Cell refs are removed safely.
8. Existing selection and Auto Contrast remain intact.

Retain existing stabilization, group-drag, inline-editor, resource, import/export and Morph/Motion tests.

## Fast manual verification — maximum three checks

1. 50 Cells, labels on, Morph off: single drag, ten-Cell group drag, pan and zoom.
2. 60 Cells, labels on, Morph on, clustered: drag, pan and zoom.
3. Open Morph & Motion, toggle Morph On/Off and confirm Membrane appears/disappears immediately.

Maximum two screenshots outside Git:

- `V8_2C0_1_TERRA_REPAIR_SCREENSHOTS/01_50_CELL_DENSE_CANVAS.png`
- `V8_2C0_1_TERRA_REPAIR_SCREENSHOTS/02_MORPH_WIDGET_AND_VISIBLE_MEMBRANE.png`

Screenshots do not prove performance; record foreground measurements separately.

## Acceptance

- 50 Cells: no obvious severe drag lag; pan/zoom responsive; labels and selection aligned.
- 60 Cells: usable stress state; no multi-second stalls, disappearing Cells, broken hit testing or unexpected fallback.
- Morph switch visible inside Morph & Motion.
- Morph On creates visible Membrane; Off removes it.
- Display switch synchronized.
- Inline editing, group drag, Auto Contrast, Motion, export and resources remain working.

## Documentation

Update:

- `docs/V8_2C0_1_CANVAS_STABILIZATION_REPORT.md`
- `docs/V8_2C0_1_MANUAL_QA.md`

Create:

- `docs/V8_2C0_1_TERRA_REPAIR_REPORT.md`

Include verified root cause, exact changes, before/after interaction measurements, whether adaptive scaling was required, Morph discoverability, remaining limitations and merge recommendation.

## Verification and commit

Run focused tests, existing stabilization tests, group drag, inline edit, Auto Contrast, Morph/Motion, resources, import/export and `git diff --check`.

Run exactly one final production build.

Commit:

```bash
git commit -m "fix: improve dense canvas interaction and expose morph"
git push origin feature/v8-2c0-1-canvas-stabilization
```

Do not merge.

## PONYTAIL

- reused:
- adapted:
- new files justified:
- duplication avoided:

## Final report

STATUS:
CODER:
MODEL:
BRANCH:
STARTING HEAD:
NEW HEAD:
MAIN:
USER LAG REPRODUCED:
VERIFIED ROOT CAUSE:
DOM SEARCHES BEFORE/AFTER:
LAYOUT WRITES BEFORE/AFTER:
ADAPTIVE RENDER SCALE REQUIRED:
15 CELLS:
30 CELLS:
50 CELLS:
60 CELLS:
SINGLE DRAG:
GROUP DRAG:
PAN:
ZOOM:
MORPH CONTROL LOCATION:
MORPH SWITCH VISIBLE:
DISPLAY SWITCH SYNCHRONIZED:
MEMBRANE OFF/ON:
DAY/NIGHT:
AUTO CONTRAST:
SELECTION:
INLINE EDIT:
MOTION:
EXPORT:
TESTS:
BUILD:
SCREENSHOTS:
REPORT:
PONYTAIL:
COMMIT:
PUSH:
MERGE:
MAIN UNTOUCHED:
UNSTAGED LEFT:
LIMITATIONS:
NEXT:
