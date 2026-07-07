---
name: zonuert-qa
description: Use for ZONUERT build checks, local preview, regression checks, and small bugfixes after visual or canvas phases.
---

# ZONUERT QA

- Run `npm run build`.
- Run `npm run dev` when browser verification is needed.
- Verify the app renders with no blank screen or console-breaking errors.
- Verify Canvas/Table switching does not reset spaces, camera, or drag positions.
- Verify the blob toggle when the phase affects canvas presentation.
- Keep bugfixes small and phase-scoped.
- Update `docs/BUGS.md`, `docs/HANDOFF.md`, and `docs/TASK_QUEUE.md` as warranted.
