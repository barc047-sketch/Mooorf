# Current Project State

**Last updated:** 2026-07-23

**Repository:** `barc047-sketch/Mooorf`

## Git truth

| Classification | Current truth |
|---|---|
| OFFICIAL PRODUCT LINEAGE | `main` contains the complete approved C0-M2, PF1A–PF1D.3, and Organism Cell Labels & Callouts lineage. |
| PRODUCT INTEGRATION COMMIT | `a7ef4cce4ff0ca4def8e5f5dcb74c5077369ce2e` |
| C0-M2 INCLUDED COMMIT | `a537102f9a9b71d0397266b7a22daef20e49282d` is an ancestor of the product integration commit; it was not merged separately. |
| OWNER APPROVED | C0-M2 Correction 1 and PF1D.3 Owner QA passed. |
| ACTIVE FINALIZATION BRANCH | `work/next-feature` is remote-backed at accepted R5.5 checkpoint `4154bd5` and carries local-uncommitted R6 export/projection work; no merge is authorized. |
| FABLE RUN 1 | Four preserved commits from `0fd5658fc498c890683298a6d073cd9e5f5d8ae8` through `52293c4dff1fc9be05561935337e9846da1d4ce6`. |
| SOL PRODUCT COMMIT | `e18b2dd5b23a0610a570f9c5322630534cf379d6` |
| CORRECTION 2 PRODUCT COMMITS | `199eda0afaa1f10cce43de57ebeca3466611f22a`, `96ac4e38303d79bd1e9e84b4f97c16a2729819b5`, `b4e7a3ec04c8a6e14625cd241cbba23dc32e5a67`, `61fcb9d313b91d486d2287156d77e84eb972658a` |
| CORRECTION 3 PRODUCT COMMIT | `48611c285dac6c11583ba8df251da01237e561b0` |
| FINAL ICON PRODUCT COMMIT | `378301fe80b478f2ae5b9411a328efc2cbe52f97` |
| STATUS | ORGANISM CELL LABELS & CALLOUTS: COMPLETE / MERGED / OWNER QA PASSED. |
| CONNECTIONS P1 SOURCE SHA | `3f62032c54d76a014a781504cc5cd8e4b5ee63d9` on both synchronized source branches. |
| CONNECTIONS P1 PRODUCT COMMIT | `01a6c916b426b63628b1a8d0d94c8fb530bfc6c8` on `work/next-feature`. |
| CONNECTIONS P1 STATUS | PUSHED / WAITING OWNER REVIEW. |
| CONNECTIONS P2 PRODUCT COMMIT | `be1b9748298c35a3c89736afaf0ede5e533806ee` on `work/next-feature`. |
| CONNECTIONS P2 STATUS | PUSHED / CODEX BROWSER QA PASSED / WAITING OWNER REVIEW. |
| CONNECTIONS R2B.1B FOUNDATION | `6c41d25381ad7943f6b2fa3938520864bfdbbea8` is pushed to `origin/work/next-feature` by normal fast-forward. |
| CONNECTIONS R2B.2 STATUS | LOCAL UNCOMMITTED / FINAL VISUAL CORRECTIONS APPLIED / PREVIEW AVAILABLE / WAITING OWNER QA. |
| CONNECTIONS R3A STATUS | OWNER QA PASSED / LOCAL CHECKPOINT `5f5e178` / NOT PUSHED. |
| CONNECTIONS R3B STATUS | OWNER ACCEPTED / PUSHED at `e9f9219`; no merge is authorized. |
| CONNECTIONS R4A STATUS | CHECKPOINT `19e9474` / INCLUDED AS ANCESTOR OF REMOTE-BACKED `4154bd5`. |
| CONNECTIONS R4B STATUS | CHECKPOINT `5cf601b` / INCLUDED AS ANCESTOR OF REMOTE-BACKED `4154bd5`. |
| CONNECTIONS R5 STATUS | OWNER ACCEPTED CHECKPOINT `833ca10` / INCLUDED AS ANCESTOR OF REMOTE-BACKED `4154bd5`. |
| CONNECTIONS R5.5 STATUS | PUSHED / REMOTE-BACKED at `4154bd5`; no merge is authorized. |
| CONNECTIONS R6 STATUS | LOCAL UNCOMMITTED / EXPORT PARITY + PROJECTION HOOKS APPLIED / AUTOMATED CHECKS PASSED / WAITING OWNER QA. |
| NEXT AUTHORITY | Owner manual R6 export/data and projection QA only. Commit, push, R7, production build, browser QA, merge and branch cleanup each require separate explicit authority. |
| BACKUP BRANCHES | Existing feature branches remain historical backup refs and are not active work. |

## Integrated product state

### C0-M2

- one Inspector with `Content | Appearance | Symbol`;
- 133 production symbols;
- Cell and Void symbol support;
- Auto Contrast and Custom tint;
- corrected arrangement and batch Add;
- complete current appearance controls and runtime power gates;
- central persistence, history and export ownership.

### PF1A–PF1D.3

- Canvas/runtime performance work;
- lazy Table workspace;
- Organism pause during Table;
- bounded 500-row virtualization;
- 35/65 workspace and 70/30 Upload/Download cards;
- full-width Search;
- CSV, XLS and XLSX upload;
- multirow review with validation and diagnostics;
- Add and Replace;
- XLSX template with `SPACES` and `README`;
- synchronized Canvas/Table/store data.

### Organism Cell Labels & Callouts — COMPLETE / MERGED / OWNER QA PASSED

- Organism remains the sole production renderer; Classic remains compile-only legacy code.
- twelve production Cell Label layouts share one contract, preset registry and pure resolved projection: the original nine plus Dual Ring, Ring + Core and Technical Orbit.
- Ring retains the `ring` layout identity at every zoom; primary and secondary curved arcs support canonical Body content, bounded fitting/degradation, readable flip and an explicit user-controlled hide threshold.
- shared runtime inside-text fitting keeps fitted inside layouts within the configured Cell occupancy without authored-setting, store or history writes while zooming.
- Flag remains presentation-only and deterministic, with advanced placement, leader, panel and content controls; it never creates a Relationship.
- the compact Inspector and WidgetHost-based Label Studio edit the same Project Default, sparse local override and Mixed-state label owner.
- Display reuses the canonical camera and label-fit settings; camera shake is runtime-only and excluded from persistence, exports and camera history.
- Correction 3 adds direct Dock launchers for Label Studio and Membrane Detail through the existing `openWidget` lifecycle; the generic Membrane Detail launcher is suppressed when it would duplicate the dedicated control.
- selected-state camera shake now remains a bounded deterministic presentation signal while a Cell is selected, and its authored settle duration applies only after deselection.
- Membrane zoom preferences change sampling/detail only: camera zoom preserves authored geometry, fusion, reach and Cell-to-Membrane proportions.
- project files, Saved Views where applicable, migration and authored-history paths retain the correction settings; PNG, PDF and presentation ZIP use the shared detached Organism label projection.
- final Label Studio launcher correction uses the approved Lucide `MessageSquareText` callout icon at the existing Dock sizing/stroke; no dependency or asset-registry changes.

### Connections P1 — PUSHED / WAITING OWNER REVIEW

- the Master Graph and central store share one canonical `connections` collection with semantic meaning separate from optional visual settings;
- six launch semantic definitions and stable modifier/geometry/stroke/marker IDs are registry-driven, with safe fallback retention for unknown future semantic IDs;
- immutable-identity-cached indexes provide ID, endpoint, unordered-pair and exact-semantic lookup without persisted derived state;
- create, semantic update, visual update, enable/disable and delete use the existing history owner with one transaction per completed action;
- canonical Cell deletion removes indexed dependent Connections in the same transaction, and Undo/Redo restores or removes the Cell and Connections together;
- project JSON, `.mooorf`, Saved Views, recovery and applicable schedule transfer preserve or safely prune the collection; old projects migrate to an empty collection;
- `docs/CONNECTIONS_IMPLEMENTATION_CONTRACT.md` owns the non-negotiable performance rules and eight-stage roadmap;
- no Dock, Inspector, line renderer, preview, label, Matrix, Material, Morph Bridge, Behaviour, animation, Classic, or visual export implementation was added.

### Connections P2 — PUSHED / WAITING OWNER REVIEW

- one `Connections` Dock launcher reuses the existing widget registry, WidgetHost, WidgetFrame, focus, minimize and persistent-geometry lifecycle;
- the compact widget exposes the six canonical semantic types, bounded `Connect Cells` and `Connect Selected` authoring, live status, cancellation, and an endpoint-aware existing-Connection list;
- a pure authoring reducer and explicit ephemeral Connection selection extend the central store without mixing Connection IDs into Cell selection or persistence;
- exact semantic duplicates select the existing Connection without history, while different semantic types for the same pair remain valid;
- Organism owns one non-persistent SVG preview line with local/ref pointer updates, existing hit testing and camera feedback; it hides on commit, cancellation, Escape, Table activation and widget close;
- the existing Inspector switches to semantic Connection Quick, Notes and Actions sections, while unchanged Cell/Void Inspector ownership remains the fallback;
- completed create, semantic edit, enable/disable, notes and delete operations reuse the existing one-transaction history owner; preview, selection and cancellation remain history-free;
- no stored-line renderer, visual grammar, geometry/stroke/marker/label controls, export rendering, Matrix, Material, Morph Bridge, Behaviour, animation or Classic work was added.

### Connections R2B.2 — LOCAL UNCOMMITTED / WAITING OWNER QA

- the selected-Connection Inspector now uses the shared dynamic factory/project Relationship Type library with Custom fallback instead of a fixed semantic list;
- the default surface is compact: actual endpoint names, Type, progressive Title/Body controls, a resolved style preview, Reverse and Delete;
- the repository-loaded active project currently has no project-created Relationship Types; focused fixtures prove active types appear, archived types do not, and Custom remains safe;
- click and Shift-click retain the existing history-free Connection selection owner, while the Inspector renders a distinct compact multi-Connection state instead of presenting one record;
- Inspector Delete removes the canonical selected Connection; guarded Delete/Backspace removes one or many selected Connections in one history transaction and never intercepts an editable text surface;
- a transient style clipboard copies one selected Connection's resolved geometry, pattern, markers and appearance scalars, then rebases that appearance into minimal sparse local overrides for one or many selected targets in one history transaction;
- the existing batched Connection renderer now gives selected lines `1.00`, endpoint-related lines `0.76`, and unrelated contextual lines `0.44` alpha during selected-Connection focus; selected-Cell focus retains the same contextual floor;
- `RelationshipTypePicker` reuses one accessible custom glass listbox for both surfaces: the approved Quick Rail opens upward and the Inspector opens downward while retaining the dynamic selectable Relationship Type library;
- Title and Body reuse sparse canonical annotation overrides; text commits through the existing blur/finalization content-edit convention rather than per keystroke;
- annotation changes and Reverse each use the central one-record Connection history path, preserving sparse visual and annotation overrides across reclassification/reversal;
- advanced requirement, strength, priority, direction, geometry, marker and anchor controls remain in canonical data but are removed from the normal Inspector surface;
- no Relationship Manager, style panel, renderer, Canvas annotation, port, export, Matrix, Table, Classic or production-build work occurred.

### Connections R3A — OWNER QA PASSED / LOCAL CHECKPOINT

- the one registry-owned Connections widget is now the `RELATIONSHIP MANAGER`, reusing workspace geometry at `40vw × 78vh` with responsive viewport bounds;
- `TYPES` consumes the canonical factory/project library, cached indexed usage counts and resolved style defaults; `CONNECTIONS` remains a next-stage placeholder;
- name/code/description search preserves canonical order; the Manager owns its vertical scroll and uses `content-visibility` for long libraries;
- project type creation/editing preserves stable IDs and immediately feeds the same Quick Rail and Inspector selector;
- Custom and factory identities remain protected; project archive/delete requires reassignment when used and applies as one atomic history operation without orphan IDs;
- archived project types leave selectable lists and remain restorable; Undo/Redo cannot leave authoring on an unavailable type;
- one shared authoring picker now caps at 240px (approximately five rows), scrolls internally, preserves Quick Rail up/Inspector down direction, and shows the same resolved color/pattern/width/geometry/marker preview used by Manager rows;
- a ten-item per-user local UI preference orders only authoring pickers by actual Relationship Type use; it is excluded from Connection history, project/Saved View semantics and Manager ordering, and unavailable IDs are ignored;
- multi-Connection Inspector now presents the shared Type or presentation-only `Mixed`, and applies one reclassification to the selected canonical records in one Undo/Redo transaction without replacing their visual, annotation, endpoint, anchor, enabled or unrelated semantic fields;
- Inspector labels make single/multi deletion explicit, while the existing delete actions continue to remove canonical records atomically rather than hiding, archiving or disabling them;
- no common Style Panel, full Connections tab, renderer, Canvas annotation, advanced port, export, Matrix, Table or Classic work occurred.

### Connections R3B — LOCAL UNCOMMITTED / WAITING OWNER QA

- the existing registry-owned `ConnectionStudioWidget` is the single universal Style Panel for Relationship Type defaults, one Connection and a fixed multi-Connection target set, including Custom Connections through the same override path;
- one shared runtime-only draft feeds Canvas, Manager, picker, Inspector and panel previews while canonical project data and history remain unchanged until Apply; Cancel removes the draft with zero history;
- geometry, stroke patterns, canonical start/end markers, line caps and line joins use visual tiles/specimens rather than text-first dropdowns; width is safely authored from `0.5–64`, Pattern scale is shared, and Pattern amplitude is capability-gated;
- `strokePatterns.ts` is the extensible source for the six existing patterns plus Zigzag, Wave, Scallop, Vertical Hash, Vertical Hatch and Lightning, including preview/renderer strategy and bounded motif metrics;
- procedural motifs sample the unchanged canonical Connection path as a centerline and never replace persisted endpoints, anchors, lanes, hit testing or semantic geometry with sampled points;
- multi style displays presentation-only Mixed values; only touched fields preview/apply across targets, and Apply derives sparse overrides independently while preserving untouched local differences, semantics, endpoints, anchors, enabled state and annotations;
- single Apply and bulk Apply each create one history entry total; Undo restores each individual prior style, while Reset remains an intentional one-transaction removal of selected visual overrides;
- Relationship Type and factory style drafts preview through inheritors on the actual batched Canvas and every shared preview surface; explicit Connection-local fields remain overriding;
- shared Relationship Type/Connection previews adapt to available space (`105–165px` compact, `145–240px` standard); increased length adds motif repetitions without non-uniformly stretching dash length, wavelength, tooth/hash size, amplitude, markers or stroke width;
- explicit type choice through either Inspector or the selected-set Quick Rail clears sparse local styling while retaining anchors and all non-style content in one transaction; Undo restores each exact prior type/visual pair, while Manager retirement reassignment continues preserving bespoke visuals;
- Vertical Hash remains base-plus-marks and Vertical Hatch renders marks only; its invisible canonical path retains endpoint markers, pattern placement and hit testing, with Pattern Scale and Amplitude controlling spacing and mark length;
- adaptive previews remain automatic and add repetitions with available width; they expose no authored responsiveness toggle;
- selection no longer redraws a thicker accent/neutral replacement stroke, so colored, thick and procedural Connections retain their exact resolved authored/transient appearance; focus opacity remains selected `1.00`, endpoint-related `0.76` and contextual `0.44`;
- the final renderer boundary measures the active Canvas transform and CSS/backing-store ratio instead of assuming DPR cancellation; camera-projected path positions/extents still zoom, while Fixed mode compensates width, dash/gap values, procedural wavelength/amplitude, hash/hatch dimensions, marker size/offset and bounded selection expansion in final CSS pixels;
- the Relationship Manager tune surface now visibly owns one project-level `VISUAL SCALE` segmented control. `Fixed on Screen` defaults missing/legacy data safely; `Scale with Canvas` applies the normalized `0.25–4` camera zoom to the same metrics for an intentional comparison;
- `settings.connectionView.visualScaleMode` is the sole canonical owner, updates both Canvas draw passes immediately, creates no Connection history, mutates no Connection/type/style draft and round-trips through the existing project/config/Saved View/recovery seams;
- hit tolerance remains screen-space practical in both modes; no grey replacement overlay or second uncompensated draw pass was introduced;
- live single, multi and Relationship Type drafts use the same Canvas metric resolution; non-Canvas preview specimens remain camera-independent and adaptive;
- eligible Style Panel Enter applies through the same one-transaction command as the button after pending range values flush; menus/options, buttons, multiline/contenteditable surfaces, repeats, modifiers, prevented events and IME composition retain native ownership, with a compact `↵` Apply hint;
- annotation appearance remains visibly deferred until its later canonical schema; the later R5 Owner amendment removes visible authoring ports while retaining Visual Scale and the bounded authoring/interaction settings; no Canvas annotation, export, Matrix, Table, Classic or production-build work occurred.

### Connections R4A — OWNER ACCEPTED / LOCAL CHECKPOINT

- the existing registry-owned Relationship Manager now replaces its CONNECTIONS placeholder with a canonical Connection projection; TYPES remains the accepted R3A library and settings/style owners;
- `src/domain/connections/selectors.ts` owns a pure reusable filter model for normalized query, dynamic Relationship Type, Active/Inactive and inherited/visual/annotation override modes, preserving canonical order and hidden selected IDs;
- the bounded Connections tab uses an internal fixed-row overscan window, compact glass rows, endpoint/type metadata, resolved local style previews, enabled state, icon-first override indicators and Locate actions;
- Manager row, Shift-click, checkbox and filtered select-all interactions reuse the central `selectedConnectionIds` owner; bulk Change Type and Delete reuse existing atomic history commands;
- `locateConnection` returns Table to Canvas and fits the existing camera around canonical endpoint Cells without persisting geometry or creating history; global Connections visibility remains distinct from enabled state;
- exactly one selected Relationship Type exposes icon-first Duplicate, Copy Style, Paste Style and Edit Style actions; duplication creates a project type with unique identity/metadata, while Copy/Paste reuse the existing source-agnostic visual clipboard for Type↔Connection compatibility;
- icon-focused plain Enter now reaches the same canonical Connection Studio Apply command, latest field values settle before the queued Apply, and open listboxes select without prematurely applying the Studio session;
- Inspector presentation now prioritizes selected Connection(s), then the existing canonical Connection mode, then normal Cell selection; a no-selection mode state shows the current authoring Relationship Type without adding another mode or selection owner;
- focused R4A/Manager/shared-selection/lifecycle contracts passed 38/38, `npx --no-install tsc -b --pretty false` passed, and `git diff --check` passed. No browser automation, production build, commit or R4A push occurred.

### Connections R4B — LOCAL CHECKPOINT / NOT PUSHED

- the universal Connection Style Panel edits canonical Title/Body content and annotation appearance through its existing transient draft; Apply creates one history transaction and Cancel creates none;
- Relationship Types own annotation appearance defaults while Connections retain sparse local presentation overrides; Inspector owns per-Connection path position, side, offset, alignment, width and plate placement controls;
- one batched Canvas annotation projection resolves canonical Connection paths, horizontal text, deterministic collision handling, bounded screen-space LOD and instrumentation without per-record React surfaces;
- `settings.connectionView.visualScaleMode` remains the only scale owner for Connection graphics and annotations: Fixed mode keeps the complete annotation unit stable in final CSS pixels, while Canvas mode scales text, plate, spacing, wrapping width and offset together through normalized camera zoom;
- authored annotation values remain zoom-independent; live Style/Inspector drafts use the same renderer path and mode switching invalidates Canvas presentation immediately;
- the visual Style clipboard includes annotation typography and plate appearance but excludes Title/Body content and per-Connection placement.

### Connections R5 — OWNER ACCEPTED / LOCAL CHECKPOINT

- one compact Relationship Manager tune surface owns Visual Scale, dynamic Default Type, Stay in mode, Select new, Edge auto-pan, hit tolerance, unrelated fade, Connection motion and bounded reset; Port Layout no longer exists;
- `settings.connectionView` is the sole normalized project/config/Saved View/recovery owner; missing values migrate to Fixed on Screen, Custom, Stay/Select/auto-pan on, `12px` corridor, `0.55` unrelated fade and Standard motion;
- `C` mode renders no authoring ports: pointer-down anywhere inside an eligible visible Cell uses the existing Cell-body hit geometry, and release anywhere inside another eligible Cell acquires the target;
- one batched interaction overlay draws only restrained source and valid-target Cell outlines plus the temporary preview; invalid targets never receive the valid outline;
- every newly authored Connection persists canonical `auto` start/end anchors so project Type side defaults cannot displace it, while historical explicit side anchors remain readable and editable;
- Default Type resolves from the dynamic active library with Custom fallback, while Stay/Select preferences reuse the existing one-transaction authoring/selection/Inspector path;
- Custom now defaults to a gentle curved `3px` solid at authored opacity `0.82`; factory/project Type styles remain intentional and explicit `0.5–64px` styles remain valid;
- edge auto-pan reuses the current camera/demand-frame owner only during active drag; hit tolerance changes only existing-line selection, unrelated fade clamps at `0.28`, focus defaults are selected `1.00`, related `0.82`, unrelated `0.55`, and Reduced motion still yields to OS reduced-motion policy.

### Connections R5.5 — PUSHED / REMOTE-BACKED

- Relationship Manager exposes a `LEGEND` action beside Settings that opens or focuses one independent frameless window through the existing WidgetHost/WidgetFrame lifecycle; the Manager's `TYPES` and `CONNECTIONS` content remains uninterrupted and closing Manager leaves Legend open;
- the Legend has no visible title/header, uses only tiny vertically stacked top-right minimize/close controls and remains movable through an invisible outer-shell drag region; it remains two-axis resizable and viewport bounded;
- `src/domain/connections/relationshipLegend.ts` owns a React-free deterministic projection from the stable canonical active Type library, resolved live styles, canonical Connections, semantic Legend config and available dimensions into semantic items, grid placement, bounds and drawing-preview data;
- `settings.connectionView.legend` is the one normalized project/config/Saved View/recovery owner for Auto/Horizontal/Vertical, horizontal rows `2–6`, Compact/Standard/Large density, Short/Standard/Long specimen length, Legible/True specimen weight, Text Width `80–320px`, text Align, semantic text X/Y placement, All Active/Used Only and Style/Name/Code/Description visibility; controls remain only in Manager Settings;
- the Legend body is output-only, and its frame x/y/width/height are remembered as workspace UI-session state outside canonical data, Relationship Types and history;
- Auto balances actual inner width and height, Horizontal fills down before opening columns and Vertical fills across before opening rows; no scrollbar exists, all items remain projected, and readable content grows the existing frame within viewport bounds when reflow/tightening is insufficient;
- the editorial surface is specimen-first/name-second with no Type cards or default row separators; Style + Name is one compact line, while Code/Description alone add secondary height;
- Legible raises only the Legend preview minimum for thin lines; True preserves authored relative width. Long Dash, Dash-Dot-Dot, Sparse Dot and Centerline add four parameter-driven registry families without loose/dense duplicates;
- archived Types are excluded, Used Only derives from canonical Connections, Manager ordering is preserved independently of authoring MRU, and live Type/usage/style/settings changes reproject without reopening either window;
- the same pure projection accepts arbitrary width, height and semantic config for future Sheet and authored export consumers; no actual export, Sheet placement, Matrix, manual item positioning or alternate Type owner was added.
- the frameless Legend overrides only its old workspace minimum with a live current-width shallow projection plus actual border/control clearance; auto-growth never becomes a future resize floor, the empty state has no historical height reservation, and no-scroll bounded growth remains intact.
- Manager `LEGEND SETTINGS` now uses the existing Morph-glass surface tokens and blur/border language; Hit tolerance and Unrelated fade reuse the shared `SliderRow`/`org-slider` primitive, eliminating native range styling without a Legend-specific slider path.
- `LEGEND SETTINGS` now uses the shared `.glass` primitive itself, with compact icon-first layout/density/alignment/placement controls, visual specimen-length marks, bounded numeric Text Width and compact Content toggles. Text Width participates in the pure width/reflow calculation; alignment and placement remain separate semantic output values and Y placement reserves no additional height.

### Connections R6 — LOCAL UNCOMMITTED / WAITING OWNER QA

- one detached, React/DOM-independent Connection export projection consumes canonical Connections, current Relationship Types, resolved sparse styles, shared lanes/geometry/motifs, shared annotation content/presentation and explicit output bounds/document scale;
- PNG, PDF and presentation ZIP now receive the same detached Organism Connection composition; the existing raster PDF sheet architecture remains unchanged and Organism SVG stays explicitly unavailable;
- export annotations ignore live Canvas LOD/focus/collision budgets, keep authored visible Title/Body content and full canonical Body text, and resolve Relationship-Type titles from the current dynamic library;
- global Connections visibility, per-record enabled and sparse local visibility remain distinct; semantic row/Matrix/JSON/CSV projections retain canonical records and status;
- the pure Legend projection now has a caller-owned Canvas/Sheet render target using semantic config and resolved Type specimens, never floating Widget geometry, Manager state, DOM scraping or per-item coordinates;
- pure Table rows and sparse Matrix cells retain canonical Connection references/IDs, resolve current Type metadata, and preserve multiple records between a pair without a Table redesign or Matrix UI;
- presentation packs add `relationships.csv`; canonical JSON remains free of sampled paths, wrapped text and window geometry;
- 2,400-record export projection is deterministic and uncapped by live viewport limits; no React-per-Connection, camera-store, WidgetHost or DOM-measurement dependency was introduced.

## Verification disposition

Correction 2 passed its focused correction contracts, `npx tsc -b --pretty false`, the final diff check, and exactly one production build. Codex browser checks were recorded at 1440×900 and 1280×800; Owner visual/interaction QA remains the active gate. The baseline Owner-QA failures were recorded before repair: Flag lost stable callout behaviour, Ring changed identity at low zoom, inside text overflowed, Membrane distorted across zoom, and the compact Inspector/Display lacked the requested controls.

Correction 3 passed focused Dock/widget and camera-shake contracts, TypeScript, final diff checks and one production build. Codex browser checks at 1440×900 and 1280×800 confirmed direct launchers, one Membrane Detail button when its family is active, persistent Soft selected-state feedback beyond ten seconds, bounded drag feedback, deselection settling and Off zero; no browser console errors were recorded.

Classic visual output and SVG were not audited or developed. Codex did not complete manual drag, reduced-motion/Table-shake, or downloaded-artifact comparison QA for this correction.

Connections P1 passed 58/58 focused and affected contracts with zero failures, including 12 Connections contracts plus existing history, persistence, export and Table-transfer coverage. `npx tsc -b --pretty false`, tracked diff check, untracked-file diff checks and final scope review passed. No production build or visual/browser QA was run because P1 contains no UI or renderer.

Connections P2 passed 46/46 focused and affected contracts with zero failures, `npx tsc -b --pretty false`, tracked and untracked diff checks, and final scope review. Codex development-mode browser QA at 1440×900 and 1280×800 verified one launcher/widget, the six canonical types, source/target preview and commit, duplicate selection, existing-list selection, Connection semantic edits with Undo/Redo, the unchanged Cell Inspector path, Escape/Table/widget-close cleanup, stable mounted Organism/labels, bounded widget geometry and zero console errors. No production build ran. Human smoothness/visual judgement remains Owner review.

Connections R2B.2 final visual correction passed 40/40 focused Connection presentation and Inspector contracts, `npx tsc -b --pretty false`, and final `git diff --check`. The local Vite preview returned HTTP 200 at `http://127.0.0.1:5173/`. Per task boundary, no browser automation or production build ran; visual and interaction judgement remains Owner QA.

Connections R3A initially passed 60/60 focused and affected contracts. The Owner-QA picker/bulk correction then passed 63/63 affected Relationship Type, Manager, picker, Inspector, canonical delete and history contracts followed by `npx tsc -b --pretty false`, tracked/untracked whitespace checks and an HTTP 200 response from the existing preview at `http://127.0.0.1:5173/`. Owner QA passed, and the exact accepted scope is protected by local-only checkpoint `5f5e178e4de36c8ab8b1fa03d5b014b6e0b47878`; no push occurred.

Connections R3B real zoom mode and visible toggle correction passed 88/88 affected final-render, transform, procedural, marker, Manager, persistence, live-draft, hit-testing, history and keyboard contracts, followed by TypeScript, tracked/untracked whitespace checks and final scope review. The accepted local checkpoint was pushed normally to `origin/work/next-feature` at `e9f9219524e2f4721670151340456a7e92bfab77`; `main` remains untouched.

Connections R4A Type duplication/clipboard correction passed 63/63 focused Manager, Relationship Type, style, history and shared-selection contracts, followed by `npx --no-install tsc -b --pretty false` and `git diff --check`. Per task boundary, no browser automation or production build ran; visual and interaction judgement remains Owner QA.

Connections R4A Enter/Inspector correction passed 46/46 focused Style Panel, picker, Inspector, authoring, Manager and lifecycle contracts. Development-browser QA at `http://127.0.0.1:5173/` verified icon-focused Enter Apply persistence, listbox Enter select-only ownership, one-step Undo, C-mode suppression of Cell Inspector, selected-Connection priority and Cell restoration after mode exit. No production build, commit or push occurred.

Connections R4B and its shared Visual Scale addendum passed 73/73 focused annotation projection, renderer, scale-setting, Style Panel, clipboard, registry and history contracts. `npx --no-install tsc -b --pretty false`, tracked and untracked whitespace checks passed. Per task boundary, no browser automation, production build, commit or push occurred; visual and interaction judgement remains Owner QA.

Connections R5 whole-Cell correction passed 144/144 affected settings, persistence/recovery, authoring, renderer/hit, focus, Inspector, Visual Scale, Relationship Type and history contracts. `npx --no-install tsc -b --pretty false`, tracked and untracked whitespace checks passed, and the current-worktree development preview returned HTTP 200 at `http://127.0.0.1:5173/`. Per task boundary, no browser automation, production build, commit or push occurred; visual and interaction judgement remains Owner QA.

Connections R5.5 detached-window correction passed 57/57 affected Legend projection, WidgetHost/Frame lifecycle, canonical Type/order/usage, Manager, adaptive style-preview, settings, project/Saved View/import/recovery and advanced-stroke contracts. `npx --no-install tsc -b --pretty false`, tracked and untracked whitespace checks passed. The focused large-library projection covers 6, 20, 50 and 120 Types, and the current-worktree development preview returned HTTP 200 at `http://127.0.0.1:5173/`. Per task boundary, no browser automation, production build, actual export/Sheet placement, commit or push occurred; visual, move and resize judgement remains Owner QA.

Connections R5.5 final editorial Legend and linetype refinement passed 36/36 affected frameless-chrome, no-scroll fitting/growth, semantic specimen, linetype-registry, Canvas-behavior, import and widget-lifecycle contracts. Exact `npx --no-install tsc -b --pretty false`, tracked and untracked whitespace checks passed, and the current-worktree development preview returned HTTP 200 at `http://127.0.0.1:5173/`. Per task boundary, no browser automation, production build, actual R6 export/Sheet placement, commit or push occurred; visual, move and resize judgement remains Owner QA.

R5.5 Owner-QA Legend height and settings visual-consistency correction passed 22 focused Legend projection, Manager settings, widget lifecycle and registry contracts. The correction replaces the old `180px` workspace floor only for the frameless Legend with a current-width shallow projection plus measured control/border clearance, preserves bounded no-scroll growth, applies existing Morph-glass tokens to `LEGEND SETTINGS`, and routes the Manager range controls through the shared slider primitive. Exact TypeScript, tracked/untracked whitespace checks and the current-worktree HTTP 200 preview check passed. No browser automation, production build, commit or push occurred.

R5.5 final editorial Legend Settings UX pass passed 23 focused Legend projection, Manager settings, widget lifecycle and registry contracts. The shared `.glass` primitive replaces the transparent local Legend surface; semantic Text Width, alignment and X/Y placement normalize through the one existing config, alter the pure width/reflow projection where applicable, and update the detached output live without item coordinates or history. Exact TypeScript, tracked/untracked whitespace checks and the current-worktree HTTP 200 preview check passed. No browser automation, production build, commit or push occurred.

Connections R6 recorded RED against the missing export/projection seams, then passed 106/106 focused and affected export, annotation, renderer, advanced-stroke, Legend, selector, JSON/import and 2,400-record contracts. `npx --no-install tsc -b --pretty false`, tracked/untracked whitespace checks and the current-worktree HTTP 200 preview check passed at `http://127.0.0.1:4173/`. Per task boundary, no browser automation, production build, full Matrix UI, Table redesign, screenshot/DOM export, Classic/Organism SVG rewrite, commit, push or merge occurred; Owner manual artifact/data QA remains the gate.

## Current gate

R6 EXPORT PARITY + PROJECTION HOOKS COMPLETE — WAITING OWNER QA

`main` remains untouched. R6 commit, push, R7, production build, browser QA, merge and branch cleanup are not authorized.
