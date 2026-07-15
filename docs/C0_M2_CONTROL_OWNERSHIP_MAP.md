# C0 M2 — Control Ownership Map

| Product surface | Canonical state owner | Preview / history owner | Live renderer owner | Export / persistence owner |
|---|---|---|---|---|
| Inspector tabs `Content | Appearance | Symbol` | `InspectorWidget` inside the existing `WidgetHost` | Existing widget lifecycle / global `I` command | N/A | UI state is not project data |
| Cell Surface | `settings.presentationDefaults.cell` / sparse `SpaceCell.appearance.cell` | Existing appearance preview + Cell/default history | `presentationLayers` in Classic and Organism overlay | project defaults/Cell overrides; Classic SVG + raster capture |
| Cell Shadow | `settings.cellShadow` (`CellShadowSettings`) | `visualSettingsPreview`; `visual-settings` history | `resolveCellShadowGated`; Classic Canvas2D / Organism shader | project/saved-view settings; PNG/PDF and Classic SVG |
| Boundary | `presentationDefaults.boundary` / sparse Cell override | Existing appearance preview/history | shared six-style stroke control/projection | project/Cell persistence; live/raster/SVG |
| Core / nucleus marker | `presentationDefaults.core` / sparse Cell override | Existing appearance preview/history | shared circle overlay; presentation-only X/Y offsets | project/Cell persistence; live/raster/SVG |
| Membrane Field | `presentationDefaults.membrane` + canonical Morph/Fusion/Reach + `settings.organism` | existing defaults/runtime preview plus `visualSettingsPreview` | Classic blob / Organism field shader | project/saved-view; PNG/PDF, no fake Organism SVG |
| Field Edge Softness | `settings.organism.edgeSoftness` | `visualSettingsPreview`; `visual-settings` history | Organism body feather; Classic contour character path | settings persistence and raster capture |
| Motion | `settings.organism.motionEnabled/idleMotion` plus supported amounts | `visualSettingsPreview`; `visual-settings` history | `resolveOrganism` + demand scheduler | settings/project/saved-view; not exported as animation |
| Membrane Edge | `presentationDefaults.membraneEdge` | project-default preview/history | Classic contour stroke / Organism edge band | project defaults; raster capture |
| Membrane Edge Softness | `presentationDefaults.membraneEdge.softness` | project-default preview/history | Classic stroke blur fallback / `uMembraneEdgeSoftness` | schema v5; PNG/PDF fallback |
| Void Fill / Edge | `presentationDefaults.void` / sparse Void override, including Void-owned style values | existing appearance preview/history | same six-style stroke control/projection as Boundary over the subtractive Void surface | presentation schema v5; live/raster/SVG; geometry invariant |
| Runtime gates | `resolveRuntimeGates` over canonical enabled/visible state | no duplicate gate state | both renderers + demand scheduler; one-shot Off uniform transition | no separate persistence |
| Symbol identity | `settings.resources.iconPlacements[].iconId` (one per target Cell or Void) | `resourcesPreview` is Canvas-only; `resources` history | shared `iconDrawing` adapter | resource schema v3; project/import/saved-view; PNG/PDF/SVG |
| Symbol tint | `IconPlacementSettings.tintMode/tint` | canonical pane state; Canvas-only preview; `resources` history | existing contrast resolver through shared `iconDrawing` | v3 migrates legacy tint to Custom; live/raster/SVG |
| Symbol placement/backing | same `IconPlacementSettings` record | canonical pane state; Canvas-only preview; one release history | shared `iconDrawing` adapter | resource schema v3; project/import/saved-view; PNG/PDF/SVG |
| Symbol search/categories | immutable `iconRegistry` metadata + local query/filter interaction | no project history | Inspector only | registry definitions never persist |
| Symbol recents/favourites | `settings.resources.iconRecents/iconFavourites` canonical IDs | `resources` history | Inspector filters | resource schema v3 |
| Current layout presets | central store selection + renderer-visible ID contract | one bounded `transform` entry | existing layout preset projector | final positions only; non-position data untouched |
| Batch Add Cells | central store + Area/radius geometry | one `batch-add` entry restores prior/new selection | collision-cleared golden-angle initial placement | Cells persist through existing graph/project owners |
| Symbol Copy/Paste Style | `styleClipboard.symbolStyle` excludes `iconId/targetSpaceId` | combined Cell/resource `style` history | target keeps its own symbol identity | ephemeral clipboard; pasted placement/backing persists |
| Snapping inactive gate | pure `snappingEnabled && interactionActive` projection | none | no M2 engine/candidates/UI | none |

Selection, hover, focus and editor state remain interaction-only. None enters appearance, symbol identity, geometry, project exports or the Master Graph.
