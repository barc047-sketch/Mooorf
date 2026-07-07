# Bylaw Check — Future Spec (V4.5B hook only)

Schema/docs hook only. **Nothing is built or integrated in this phase.**

## Scope & disclaimer
- A **preliminary** bylaw check — a design-stage sanity screen, **not legal approval** and not a substitute for authority review or a licensed professional.
- Works entirely on graph selectors: the app compares computed stats (FAR, coverage, totals — see `src/domain/graph/selectors.ts`) against a local **rule pack**.

## Rule packs (future)
- User selects country / state / city / authority (already fields on `ProjectMeta`: `location_*`, `authority`, plus `road_width`, `land_use`).
- Rule packs are curated data files created **externally** — NotebookLM / Gemini Deep Research used for source research and drafting rule packs from published development-control regulations. They are reviewed before shipping; there is **no live AI integration** in the app.

## Future checks
FAR / FSI · ground coverage · building height · setbacks · parking requirement · open-space ratio · fire access · road-width-conditioned entitlements.

## Result labels
Every check resolves to one of: **OK** · **Check** · **Exceeding** · **Needs Manual Verification**.

## Future UI (later phase, library-first)
Movable, collapsible glassmorphism popup over the canvas (per [V4_5_FLOATING_WIDGET_SYSTEM.md](V4_5_FLOATING_WIDGET_SYSTEM.md)): warning count in header, per-rule rows with label chips, **source** button (links the rule's published clause), **suggest fix** button, affected-cell highlight on canvas, small triangle danger icons near affected cells (muted yellow/red accents only, per [V4_5_VISUAL_DIRECTION.md](V4_5_VISUAL_DIRECTION.md)).

## Data path (already in place after V4.5B)
`ZonuertProject` → selectors (`getFAR`, `getGroundCoveragePercentage`, `getFloorTotals`, `getMissingDataWarnings`) → future rule-pack comparator → warning rows. No new data storage needed — the graph stays the single brain.
