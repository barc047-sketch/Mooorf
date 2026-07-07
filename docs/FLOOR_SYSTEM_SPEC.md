# Floor System Spec (V4.5B)

Schema + selectors only in this phase. **No floor UI is built now.**

## Model
- `FloorNode` (`src/domain/graph/types.ts`): `id`, `name`, `level` (0 = ground, negative = basement, positive = upper), `elevation` (m), `area_target`, `visible`, `locked`, `notes`.
- Every `SpaceNode` carries a required `floor_id` pointing at a FloorNode. A space with a missing/unknown `floor_id` raises a `MISSING_FLOOR`/`UNKNOWN_FLOOR` warning (see `getMissingDataWarnings`).

## Totals
- `area_target` is the planned area per floor.
- **Actual** floor area is always derived from its spaces via `getFloorTotals(project)` → `{floor_id, name, level, area_target, actual_area, space_count, delta}` sorted basement-first. Locked and hidden spaces count.
- Ground coverage (`getGroundCoveragePercentage`) uses level-0 floors' enclosed (non-OUT) spaces against site area.

## Visibility & locking
- `visible:false` hides a floor's spaces from the canvas *view* — it never removes them from stats (one brain, many views).
- `locked:true` blocks editing/dragging of that floor's spaces; they still count everywhere.

## Future floor panel (later phase, not now)
Right-side glass panel listing floors with an **Add Floor** action; typical entries: Basement, Ground Floor, First Floor, Second Floor, Terrace. Per-floor rows show name, level, target vs actual (from `getFloorTotals`), visibility eye, lock. Built library-first per [V4_5_COMPONENT_LIBRARY_RULES.md](V4_5_COMPONENT_LIBRARY_RULES.md).

## Future view modes (later phase)
- **All floors** — everything on one canvas (current behaviour).
- **Selected floor** — only the active floor's spaces at full strength, others dimmed/hidden.
- **Floor stack** — floors offset vertically as a stacked axon-style overview.

All of these are pure views over the same graph — no per-floor data copies.
