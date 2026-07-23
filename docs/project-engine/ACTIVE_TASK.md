# Active Task

## R5 WHOLE-CELL CONNECTION AUTHORING

Status: LOCAL UNCOMMITTED / AUTOMATED CHECKS PASSED / PREVIEW AVAILABLE / WAITING OWNER QA

- branch: `work/next-feature`;
- starting R4B checkpoint: `5cf601b97eefb4201617299c68c27f7da6190f5f`; remote feature HEAD intentionally remains `e9f9219524e2f4721670151340456a7e92bfab77`;
- visible V1 authoring ports and the project `portLayout` setting are removed;
- the complete existing visible Cell hit body is the source and target surface during `C` mode, with restrained source/valid-target outlines and no valid highlight for invalid Cells;
- every newly authored Connection writes canonical `auto` start/end anchors, while legacy explicit side anchors remain readable and editable;
- the sole Connection Settings surface retains Visual Scale, dynamic Default Type, Stay in mode, Select new, Edge auto-pan, hit tolerance, unrelated fade, Reduced/Standard motion and bounded reset;
- Custom now defaults to a gentle curved `3px` solid at authored opacity `0.82`; explicit `0.5–64px` styles and all factory/project Type styles remain independent;
- focus defaults are selected `1.00`, related `0.82`, unrelated `0.55`, with unrelated fade still adjustable down to `0.28`;
- authoring retains one creation transaction, current Inspector priority and the existing bounded camera scheduler;
- 144/144 affected contracts, TypeScript and tracked/untracked whitespace checks pass;
- `http://127.0.0.1:5173/` serves the current worktree for Owner QA;
- no browser automation, production build, commit, push, merge, export, Matrix/Table projection, Classic, renderer rewrite or dependency work occurred.

Next safe action:

Owner visual and interaction QA for revised R5. Finalization, commit, push, merge and branch cleanup each require separate explicit authority.
