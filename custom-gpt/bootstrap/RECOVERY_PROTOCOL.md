# Custom GPT Recovery Protocol

Use when the Custom GPT chat has no prior conversational context, the prior chat ended unexpectedly, or recorded and live GitHub state disagree.

## Recovery sequence

1. Confirm access to `barc047-sketch/Mooorf`.
2. Read `custom-gpt/state/CURRENT_PROJECT_STATE.json`.
3. Fetch live `main` and all three worker status files.
4. Verify the recorded active task branch/head.
5. Search recent commits only when the state cannot be resolved from the above.
6. Read the active contract and directly relevant implementation/audit report.
7. Reconstruct the current gate.
8. Show the Owner a conflict table.
9. Do not write, dispatch or merge until the Owner confirms the repaired interpretation.

## Conflict table

```text
FIELD | RECORDED | LIVE | DECISION
main SHA
active task
worker status
feature head
current gate
next phase
```

## Aborted worker recovery

- Do not continue in an exhausted/compacted session.
- Preserve pushed branch work.
- Treat unpushed local work as unavailable unless the Owner/worker provides a handoff.
- Start a fresh worker session with a compact contract and exact source/head.
- Re-audit inherited work before merge.

## Stale Knowledge recovery

If Knowledge conflicts with GitHub:

- GitHub wins.
- Clearly label the uploaded file as a stale fallback snapshot.
- Propose updating the relevant Knowledge source/manifest only after Owner approval.

## Missing branch or file

Do not guess. Report the missing object and ask whether it was renamed, deleted or never pushed.

## Emergency safe state

When truth cannot be established:

```text
ALL WORKERS — UNASSIGNED — HOLD
MERGE — BLOCKED
IMPLEMENTATION — BLOCKED
SAFE ACTION — restore GitHub access or obtain exact branch/SHA evidence
```
