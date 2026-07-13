# MOOORF Core Rules — Knowledge Upload 01

## Identity

MOOORF is a browser-first architecture and spatial-program design system. It converts one central spatial graph into synchronized editable views and presentation outputs.

## Authority

- Owner makes final decisions.
- Custom GPT is Project Manager.
- Workers execute approved contracts only.
- GitHub is live truth.
- Rough discussion is not approval.

## Protected product truths

- Master Graph is the only project-data source of truth.
- Canvas, Table, Floors, Stats, Sankey, Charts, Bylaw Check and Export are views.
- UI reads state and sends commands; UI does not own project data.
- No duplicate store, graph, registry, renderer, camera, history, persistence or export-truth system.
- Architecture remains modular so individual systems can be redesigned independently.

## Current architectural targets

Organism system:

- Cell
- Boundary
- Membrane
- Membrane Edge
- Core
- Void

Selection is editing UI only. It is not persisted as architectural style, copied as style or exported.

Connection system remains separate:

- Relationship: semantic Master Graph meaning
- Visual Connection: rendered line
- Morph Bridge: membrane-based physical link
- Cell Behaviour: attraction, repulsion, clearance and merging behaviour

## Text and markup

- Cell Label Layout controls Name, Area and Body arrangement.
- Flag is a Cell Label Layout preset with top/bottom/left/right/auto and adjustable distance.
- Area may be positioned separately through presets and later advanced placement.
- Annotation Card is a standalone markup object, not embedded in Cell.
- There is no Linked Callout object.
- Annotation Card content order: optional transparent PNG logo, Heading, Body.
- Logo has no background and uses the resolved Text Colour / Auto Contrast tint.
- Annotation Card uses the shared text-style system and shared material/background tokens.

## Area and Table truth

- Name, Area and Body sync through Master Graph/state.
- Area edited from Canvas, Inspector or Space Table updates one canonical Area.
- Area change recalculates Cell size immediately.
- Tables are synchronized projections, never separate databases.
- Future Annotation Cards use their own markup collection and table projection.

## Product constraints

- Desktop first at 1440 and 1280.
- Mobile/tablet/backend/auth/cloud/collaboration come later.
- Keep blur; no UI shadows.
- No Mac Dock hover magnification.
- Compact technical controls, icons and signal dots.
- Plain Cells at startup; advanced systems are opt-in.
- 50+ Cell performance remains a known limitation until explicitly solved.
- Known Vite chunk warning is accepted unless it changes.

## Safety

- Preserve `.claude/launch.json`.
- Keep `.references/` local-only.
- Never merge Claude prototype branches wholesale.
- No unaudited complex merge.
- No packages unless explicitly required.
- No secrets in documentation or Knowledge uploads.

## Canonical references in GitHub

- `AGENTS.md`
- `docs/MOOORF_AI_TEAM_OPERATING_PROTOCOL.md`
- `docs/MOOORF_FINAL_SCOPE.md`
- `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`
- `docs/MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md`
- `docs/MOOORF_CANONICAL_PHASE_ROADMAP.md`
- `docs/MOOORF_CHANGE_CONTROL_PROTOCOL.md`
- `docs/PROJECT_MEMORY_INDEX.md`
