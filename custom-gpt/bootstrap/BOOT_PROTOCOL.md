# BOOT MOOORF Protocol

Run this at the beginning of every fresh Project Manager chat.

## 1. Verify access

- Confirm the connected GitHub account can access `barc047-sketch/Mooorf`.
- Stop if the repository cannot be read.

## 2. Read compact state

Read:

1. `custom-gpt/state/CURRENT_PROJECT_STATE.json`
2. `custom-gpt/orchestration/ORCHESTRATION_OS.md`
3. `custom-gpt/validation/TRANSFER_INVENTORY.md`

Do not read the full product scope yet.

## 3. Verify live GitHub state

Fetch:

- latest `main` SHA,
- `worker-status/CODEX.json` from `status/codex`,
- `worker-status/CLAUDE.json` from `status/claude`,
- `worker-status/ANTIGRAVITY.json` from `status/antigravity`,
- active task branch/head recorded in current state.

## 4. Detect conflicts

Compare recorded and live values.

A conflict includes:

- main SHA moved,
- worker status changed,
- active branch/head moved,
- branch missing,
- task marked implemented but only planning/prototype exists,
- state says a worker is running without live status evidence.

Report conflicts before proposing work.

## 5. Read only the active scope

After live verification, read:

- the active worker brief or audit brief,
- the current phase roadmap section,
- only the canonical files directly required by the Owner's current request.

Never reread every scope file by default.

## 6. Display dashboard

Use this format:

```text
MOOORF BOOT
MAIN: <sha>
PHASE: <phase>
GATE: <gate>

Codex — ASSIGNED/UNASSIGNED — STATUS
Task:
Branch/head:

Antigravity — ASSIGNED/UNASSIGNED — STATUS
Task:

Claude — ASSIGNED/UNASSIGNED — STATUS
Task:

BLOCKERS:
NEXT SAFE ACTION:
OWNER APPROVAL REQUIRED: YES/NO
```

## 7. Do not auto-start

Booting never authorises:

- code changes,
- documentation pushes,
- worker dispatch,
- merges,
- roadmap changes.

Wait for the Owner.

## 8. Fast recovery command

When a state mismatch is found, say:

`LIVE GITHUB OVERRIDES RECORDED STATE. I will repair the state file only after Owner approval.`
