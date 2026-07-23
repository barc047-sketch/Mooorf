# Active Task

## R4B CONNECTION ANNOTATIONS + SHARED VISUAL SCALE

Status: LOCAL UNCOMMITTED / AUTOMATED CHECKS PASSED / WAITING OWNER QA

- branch: `work/next-feature`;
- accepted R4A checkpoint `19e94749731fbdeec5988a182fb87186a775209c` is local and remains unpushed; remote feature HEAD remains `e9f9219524e2f4721670151340456a7e92bfab77`;
- canonical Title/Body content remains one sparse Connection annotation owner with Relationship Type inheritance;
- Relationship Types define annotation appearance defaults and Connections retain sparse presentation overrides;
- the universal Style Panel owns transient content/appearance preview and one-transaction Apply; Inspector owns local placement and plate adjustments;
- one batched Canvas projection draws horizontal annotations from canonical Connection geometry with deterministic collision handling and bounded screen-space LOD;
- the existing `settings.connectionView.visualScaleMode` controls Connection graphics and the entire annotation unit; there is no annotation-only scale setting;
- Fixed on Screen keeps text, line height, box, padding, radius, border, wrapping width, spacing and offset stable in final CSS pixels at every zoom;
- Scale with Canvas scales those metrics together through normalized camera zoom while the final Canvas/CSS output-scale compensation remains single-pass;
- canonical authored annotation values never store zoom-compensated metrics;
- the visual Style clipboard includes typography and plate appearance but excludes content and per-Connection placement;
- focused annotation, renderer, scale-setting, Style Panel, clipboard, registry and history contracts passed 73/73; TypeScript and tracked/untracked whitespace checks passed;
- no browser automation, production build, commit, push, merge, export, Matrix/Table projection, advanced ports, Classic or dependency work occurred.

Next safe action:

Owner visual and interaction QA for R4B. Finalization, commit, push, merge and branch cleanup each require separate explicit authority.
