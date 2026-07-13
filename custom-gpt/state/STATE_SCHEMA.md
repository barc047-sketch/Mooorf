# Current Project State Schema

`CURRENT_PROJECT_STATE.json` is a compact recovery pointer, not a replacement for live GitHub.

Required fields:

- `schema_version`
- `updated_at`
- `repository`
- `default_branch`
- `recorded_main_sha`
- `current_phase`
- `current_gate`
- `owner_approval_required`
- `active_task`
- `workers`
- `next_planned_phase`
- `locked_sequence`
- `protected`
- `known_limits`
- `boot_file`

## Active task

When present, include:

- task ID/title,
- worker,
- execution status,
- source branch/SHA,
- work branch/SHA,
- brief path,
- next gate.

## Update rules

Update after:

- main changes,
- a worker starts/stops/blocks,
- feature head changes materially,
- audit verdict changes the gate,
- Owner approves/rejects merge,
- roadmap phase changes.

Do not update based only on chat claims. Verify GitHub first.

## Conflict rule

Live GitHub overrides the state file. On conflict, report it and obtain Owner approval before repairing the recorded state.

## State economy

Do not store:

- complete task history,
- full reports,
- source code,
- secrets,
- large file lists,
- speculative future SHAs.

Those remain in canonical GitHub documents and branches.
