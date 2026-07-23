# Active Task

## R7 CONNECTIONS V1 FINAL HARDENING

Status: LOCAL UNCOMMITTED / AUTOMATED + CODEX BROWSER QA PASSED / WAITING FINAL OWNER QA

- branch: `work/next-feature`;
- accepted starting local R6 checkpoint: `7be315ea692f45e9ee62eaa10b8a8c751dcae86d`;
- `origin/work/next-feature` intentionally remains at `4154bd5dda986db7c8ec7d63c6df90b1ffd180d1`; `main` remains untouched;
- the active production Organism cap is now 500 Cells through the existing `MAX_NUCLEI` owner;
- the WebGL renderer keeps one field draw path and transports the bounded 500-Cell position/radius/strength/color payload through one persistent `RGBA32F` data texture instead of oversized fragment-uniform arrays;
- shader work remains proportional to the current bounded Cell count, and the existing scheduler, Table inactivity gate, Connection viewport culling, 1,024 live command budget and detached export architecture remain intact;
- focused RED proved the old 96 cap and missing bounded texture path before implementation;
- 40/40 focused R7 cap/renderer contracts passed;
- 254/254 full relevant Connection, history, persistence, renderer, export, project-transfer, Table lifecycle and widget-owner contracts passed;
- 100/250/500-Cell projection contracts and 100/800/2,400-Connection density/export fixtures passed;
- `npx --no-install tsc -b --pretty false` passed;
- the one authorized canonical `npm run build` passed, transforming 2,952 modules in 16.16s with only the accepted Vite chunk-size warning;
- Codex browser Runs A/B/C cover normal load, whole-Cell authoring, typed multiple Connections, Manager range selection, Inspector Title/Body, Enter Apply, visual-scale modes, detached Legend/settings, Table→Canvas, Connections OFF→ON, PNG generation, export opening and console sanity;
- `http://127.0.0.1:4173/` serves the current worktree with HTTP 200;
- no feature redesign, new React-per-Connection path, Classic work, dependency install, commit, push, merge or `main` mutation occurred.

Next safe action:

Owner final manual R7 QA only. Commit, push, merge and branch cleanup each require separate explicit authority.
