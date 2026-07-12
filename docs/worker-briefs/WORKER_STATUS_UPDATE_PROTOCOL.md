# Worker Status Update Protocol

All active workers must publish a machine-readable status before beginning, at meaningful checkpoints, when blocked, and when finished.

## Worker identity

Use only these worker slots:

- `Codex` — includes GPT-5.6 Ultracode, Terra, Luna, Sol, and other Codex model modes. These are model routes inside one worker slot, not separate workers.
- `Claude`
- `Antigravity`

## Required status states

- `ASSIGNED_NOT_STARTED`
- `RUNNING`
- `BLOCKED`
- `WAITING_REVIEW`
- `DONE`
- `HOLD`
- `ABORTED`

## Required status file

Each worker must maintain one local status artifact outside production code:

`/Users/tanisxq/Documents/ZONU0-AG-ARTIFACTS/WORKER_STATUS_<WORKER>.json`

Examples:

- `WORKER_STATUS_CODEX.json`
- `WORKER_STATUS_CLAUDE.json`
- `WORKER_STATUS_ANTIGRAVITY.json`

Use this schema:

```json
{
  "worker": "Codex",
  "model": "GPT-5.6 Ultracode",
  "status": "RUNNING",
  "task": "C0.2/C0.3 production architecture",
  "brief": "docs/worker-briefs/C0_3_GPT56_ULTRACODE_ICON_INSPECTOR_ARCHITECTURE.md",
  "source_branch": "main",
  "source_sha": "92f4c644a9f27a3bdd6b61d1349e560a63235bd1",
  "work_branch": null,
  "last_checkpoint": "Reading production contracts",
  "updated_at": "ISO-8601 timestamp",
  "blocked_reason": null,
  "expected_outputs": []
}
```

## Update timing

Update the file:

1. immediately before work starts,
2. after source/branch verification,
3. after each major task section,
4. immediately when blocked,
5. before commit/push,
6. after completion.

## GitHub visibility

When the task creates or uses a GitHub branch, push a lightweight checkpoint commit only when the brief permits commits. Do not create empty commits solely for status.

Read-only workers may remain invisible on GitHub while running, so their local status JSON is authoritative. Their final report must state the exact status file path.

## Final response requirement

Every worker response begins with:

```text
WORKER:
MODEL:
STATUS:
TASK:
SOURCE SHA:
WORK BRANCH:
LAST CHECKPOINT:
BLOCKED:
STATUS FILE:
```

Never describe a worker as `RUNNING` unless its latest status file or branch activity confirms it.
