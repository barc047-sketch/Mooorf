# Current Project State

**Last updated:** 2026-07-22

**Repository:** `barc047-sketch/Mooorf`

## Git truth

| Classification | Current truth |
|---|---|
| OFFICIAL PRODUCT LINEAGE | `main` contains the complete approved C0-M2, PF1A–PF1D.3, and Organism Cell Labels & Callouts lineage. |
| PRODUCT INTEGRATION COMMIT | `a7ef4cce4ff0ca4def8e5f5dcb74c5077369ce2e` |
| C0-M2 INCLUDED COMMIT | `a537102f9a9b71d0397266b7a22daef20e49282d` is an ancestor of the product integration commit; it was not merged separately. |
| OWNER APPROVED | C0-M2 Correction 1 and PF1D.3 Owner QA passed. |
| ACTIVE FINALIZATION BRANCH | `work/next-feature` contains pushed accepted R3B plus local-uncommitted R4A Relationship Manager Connections work; no merge is authorized. |
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
| CONNECTIONS R4A STATUS | LOCAL UNCOMMITTED / CONNECTIONS TAB COMPLETE / PREVIEW AVAILABLE / WAITING OWNER QA. |
| NEXT AUTHORITY | Owner visual and interaction QA for R4A only. Commit, push, merge and branch cleanup each require separate explicit authority. |
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
- annotation appearance remains visibly deferred until its later canonical schema; R5 retains Auto/Center, Cardinal 4, Horizontal 2 and Vertical 2 port layouts plus the other listed Connection settings; no Canvas annotation, CONNECTIONS-tab, advanced-port, export, Matrix, Table, Classic or production-build work occurred.

### Connections R4A — OWNER-PASSED / CORRECTION WAITING OWNER QA

- the existing registry-owned Relationship Manager now replaces its CONNECTIONS placeholder with a canonical Connection projection; TYPES remains the accepted R3A library and settings/style owners;
- `src/domain/connections/selectors.ts` owns a pure reusable filter model for normalized query, dynamic Relationship Type, Active/Inactive and inherited/visual/annotation override modes, preserving canonical order and hidden selected IDs;
- the bounded Connections tab uses an internal fixed-row overscan window, compact glass rows, endpoint/type metadata, resolved local style previews, enabled state, icon-first override indicators and Locate actions;
- Manager row, Shift-click, checkbox and filtered select-all interactions reuse the central `selectedConnectionIds` owner; bulk Change Type and Delete reuse existing atomic history commands;
- `locateConnection` returns Table to Canvas and fits the existing camera around canonical endpoint Cells without persisting geometry or creating history; global Connections visibility remains distinct from enabled state;
- exactly one selected Relationship Type exposes icon-first Duplicate, Copy Style, Paste Style and Edit Style actions; duplication creates a project type with unique identity/metadata, while Copy/Paste reuse the existing source-agnostic visual clipboard for Type↔Connection compatibility;
- icon-focused plain Enter now reaches the same canonical Connection Studio Apply command, latest field values settle before the queued Apply, and open listboxes select without prematurely applying the Studio session;
- Inspector presentation now prioritizes selected Connection(s), then the existing canonical Connection mode, then normal Cell selection; a no-selection mode state shows the current authoring Relationship Type without adding another mode or selection owner;
- focused R4A/Manager/shared-selection/lifecycle contracts passed 38/38, `npx --no-install tsc -b --pretty false` passed, and `git diff --check` passed. No browser automation, production build, commit or R4A push occurred.

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

## Current gate

R4A OWNER-PASSED — ENTER APPLY + CONNECTION MODE INSPECTOR CORRECTION WAITING OWNER QA

`main` remains untouched. R4A commit, push, merge and branch cleanup are not authorized.
