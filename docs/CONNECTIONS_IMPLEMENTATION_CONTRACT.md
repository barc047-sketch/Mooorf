# MOOORF Connections V1 Implementation Contract

**Authority:** Owner-approved Connections V1 master run

**Frozen:** 2026-07-21

**Execution branch:** `work/next-feature`

**Starting head:** `c04e4fba1db003bd4e84583c9937e73ba9ae717b`

**Applies to:** Connections Tasks 0–7, every live renderer/editor surface, persistence path, data projection, visual export, and final verification gate

## 1. Existing product truth

Connections V1 extends the pushed P1/P2 lineage. It does not replace it.

- P1 product commit `01a6c916b426b63628b1a8d0d94c8fb530bfc6c8` owns the canonical `connections` collection, six launch definitions, open registry-compatible IDs, endpoint/pair/exact-semantic indexes, one central command/history path, dependent Cell cleanup, persistence, migration, recovery, and Saved View continuity.
- P2 product commit `be1b9748298c35a3c89736afaf0ede5e533806ee` owns the authoring reducer, ephemeral Connection selection, one Connections widget, one Dock launcher, one existing Inspector context, exact-duplicate selection, and one temporary Organism-local preview.
- The Master Graph and `src/state/store.ts` remain the only project-data owners.
- Organism remains the sole production renderer. Classic is compile-only legacy and receives no Connections work.
- The current 96-visible-nucleus Organism limit remains truthful. Larger authored projects are valid; they do not imply that every Cell renders simultaneously.

## 2. Non-negotiable ownership

- One canonical `Connection` record and one canonical `connections` collection.
- One central store and one bounded Undo/Redo owner.
- One camera and one demand-frame scheduler.
- One Inspector.
- One WidgetHost/WidgetFrame registry and lifecycle.
- One live Organism composition and one detached Organism export path.
- One pure visual projection shared by live drawing and detached export.
- Preview, pointer capture, whole-Cell authoring hover, selected handles, resolved anchors, lanes, culling, tessellation, hit geometry, and caches are runtime-only.
- Flag remains a presentation-only Cell callout. It never becomes a Connection record or endpoint.
- Material Registry, Morph Bridge, Cell Behaviour, full Matrix/Table UIs, Classic, and SVG remain outside this run.

## 3. Canonical authored model

```text
Connection
├── id
├── fromSpaceId
├── toSpaceId
├── enabled
├── semantic
│   ├── typeId
│   ├── requirement
│   ├── direction
│   ├── strength
│   ├── priority
│   └── notes
└── visual?                       sparse local override
    ├── visible?
    ├── geometryId?
    ├── strokePatternId?
    ├── startMarkerId?
    ├── endMarkerId?
    ├── startAnchorId?
    ├── endAnchorId?
    ├── label?
    └── appearance?
```

Project-level semantic type styles are authored separately in canonical project settings:

```text
ProjectConnectionStyles
├── custom
├── adjacency
├── direct-access
├── visual-access
├── shared-support
├── circulation-flow
└── separation
```

Resolved presentation is always:

```text
semantic type default → sparse local override → resolved visual style
```

There is no persisted `styleSource`. Absence of a local override means inherited type default. No resolved geometry or renderer result is persisted.

## 4. Semantic registry

Known V1 semantic types, in display order:

| ID | Name | Category | Table/Matrix code | Default modifiers |
|---|---|---|---|---|
| `custom` | Custom | unknown/general | `CUS` | optional · none · medium · normal |
| `adjacency` | Adjacency | proximity | `ADJ` | preferred · none · medium · normal |
| `direct-access` | Direct Access | access | `ACC` | required · two-way · strong · high |
| `visual-access` | Visual Link | access | `VIS` | preferred · two-way · medium · normal |
| `shared-support` | Shared Support | support | `SUP` | preferred · two-way · medium · normal |
| `circulation-flow` | Circulation Flow | flow | `FLOW` | preferred · a-to-b · strong · high |
| `separation` | Separation | constraint | `SEP` | avoid · none · strong · high |

`custom` is the default authoring type. Unknown future semantic IDs still round-trip unchanged through the safe fallback definition.

Modifier IDs remain:

- requirement: `required`, `preferred`, `optional`, `avoid`;
- direction: `none`, `two-way`, `a-to-b`, `b-to-a`;
- strength: `weak`, `medium`, `strong`;
- priority: `low`, `normal`, `high`, `critical`.

## 5. Visual registry and defaults

Known geometries: `straight`, `curved`, `orthogonal`, `elbow`.

Known patterns: `solid`, `dashed`, `dotted`, `dash-dot`, `double`, `segmented-bars`. The registry remains open for 40+ future IDs without schema migration; only these six are produced in V1.

Known markers: `none`, `open-arrow`, `filled-arrow`, `open-triangle`, `filled-triangle`, `circle`, `filled-dot`, `square`, `diamond`, `bar`, `slash`, `cross`, `architectural-tick`, `chevron`.

Known anchors: `auto`, `top`, `right`, `bottom`, `left`. New V1 whole-Cell authoring writes explicit `auto` endpoints so project Type side anchors cannot displace the new Connection; the existing renderer then clips visible geometry safely against each Cell.

Launch type defaults must remain distinguishable in monochrome and at low zoom:

- Custom — gentle curved solid, approximately `3px`, authored opacity `0.82`, the clean canonical cap/join, no marker;
- Adjacency — straight or soft curve, fine dashed, no marker;
- Direct Access — straight, medium solid, direction-compatible marker;
- Visual Link — soft curve, fine dotted, no marker;
- Shared Support — straight, double, no marker;
- Circulation Flow — curved or straight, medium solid, directional arrow;
- Separation — straight, dash-dot or segmented, no marker.

Style packs are `minimal`, `technical`, `presentation`, `monochrome`, and `high-contrast`. Applying a pack updates all seven project type defaults in one Undo transaction.

Reclassification preserves any sparse local visual override and reports `Local appearance retained`. `Use <Type> Default` removes the local override in one transaction. Reclassification without a local override automatically resolves through the new type default.

## 6. Mode and shortcut

The Connections Dock control and `C` shortcut invoke the same store command.

Entering mode:

1. makes the global visual layer visible;
2. activates `custom`;
3. opens the split contextual Quick Rail;
4. makes each complete visible valid Cell body an authoring target without visible ports;
5. announces `Connections shown for editing`.

One application-level shortcut owner handles `C`. It ignores repeats, modifiers, Table mode, `input`, `textarea`, `select`, search controls, contenteditable, notes, inline Cell editing, and modal text-edit sessions.

Exit rules:

- `C` while mode is active exits mode;
- Escape during a source/target drag cancels only that drag and keeps mode active;
- Escape while mode is active without a drag exits mode;
- exit removes preview, whole-Cell authoring feedback, handles, and Quick Rail without authoring a change;
- permanent lines remain according to global visibility.

Cell and Connection selection remain mutually exclusive. V1 mixed selection means multiple selected Connections only.

## 7. Whole-Cell authoring

MOOORF V1 exposes no authoring ports. In Connection mode, the existing visible Cell-body hit geometry is the sole source and target interaction surface.

- Pointer-down anywhere inside a visible, non-Void, non-hidden, non-locked, non-deleted Cell begins authoring.
- Hover and release anywhere inside another eligible Cell acquire that target.
- Source and valid-target feedback use restrained whole-Cell outlines on the existing batched interaction overlay; invalid Cells never receive valid-target treatment.
- New Connections persist explicit canonical `auto` start/end anchors, representing deterministic center intent without side or nearest-edge authoring inference.
- Whole-Cell hover and preview perform no store/history writes and own no continuous animation.
- Hard OFF removes authoring feedback and all Connection-mode Cell targeting.

Primary interaction:

```text
pointer down anywhere in source Cell
→ pointer capture
→ local preview follows pointer
→ existing visible Cell hit detection
→ release anywhere in valid target Cell
→ one canonical transaction
→ select result
→ remain in mode
```

Release on empty Canvas or an invalid target creates no Connection and no history. Exact duplicates create no history, select and briefly emphasise the existing record, and announce `Connection already exists`. A different semantic record for the same pair remains valid.

Mode remains active for repeated one-to-many creation. An accessible Manager fallback exposes source and target native controls that call the same authoring/store commands; it is not a second reducer or primary creation model.

Existing pan, zoom, Space temporary-pan, and middle-button pan remain available while not dragging. Active drag uses pointer capture and the existing demand-frame scheduler for bounded edge auto-pan; there is no second camera or uncontrolled loop.

## 8. Contextual Quick Rail

The contextual Rail is a new Dock-adjacent surface, not a rewrite of the permanent left navigation Rail.

- It appears above the Dock as coordinated left/right wings around the unchanged Add Cell, Add Cluster, and Add Void centre controls.
- All seven semantic types remain one action away at normal desktop widths.
- `Manage`, `Detail`, and `Close` are secondary actions.
- `Manage` opens/refocuses the existing `connections` widget, now the Connections Manager.
- `Detail` opens/refocuses the registry-owned `connection-studio` widget.
- Type controls use a semantic icon, concise label where space permits, miniature pattern sample, tooltip, and keyed active state.
- Effective workspace width accounts for open non-minimised widget geometry; responsive modes are wide, medium, and compact/icon-only.
- The centre controls are never covered and the Rail creates no horizontal viewport overflow.

Open motion is 150–180 ms with opacity, `translateY(8px → 0)`, and `scale(0.985 → 1)`. Both wings move together. There is no animated blur, bounce, stagger, glow, shadow, or Organism remount. Reduced motion uses opacity-only or immediate state. Closed controls are not focusable and intercept no pointer events.

## 9. Global visibility and view state

The sole top-right owner, QuickToggleBar, exposes one always-available `Connections ON / OFF` control outside its collapsible subtree.

This view setting is separate from per-record semantic `enabled` and sparse local `visual.visible`.

OFF is a hard runtime gate. After transition settlement it performs:

- zero Connection draw calls;
- zero anchor/path resolutions;
- zero label layout work;
- zero Connection hit-test work;
- zero authoring feedback, previews, handles, or line animation.

The canonical collection and authored styles remain untouched. OFF may be captured by Saved Views. Export uses an explicit export option and never silently follows only this live toggle.

## 10. Live renderer architecture

Organism owns one base Connections Canvas2D surface and one batched interaction surface inside its existing host.

```text
WebGL Organism field
→ grid
→ base Connection Canvas2D batch
→ existing Cell presentation overlay
→ selected Connection / handles / whole-Cell authoring feedback batch
→ existing Cell labels and symbols
```

The base pipeline is pure and shared with detached export:

```text
canonical Connections
→ shared view/filter projection
→ endpoint validation
→ type-style resolution
→ sparse override merge
→ anchor/boundary clipping
→ deterministic pair lanes
→ path cache
→ viewport culling
→ batched draw
→ bounded hit index
```

No stored Connection or authoring target receives a React component or SVG element. The P2 SVG preview is replaced by the single batched interaction overlay. Static lines sleep after invalidation and use no independent scheduler.

Moving/resizing Cell A invalidates paths whose endpoint index contains A. A type-default edit invalidates inheriting records of that type. A local override invalidates only the edited records. Camera changes reproject visible paths without mutating authored geometry.

Multiple lines for one unordered pair use deterministic ID-stable ordering:

- one: centre;
- two: symmetric small offsets;
- three: centre plus symmetric small offsets;
- four or more: symmetric increasing lanes.

Selected records draw above siblings and remain individually hit-testable. V1 does not bundle lines.

## 11. Selection and direct editing

- Click replaces Connection selection.
- Shift-click toggles one Connection in the existing ephemeral Connection selection array.
- Manager and Canvas use the same selection owner.
- Selected endpoints receive external keyline emphasis; unrelated lines fade.
- Inspector supports mixed values across selected Connections.
- One property edit applies only that property to the selected records in one history transaction.

Only selected records expose reconnect-source, reconnect-target, reverse, delete, Studio, and supported curve controls. Reconnection uses the same valid endpoint policy and commits once on release. Editing handles are absent from unselected records.

## 12. Inspector, Studio, and Manager

The one existing Inspector stays the quick semantic editor. It owns endpoint summary, type, relationship-active state, direction, requirement, strength, priority, inheritance state, reverse, Studio launch, and delete. It does not become the complete visual grammar.

`connection-studio` is one new registry-owned WidgetHost/WidgetFrame body. It provides visual tabs for Meaning, Line, Anchors, Markers, Label, and Global. Its header always names endpoints, semantic type, relationship state, miniature preview, and editing scope (`This Connection` or `Type Default · <Type>`). Scope changes are explicit; a local edit can never silently write every type default.

The existing `connections` widget becomes Manager. It owns search, type/custom counts, selected-Cell, floor, cross-floor, active-state, and local-override filters; locate; shared multi-selection; bulk classification; bulk relationship-active state; bulk reset to type default; and a bounded virtual row window.

Floor semantics come from a canonical graph/store adapter. Current records without floor identity resolve as `Unassigned`; Manager never invents or persists a separate floor dataset.

## 13. Shared filters and future projections

One pure `ConnectionFilterSpec` and selector implementation is shared by Canvas, Manager, and future Matrix/Table consumers:

```text
search
typeIds
floorIds
selectedCellIds
activeState
customOnly
localOverrideOnly
crossFloorOnly
```

Stable pair queries, direction, multiple records per pair, stable Table/Matrix codes, pair selection, and canonical bulk commands are covered by tests. This run does not build full Matrix or Connection Table UIs.

## 14. Labels and dense degradation

Connection labels are optional and hidden by default. V1 supports semantic type, custom short text, direction, strength, priority, start/quarter/middle/three-quarter/end placement, horizontal/follow-path orientation, above/below offset, and a zoom hide threshold.

Label layout is bounded and deterministic. Dense degradation order is:

1. hide Connection labels;
2. simplify marker detail;
3. use the declared pattern fallback;
4. fade unrelated lines;
5. preserve selected/core lines;
6. preserve all semantic records.

No performance fallback rewrites or deletes authored data.

## 15. History, persistence, and migration

Every completed create, semantic edit, sparse visual edit/reset, enabled-state edit, reclassification, reconnection, delete, style-default edit, style-pack apply, and bulk action creates exactly one Undo entry. Preview, hover, selection, mode, filter changes, and cancellation create none.

Connection history records only the changed records/indices plus the small style snapshot required by the transaction; it does not copy a 100,000-record collection twice for every edit.

Project replacement, Saved View load, schedule replacement, and recovery restoration normalize/clear stale ephemeral Connection selection/authoring and cannot replay history from a different project snapshot.

Old projects without Connections migrate to `[]`. Old projects without project type styles or view settings receive V1 defaults. Existing complete P1 visual objects normalize into semantically identical sparse overrides. Unknown semantic and visual registry IDs remain recoverable.

Project JSON, `.mooorf`, recovery, Saved Views, applicable schedule transfer, and JSON export preserve canonical records and project type styles through existing owners. Settings-only configuration never duplicates semantic records.

## 16. Export contract

Live and detached Organism rendering consume the same resolved style, lane, anchor, and path projection. Detached output draws Connections after the WebGL field and before existing Cell presentation/labels so clipped endpoints remain covered by Cells.

Visual outputs: PNG, PDF, presentation ZIP.

Semantic outputs: JSON and relationship CSV. Space CSV remains a space projection; relationship CSV is a separate artifact.

Export UI exposes `Include Connections` and scope:

- current visible view;
- all active Connections;
- selected Connections.

Preview, authoring feedback, selection overlays, handles, hover, onboarding, camera feedback, and runtime caches never enter authored exports. Organism SVG remains unavailable.

## 17. Performance and instrumentation

Non-negotiable:

- no React component per Connection or authoring target;
- no store/history write per pointer frame;
- no persisted path/hit/culling result;
- no permanent static loop or second scheduler;
- no unchecked all-to-all Cell-pair work;
- cull before expensive draw/label work;
- endpoint-dependent cache invalidation;
- bounded hit index and Manager window;
- whole-Cell target detection reuses the current visible Organism subset and existing Cell hit geometry;
- Table pauses Connections with Organism;
- no Organism or label remount during mode/editing;
- complete semantic data under every LOD fallback.

Lightweight development/test counters cover path resolutions, draw calls, visible count, cache hit/miss, endpoint invalidations, hit-test work, OFF-state work, renderer mounts, store mutations during drag, and history transactions.

Required scenes:

- 25 visible Cells / 50 Connections;
- 60 visible Cells / 200–300 Connections;
- up to 96 visible Cells / large visible set;
- 500+ authored spaces / bounded visible subset / large semantic collection;
- settled OFF state with all visual-work counters at zero.

## 18. Accessibility, onboarding, and motion

- visible focus on Dock, Quick Rail, Manager, Studio, and Inspector controls;
- native buttons/radios/selects where native keyboard behaviour is sufficient;
- Manager endpoint controls provide the non-Canvas creation fallback;
- aria-live status for source, target, invalid, duplicate, commit, cancel, and mode visibility;
- invalid states use text and shape, not colour alone;
- the complete visible Cell body is the practical Canvas source/target area; UI controls retain at least 24 px target geometry;
- keyboard selection/deletion and Manager access to every record;
- pattern/marker differences keep semantic types identifiable without colour;
- reduced motion disables nonessential transitions;
- the collapsible QuickToggleBar subtree is removed from the tab order while closed.

First activation shows a lightweight contextual hint: `Press C to connect Cells` and `Drag from one Cell to another`. First success shows `Connection created · Press Esc to exit · C to toggle`. Dismissal is a local UI preference, never project semantic data.

Allowed motion is bounded Rail entry, target emphasis, new-line fade, selection emphasis, and Studio tab transition. There are no continuous flow animations, pulsing targets, glow loops, animated blur, or elastic overshoot.

## 19. Task and commit gates

| Task | Product boundary | Commit intent |
|---:|---|---|
| 0 | durable contract, exact implementation plan, progress ledger; no product code | `docs(connections): freeze v1 interaction and renderer specification` |
| 1 | Custom, style inheritance, style packs, shared filters/projection contracts; no Canvas renderer | `feat(connections): add custom type and style inheritance foundation` |
| 2 | unified mode, shortcut, split Rail, batched preview/whole-Cell feedback, drag/click authoring, onboarding, Manager role; no permanent stored-line renderer | `feat(connections): add rail-first drag authoring` |
| 3 | batched stored-line renderer, clipping, paths, lanes, culling, hit testing, selection, hard OFF, LOD/counters | `feat(connections): add batched visual renderer` |
| 4 | four geometries, six patterns, fourteen markers, five anchors, Studio, quick/mixed editing, reconnect/reverse | `feat(connections): add connection studio and visual grammar` |
| 5 | labels, bounded Manager, filters/counts/bulk selection, Matrix/Table hooks | `feat(connections): complete manager labels and projections` |
| 6 | detached visual parity, relationship CSV, explicit export scope, full continuity | `feat(connections): add export and data continuity` |
| 7 | performance/accessibility hardening, responsive/browser QA, final review, exactly one production build | `perf(connections): harden dense scenes and complete v1` |

Each product task uses RED → verified meaningful failure → minimal GREEN → affected contracts → TypeScript → diff check → task spec/quality review → Important/Critical fix loop → commit → progress ledger update.

## 20. Exclusions and stop conditions

Do not add a dependency, backend, auth, cloud save, public deployment, new state library, new graphics framework, Material integration, Morph Bridge, Behaviour, full Matrix/Table UI, animated flow lines, bundling, obstacle avoidance, arbitrary waypoints, 40 production patterns, Classic work, Organism SVG, rebase, squash, force push, or merge.

Stop `BLOCKED` on an unexpected SHA/dirty tree/active writer; migration data loss; required architecture replacement; unavoidable per-Connection React; hard OFF that still performs visual work; regression in Labels/Ring/Flag/Membrane/Table; repeated test failure after one bounded repair; one-build failure requiring scope expansion; or a review contradiction not resolved by this contract.

## 21. Final verification gate

Fresh evidence must include all focused Connections contracts; affected history/persistence/migration/widget/selection/keyboard/runtime/export contracts; TypeScript; tracked and untracked diff checks; browser QA at 1440×900 and 1280×800 plus constrained effective Canvas width; normal/dense/max-visible/large-authored/OFF performance scenes; zero browser console errors; one production build; full requirement audit; Git status; local/remote head; and ahead/behind state.

Only `work/next-feature` is pushed. `main` remains untouched. No merge is performed.

## 22. Exact browser acceptance checklist

At 1440×900, 1280×800, and constrained effective Canvas width, verify:

1. `C` enters mode.
2. Custom is active by default.
3. No visible authoring ports appear; every visible valid Cell body is a source target.
4. Hovering anywhere inside a valid destination Cell shows restrained whole-Cell feedback.
5. Drag creates a visible Connection.
6. Repeated creation works.
7. Empty release cancels only the drag.
8. Escape behaviour is correct.
9. `C` does not trigger during text editing.
10. Exact duplicate selects the existing record.
11. Different semantic types for one pair are allowed.
12. Parallel lanes are individually selectable.
13. The contextual Rail never covers the central Dock controls.
14. The contextual Rail adapts to narrower workspace width.
15. Top-right OFF performs no visual Connection work.
16. Line selection highlights endpoints.
17. Shift selection supports multiple Connections.
18. Inspector shows mixed states.
19. Connection Studio scope is always clear.
20. Changing a type default updates every inheriting Connection.
21. Local overrides remain sparse.
22. Reclassification preserves local overrides.
23. Manager search/filter/bulk actions work.
24. Table activation pauses the Connection runtime.
25. Exports exclude authoring feedback, preview, and selection overlays.
26. Organism and Cell labels do not remount.
27. The browser console records zero errors.

Unsupported manual interactions are reported honestly and remain Owner QA, never inferred from automated contracts.

## 23. Final report contract

Return:

1. verified starting SHAs;
2. plan path;
3. task/commit ledger;
4. every product commit SHA;
5. final feature head;
6. files created/modified by responsibility;
7. Custom type and migration behaviour;
8. type-style defaults and inheritance;
9. `C` shortcut and mode behaviour;
10. split Rail structure and responsive behaviour;
11. whole-Cell authoring architecture;
12. drag and multi-Connection behaviour;
13. renderer/layer architecture;
14. path cache and invalidation behaviour;
15. parallel-lane behaviour;
16. ON/OFF performance evidence;
17. selection and multi-selection;
18. Inspector and Connection Studio;
19. Manager and shared filters;
20. Matrix/Table future hooks;
21. labels and dense degradation;
22. export parity;
23. accessibility evidence;
24. focused test totals;
25. TypeScript evidence;
26. browser QA;
27. dense-performance evidence;
28. the one production build;
29. whole-branch review findings/resolutions;
30. remaining limitations;
31. confirmation `main` is untouched;
32. confirmation feature local/remote heads match;
33. final ahead/behind state;
34. clean worktree;
35. confirmation no excluded scope entered.

End exactly:

```text
CONNECTIONS V1 IMPLEMENTATION COMPLETE
CUSTOM DEFAULT COMPLETE
RAIL-FIRST DRAG AUTHORING COMPLETE
CENTRE PORT SYSTEM COMPLETE
BATCHED VISUAL RENDERER COMPLETE
GLOBAL TYPE STYLES COMPLETE
CONNECTION STUDIO COMPLETE
CONNECTION MANAGER COMPLETE
EXPORT PARITY COMPLETE
PERFORMANCE HARDENING COMPLETE
MAIN UNTOUCHED
NO MERGE PERFORMED
WAITING OWNER QA
```
