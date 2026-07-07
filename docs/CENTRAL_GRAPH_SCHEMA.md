# Central Graph Schema (V4.5B)

## Master rule
**The master graph is the brain.** Canvas, Table, Floors, Stats, Sankey, Charts, Bylaw Check, and Export are all *views* computed from one `ZonuertProject` via selectors. No view stores its own copy of program data; no dashboard stat is typed by hand.

Source of truth code: `src/domain/graph/types.ts` · `selectors.ts` · `sample-project.ts` · `import-contract.ts` · `adapters.ts`.

## Root shape — `ZonuertProject`
- `version`, `created_at`, `updated_at`
- `meta: ProjectMeta`
- `floors: FloorNode[]`
- `spaces: SpaceNode[]`
- `relationships: RelationshipEdge[]`
- `flows: FlowPath[]`
- `categories: CategoryDefinition[]`

## Node types (see types.ts for exact fields)
- **ProjectMeta** — identity, location/authority, `site_area` (+unit), target `total_built_up_area`, optional cached `far`/`ground_coverage` (targets only — actuals are always computed), `road_width`, `land_use`.
- **FloorNode** — `level` (0 = ground, negative = basement), `elevation`, `area_target`, `visible`, `locked`. Actual floor area comes from its spaces.
- **SpaceNode** — program cell: `floor_id` (required), `area`+`unit`, `category` (CategoryCode), `privacy` (PrivacyCode), optional `parent_id`/`zone`/`user_group`/`priority`, shape/color/gradients, canvas `x`/`y`/`radius`, `locked`/`visible`, notes.
- **RelationshipEdge** — `from`/`to` space ids, `type` (S3/S2/S1/AV/CF/DEP/ADJ/VIS/ACC), optional strength/access/avoid/conflict flags.
- **FlowPath** — named movement path: `flow_type` (visitor/staff/service/goods/emergency), `start`/`end`/`via` space ids, intensity/color/speed.
- **CategoryDefinition** — 16 codes (PUB…STO) with restrained ZONUERT colors + blob `gradient_to` + `default_privacy` + `legend_order`. Defaults live in `DEFAULT_CATEGORIES`.

## GraphStats — computed only
`GraphStats` is never stored. Every number (total area, area left, FAR, coverage, ratios, warnings) comes from pure selectors in `selectors.ts`. Counting rules: locked spaces count; hidden spaces count (visibility is a view concern); divide-by-zero returns 0.

## Compatibility with the existing canvas
The V4 store (`src/state/store.ts`) keeps working on `SpaceCell[]` untouched. `adapters.ts` bridges the two: `spaceNodeToCanvasCell` / `canvasCellToSpaceNode` / `radiusFromArea` (reuses `lib/geometry.areaToRadius`) / `shortLabelFromName`. Legacy `Privacy` ("public/shared/private") maps to `PrivacyCode` (P0/P2/P3).

## V5 migration path
1. Store adopts `ZonuertProject` as its data slice (spaces become `SpaceNode[]`); `SpaceCell` becomes a render-only projection via adapters.
2. CanvasView + TableView both read/write the same graph slice; selectors feed HUD/widgets.
3. Floor panel + import UI land after table sync, built directly on FloorNode + import-contract.
No store rewrite happens in V4.5B — this doc is the contract for that migration.
