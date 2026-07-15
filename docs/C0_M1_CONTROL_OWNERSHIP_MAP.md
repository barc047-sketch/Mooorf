# C0 M1 Control Ownership Map

Scope: every Content, appearance, Morph, Core, Void and selection control visible at audited base `21388c0d765cd4bbc675d0321d94e77db9a41e5c`. Each row has exactly one M1 disposition. “Hidden” means its canonical compatibility data is preserved, but no production launcher exposes a control outside the bounded M1 contract.

| Base control | Previous owner | Disposition | Final owner | Canonical state/action path |
| --- | --- | --- | --- | --- |
| Inline Space Name | `InlineCellEditor` → `updateSpace` | KEEP + REBIND | Inline editor, Inspector Content, Table | `SpaceCell.name` → `commitSpaceEdit` → existing history |
| Inline Area | `InlineCellEditor` → `updateSpace` | KEEP + REBIND | Inline editor, Inspector Content, Table | `SpaceCell.area` → normalized `commitSpaceEdit`; geometry derives from Area only |
| Body / subtext | absent | MERGE | Inline editor, Inspector Content, Table | optional `SpaceCell.body` → normalized `commitSpaceEdit`; presentation-only text |
| Table Name and Area inputs | `TableView` → per-keystroke `updateSpace` | KEEP + REBIND | Minimal Table | local draft → blur/Enter `commitSpaceEdit`; Escape restores draft |
| Table Category and Privacy | `TableView` | KEEP + REBIND | Minimal Table, unchanged | existing `updateSpace`; outside M1 text/appearance ownership |
| Annotation Text Scale | Annotation widget / `annotationDetail.textScale` | MERGE | Inspector Text Size | legacy value migrates to `presentationDefaults.text.size`; no second live multiplier |
| Annotation label colour modes and custom colour | Annotation widget / `labelColourMode` | MERGE | Inspector Text Colour + Auto Contrast | legacy Auto/Black/White/Custom migrates to canonical text default mode/colour |
| Annotation Screen/Adaptive/World projection | Annotation widget | HIDE AS UNSUPPORTED | compatibility state only | `settings.labelScaleMode` remains persisted/rendered; no M1 appearance duplicate |
| Annotation Editorial/Pill/Technical/Hidden modes | Annotation widget | HIDE AS UNSUPPORTED | compatibility state only | `settings.annotationMode`; M1 does not build Annotation Studio |
| Annotation show Name/Area/Category, keyline, position and pill outline | Annotation widget | HIDE AS UNSUPPORTED | compatibility state only | `settings.annotationDetail`; Body is never stored here |
| Dock Morph style | Dock quick control | MOVE | Membrane Settings → Field character | `commitMembraneRuntime({ morphMode })`; one history transaction |
| Organism widget Morph Style | Organism widget | MOVE | Membrane Settings → Field character | same `settings.morphMode` owner; legacy widget has no launcher |
| Dock/Organism Attachment | Dock and Organism widget | MOVE | Membrane Settings → Fusion | `commitMembraneRuntime({ attachMode })`; one history transaction |
| Dock Density / Organism Reach | Dock and Organism widget | MOVE | Membrane Settings → Reach | ephemeral `membraneRuntimePreview.mergeDistance`; one release transaction |
| Display Morph toggle | Display widget | REMOVE AS DUPLICATE | Membrane Settings → Membrane visible | `presentationDefaults.membrane.visible`; legacy `blobOn` migration remains compatible |
| Organism Mass, Iso Level, Surface Tension, Edge Softness and Connection Bias | Organism widget | HIDE AS UNSUPPORTED | compatibility state only | existing `settings.organism` values persist; advanced procedural Membrane work is excluded from M1 |
| Organism Strength, Radius Min/Max and Size Variation | Organism widget | HIDE AS UNSUPPORTED | compatibility state only | existing shader/adapter compatibility values persist; Cell/Core geometry is not re-owned |
| Organism Global/XY/Radial/Angular offsets and Camera-aware morph | Organism widget | HIDE AS UNSUPPORTED | compatibility state only | existing adapter values persist; no presentation control may change architectural centres/hit testing |
| Organism Idle Motion, Time Scale, Response, Drift, Breathing, Wobble and Phase Variation | Organism widget | HIDE AS UNSUPPORTED | compatibility state only | existing performance-bounded runtime values persist; not an M1 appearance target |
| Organism Pocket Threshold and Pocket Softness | Organism widget | HIDE AS UNSUPPORTED | compatibility state only | existing shader values persist; no M1 control may alter Void subtraction |
| Organism Reset Morph / Reset motion | Organism widget | HIDE AS UNSUPPORTED | compatibility state only | no launcher exposes broad procedural reset in M1 |
| Palette mode quick control | Dock | HIDE AS UNSUPPORTED | canonical palette resolver remains | `settings.paletteMode`; M1 target swatches reuse `getNucleusColor` |
| Color By, Mode, Nucleus Palette, Organism Palette and Program Mapping | Palette widget | HIDE AS UNSUPPORTED | canonical resolver/resources remain | existing settings/registries persist; full Material/Palette Browser is excluded |
| Disabled Custom palette | Palette widget | REMOVE AS DUPLICATE | none in M1 | fake/future no-op is unreachable; no competing palette schema added |
| Cell fill visibility/colour/opacity | no complete target editor | MERGE | Cell Settings | `appearance.cell` sparse override or `presentationDefaults.cell` |
| Boundary visibility/style/width/alignment/offset/dash/gap/double spacing/colour/opacity | no complete target editor | MERGE | Boundary Settings | `appearance.boundary` sparse override or `presentationDefaults.boundary` |
| Membrane fill visibility/colour/opacity | Display Morph plus shader owners | MOVE | Membrane Settings | audited shared `presentationDefaults.membrane`; never a disconnected local override |
| Membrane Edge visibility/width/colour/opacity | shader/runtime only | MERGE | Membrane Edge Settings | independent audited shared `presentationDefaults.membraneEdge` |
| Display Show nuclei dots | Display widget / `organism.showNuclei` | MOVE | Core Settings | `appearance.core` or `presentationDefaults.core`; legacy setting migrates into defaults |
| Core visibility/size/colour/opacity/Auto Contrast | no complete target editor | MERGE | Core Settings | one `appearance.core` / `presentationDefaults.core` owner |
| Add Void in Rail and Dock | duplicate creation launchers | REMOVE AS DUPLICATE | Dock Add Void | existing `addVoid`; Rail duplicate removed |
| Void fill/edge visibility, paints, opacity and edge width | no complete target editor | MERGE | Void Settings | `appearance.void` / `presentationDefaults.void`; geometry/subtraction/hit testing untouched |
| Selected Cell keyline | renderer overlays | KEEP + REBIND | existing renderer-neutral selection overlay | ephemeral `selectedIds`/`primarySelectedId`; excluded from appearance, copy, persistence and clean export |
| Prototype dotted rotating orbit | Claude prototype evidence | HIDE AS UNSUPPORTED | deferred | existing clean keyline retained; no new renderer geometry or persisted selection style |
| Export selection include/clean choice | Export widget local state | KEEP + REBIND | existing Export widget | export-local option; clean capture explicitly clears M1 previews |

## Invariants

- Cell, Boundary, Membrane, Membrane Edge, Core and Void have separate production controls and canonical target paths.
- Membrane and Membrane Edge are independent but shared organism fields, so their widgets truthfully edit Project Defaults for every Cell.
- Text Style, Text Size and Text Colour are owned only by `presentationDefaults.text` plus sparse `appearance.text` overrides.
- Selection and all M1 previews remain ephemeral and clean-export-excluded.
- Legacy compatibility fields remain importable; no legacy widget, mock store, fake export, fake Cell or duplicate registry is exposed.
