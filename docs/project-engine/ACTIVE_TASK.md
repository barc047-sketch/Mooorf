# Active Task

## R4A OWNER-PASSED — ENTER APPLY + CONNECTION MODE INSPECTOR CORRECTION

Status: LOCAL UNCOMMITTED / PREVIEW VERIFIED / WAITING OWNER QA

- branch: `work/next-feature`;
- accepted R3B checkpoint `e9f9219524e2f4721670151340456a7e92bfab77` is pushed to `origin/work/next-feature`;
- the existing registry-owned `ConnectionsWidget` remains the sole Relationship Manager/Types/Connections owner;
- CONNECTIONS now projects canonical `connections` in stable order through a pure reusable filter model covering query, dynamic Relationship Type, Active/Inactive and visual/annotation override state;
- search covers source/target Cell names, Relationship Type name/code, resolved Title and Body text; Manager state remains local UI state;
- rows show source/target, Relationship Type, resolved local style preview, enabled state, compact visual/Title/Body override indicators and icon-first Locate;
- Canvas and Manager use the existing shared `selectedConnectionIds` owner; normal, Shift, checkbox and filtered select-all interactions preserve hidden selected IDs;
- ordered Manager selection now uses one UI-only anchor with standard visible-order Shift ranges, Cmd/Ctrl toggles and guarded Cmd/Ctrl+A; Canvas retains spatial additive/toggle semantics;
- exactly one selected Relationship Type now exposes icon-first Duplicate, Copy Style, Paste Style and Edit Style actions; duplication creates a project type and Copy/Paste reuse the existing source-agnostic visual clipboard;
- the list uses a fixed-row overscan window and internal scrolling, bounding mounted row DOM for large canonical collections;
- bulk Change Type calls the existing atomic supersession command; bulk Delete calls the existing atomic canonical deletion command;
- Locate selects the canonical Connection, returns Table to Canvas, and uses the existing `fitCamera` owner without history or stored geometry;
- global Connections visibility remains distinct from per-Connection enabled state;
- R3A TYPES behavior, Relationship Type retirement safety, renderer and persistence owners remain unchanged;
- icon-first Connection Studio controls now explicitly yield plain Enter to the Studio's one canonical Apply path, while open listboxes consume Enter through their existing selection callback and numeric/single-line values settle before Apply;
- Inspector priority is selected Connection(s), then the canonical `connectionModeActive` presentation, then normal Cell presentation; C-mode endpoint interaction retains its existing selection/authoring owners;
- focused Connection/Manager/Inspector/authoring regressions passed 46/46; real browser QA verified Enter persistence, one-step Undo, listbox select-only ownership, C-mode Cell suppression, selected-Connection priority and Cell restoration on mode exit;
- no Canvas annotation rendering, advanced ports, Connection Settings expansion, Matrix/Table UI, export, Classic, production build or dependency work occurred;
- Owner confirmation is required before any R4A checkpoint commit; no commit or push for R4A is authorized.

Next safe action:

Owner confirmation of Enter Apply and Connection-mode Inspector ownership. Finalization, commit, push, merge and branch cleanup each require separate explicit authority.
