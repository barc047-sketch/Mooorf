# Import Template Spec (V4.5B)

Code contract: `src/domain/graph/import-contract.ts`. No import UI exists yet — this is the file format users (and the AI prompt in [AI_TEMPLATE_PROMPT.md](AI_TEMPLATE_PROMPT.md)) must produce.

## Mode 1 — CSV simple
One flat sheet of spaces. Exact headers:

```
name,area,category,privacy,floor
```

| column | required | default | rule |
|---|---|---|---|
| name | yes | — | non-empty text |
| area | yes | — | number > 0, no units in cell |
| category | yes | PUB | CategoryCode (PUB…STO) or full name |
| privacy | yes | P0 | PrivacyCode P0–P5; empty → category default |
| floor | yes | Ground Floor | floor name; unknown names create a floor |

Example:
```
name,area,category,privacy,floor
Entrance Lobby,160,PUB,P0,Ground Floor
Library,180,EDU,P1,First Floor
Pump Room,80,UTL,P5,Basement
```

## Mode 2 — XLSX advanced
Six sheets, exact UPPERCASE names: **PROJECT, FLOORS, SPACES, RELATIONSHIPS, FLOWS, CATEGORIES** (CATEGORIES optional → `DEFAULT_CATEGORIES` used).

- **PROJECT** — two columns `field,value`; one row per ProjectMeta field (`project_name`, `site_area`, `site_area_unit`, `far` target, etc.).
- **FLOORS** — `id, name, level, elevation, area_target, visible, locked, notes`. Required: `name`, `level` (integer, 0 = ground, negative = basement).
- **SPACES** — `id, parent_id, floor_id, code, name, area, unit, category, privacy, zone, user_group, priority, shape, color, gradient_from, gradient_to, x, y, locked, visible, notes`. Required: `floor_id, name, area, category, privacy`. Defaults: `unit=sqm`, `shape=circle`, `visible=TRUE`, `locked=FALSE`, empty `id`→auto, empty `x/y`→auto-scatter, empty `color`→category color.
- **RELATIONSHIPS** — `id, from, to, type, strength, access, avoid, conflict, notes`. Required: `from, to, type` (S3/S2/S1/AV/CF/DEP/ADJ/VIS/ACC).
- **FLOWS** — `id, name, flow_type, start, end, via, intensity, color, speed, notes`. Required: `name, flow_type (visitor/staff/service/goods/emergency), start, end`. `via` = semicolon-separated space ids.
- **CATEGORIES** — `code, name, color, gradient_to, default_privacy, legend_order, description`.

## Mode 3 — JSON `.zonuert` (future)
Full-project save/round-trip: `{ format: "zonuert-project", schema_version: "1.0", exported_at, project: ZonuertProject }` (`ZonuertSaveFile` type). Not built yet.

## Validation rules
- All ids unique per sheet (duplicates → warning, not silent overwrite).
- `SPACES.floor_id` must match a FLOORS row; relationship/flow endpoints must match space ids.
- Numeric cells must parse as numbers; code cells must be valid union members.
- No merged cells, no markdown, no units inside cells.
- Import produces a NEW project for review — never overwrites in place.

## Common errors
Area with unit text ("120 sqm") · privacy written as words in advanced mode · floor referenced by name in SPACES sheet (must be `floor_id`) · duplicate space ids from copy-paste · merged header cells from spreadsheet styling.
