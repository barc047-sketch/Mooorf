# C0.4 Safe Implementation Slices

**Status:** Approved planning structure
**Product-code effect:** None until separate worker briefs receive explicit GO

## Purpose

C0.4 separates Organism and presentation ownership before the production Cell Inspector is connected.

The phase is intentionally divided into small branches so each change can be audited, tested, redesigned or rejected without destabilising unrelated systems.

## C0.4.0 — Canonical architecture package

### Goal

Preserve the accepted audit findings and corrected architecture in GitHub.

### Included

- ownership review,
- safe implementation slices,
- future-scope directory,
- explicit dependency gates.

### Excluded

- product code,
- renderer changes,
- state/schema changes.

### Gate

Owner approves the planning package.

---

## C0.4.1 — Layer contracts, defaults and resolvers

### Goal

Define the typed architecture that all later renderer and Inspector work will consume.

### Included

- canonical appearance-target types:
  - Cell,
  - Boundary,
  - Membrane,
  - Membrane Edge,
  - Core,
  - Void,
- nested sparse override types,
- project presentation defaults,
- pure resolver functions,
- target compatibility metadata,
- baseline persistence migration shape only where required,
- focused type/resolver/migration tests.

### Baseline visual capability

Boundary:

- visible,
- solid,
- width,
- offset,
- colour/material reference.

Core:

- visible,
- dot,
- size,
- colour/material reference.

### Explicit exclusions

- no visible UI,
- no renderer visual changes,
- no advanced Boundary styles,
- no additional Core shapes,
- no Cell Inspector,
- no Annotation Cards,
- no Flag implementation,
- no broad history refactor.

### Gate

- old project files migrate safely,
- resolved defaults equal current production appearance,
- no visual regression,
- no duplicated state owner.

---

## C0.4.2 — Selection overlay isolation

### Goal

Move selection/editing feedback into an explicit temporary overlay owner.

### Included

- one shared selection projection,
- clean keyline baseline,
- dotted orbit compatibility hook,
- reduced-motion contract,
- exclusion from persistence and export,
- Classic and Organism coordinate compatibility,
- focused selection/export-exclusion tests.

### Excluded

- architectural Boundary styling,
- Core styling,
- label/callout rendering,
- complete interaction-history rewrite.

### Gate

Selection can change without modifying Cell, Boundary or Core appearance.

---

## C0.4.3 — Classic renderer layer separation

### Goal

Separate the Canvas 2D drawing path into explicit semantic layers without changing the approved baseline look.

### Included

- Cell fill owner,
- baseline Boundary owner,
- baseline Core owner,
- Membrane and Membrane Edge ownership boundaries,
- Void ownership,
- Cell Label overlay hook,
- Flag overlay reservation,
- future Annotation Card overlay reservation,
- hit testing remains geometry-owned,
- Classic PNG/PDF/SVG compatibility checks.

### Excluded

- WebGL changes,
- advanced technical Boundary styles,
- Annotation Card implementation,
- advanced labels/Flags.

### Gate

Changing one baseline layer cannot silently alter another layer, Cell area or hit testing.

---

## C0.4.4 — Organism/WebGL renderer layer separation

### Goal

Provide semantic parity with C0.4.3 without forcing unsupported visual effects into the shader.

### Included

- target ownership parity,
- baseline Cell/Boundary/Core projections,
- Membrane and Membrane Edge separation where current rendering technology supports it,
- Void parity,
- overlay hooks for labels, Flags and future Annotation Cards,
- performance and renderer-cap validation,
- Classic fallback remains intact.

### Excluded

- major shader redesign,
- per-Cell texture-buffer scaling,
- advanced dashed/pattern Boundary rendering,
- advanced Membrane geometry/motion,
- Annotation Cards.

### Gate

Current Organism appearance and interaction remain stable, with explicit ownership available for later Inspector work.

---

## C0.4.5 — Persistence, history and export parity

### Goal

Ensure the separated baseline layers survive save/load, Undo/Redo and export consistently.

### Included

- sparse override persistence,
- safe migration from older projects,
- unknown/missing target fallback,
- one transaction per committed layer-setting change,
- previews remain ephemeral,
- PNG/PDF/SVG behaviour documented per renderer,
- selection/editing UI excluded,
- focused persistence/history/export contracts.

### Excluded

- broad drag-history redesign,
- Annotation Card persistence,
- advanced Boundary/style persistence fields not yet activated.

### Gate

Round-trip save/load and Undo/Redo preserve the same resolved appearance without duplicating registry objects.

---

## C0.4.6 — Independent audit and owner Canvas QA

### Goal

Validate the entire C0.4 foundation before production Inspector work starts.

### Required audit

- state ownership,
- migration,
- Classic parity,
- Organism parity,
- export parity,
- no new selector loops,
- no hit-testing or Area regression,
- no advanced future scope accidentally activated.

### Manual QA

- Cell remains area-driven,
- Boundary can be changed independently,
- Core can be changed independently,
- Membrane and Membrane Edge remain independent owners,
- Void behaviour remains intact,
- selection is clearly temporary UI,
- 1440 and 1280 layouts remain stable.

### Gate

Owner explicitly approves C0.4 before C0.5 production Cell Inspector begins.

---

# C0.5 dependency reminder

Only after C0.4 approval:

- production Cell Inspector,
- Text Style / Size / Colour,
- Symbol system,
- Cell Label Layout presets,
- separate Area placement,
- Flag direction/distance,
- canonical Area edit → Cell resize,
- Spaces and Cell Labels table projections.

Future Annotation Card implementation remains at C0.13A.

# Worker routing

Each numbered implementation slice receives:

1. a separate Codex brief,
2. a separate work branch,
3. focused tests,
4. one final build when justified,
5. Antigravity or equivalent independent audit,
6. Owner approval before merge or next slice.

No worker may combine all C0.4 slices into one branch without a new Owner-approved roadmap change.
