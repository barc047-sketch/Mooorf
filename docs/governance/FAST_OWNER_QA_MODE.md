# MOOORF Fast Owner-QA Mode

**Status:** Active from M1 final acceptance onward  
**Purpose:** Finish the product quickly and safely without spending implementation credits on open-ended browser-harness tuning.

## Core rule

Use automation to protect data, state, history, persistence, renderer and export contracts. Use the Owner for fast visual and interaction acceptance.

A worker must not substitute hours of fragile browser automation for a short Owner check when the Owner can reproduce the visible behavior directly.

## Required automated checks

For each bounded production task:

1. Focused executable behavioral/unit contracts for changed owners.
2. Affected history, persistence, migration, renderer or export contracts when those owners change.
3. TypeScript check when TypeScript changes.
4. `git diff --check` from the exact reviewed base.
5. Exactly one final production build per milestone or correction batch.

Do not rerun already-passing broad suites after documentation-only or test-harness-only changes unless the product source changed.

## Owner manual acceptance

After the worker stops at `WAITING_REVIEW`, the coordinator sends a short checklist of the visible behaviors that changed. The Owner replies yes/no from the live preview.

Default checklist size: 3–7 direct checks. Avoid long audit forms.

The Owner’s reproduced result overrides an automated claim about visible behavior.

## Browser automation limits

Exhaustive CDP/E2E matrices are **not required by default**.

They are allowed only when:

- a high-risk regression cannot be safely covered by focused contracts plus Owner QA;
- cross-view persistence, export or data-loss behavior specifically requires automation; or
- the Owner explicitly requests browser automation.

Any QA harness that stalls, needs repeated restructuring or exceeds **10 minutes of tuning** must stop. Record the incomplete harness truthfully and move to focused tests plus Owner verification.

Do not optimize a QA harness inside a product milestone after the product behavior is already working, unless the harness itself is an explicitly authorized task.

## Credit and time protection

- Prioritize product implementation over redundant QA infrastructure.
- No routine second audit loop.
- No repeated production builds.
- No open-ended polling of headless browsers.
- No expanding a bounded correction to test unrelated legacy behavior.
- Worker stops immediately after one fixed head and `WAITING_REVIEW` status are pushed.

## Table Body decision

Editable Body/subtext remains in the Table because it uses the same canonical `SpaceCell` record as Canvas and Inspector.

For now, keep it. Dense-table performance for 100+ spaces is deferred to M8 and should be improved only after profiling. Likely options are truncated rows, expand-on-demand editing and row virtualization. Do not prematurely rebuild the Table during M2.

## Merge gate

Fast Owner-QA does not remove the explicit merge gate. Production branches still require the Owner’s exact merge command before `main` changes.
