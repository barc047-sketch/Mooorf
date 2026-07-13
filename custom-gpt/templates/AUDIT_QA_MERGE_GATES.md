# Audit, Owner QA and Merge Gates

## Independent audit brief

```text
WORKER: Antigravity
TYPE: read-only delta audit
SESSION: NEW REQUIRED
SOURCE SHA:
FEATURE BRANCH:
FEATURE HEAD:

READ:
- active implementation brief
- implementation report
- changed files only
- directly affected tests/config

VERIFY:
- exact scope completed
- forbidden scope absent
- no duplicate owner/system
- migration/persistence truth
- renderer/export parity when applicable
- focused tests
- git diff --check
- required build

REPORT:
BLOCKERS:
MAJOR:
MINOR:
ACCEPTED LIMITATIONS:
VERDICT: MERGE CANDIDATE | CORRECTION REQUIRED | REJECT
```

## Owner QA panel

Use only checks the Owner can evaluate quickly.

```text
FEATURE:
PREVIEW:

A. Opens and remains stable
A1 —
A2 —

B. Core interaction
B1 —
B2 —

C. Visual quality
C1 —
C2 —

Result values:
PASS | PARTIAL | FAIL | NOT TESTED

FINAL VERDICT:
[ ] APPROVE
[ ] APPROVE WITH MINOR PRODUCTION ADJUSTMENTS
[ ] REVISE
[ ] REJECT
```

## Merge gate

Before proposing merge, verify:

- implementation branch/head still equals audited head,
- audit verdict permits merge,
- all required corrections are included and re-audited,
- source/main movement is understood,
- focused tests and final build passed,
- no protected/local/generated/status/prototype files entered the diff,
- Owner explicitly approves merge.

Merge worker contract must:

- use a fresh session,
- name exact source and feature SHAs,
- use an isolated worktree,
- integrate only audited commits/documents,
- stop on conflicts or unexpected files,
- push `main` only after all gates pass,
- report resulting main SHA,
- never claim future metadata as implemented.
