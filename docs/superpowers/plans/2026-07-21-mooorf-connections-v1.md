# MOOORF Connections V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Connections V1 on `work/next-feature` by extending the pushed P1/P2 ownership into rail-first drag authoring, one batched Organism renderer, sparse inherited visual grammar, Studio/Manager editing, detached export parity, and verified dense-scene performance without merging `main`.

**Architecture:** Canonical semantic records and project type styles remain in the Master Graph/central store. Pure connection style/filter/geometry projections feed one live Canvas2D batch and the detached Organism export; the existing demand-frame scheduler, camera, history, Inspector, WidgetHost, and export snapshot owners remain singular. Runtime preview, ports, selection handles, culling, path caches, and hit geometry never persist.

**Tech Stack:** React 19, TypeScript 5.6, Zustand, native Canvas2D/WebGL composition, Motion for bounded chrome transitions, Node test runner through the installed `tsx` harness, Vite.

## Global Constraints

- Repository: `/Users/tanisxq/Documents/ZONU0`; branch: `work/next-feature`; starting local/remote head: `c04e4fba1db003bd4e84583c9937e73ba9ae717b`.
- `main` and `origin/main` remain `3f62032c54d76a014a781504cc5cd8e4b5ee63d9`; never merge, rebase, squash, force-push, or switch implementation to `main`.
- The lead orchestrator is the only writer. Fresh subagents are read-only implementation/review specialists; the lead applies every patch, runs verification, commits, updates the progress ledger, and pushes.
- Preserve P1/P2 commits and extend their canonical collection, registry, indexes, reducer, selection, Inspector, widget, persistence, and history seams.
- Organism is the sole production renderer. Do not implement or claim Classic or Organism SVG.
- One central store, history path, camera, scheduler, Inspector, WidgetHost/WidgetFrame lifecycle, and export path.
- No dependency installation or new third-party package. Reuse native Canvas2D and existing runtime owners.
- No React component or SVG element per stored Connection or per port; no store/history write per pointer frame; no persisted derived geometry; no unchecked Cell-pair generation; no permanent static loop.
- `custom` is the default semantic type; `visual-access` displays as `Visual Link`; unknown future IDs must round-trip unchanged.
- Global type style → sparse local override → resolved style. Do not persist `styleSource` or fill absent override properties with inherited defaults.
- Multi-selection means multiple Connections. Cell and Connection selection stay mutually exclusive.
- Floor filters consume canonical graph/store projection; missing live floor data is `Unassigned`, never Manager-owned duplicate data.
- OFF is a hard visual-work gate. Export has an explicit independent include/scope option.
- Run browser QA only after Tasks 2, 3/4/5 as relevant, and final Task 7. Run exactly one production build, in Task 7 after final code fixes.
- Every product behavior follows RED → meaningful failure → minimal GREEN → affected tests → TypeScript → diff checks → spec/quality review → fix/re-review → commit.
- Stop on every condition in `docs/CONNECTIONS_IMPLEMENTATION_CONTRACT.md §20`.

## File Ownership Map

| Responsibility | Canonical files |
|---|---|
| Authored Connection/schema and open IDs | `src/domain/graph/types.ts` |
| Registry, launch defaults, style packs | `src/domain/connections/registry.ts`, new `src/domain/connections/styles.ts` |
| Normalization, cloning, authoring reducer | `src/domain/connections/model.ts` |
| ID/endpoint/pair/exact indexes | `src/domain/connections/selectors.ts` |
| Shared Canvas/Manager/future filters | new `src/domain/connections/filters.ts` |
| Pure geometry, lanes, clipping, culling, hit index, counters | new `src/canvas/connections/geometry.ts`, `src/canvas/connections/renderer.ts`, `src/canvas/connections/instrumentation.ts` |
| Mode/port/auto-pan math and shortcut policy | new `src/canvas/connections/editing.ts`, new `src/interaction/connectionShortcut.ts` |
| Central state/history/Saved Views | `src/state/store.ts`, `src/types.ts` |
| Live Organism host | `src/canvas/OrganismCanvasView.tsx`, `src/canvas/organismCanvas.css` |
| Dock/Quick Rail/top-right control | `src/ui/Dock.tsx`, new `src/ui/ConnectionQuickRail.tsx`, `src/ui/QuickToggleBar.tsx`, `src/App.tsx`, `src/ui/shell.css`, `src/ui/quickToggleBar.css` |
| Manager/Studio/Inspector/widget lifecycle | `src/ui/widgets/ConnectionsWidget.tsx`, new `src/ui/widgets/ConnectionStudioWidget.tsx`, `src/ui/widgets/InspectorWidget.tsx`, `src/ui/widgets/WidgetHost.tsx`, `src/ui/panels/widgetRegistry.ts`, `src/ui/widgets/widgets.css`, `src/types.ts` |
| Project/import/recovery continuity | `src/export/projectSnapshot.ts`, `src/import/projectFiles.ts`, `src/import/projectTransfer.ts` |
| Detached visual/data export | `src/canvas/exportCapture.ts`, `src/export/organismExport.ts`, `src/export/exportService.ts`, `src/export/types.ts`, `src/ui/widgets/ExportWidget.tsx`, new `src/export/connectionCsv.ts` |
| Focused contracts | current `src/domain/connections/*.test.ts` plus task-specific tests named below |

## Cross-Task Interfaces

Task 1 produces these stable contracts; later tasks consume them without renaming:

```ts
export type KnownConnectionAnchorId = "auto" | "top" | "right" | "bottom" | "left";
export type ConnectionAnchorId = KnownConnectionAnchorId | (string & {});
export type ConnectionLabelContent = "hidden" | "semantic" | "custom" | "direction" | "strength" | "priority";
export type ConnectionLabelPosition = "start" | "quarter" | "middle" | "three-quarter" | "end";
export type ConnectionLabelOrientation = "horizontal" | "follow-path";
export type ConnectionLabelOffset = "above" | "below";

export interface ConnectionLabelStyle {
  content: ConnectionLabelContent;
  text: string;
  position: ConnectionLabelPosition;
  orientation: ConnectionLabelOrientation;
  offset: ConnectionLabelOffset;
  offsetPx: number;
  hideBelowZoom: number;
}

export interface ConnectionVisualAppearance {
  color?: string;
  width?: number;
  opacity?: number;
  curve?: number;
  markerSize?: number;
  markerOffset?: number;
  dashScale?: number;
}

export interface ConnectionVisual { // every field is a sparse local override
  visible?: boolean;
  geometryId?: ConnectionGeometryId;
  strokePatternId?: ConnectionStrokePatternId;
  startMarkerId?: ConnectionMarkerId;
  endMarkerId?: ConnectionMarkerId;
  startAnchorId?: ConnectionAnchorId;
  endAnchorId?: ConnectionAnchorId;
  label?: Partial<ConnectionLabelStyle>;
  appearance?: ConnectionVisualAppearance;
}

export interface ResolvedConnectionAppearance {
  color: string;
  width: number;
  opacity: number;
  curve: number;
  markerSize: number;
  markerOffset: number;
  dashScale: number;
}

export interface ResolvedConnectionStyle {
  visible: boolean;
  geometryId: ConnectionGeometryId;
  strokePatternId: ConnectionStrokePatternId;
  startMarkerId: ConnectionMarkerId;
  endMarkerId: ConnectionMarkerId;
  startAnchorId: ConnectionAnchorId;
  endAnchorId: ConnectionAnchorId;
  label: ConnectionLabelStyle;
  appearance: ResolvedConnectionAppearance;
}
export type ProjectConnectionStyles = Record<KnownConnectionSemanticTypeId, ResolvedConnectionStyle>;
export type ConnectionFocusMode = "all" | "selected-cell" | "selected-connections";
export interface ConnectionViewSettings {
  visible: boolean;
  focusMode: ConnectionFocusMode;
}

export function createDefaultProjectConnectionStyles(): ProjectConnectionStyles;
export function normalizeProjectConnectionStyles(value: unknown): ProjectConnectionStyles;
export function resolveConnectionStyle(connection: Connection, styles: ProjectConnectionStyles): ResolvedConnectionStyle;
export function applyConnectionStylePack(styles: ProjectConnectionStyles, packId: ConnectionStylePackId): ProjectConnectionStyles;

export interface ConnectionFilterSpec {
  search: string;
  typeIds: readonly ConnectionSemanticTypeId[];
  floorIds: readonly string[];
  selectedCellIds: readonly string[];
  activeState: "all" | "active" | "inactive";
  customOnly: boolean;
  localOverrideOnly: boolean;
  crossFloorOnly: boolean;
}
export interface ConnectionFilterCell {
  id: string;
  name: string;
  floorId?: string;
}
export interface ConnectionFilterInput {
  connections: readonly Connection[];
  cellsById: ReadonlyMap<string, ConnectionFilterCell>;
  spec: ConnectionFilterSpec;
}
export function filterConnections(input: ConnectionFilterInput): readonly Connection[];
```

Task 2 produces:

```ts
export interface ScreenPoint { x: number; y: number; }
export interface ScreenVector { dx: number; dy: number; }
export interface ViewportRect { x: number; y: number; width: number; height: number; }
export interface ConnectionPort {
  id: string;
  spaceId: string;
  x: number;
  y: number;
  state: "idle" | "source" | "valid-target" | "invalid-target";
}
export function shouldHandleConnectionShortcut(event: KeyboardEvent, view: ViewMode): boolean;
export function hitConnectionPort(ports: readonly ConnectionPort[], point: ScreenPoint, radiusPx?: number): ConnectionPort | null;
export function resolveConnectionAutoPan(point: ScreenPoint, viewport: ViewportRect): ScreenVector;
```

Task 3 produces the shared live/export seam:

```ts
export interface ConnectionEndpointGeometry { id: string; x: number; y: number; radius: number; floorId?: string; }
export interface ConnectionBounds { x: number; y: number; width: number; height: number; }
export type ConnectionPath =
  | { kind: "line"; points: readonly ScreenPoint[] }
  | { kind: "bezier"; points: readonly ScreenPoint[] }
  | { kind: "polyline"; points: readonly ScreenPoint[] };
export interface ConnectionDrawCommand {
  id: string;
  fromSpaceId: string;
  toSpaceId: string;
  pairKey: string;
  laneIndex: number;
  laneOffset: number;
  path: ConnectionPath;
  bounds: ConnectionBounds;
  style: ResolvedConnectionStyle;
  selected: boolean;
  labelText: string | null;
}
export interface ConnectionHitRecord { id: string; bounds: ConnectionBounds; path: ConnectionPath; }
export interface ConnectionHitIndex { cellSize: number; buckets: ReadonlyMap<string, readonly ConnectionHitRecord[]>; }
export interface ConnectionRenderMetrics {
  authoredCount: number;
  eligibleCount: number;
  visibleCount: number;
  pathResolutions: number;
  cacheHits: number;
  cacheMisses: number;
  endpointInvalidations: number;
  hitIndexEntries: number;
  labelLayouts: number;
}
export type ConnectionLodMode = "full" | "dense" | "critical";
export interface ConnectionProjectionInput {
  connections: readonly Connection[];
  endpoints: ReadonlyMap<string, ConnectionEndpointGeometry>;
  styles: ProjectConnectionStyles;
  filter: ConnectionFilterSpec;
  viewport: ViewportRect;
  selectedIds: ReadonlySet<string>;
  changedEndpointIds: ReadonlySet<string>;
  lod: ConnectionLodMode;
}
export interface ConnectionPathCache {
  readonly size: number;
  get(key: string): ConnectionDrawCommand | undefined;
  set(key: string, command: ConnectionDrawCommand, endpointIds: readonly string[]): void;
  invalidateEndpoints(endpointIds: ReadonlySet<string>): number;
  clear(): void;
}
export interface ConnectionProjectionResult {
  commands: readonly ConnectionDrawCommand[];
  hitIndex: ConnectionHitIndex;
  metrics: ConnectionRenderMetrics;
}
export interface ConnectionDrawOptions {
  theme: "day" | "night";
  scale: number;
  fadeUnrelated: boolean;
  drawLabels: boolean;
  markerDetail: "full" | "simple";
  patternFallback: boolean;
}
export function projectConnections(input: ConnectionProjectionInput, cache: ConnectionPathCache): ConnectionProjectionResult;
export function drawConnectionBatch(ctx: CanvasRenderingContext2D, commands: readonly ConnectionDrawCommand[], options: ConnectionDrawOptions): void;
export function hitTestConnections(index: ConnectionHitIndex, point: ScreenPoint, tolerancePx: number): string | null;
```

Task 4 adds atomic multi-edit commands used by Task 5:

```ts
updateConnectionsSemantic(ids: readonly string[], patch: Partial<ConnectionSemantic>): boolean;
updateConnectionsVisual(ids: readonly string[], patch: ConnectionVisualPatch): boolean;
resetConnectionsVisual(ids: readonly string[]): boolean;
setConnectionsEnabled(ids: readonly string[], enabled: boolean): boolean;
reverseConnections(ids: readonly string[]): boolean;
reconnectConnection(id: string, endpoint: "start" | "end", spaceId: string): boolean;
setConnectionSelection(ids: readonly string[], primaryId?: string | null): void;
toggleConnectionSelection(id: string): void;
```

---

### Task 0: Freeze the durable specification and execution ledger

**Files:**

- Modify: `docs/CONNECTIONS_IMPLEMENTATION_CONTRACT.md`
- Create: `docs/superpowers/plans/2026-07-21-mooorf-connections-v1.md`
- Create local ignored ledger: `.superpowers/sdd/progress.md`
- Do not modify product source or Project Engine status files.

**Interfaces:** Consumes the Owner master run and pushed P1/P2 truth. Produces the single durable contract, this exact task plan, and recovery ledger used by every later dispatch/review.

- [ ] **Step 1: Record all locked decisions**

Verify the contract explicitly covers Custom/defaulting, inherited styles, split Rail, mode/shortcut/Escape, batched ports/drag/auto-pan, hard OFF, renderer layers/caches/lanes/hit testing, Studio/Manager/multi-selection, labels/filters/projections, export scope/parity, performance scenes, accessibility, exclusions, task commits, stop conditions, and final evidence.

- [ ] **Step 2: Verify stale P1-only boundaries are removed from the durable contract**

Run:

```bash
rg -n "Current stage: P1|no Connections UI or renderer exists|Material" docs/CONNECTIONS_IMPLEMENTATION_CONTRACT.md
```

Expected: no stale P1 stage statement and no Material dependency; any Material occurrence is exclusion-only.

- [ ] **Step 3: Review exact task/file/interface/test boundaries**

Check this plan for placeholder markers and conflicting signatures:

```bash
rg -n "T[B]D|T[O]DO|implement[[:space:]]+later|fill[[:space:]]+in|Similar[[:space:]]+to[[:space:]]+Task" docs/superpowers/plans/2026-07-21-mooorf-connections-v1.md
```

Expected: no matches.

- [ ] **Step 4: Run docs diff checks and task review**

```bash
git diff --check -- docs/CONNECTIONS_IMPLEMENTATION_CONTRACT.md docs/superpowers/plans/2026-07-21-mooorf-connections-v1.md
git diff --no-index --check /dev/null docs/superpowers/plans/2026-07-21-mooorf-connections-v1.md
git diff --stat -- docs/CONNECTIONS_IMPLEMENTATION_CONTRACT.md docs/superpowers/plans/2026-07-21-mooorf-connections-v1.md
git status --short
```

Dispatch one read-only spec/quality reviewer. Fix every Important/Critical finding and re-review.

- [ ] **Step 5: Commit and ledger**

Stage only the two tracked docs, commit `docs(connections): freeze v1 interaction and renderer specification`, then append the required Task 0 record with exact base/head/tests/review/concerns to `.superpowers/sdd/progress.md`.

---

### Task 1: Add Custom, sparse style inheritance, bounded history, and projection contracts

**Files:**

- Modify: `src/domain/graph/types.ts`
- Modify: `src/domain/connections/registry.ts`
- Modify: `src/domain/connections/model.ts`
- Modify: `src/domain/connections/selectors.ts`
- Create: `src/domain/connections/styles.ts`
- Create: `src/domain/connections/filters.ts`
- Create: `src/domain/connections/v1FoundationContracts.test.ts`
- Modify: `src/domain/connections/connectionsContracts.test.ts`
- Modify: `src/state/store.ts`
- Modify: `src/types.ts`
- Modify: `src/export/projectSnapshot.ts`
- Modify: `src/import/projectFiles.ts`
- Modify: `src/import/projectTransfer.ts`
- Modify: `src/import/importCore.test.ts`

**Interfaces:** Consumes the current P1 registry/index/store/persistence. Produces all Cross-Task Task 1 contracts, `settings.connectionStyles`, `settings.connectionView`, sparse visual normalization, project replacement hygiene, and changed-record history entries.

- [ ] **Step 1: RED — semantic and style contracts**

Write focused tests that assert:

```ts
assert.equal(CONNECTION_SEMANTIC_TYPE_IDS[0], "custom");
assert.equal(resolveConnectionSemanticType("custom").tableCode, "CUS");
assert.equal(resolveConnectionSemanticType("visual-access").name, "Visual Link");
assert.equal(createConnectionAuthoringState().typeId, "custom");
assert.equal(resolveConnectionStyle(connectionWithoutVisual, defaults).geometryId, defaults.custom.geometryId);
assert.deepEqual(normalizeConnectionVisual({ appearance: { width: 2 } }), { appearance: { width: 2 } });
```

Also assert all five style packs return seven complete styles, reclassification retains a sparse local override, reset removes it, unknown IDs retain authored IDs, and shared filter/pair projections preserve multiple relationships/direction/codes.

Run the new foundation test and confirm meaningful failures for missing exports/Custom.

- [ ] **Step 2: GREEN — schema, registry, styles, and filters**

Add `custom`, anchor/label/sparse visual types, complete resolved style types, seven launch defaults, style-pack registry, safe normalization, pure resolver, and exact shared filter semantics. Unknown type styles resolve through Custom without rewriting the unknown ID.

- [ ] **Step 3: RED/GREEN — bounded history and atomic store commands**

Add tests proving one single and one bulk mutation create one Undo entry containing only changed record patches, not cloned full collections. Replace the full-collection `connections` history snapshots with indexed record patches while preserving create/delete order and Cell-delete atomic restore. Add project style-default/style-pack actions with one small style history entry.

- [ ] **Step 4: RED/GREEN — persistence and stale-state hygiene**

Prove old projects receive empty Connections/default styles/default view state; P1 complete visual objects migrate to equivalent sparse overrides; project/Saved View/recovery round trips styles/view state; full project/Saved View/schedule/recovery replacement clears stale Connection selection/authoring and cannot replay prior-project history.

- [ ] **Step 5: Verify Task 1**

```bash
npx --no-install tsx --test src/domain/connections/v1FoundationContracts.test.ts src/domain/connections/connectionsContracts.test.ts src/domain/connections/p2AuthoringContracts.test.ts src/import/importCore.test.ts
npx tsc -b --pretty false
git diff --check
```

Review from the Task 0 head to the Task 1 candidate, fix/re-review, commit `feat(connections): add custom type and style inheritance foundation`, then update the ledger.

---

### Task 2: Unify mode entry and add rail-first drag authoring

**Files:**

- Modify: `src/domain/connections/model.ts`
- Modify: `src/domain/connections/p2AuthoringContracts.test.ts`
- Modify: `src/domain/connections/p2SurfaceContracts.test.ts`
- Create: `src/domain/connections/v1AuthoringContracts.test.ts`
- Modify: `src/state/store.ts`
- Create: `src/interaction/connectionShortcut.ts`
- Create: `src/interaction/connectionShortcut.test.ts`
- Create: `src/canvas/connections/editing.ts`
- Create: `src/canvas/connections/editing.test.ts`
- Modify: `src/canvas/OrganismCanvasView.tsx`
- Modify: `src/canvas/organismCanvas.css`
- Modify: `src/ui/Dock.tsx`
- Create: `src/ui/ConnectionQuickRail.tsx`
- Modify: `src/ui/widgets/ConnectionsWidget.tsx`
- Modify: `src/ui/widgets/WidgetHost.tsx`
- Create: `src/ui/widgets/ConnectionStudioWidget.tsx`
- Modify: `src/ui/panels/widgetRegistry.ts`
- Modify: `src/types.ts`
- Modify: `src/ui/shell.css`
- Modify: `src/ui/widgets/widgets.css`
- Modify: `src/App.tsx`

**Interfaces:** Consumes Task 1 Custom/styles/filter contracts and current reducer. Produces one persistent mode flag/type, one app-level C policy, batched centre-port/preview math, one split Quick Rail, repeated drag and click-to-click fallback, and bounded auto-pan using the existing render loop.

- [ ] **Step 1: RED — mode and keyboard policy**

Test C/c entry/exit, Custom activation, forced visual ON, Escape drag-only cancellation versus mode exit, Table cleanup, and guards for repeat/modifiers/input/textarea/select/search/contenteditable/notes/inline editor/dialog editing.

- [ ] **Step 2: GREEN — one mode owner**

Add `connectionModeActive`, `connectionModeTypeId`, `enterConnectionMode`, `exitConnectionMode`, `toggleConnectionMode`, `setConnectionModeType`, and `cancelConnectionGesture`. Keep P2 reducer as the only source/target state machine; after success/duplicate/invalid empty release, return to mode-ready state without extra history.

- [ ] **Step 3: RED/GREEN — ports, pointer capture, and auto-pan**

Test visible-valid-only ports, fixed 18–20 px hit radius, no Void/hidden/locked/off-subset ports, pointer down/capture/move/release, empty release, exact duplicate, same-pair different semantic, repeated one-to-many, and bounded edge velocity. Implement Canvas-local port/preview data and call store only on source selection or terminal commit; pointer movement changes refs only.

- [ ] **Step 4: RED/GREEN — Dock and split Quick Rail**

Dock toggles mode instead of opening Manager. Add two responsive wings around the unchanged centre controls, seven semantic buttons, Manage (`connections` widget), Detail (open or refocus the registry-owned `connection-studio`), and Close. Task 2 registers a minimal read-only Studio shell with title, current type, scope status, and close/focus behaviour; it exposes no visual-grammar controls until Task 4. Closed rail is absent/inert. Use effective width derived from the app shell minus open non-minimised widget geometry.

- [ ] **Step 5: Accessible fallback and onboarding**

Refactor `ConnectionsWidget` toward Manager while retaining a bounded native source/target fallback that calls the same store commands. Add one aria-live mode/status surface and local-only onboarding dismissal.

- [ ] **Step 6: Verify Task 2 and browser gate**

```bash
npx --no-install tsx --test src/domain/connections/v1AuthoringContracts.test.ts src/domain/connections/p2AuthoringContracts.test.ts src/domain/connections/p2SurfaceContracts.test.ts src/interaction/connectionShortcut.test.ts src/canvas/connections/editing.test.ts src/interaction/canvasGestureController.test.ts src/interaction/frameScheduler.test.ts src/runtime/pf1d2Contracts.test.ts
npx tsc -b --pretty false
git diff --check
```

Browser at 1440×900 and 1280×800: C/Dock parity, Custom default, all valid ports, zoom-stable ports, drag/repeat/empty/duplicate/different-type/Escape, typing guard, pan/zoom/auto-pan, responsive rail with widgets, Table cleanup, no Organism/label remount, zero console errors. Review/fix/re-review, commit `feat(connections): add rail-first drag authoring`, update ledger.

---

### Task 3: Add the permanent batched Organism renderer and hard OFF gate

**Files:**

- Create: `src/canvas/connections/geometry.ts`
- Create: `src/canvas/connections/renderer.ts`
- Create: `src/canvas/connections/instrumentation.ts`
- Create: `src/canvas/connections/rendererContracts.test.ts`
- Modify: `src/canvas/OrganismCanvasView.tsx`
- Modify: `src/canvas/organismCanvas.css`
- Modify: `src/ui/QuickToggleBar.tsx`
- Modify: `src/ui/quickToggleBar.css`
- Modify: `src/state/store.ts`
- Modify: `src/domain/connections/p2SurfaceContracts.test.ts`
- Modify: `src/canvas/runtimeOrganismWiring.test.ts`
- Modify: `src/canvas/organismStaticRuntime.test.ts`
- Modify: `src/runtime/pf1d2Contracts.test.ts`

**Interfaces:** Consumes Task 1 resolved styles/filters and Task 2 mode/ports. Produces the Cross-Task Task 3 projection/draw/hit interfaces, dependency cache, deterministic lanes, one base canvas plus one interaction pass, selection hit path, focus LOD, and zero-work OFF instrumentation.

- [ ] **Step 1: RED — pure geometry**

Test boundary clipping for auto/top/right/bottom/left, deterministic straight/curved/orthogonal/elbow paths, pair lanes for 1–4+, stable ordering after unrelated insertion, crossing-segment viewport inclusion, offscreen rejection, unknown geometry fallback, and screen-stable widths/dashes/markers.

- [ ] **Step 2: GREEN — path projection/cache**

Implement pure commands and a bounded cache keyed by Connection identity, resolved style, endpoint screen geometry, lane, and viewport projection. Record endpoint dependencies. Cell A changes invalidate only indexed records involving A; camera/resize invalidates projection without authored writes.

- [ ] **Step 3: RED/GREEN — batch draw and hit index**

Test one batch surface, no JSX/per-record SVG, selected-above-sibling ordering, bounded fixed-tolerance hit results, Cell priority, mode port priority, and metrics. Draw base commands grouped by compatible style; interaction pass handles selection/endpoints/ports.

- [ ] **Step 4: Integrate Organism and demand scheduler**

Insert the base canvas after grid and before existing Cell presentation; replace P2 SVG with the interaction canvas. Apply the same runtime camera-shake CSS transform as current live layers, but never authored camera/export. Add `CONNECTIONS` invalidation that wakes the existing demand loop without forcing unnecessary membrane work. Resize/draw before the existing resume-ready callback.

- [ ] **Step 5: RED/GREEN — hard OFF and dense LOD**

Add the always-reachable top-right toggle outside QuickToggleBar’s collapsed subtree. Tests must settle OFF then observe zero draw/path/label/hit counters, no ports/preview/selection overlay, preserved semantic data, and no continuous frames. Add all/selected-cell/selected-connections focus modes and declared dense fallbacks.

- [ ] **Step 6: Verify Task 3 and performance/browser gate**

```bash
npx --no-install tsx --test src/canvas/connections/rendererContracts.test.ts src/domain/connections/p2SurfaceContracts.test.ts src/canvas/runtimeOrganismWiring.test.ts src/canvas/organismStaticRuntime.test.ts src/interaction/frameScheduler.test.ts src/runtime/pf1d2Contracts.test.ts
npx tsc -b --pretty false
git diff --check
```

Exercise 25/50, 60/300, 96/large-visible, and settled OFF counters. Browser both required sizes: visible inherited lines, clipped endpoints, lanes selectable, endpoint highlight, hard OFF, focus modes, pan/zoom/drag, Table sleep/resume, no remount, zero console errors. Review/fix/re-review, commit `feat(connections): add batched visual renderer`, update ledger.

---

### Task 4: Complete visual grammar, multi-edit Inspector, and Connection Studio

**Files:**

- Modify: `src/domain/connections/styles.ts`
- Create: `src/domain/connections/v1StudioContracts.test.ts`
- Modify: `src/state/store.ts`
- Modify: `src/types.ts`
- Modify: `src/ui/widgets/ConnectionStudioWidget.tsx`
- Modify: `src/ui/widgets/ConnectionsWidget.tsx`
- Modify: `src/ui/widgets/InspectorWidget.tsx`
- Modify: `src/ui/widgets/WidgetHost.tsx`
- Modify: `src/ui/panels/widgetRegistry.ts`
- Modify: `src/ui/widgets/widgets.css`
- Modify: `src/ui/ConnectionQuickRail.tsx`
- Modify: `src/canvas/connections/geometry.ts`
- Modify: `src/canvas/connections/renderer.ts`
- Modify: `src/canvas/OrganismCanvasView.tsx`

**Interfaces:** Consumes the renderer and style contracts. Produces the atomic multi-selection/edit commands, full four/six/fourteen/five grammar, registry-owned `connection-studio`, explicit type-default/local scope, mixed Inspector values, reconnect/reverse, and direct selected handles.

- [ ] **Step 1: RED — registry completeness and atomic multi-edit**

Assert exactly four geometries, six patterns, fourteen markers, five anchors; start/end marker/anchor independence; Shift toggle/replace semantics; mixed value resolution; and one Undo entry for one-property multi-edit, reverse, reconnect, reset, and type-style edit.

- [ ] **Step 2: GREEN — store actions and direct editing**

Implement the Task 4 command signatures using changed-record history patches. Reconnect validates endpoint/self/duplicate rules. Reverse swaps endpoints/anchors/markers and normalizes directional meaning without losing semantic intent.

- [ ] **Step 3: RED/GREEN — Studio**

Register `connection-studio` once and render it through WidgetHost/Frame. Implement native/tab buttons for Meaning, Line, Anchors, Markers, Label, Global; visual galleries; five-position anchor controls; numeric sliders only for width/opacity/curve/marker values; miniature preview; explicit scope; reset local/type; all five packs; preview state that commits once or cancels without history.

- [ ] **Step 4: Inspector and selected handles**

Keep the Inspector compact. Add mixed-state segmented/chip controls, inheritance message/reset, reverse, Studio, and multi-delete. Draw only selected endpoint/reconnect/curve handles in the interaction pass.

- [ ] **Step 5: Verify Task 4**

```bash
npx --no-install tsx --test src/domain/connections/v1StudioContracts.test.ts src/domain/connections/v1FoundationContracts.test.ts src/canvas/connections/rendererContracts.test.ts src/ui/widgets/widgetLifecycle.test.ts src/domain/connections/p2SurfaceContracts.test.ts
npx tsc -b --pretty false
git diff --check
```

Browser both sizes plus constrained workspace: Studio scope clarity, galleries/tabs, global propagation, sparse local reset, reclassification message, multi/mixed Inspector, reverse/reconnect/handles, reduced motion, focus order, no duplicate frames, zero console errors. Review/fix/re-review, commit `feat(connections): add connection studio and visual grammar`, update ledger.

---

### Task 5: Add labels and a virtualized Connections Manager

**Files:**

- Create: `src/domain/connections/manager.ts`
- Create: `src/domain/connections/v1ManagerContracts.test.ts`
- Create: `src/canvas/connections/labels.ts`
- Create: `src/canvas/connections/labelContracts.test.ts`
- Modify: `src/canvas/connections/renderer.ts`
- Modify: `src/canvas/OrganismCanvasView.tsx`
- Modify: `src/ui/widgets/ConnectionsWidget.tsx`
- Modify: `src/ui/widgets/widgets.css`
- Modify: `src/state/store.ts`
- Modify: `src/types.ts` only for optional canonical `floorId` adapter continuity if the existing graph adapter cannot supply the map without widening the live record
- Modify: `src/domain/graph/adapters.ts` and `src/domain/graph/selectors.ts` for canonical floor/pair projections

**Interfaces:** Consumes Task 1 filters, Task 3 commands, Task 4 bulk actions. Produces bounded label layouts, Manager row/count projections, virtual windowing, search/filters/counts/locate/bulk actions, Canvas/Manager selection sync, and future Matrix/Table pair hooks.

- [ ] **Step 1: RED/GREEN — label layout**

Test hidden default; all six content modes; five positions; two orientations; above/below offset; zoom hide; deterministic path placement; collision occupancy; label-first dense degradation; selected label preservation; and no runtime/store writes. Implement a bounded occupancy grid over already-culled commands.

- [ ] **Step 2: RED/GREEN — Manager projection/window**

Test search over endpoint/type/notes, seven counts plus Custom/unclassified, selected-Cell, floor, cross-floor, active, local-override filters, stable ordering, multiple pair records, and a fixed-row virtual window with an explicit render ceiling for 100,000 records.

- [ ] **Step 3: Manager UI and selection sync**

Replace the eager `rows.map` with memoized projection and top/bottom spacer window. Add search/filter controls, counts, locate/fit, Shift/multi selection, bulk classify/active/reset. Preserve the native endpoint creation fallback. Use narrow subscriptions and no duplicate records.

- [ ] **Step 4: Future Matrix/Table hooks**

Expose stable row/pair projections with table/matrix codes, direction, all pair Connection IDs, selection by pair, and canonical bulk command inputs. Do not build Matrix or Connection Table UIs.

- [ ] **Step 5: Verify Task 5**

```bash
npx --no-install tsx --test src/domain/connections/v1ManagerContracts.test.ts src/canvas/connections/labelContracts.test.ts src/domain/connections/v1StudioContracts.test.ts src/domain/connections/v1FoundationContracts.test.ts src/canvas/connections/rendererContracts.test.ts
npx tsc -b --pretty false
git diff --check
```

Browser required sizes/constrained workspace: label modes/degradation, Manager search/filter/counts/virtual scroll/locate/multi/bulk, selection sync, floor Unassigned truth, keyboard-only path, responsive layout, zero console errors. Review/fix/re-review, commit `feat(connections): complete manager labels and projections`, update ledger.

---

### Task 6: Add detached visual parity, relationship CSV, and explicit export scope

**Files:**

- Modify: `src/canvas/exportCapture.ts`
- Modify: `src/export/organismExport.ts`
- Modify: `src/export/exportService.ts`
- Modify: `src/export/types.ts`
- Create: `src/export/connectionCsv.ts`
- Create: `src/export/connectionsExport.test.ts`
- Modify: `src/ui/widgets/ExportWidget.tsx`
- Modify: `src/export/projectSnapshot.ts`
- Modify: `src/import/projectFiles.ts`
- Modify: `src/import/projectTransfer.ts`
- Modify: `src/import/importCore.test.ts`
- Modify: `src/export/exportCore.test.ts`
- Modify: `src/export/backgroundExportContracts.test.ts`
- Modify: `src/export/organismLabelExport.test.ts`

**Interfaces:** Consumes the exact Task 3 pure projection/drawer and Task 5 labels. Produces structured-cloned export Connections/styles, `includeConnections`, scope `visible | active | selected`, detached draw parity, separate relationship CSV, and complete persistence/reload integration.

- [ ] **Step 1: RED — export snapshot and scope**

Assert `createCanvasExportSnapshot` clones Connections and project styles but excludes selection/preview/cache. Test visible scope against shared live filter, active scope against semantic enabled/local visible, selected scope against explicit selected IDs, and include false producing no draw commands regardless of live ON/OFF.

- [ ] **Step 2: GREEN — detached parity**

In `renderDetachedOrganismExport`, build endpoint geometry from the same detached nuclei, call `projectConnections`, draw base commands after WebGL copy and before Cell circle overlays, then draw eligible Connection labels before/with the label phase. Use authored camera only; no shake/live cache/store reads.

- [ ] **Step 3: RED/GREEN — relationship CSV and UI**

Serialize stable ID/source/target/type/code/direction/requirement/strength/priority/active/inheritance/label fields with correct escaping. Data export downloads both space CSV and relationship CSV plus JSON. Add visible `Include Connections` and scope controls to visual exports; selected scope explains/blocks empty selection without silently changing scope.

- [ ] **Step 4: Integration continuity**

Freshly prove project JSON, `.mooorf`, Saved Views, recovery, schedule pruning, migration, styles, view state, and Undo/Redo after reload. Confirm project replacement clears stale histories and ephemeral mode/selection.

- [ ] **Step 5: Verify Task 6**

```bash
npx --no-install tsx --test src/export/connectionsExport.test.ts src/export/exportCore.test.ts src/export/backgroundExportContracts.test.ts src/export/organismLabelExport.test.ts src/import/importCore.test.ts src/domain/connections/connectionsContracts.test.ts
npx tsc -b --pretty false
git diff --check
```

Generate real PNG/PDF/presentation ZIP/JSON/space CSV/relationship CSV artifacts for structural inspection. Verify no ports/preview/selection/onboarding, no SVG claim, and consistent 1×/2×/4× logical geometry. Review/fix/re-review, commit `feat(connections): add export and data continuity`, update ledger.

---

### Task 7: Harden performance/accessibility and complete the verified feature branch

**Files:**

- Create or modify only focused Connections/runtime tests needed by final findings.
- Modify production files only for a failing acceptance gate with a preceding RED regression test.
- Update instrumentation owners: `src/canvas/connections/instrumentation.ts`, `src/canvas/connections/renderer.ts` if evidence requires.
- Do not update Project Engine status files until every product gate and final review passes.

**Interfaces:** Consumes the complete branch. Produces fresh normal/dense/max/large/OFF evidence, full accessibility/responsive evidence, a clean whole-branch review, exactly one production build, and the Task 7 product commit.

- [ ] **Step 1: Run focused and affected contracts**

```bash
npx --no-install tsx --test \
  src/domain/connections/connectionsContracts.test.ts \
  src/domain/connections/p2AuthoringContracts.test.ts \
  src/domain/connections/p2SurfaceContracts.test.ts \
  src/domain/connections/v1FoundationContracts.test.ts \
  src/domain/connections/v1AuthoringContracts.test.ts \
  src/domain/connections/v1StudioContracts.test.ts \
  src/domain/connections/v1ManagerContracts.test.ts \
  src/canvas/connections/editing.test.ts \
  src/canvas/connections/rendererContracts.test.ts \
  src/canvas/connections/labelContracts.test.ts \
  src/interaction/connectionShortcut.test.ts \
  src/interaction/canvasGestureController.test.ts \
  src/interaction/frameScheduler.test.ts \
  src/runtime/pf1d2Contracts.test.ts \
  src/canvas/runtimeOrganismWiring.test.ts \
  src/canvas/organismStaticRuntime.test.ts \
  src/export/connectionsExport.test.ts \
  src/export/exportCore.test.ts \
  src/export/backgroundExportContracts.test.ts \
  src/export/organismLabelExport.test.ts \
  src/import/importCore.test.ts \
  src/ui/widgets/widgetLifecycle.test.ts
```

Any failure gets one bounded TDD repair cycle, affected rerun, and review.

- [ ] **Step 2: Performance scenarios**

Record counters and interaction evidence for 25/50, 60/200–300, 96/large-visible, and 500+ authored/visible-cap scenes. Verify bounded Manager rows/cache/hit index; moved Cell invalidates only incident records; no store mutation during drag; one history transaction per terminal action; Table pause zero work; settled OFF all zero.

- [ ] **Step 3: Accessibility and browser QA**

At 1440×900, 1280×800, and constrained effective Canvas width with widgets, execute this exact browser list:

1. `C` enters mode.
2. Custom is active by default.
3. All visible valid Cells display centre ports.
4. Ports remain screen-stable during zoom.
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
25. Exports exclude ports, preview, and selection overlays.
26. Organism and Cell labels do not remount.
27. The browser console records zero errors.

Also verify keyboard-only mode/type/source/target/selection/delete/Manager/Studio, focus visibility/return, aria-live messages, 200% zoom/reflow, reduced motion, non-colour semantics, practical hit targets, and zero console errors. Record unsupported screen-reader/manual smoothness honestly for Owner QA.

- [ ] **Step 4: TypeScript, full diff, and whole-branch review**

```bash
npx tsc -b --pretty false
git diff --check
git status --short
git diff --stat c04e4fba1db003bd4e84583c9937e73ba9ae717b..HEAD
```

Generate the whole-branch review package from merge base/starting V1 head to candidate head. Dispatch the most capable read-only reviewer. Resolve all Critical/Important findings in one fix wave with regression tests, then re-review.

- [ ] **Step 5: Run the one and only production build**

Only after final fixes:

```bash
npm run build
```

Expected: exit 0. Record transformed module count, emitted Connection-related chunks if any, timing, and only truthful existing warnings. Do not run another build.

- [ ] **Step 6: Commit Task 7**

Freshly rerun only the proof needed after the build (no second build), verify diff/status, commit `perf(connections): harden dense scenes and complete v1`, and update the ledger.

---

## Project Engine closeout and push

After Task 7 product verification only:

- [ ] Update `docs/project-engine/STATE.md` with exact product/status/local/remote truth.
- [ ] Replace `docs/project-engine/ACTIVE_TASK.md` with `WAITING OWNER QA` and no unauthorized merge.
- [ ] Update the Connections rows/impact lookup in `docs/project-engine/REPO_MAP.md`.
- [ ] Update `docs/project-engine/ROADMAP.md` status only where the completed V1 sequence changes truth.
- [ ] Append one compact durable result/limits record to `docs/project-engine/LEDGER.md`.
- [ ] Verify Project Engine diff, commit `docs(project-engine): record Connections V1 review head`.
- [ ] Push only `work/next-feature`; verify local/remote heads match, `main` remains unchanged, ahead/behind is truthful, and the tracked worktree is clean.

## Final verification commands

The exact test file list is Task 7 Step 1. Then run, in order:

```bash
npx tsc -b --pretty false
git diff --check
npm run build                           # exactly once, Task 7 only
git status --short --branch
git rev-parse HEAD
git rev-parse origin/work/next-feature
git rev-parse main
git rev-parse origin/main
git rev-list --left-right --count main...work/next-feature
```

Browser/performance/export artifacts and the line-by-line requirement audit are mandatory evidence, not replaced by TypeScript or unit tests.
