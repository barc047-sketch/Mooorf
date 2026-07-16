# Permanent Lean Workflow

## A. Task intake

Every task begins with one compact contract:

- one goal;
- exact visible problem or requested outcome;
- current branch and full SHA;
- owner files from `REPO_MAP.md`;
- maximum read and write budget;
- forbidden areas;
- focused acceptance criteria;
- explicit Owner GO command.

Verify remote source state, branch, HEAD, and working-tree condition before dispatch. Preserve unrelated changes and identify file overlap before work starts.

## B. Audit gate

Audit is required only when:

- canonical ownership is unknown;
- more than one subsystem may own the defect;
- schema or persistence could change;
- the source SHA changed after the task was prepared; or
- a previous correction produced a regression.

Before auditing, the Project Manager tells the Owner:

- why audit is needed;
- maximum elapsed time;
- exact files/subsystems;
- whether it is read-only or may produce code;
- expected decision/result.

Audit uses metadata and targeted `rg`/Git reads. It does not default-scan the repository or historical reports.

## C. Implementation

Default implementation contract:

- one goal;
- maximum 6 expected production files;
- focused TDD against the owning contracts;
- no broad repository scan;
- no production build;
- no commit or push;
- live preview for Owner review when the result is visual;
- one compact changed-files/root-cause/checks report.

Reuse the existing component, store action, adapter, registry, renderer path, and test seam before adding anything. Preview state stays ephemeral; product state remains central.

If the confirmed repair needs more than the budget, stop and return a revised ownership/risk proposal. Do not silently expand scope.

## D. QA ownership

### Codex owns

- focused contracts for the touched subsystem;
- the established TypeScript/no-emit check;
- `git diff --check` and diff-scope review;
- console sanity in the live preview;
- a verified local preview URL;
- explicit limitations and unverified surfaces.

### Owner owns

- visual appearance;
- interaction feel;
- responsive layout at the required viewports;
- subjective smoothness;
- final PASS or FAIL.

Manual confirmation is valid evidence when labelled manual. Partial or aborted browser automation is not a full pass. Broad browser automation, benchmarks, stress tests, and multi-device sweeps run only when explicitly requested.

## E. Finalization

Finalization starts only after explicit Owner PASS and a bounded finalization command.

Then, and only then:

1. Reverify branch, HEAD, remote source, dirty files, and intended file set.
2. Run focused regression checks.
3. Run exactly one production build.
4. Review `git diff --check` and the final diff.
5. Stage only intended task files; preserve `.claude/launch.json`, `.references/`, and unrelated changes.
6. Confirm staged paths before commit.
7. Commit with the approved message.
8. Push the current feature branch and verify its remote SHA.
9. Update `STATE.md`, replace/close `ACTIVE_TASK.md`, and update `LEDGER.md`/`REPO_MAP.md` only where truth changed.
10. Do not merge without the Owner's explicit merge command.

If an unrelated or unexpected staged file appears, stop. Do not clean, reset, stash, or silently unstage another worker's work without authority.

## F. Task report

Return a compact report containing:

- changed files;
- root cause;
- implementation;
- focused checks and exact outcomes;
- preview URL and console status when visual;
- limitations/manual-only evidence;
- commit and push status;
- remaining unrelated working-tree changes;
- next dependency-safe action.

Do not require ceremonial reports or repeat the roadmap. Never claim pushed as merged, local as committed, contract success as visual approval, or partial browser evidence as a full pass.

## Docs-only exception

When the Owner explicitly defines a docs-only task with its own verification and forbids builds/tests/previews, that narrower contract overrides the ordinary implementation checks. Stage only the authorized documentation paths and verify product files remain untouched.
