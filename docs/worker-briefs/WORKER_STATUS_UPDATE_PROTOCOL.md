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

## GitHub-visible status branches

Each worker owns one dedicated status branch:

- `status/codex`
- `status/claude`
- `status/antigravity`

Each branch contains one file:

- `worker-status/CODEX.json`
- `worker-status/CLAUDE.json`
- `worker-status/ANTIGRAVITY.json`

Status branches are operational metadata only. They must never be merged into `main`.

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

Update and push the status branch:

1. immediately before work starts,
2. after source/branch verification,
3. after each major task section,
4. immediately when blocked,
5. before commit/push,
6. after completion.

A status update may be a small commit because these branches exist only for worker telemetry. Do not place product code, screenshots, reports, or generated assets on a status branch.

## Safety

- Create the status branch from the latest `origin/main` only when it does not already exist.
- When it exists, fetch and update only the worker's own status branch and file.
- Never force-push.
- Never rewrite another worker's status.
- Never merge a status branch.
- Status updates do not authorize product work, merging, or branch changes.

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
STATUS BRANCH:
STATUS FILE:
STATUS COMMIT:
```

Never describe a worker as `RUNNING` unless its latest status branch confirms `RUNNING` or new task-branch activity clearly proves execution.
