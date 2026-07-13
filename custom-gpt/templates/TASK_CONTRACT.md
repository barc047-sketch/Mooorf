# Compact Worker Task Contract

```text
WORKER:
MODEL:
TASK ID:
TYPE: implementation | audit | prototype | merge-prep | docs
SESSION: NEW | CONTINUE
EFFORT:

GOAL:
One measurable outcome only.

SOURCE:
Repository: barc047-sketch/Mooorf
Base branch:
Base SHA:

WORK:
Branch:
Preferred worktree:
Commit message:
Push: yes
Merge: no

READ ALLOWLIST:
1.
2.
3.

WRITE ALLOWLIST:
1.
2.
3.

DO NOT TOUCH:
- .claude/launch.json
- .references/
- main
- unrelated product/state/renderer/schema files
- prototype/status branches except the worker's own required status update

SCOPE:
- 
- 

LIMITATIONS / NOT IN SCOPE:
- 
- 

ACCEPTANCE:
- 
- 

TESTS:
- focused tests
- git diff --check
- exactly one final production build when code changed

STOP CONDITIONS:
- base SHA mismatch
- required file ownership differs from contract
- unapproved package/schema/renderer/store change becomes necessary
- context compaction or low-context warning
- dirty/shared primary checkout risk

STATUS:
Publish RUNNING before work.
Finish WAITING_REVIEW for implementation.
Finish DONE for read-only audit/research.

OUTPUT:
- branch/head SHA
- exact files changed/read
- tests/build
- blockers/limitations
- report path
- next gate

PONYTAIL:
- reused:
- adapted:
- new files justified:
- duplication avoided:
```

## Contract limits

- Prefer <=120 lines.
- List only the first files the worker may read.
- Do not paste complete product history.
- The contract must state whether a new session is required.
- Unknown future SHAs remain placeholders and the brief stays non-executable until dispatch.
