# Active Task

## R3A PICKER + BULK TYPE CORRECTIONS — WAITING OWNER QA

Status: LOCAL UNCOMMITTED / PREVIEW AVAILABLE / WAITING OWNER QA

- branch and unchanged committed base: `work/next-feature` at `120058e2f7cdffd7dd5080df1e42cce8c666fe2b`;
- the Owner-approved Amendment 2 is appended to the Locked Connections Master Spec;
- Quick Rail, single Inspector, multi-Connection Inspector and Manager reassignment reuse one `RelationshipTypePicker` with a 240px maximum, approximately five 42px rows and internal vertical scrolling;
- picker rows and Relationship Manager rows reuse one canonical `RelationshipTypeStylePreview`, including current color, width, pattern, geometry and start/end markers for factory and project-created types;
- authoring pickers place up to ten actually used Relationship Type IDs first through the local UI preference key `mooorf:recent-relationship-types`; unavailable IDs are ignored, while Manager rows remain in stable canonical factory/project order;
- MRU updates occur once after Quick Rail choice, successful single Inspector reclassification, successful bulk Inspector reclassification, or successful Manager reassignment; hover, open, focus and search do not update it;
- multi-selected Connections show a real Type picker with shared-type or presentation-only `Mixed` state;
- one bulk Type assignment clones only each selected Connection's semantic record, preserves all visual/annotation/endpoints/anchors/enabled/unrelated semantic fields, and creates one atomic Connection history transaction;
- single and multi Delete continue to remove canonical Connection records in one transaction, with explicit counted Inspector labels and one-step Undo restoration;
- affected contracts: 63/63 passed; `npx tsc -b --pretty false`, the tracked diff check and the untracked no-index whitespace check passed; the preview returned HTTP 200;
- no subagents, reviewer agents, browser automation, production build, common Style Panel, full Connections tab, renderer, Canvas annotation, advanced port, export, Matrix, Table or Classic work occurred;
- no commit, push or merge occurred; `main` is untouched.

Next safe action:

Owner visual and interaction QA of the corrected R3A pickers and multi-Connection Inspector. Finalization, R3B, merge and branch cleanup each require separate explicit authority.
