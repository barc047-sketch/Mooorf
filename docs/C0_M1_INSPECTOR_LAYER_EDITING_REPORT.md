# C0 M1 Production Inspector, Content and Layer Editing Recovery Report

## Fixed-head identity

- Task: `C0-M1-CORRECTION-2`
- Source base: `feature/c0-4f-a-runtime-layer-separation@21388c0d765cd4bbc675d0321d94e77db9a41e5c`
- Feature branch: `feature/c0-m1-inspector-layer-editing-recovery`
- Previous reviewed head: `484ddeb859fcb18256a6acf7b7287e2be917aedc`
- Correction contract: `origin/docs/mooorf-ai-team-operating-protocol@584f92ba5a036a341e74ded9889130bce91dee41:docs/worker-briefs/C0_M1_CORRECTION_2_INSPECTOR_VOID_MEMBRANE_COLOUR.md`
- Corrected fixed head: the immutable pushed SHA is recorded in `worker-status/CODEX.json` on `status/codex` because a commit cannot contain its own SHA.
- Production guard: `origin/main` remained `c4600472ea76f651800c19b91cf8f67954ca992e`; no merge was performed.

## Corrected outcome

M1 now has exactly one production Inspector. Content and Appearance are live; the future Symbol seam remains inside this same Inspector and no Symbol UI is exposed in M1. The user-facing Appearance hierarchy is exactly:

```text
Cell
├── Surface
├── Boundary
└── Core / nucleus

Membrane
├── Field
└── Edge

Void
├── Fill
└── Edge
```

The six audited renderer targets remain independent internally: `cell`, `boundary`, `core`, `membrane`, `membrane-edge`, and `void`. Three family Detail widgets project those targets without merging state, render ownership, persistence or history.

Name, Area and optional Body/subtext remain canonical `SpaceCell` data. Inline Canvas editing, Inspector and minimal Table commit through the central store and existing bounded history. Table and Inspector now share an explicit edit-session state machine: normal blur commits once, Enter commits once, Shift+Enter keeps a Body draft active, and Escape restores the exact canonical value while the following blur is a no-op.

Text Style retains six coordinated Heading/Area/Body presets, proportional Text Size, Text Colour and Auto Contrast. Actual sparse appearance values derive Project Default, Local Override and Mixed status; selection count is never used as a status shortcut.

Every existing widget launcher now uses the same canonical lifecycle action: a single click mounts a closed widget, focuses a background widget, expands a minimized widget, and clamps an unreachable widget back into the current viewport. Both Dock and Rail `i` launchers therefore display the full Inspector body in one click.

Membrane Field colour now has two truthful modes. `Cell Gradient` is the unchanged Cell-derived production gradient and remains the default. `Solid` resolves Black, Ink, MOOORF Red, Charcoal and Custom through the canonical material registry/persisted presentation defaults, and removes all Cell-derived spatial colour patches without changing field geometry, fusion or the independent Membrane Edge colour. The unconditional Void inner echo was removed from live Canvas2D and Classic SVG output; the canonical outer fill, outer edge and negative/subtractive nucleus remain unchanged.

## Canonical architecture retained

1. The central Zustand/Master Graph store remains the only content, settings, preview and history owner.
2. `resolveCellAppearance` and `projectRuntimePresentation` remain the only canonical appearance resolution path.
3. The existing pointer-transparent Organism Canvas2D overlay now draws canonical Cell/Boundary/Core/Void presentation over unchanged WebGL field geometry.
4. Classic and Organism use the same six-style Boundary projection. Dash-dot uses a dash/gap/rounded-dot/gap sequence; segmented bars use a deterministic grouped-bar sequence distinct from dashed.
5. Organism WebGL still owns field geometry. M1 did not redesign the field shader, radius, hit testing, selection or Void subtraction.
6. The legacy embedded WebGL nucleus-dot amount remains zero. Production debug geometry is now ring-only through an explicit debug-centre-dot uniform; the isolated Organism Lab retains its original dot diagnostic.
7. Previews remain ephemeral and clean-capture-excluded. PNG/PDF use the existing capture path and Classic SVG uses the existing true-vector path.
8. No duplicate store, registry, history owner, renderer settings model, export path, fake Cell, prototype shell or mock data path was added.
9. Widget minimized state and launch revisions are ephemeral central-store UI state; launcher recovery does not create another widget host or persistence owner.
10. Presentation schema v3 adds only Membrane colour mode and solid material identity. v1/v2 projects migrate deterministically to the unchanged `Cell Gradient` default.

## Owner-observed issue disposition

| Owner-observed issue | Reproduction at reviewed head | Corrected disposition | Evidence |
| --- | --- | --- | --- |
| Inspector and Table Escape committed through blur | Reproduced: edited Name survived Escape in both surfaces | FIXED | Shared explicit `active/cancelled/committed` edit session; executable zero-history/one-transaction tests plus built-browser cancellation |
| Inspector single selection always said Local and multi-selection always Mixed | Reproduced with one default Cell | FIXED | Header and family badges derive actual sparse text/family inheritance; one default Cell reports Project Default |
| Bottom-bar controls regressed | Reproduced against the reviewed dock | FIXED | Restored visible Inspector and active-family Detail launchers while retaining Add Space, Add 5, Add Void, Saved Views, Random, Import and Export |
| Visible `i` and Detail paths were indirect | Reproduced | FIXED | Rail and dock Inspector launchers open the one Inspector in one click; Dock Detail follows Cell/Membrane/Void family and reports truthful aria/open state |
| Cell Surface and Boundary controls reported non-working | Surface visibility worked in the reviewed fixture; Boundary technical parity did not | REPAIRED + PROTECTED | Built-browser Surface off/on/colour evidence; executable paint/opacity projection; six-style matrices in both renderers; reset/undo/persistence/export contracts |
| Organism dash-dot fell back to solid | Reproduced with `data-boundary-fallback-count="1"` | FIXED | Overlay renders all six styles, fallback count is `0`, dash-dot is rounded and segmented bars differ from dashed |
| Void was reported working by Owner | Confirmed working; no deterministic defect reproduced | REGRESSION-PROTECTED ONLY | Add selects canonical `kind: "void"`; built-browser fill edit and drag; executable undo/redo/snapshot/export and no Cell/Boundary/Core layer assertions |
| White centre dots remained with Core off | Reproduced with Project Default Core off, local Core cleared, and Cell field debug enabled | FIXED | Source was the WebGL debug `centerDot`, not legacy embedded dots or sparse Core resolution. Production debug projection now forces centre dots off; Core-off Canvas2D and built-browser debug evidence are dot-free |
| Closed/background/minimized/offscreen widgets did not share one reliable launch path | Reproduced from Dock and Rail launchers | FIXED GENERICALLY | One store-owned launch revision mounts/focuses/expands; `WidgetFrame` clamps the launched frame into the viewport; executable lifecycle coverage includes Inspector and a non-Inspector widget |
| Dock and Rail `i` could leave only the Inspector title bar visible | Reproduced with a minimized Inspector | FIXED | Both launchers call the same generic `openWidget("inspector")`; built-browser one-click checks prove the full body returns |
| Void always drew an extra inner circle | Reproduced in live Canvas2D and Classic SVG projection | FIXED | Removed the unconditional inner echo only; executable renderer/SVG tests retain outer fill/edge, subtraction and selection separation |
| Membrane colour could not be selected independently of Cells | Reproduced: the field was always Cell-derived | FIXED | Default `Cell Gradient` is byte-for-byte projection-compatible; `Solid` uses the canonical material registry and zero spatial colour mixing, with history/persistence/export coverage |
| A sparse Void Edge-only edit reset inherited Fill opacity | Reproduced during deterministic Correction 2 QA | FIXED | Sparse normalization now removes explicit `undefined` leaves, so untouched sibling defaults continue to inherit; executable regression asserts the exact compact override |

## Stale/no-op control disposition

The exhaustive ownership table is [C0_M1_CONTROL_OWNERSHIP_MAP.md](C0_M1_CONTROL_OWNERSHIP_MAP.md).

| Previous surface | Disposition | Production owner |
| --- | --- | --- |
| Six top-level Appearance targets | RESTRUCTURE | Inspector offers Cell/Membrane/Void families; all six internal targets remain separate |
| Standalone Boundary and Core widgets | MOVE | Nested in Cell Detail |
| Standalone Membrane Edge widget | MOVE | Nested in Membrane Detail |
| Dock/Organism Morph, Attachment and Reach duplicates | MOVE | Membrane Detail Field/Fusion/Reach; one canonical runtime owner |
| Display Morph and Show nuclei duplicates | REMOVE/REBIND | Membrane visibility and Cell Detail Core/nucleus |
| Legacy Palette and broad procedural Organism launchers | HIDE AS UNSUPPORTED | Compatibility state retained; M2/M4 destinations documented below |
| Duplicate Rail Add Void | REMOVE AS DUPLICATE | Dock Add Void remains live |
| Prototype selection orbit | DEFER | Existing ephemeral clean selection keyline remains |
| Prototype mock store, fake Cells, shell and export | REJECT | Never merged or copied |
| Membrane colour source | MERGE | Membrane Detail → Field; canonical `presentationDefaults.membrane.colourMode` and material registry |
| Unconditional Void inner echo | REMOVE | No live/export owner; optional default-off Inner Echo is explicitly deferred to M2 advanced Void instruments |

## Automated verification

Executed after source correction and before the single production build:

| Verification | Result |
| --- | --- |
| Every repository `src/**/*.test.ts` through `npx --yes tsx` | PASS |
| `node --test scripts/audit-utils.test.mjs` | PASS, 4/4 |
| Focused `contentEditSession`, M1 correction behavior, M1 renderer behavior and M1 product contracts | PASS |
| Affected C0.4F-A runtime presentation, renderer integration, Organism wiring, SVG/export/import/resource/interaction/widget contracts | PASS |
| `npx tsc -b --pretty false` | PASS, zero diagnostics |
| `git diff --check 484ddeb859fcb18256a6acf7b7287e2be917aedc...HEAD` | PASS as the final post-commit handoff gate |
| `npm run build` | PASS; exactly one final production build, accepted Vite large-chunk warning only |

The final build emitted the main application chunk at `983.99 kB` (`315.98 kB` gzip). No second production build was run.

Executable correction coverage includes Escape/blur/Enter/Shift+Enter transitions, one family-reset transaction, inheritance status, closed/background/minimized/offscreen widget recovery, Void add/select/undo/redo/project snapshot, exact Void live/SVG layer projection, sparse Void sibling inheritance, Cell opacity, all six Classic and Organism strokes, distinct segmented bars, rounded dash-dot, Core-off drawing, production debug ring projection, Cell Gradient compatibility, patch-free preset/custom Solid Membrane projection, one-transaction history, persistence/import/saved-view round trips, and the Organism plain-mode Cell mask/paint adapter. Source-presence checks remain supplementary only.

## Deterministic browser QA

The built artifact was tested at `http://127.0.0.1:4173/`.

### 1440 × 900

- From a closed state, Dock `i` opened the full Inspector body in one click. After minimize, Dock `i` reported collapsed and restored the full Content body in one click.
- Opening Layout placed it at z-index `41` over Inspector `40`; Rail `i` focused the existing Inspector to `41` and moved Layout to `40` without mounting a duplicate.
- The generic recovery path was also exercised with an Inspector dragged beyond the right viewport edge; the next launcher click restored its full `332px` frame within the viewport. Executable coverage repeats the clamp for Inspector and a non-Inspector widget.
- The bottom bar exposed Inspector, active-family Detail, Add Space, Add 5 Spaces, Add Void, Saved Views, Random Arrangement, File Intake and Export.
- Dock `i` opened the one Inspector in one click. A default selected Cell reported Project Default; Inspector Escape restored `New Space` exactly.
- Appearance exposed exactly Cell, Membrane and Void. Dock Detail changed immediately with each family.
- Cell Detail contained Surface, Boundary and Core/nucleus; Membrane Detail contained Field and Edge; Void Detail contained Fill and Edge.
- Cell Surface off produced a hollow presentation-only Cell; on plus custom black produced the canonical visible black surface.
- Six cropped render captures for Classic and six for Organism were visually inspected. Solid, dashed, dotted, dash-dot, double and grouped segmented bars produced six distinct image hashes in each renderer; Organism reported fallback count `0`.
- Project Default Core was turned off before adding a Cell. Enabling Cell field debug showed the geometry ring without any centre dot.
- Add Void created and selected `Void Nucleus`; the Inspector context said VOID. The live image retained the outer fill/edge and selection separation with no unconditional inner echo. Fill toggled off/on, drag moved the subtractive Void, and Cell/Boundary/Core remained absent from its renderer projection.
- Table Name Escape restored `New Space`. Body Shift+Enter retained `Line one\n`; Escape restored the empty canonical Body.
- Clean PNG, true-vector Classic SVG and PDF each reached the product `Complete` state without an error.

### 1280 × 800

- Viewport was exactly `1280 × 800`; document `scrollWidth/clientWidth` was `1280/1280` and `scrollHeight/clientHeight` was `800/800`.
- Inspector measured `left 936`, `right 1268`, `top 72`, `bottom 474.30`, width `332` while Appearance was active.
- Membrane Detail measured `left 936`, `right 1256`, `top 114`, `bottom 746`, width `320`; its internal scroll kept Field, Fusion/Reach and Edge reachable.
- Dock measured `left 458`, `right 822`, `top 732`, `bottom 776`; Rail measured `left 24`, `right 66`, `top 214`, `bottom 586`. Neither collided with Inspector/Detail controls.
- `Cell Gradient` was selected by default. Switching to `Solid` exposed exactly Black, Ink, MOOORF Red, Charcoal and Custom from the canonical registry.
- With five differently coloured Cells, MOOORF Red settled to one uniform field colour around the Cell holes; no Cell-derived colour patches remained in the field. The selected preset and Field visibility stayed truthful.
- The canonical widget cascade remained draggable/closable, all Membrane controls were reachable, and no body-level overflow occurred.
- Final browser warning/error log: `[]`.

The browser harness does not expose `file-saver` output as a normal browser download event. Export evidence therefore records the production `Complete` states, clean console and executable SVG/project/export content tests.

## Locked milestone map

**Implemented in corrected M1**

- one Inspector,
- Content and Appearance tabs,
- Name/Area/Body direct editing,
- text presets/size/colour/Auto Contrast,
- Cell/Membrane/Void Appearance families,
- Boundary and Core nested in Cell,
- Edge nested in Membrane,
- Copy/Paste/Reset,
- defaults/local/mixed,
- direct Inspector and Detail access.
- generic one-click widget lifecycle recovery,
- default Cell Gradient plus truthful Solid Membrane colour,
- Void outer fill/edge without an unconditional inner echo.

**Assigned to M2 in the same Inspector**

- Symbol tab,
- advanced Cell/Boundary/Core instruments,
- Membrane → Field → Field Edge Softness, owned by the existing field/body feather path (`settings.organism.edgeSoftness`),
- Membrane → Edge → Edge Softness, a future independent presentation-band softness control that must not alias Field Edge Softness,
- optional Void Inner Echo as an advanced default-off control only if live/export parity is implemented,
- approved selection orbit,
- Antigravity symbol catalogue.

**Assigned to M4**

- full Material Browser,
- recents/favourites,
- hover material preview/revert,
- Material Studio.

No approved prototype feature is unassigned. M2 and M4 were not started.

## Gate

The feature branch is pushed as one corrected fixed head. `status/codex` records the previous reviewed head, corrected SHA, issue disposition, tests and QA as `WAITING_REVIEW`. The next gate is Owner review. No merge and no M2 work occurred.
