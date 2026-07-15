# C0 M1 Control Ownership Map

Scope: every M1 Content, Appearance, Morph, Core, Void, selection and launcher control visible from audited base `21388c0d765cd4bbc675d0321d94e77db9a41e5c` through corrected M1. Each row has one disposition and one canonical production owner.

| Control or stale surface | Previous owner | Disposition | Corrected final owner | Canonical state/action path |
| --- | --- | --- | --- | --- |
| Inline Space Name and Area | `InlineCellEditor` → direct update | KEEP + REBIND | Inline editor | `commitSpaceEdit`; one existing history transaction |
| Body / subtext | absent | MERGE | Inline editor, Inspector Content, minimal Table | optional `SpaceCell.body`; bounded presentation text only |
| Table Name/Area/Body draft exit | local component blur handlers | REBIND | shared content edit session | `active/cancelled/committed`; Escape zero transaction, blur/Enter one |
| Inspector Name/Area/Body draft exit | local component blur handlers | REBIND | same shared content edit session | `commitSpaceContent`; multi-selection remains one transaction |
| Table Category and Privacy | `TableView` | KEEP | minimal Table | existing `updateSpace`; outside M1 appearance ownership |
| Inspector header status | selection-count shortcut | REMOVE + REBIND | actual channel/family inheritance projection | `resolveInheritanceState` / `resolveFamilyInheritanceState` |
| Inspector/info launcher | indirect/stale visible path plus translating Motion hit target | REBIND + REPAIR | shared `InspectorLauncherButton` in Rail and bounded Dock | stable `data-command="open-inspector"`; fixed geometry, truthful aria/open/focus state and click/Enter/Space delegate to generic `openWidget("inspector")` |
| Global Inspector `I` shortcut | absent; previously unassigned | MERGE | one `MainApp` capture listener and shared Inspector command | lowercase/uppercase `I`; canonical open/expand/focus/reveal, close only when fully visible/frontmost; editing/modifier/repeat guards; no duplicate listener on view switch |
| Inspector shell availability | Canvas-only `Rail`/`Dock`/`WidgetHost` composition | MOVE + PROTECT | application shell after loader completion | one existing host and both real launchers remain mounted in Canvas and Table; no duplicate Inspector or host |
| Every registered widget launcher | separate mount/focus behavior | REBIND + PROTECT | existing `WidgetHost`/`WidgetFrame` lifecycle | one store-owned launch revision expands and viewport-clamps the requested widget; no duplicate host |
| Active-family Detail launcher | absent | MERGE | bounded Dock and Inspector Appearance | `appearanceFamilyDefinition(activeFamily).detailWidgetId` |
| Six top-level target buttons | Inspector Appearance | RESTRUCTURE | Cell/Membrane/Void primary families | projection only; six internal target IDs remain unchanged |
| Standalone Cell settings | one-target widget | MERGE | Cell Detail → Cell Surface | sparse `appearance.cell` or `presentationDefaults.cell` |
| Standalone Boundary settings | separate widget | MOVE | Cell Detail → Boundary | sparse `appearance.boundary` or `presentationDefaults.boundary` |
| Standalone Core settings | separate widget | MOVE | Cell Detail → Core / nucleus | sparse `appearance.core` or `presentationDefaults.core` |
| Standalone Membrane settings | one-target widget | MERGE | Membrane Detail → Field/Fusion/Reach | audited shared `presentationDefaults.membrane` plus existing runtime settings |
| Membrane colour source | always Cell-derived | MERGE + REPAIR | Membrane Detail → Field | persisted `presentationDefaults.membrane.colourMode`; `cell-gradient` remains default, `solid` disables spatial Cell colour mixing |
| Membrane Solid presets | absent | MERGE | Membrane Detail → Field | canonical material registry IDs: Black, Ink, MOOORF Red, Charcoal; Custom reuses canonical paint colour/opacity |
| Standalone Membrane Edge settings | separate widget | MOVE | Membrane Detail → Edge | audited shared `presentationDefaults.membraneEdge` |
| Standalone Void settings | one-target widget | MERGE | Void Detail → Fill/Edge | sparse `appearance.void` or `presentationDefaults.void` |
| Family Reset | target-only reset | MERGE | Inspector Appearance | `resetAppearanceFamily`; one history transaction across owned internal targets |
| Copy/Paste/Reset All | Inspector | KEEP + PROTECT | Inspector Appearance | sparse styles only; excludes content, selection and shared Membrane values |
| Annotation Text Scale | Annotation widget | MERGE | Inspector Text Size | migrated `presentationDefaults.text.size`; no second multiplier |
| Annotation label colour/custom modes | Annotation widget | MERGE | Inspector Text Colour + Auto Contrast | migrated canonical text mode/colour |
| Annotation projection/modes/detail toggles | Annotation widget | HIDE AS UNSUPPORTED | compatibility state only | persisted legacy settings; Annotation Studio not implemented |
| Dock/Organism Morph style | duplicate quick/widget controls | MOVE | Membrane Detail → Field character | `commitMembraneRuntime({ morphMode })` |
| Dock/Organism Attachment | duplicate quick/widget controls | MOVE | Membrane Detail → Fusion | `commitMembraneRuntime({ attachMode })` |
| Dock Density / Organism Reach | duplicate quick/widget controls | MOVE | Membrane Detail → Reach | ephemeral runtime preview, one release transaction |
| Display Morph toggle | Display duplicate | REMOVE AS DUPLICATE | Membrane Field visibility | `presentationDefaults.membrane.visible` |
| Broad procedural Organism controls | legacy Organism widget | HIDE AS UNSUPPORTED | compatibility state; advanced M2 destination | existing `settings.organism`; no M1 launcher |
| Palette quick control/browser | Dock/Palette widget | HIDE AS UNSUPPORTED | canonical palette resolver; Material Browser M4 | `getNucleusColor` and existing resource IDs remain owners |
| Cell Surface visible/colour/opacity | incomplete | MERGE | Cell Detail → Cell Surface | canonical paint projection in both renderers/export |
| Boundary six styles and geometry/paint | incomplete/fallback | MERGE + REPAIR | Cell Detail → Boundary | one `appearance.boundary`; Classic/Organism overlay/Classic SVG |
| Organism non-solid fallback warning | Boundary widget | REMOVE AFTER REPAIR | none | all six requests render truthfully; runtime fallback count `0` |
| Debug nuclei centre dot | WebGL debug block | REBIND | isolated Lab diagnostic only | production `projectOrganismDebugPresentation` is ring-only |
| Display Show nuclei dots | legacy display setting | MOVE | Cell Detail → Core / nucleus | legacy migration to Core defaults; no competing live toggle |
| Core explanation | absent | MERGE | Cell Detail → Core / nucleus | explicitly separate from selection, Boundary, Membrane and debug geometry |
| Add Void Rail/Dock duplication | duplicate creation launchers | REMOVE AS DUPLICATE | Dock Add Void | existing `addVoid`; canonical `kind: "void"` selected on add |
| Void appearance | incomplete | MERGE + PROTECT | Void Detail → Fill/Edge | presentation only; subtraction/geometry/hit testing unchanged |
| Unconditional Void inner circle | Canvas2D/SVG hard-coded echo | REMOVE | none in M1 | outer fill/edge and subtractive nucleus remain; no inner live/export layer |
| Optional Void Inner Echo | no truthful control | DEFER | M2 advanced Void instrument, default OFF | only implement with canonical state and live/export parity |
| Selected Cell keyline | renderer overlays | KEEP + PROTECT | renderer-neutral ephemeral selection overlay | excluded from style, persistence and clean export |
| Prototype selection orbit | prototype evidence | DEFER | M2 in the same Inspector | no persisted selection appearance added in M1 |
| Export clean/include selection | Export widget | KEEP + PROTECT | existing Export widget | clean capture clears all M1 previews; no new export path |
| Material Browser/recents/favourites/hover | prototype evidence | DEFER | M4 | no M1 control or schema |
| Symbol tab/catalogue | approved prototype/research | DEFER | M2 tab inside the same Inspector | audited registry/research compatibility preserved; no M1 Symbol UI |
| Membrane Field Edge Softness | existing field/body softness | DEFER UI | M2 Membrane → Field → Field Edge Softness | existing `settings.organism.edgeSoftness`; affects field-body feather only |
| Independent Membrane Edge Softness | absent | DEFER | M2 Membrane → Edge → Edge Softness | future independent presentation-band owner; must not alias Field Edge Softness |

## Invariants

- There is one Inspector. Content and Appearance are live; Symbol is a future M2 tab inside it.
- User-facing Appearance has three families while Cell, Boundary, Core, Membrane, Membrane Edge and Void remain six independent canonical targets.
- There are three user-facing Detail widgets, not six competing windows.
- Membrane Field and Edge are independent shared organism targets and truthfully edit Project Defaults.
- Text Style, Text Size and Text Colour are owned only by text defaults plus sparse text overrides.
- Selection, content drafts and every appearance/runtime preview remain ephemeral and clean-export-excluded.
- Void remains subtractive and never renders Cell Surface, Boundary or Core.
- Void live/export presentation contains only its outer fill and outer edge; M1 has no unconditional inner echo.
- `Cell Gradient` remains the default Membrane colour mode; Solid mode resolves through canonical registry IDs and never contains Cell-derived colour patches.
- No legacy widget, mock store, fake export, fake Cell, prototype shell or duplicate registry is exposed.
- `I` is owned by the one production Inspector. The future M2 Symbol tab is inside that Inspector and must not register a competing shortcut or listener.

## Correction 4 verification disposition

- The Owner manually confirmed the global `I` shortcut in the live preview.
- Focused shortcut policy and M1 product contracts passed; the complete affected source-contract set, TypeScript build check and the single permitted production build had already passed after the final source change.
- Physical browser checkpoints passed for Canvas lifecycle/editing guards and bounded Table interactions. The exhaustive two-viewport CDP run was stopped after repeated harness stalls on controlled Table, textarea and number-field interactions. This is a QA-harness limitation, not a reproduced product failure, and no complete uninterrupted automated two-viewport Correction 4 pass is claimed.
