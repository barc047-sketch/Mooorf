# Active Task

## R6 EXPORT PARITY + TABLE/MATRIX PROJECTION HOOKS

Status: LOCAL UNCOMMITTED / AUTOMATED CHECKS PASSED / PREVIEW AVAILABLE / WAITING OWNER QA

- branch: `work/next-feature`;
- starting remote-backed R5.5 checkpoint: `4154bd5dda986db7c8ec7d63c6df90b1ffd180d1`; local HEAD and `origin/work/next-feature` matched and the worktree was clean before R6;
- `src/export/connectionExport.ts` owns one React/DOM-independent authored export projection from canonical Connections, current Relationship Types, resolved sparse styles, explicit output-space endpoints/bounds and document scale into paths, motifs, markers, annotations and bounds;
- detached export reuses the existing geometry, lane, style, stroke-pattern and annotation projectors; export mode removes live LOD/focus/collision budgets while retaining canonical full Body text and bounds-aware wrapping;
- detached Organism PNG capture draws Connections after the WebGL field and before Cell presentation/labels; PDF and presentation ZIP inherit that same capture; the existing raster PDF architecture was not rewritten and Organism SVG remains explicitly unavailable;
- global `settings.connectionView.visible` omits normal visual export while per-Connection `enabled` and sparse `visual.visible` remain separate canonical gates;
- `relationshipLegend` is an optional explicit capture target with caller-owned x/y/width/height; it recomputes `projectRelationshipLegend(...)` from canonical Types/config and renders through the shared Connection style/motif path without Widget geometry or DOM capture;
- the same Legend render target is the bounded future Sheet object seam; no Sheet editor or stored per-item coordinates were added;
- `projectRelationshipRows(...)` and `projectRelationshipMatrix(...)` resolve current dynamic Type metadata and annotations while retaining canonical Connection references/IDs, disabled records and multiple records per endpoint pair; no Table redesign or Matrix UI was added;
- presentation packs include a separate `relationships.csv` with Connection ID, Source, Target, Type, Type Code, Enabled, Title and Body; JSON remains the existing canonical project snapshot without path samples, wrapped lines or Widget geometry;
- the export projector has no live camera, WidgetHost, Manager, React-per-Connection or DOM-measurement dependency and projected 2,400 deterministic records without the live 1,024-command cap;
- RED was recorded against the missing R6 module/wiring; 106/106 focused and affected contracts then passed, including export, annotation, renderer, advanced styles, Legend, selectors, JSON/import and 2,400-record coverage;
- `npx --no-install tsc -b --pretty false` passed;
- tracked/untracked whitespace and scope checks passed;
- `http://127.0.0.1:4173/` serves the current worktree with HTTP 200 and title `ZONUERT Canvas Lab`;
- no browser automation, production build, full Matrix UI, Table redesign, screenshot/DOM export, Classic/Organism SVG rewrite, commit, push or merge occurred.

Next safe action:

Owner manual export/data inspection and Table/Matrix projection review for R6. Commit, push, R7 hardening, production build, browser QA and merge each require separate explicit authority.
