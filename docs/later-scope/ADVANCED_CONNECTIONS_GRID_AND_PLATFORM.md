# Later Scope — Advanced Connections, Grid and Platform

**Status:** CAPTURED / DEPENDENCY-GATED

## Advanced connection system

The canonical separation remains:

```text
Relationship
Visual Connection
Morph Bridge
Cell Behaviour
```

Future Visual Connection styles:

- straight,
- curved,
- Bezier,
- orthogonal,
- elbow,
- custom anchors,
- arrows,
- labels,
- animated flow,
- screen-fixed/world-scaled line thickness,
- technical dashed/dotted/chain presets,
- material/pattern-compatible strokes.

Changing a line style must never change semantic Relationship data.

Future Morph Bridge work may include:

- bridge geometry presets,
- width and tension,
- membrane/material compatibility,
- animated response,
- merge/touch/keep-clear behaviours,
- high-density fallback.

## Advanced Cell Behaviour

Future architectural behaviours:

- merge,
- touch,
- keep clear,
- attract,
- repel,
- bridge,
- ignore,
- minimum clearance,
- influence radius,
- floor/category/privacy-aware rules.

Behaviour is architectural/spatial logic, not a visual Boundary offset.

## Advanced grids and snapping

Future grid work after the C0.2 registry foundation:

- Dots,
- Square,
- Major/Minor Technical,
- Isometric,
- Triangular,
- Hexagonal,
- Polar/Radial,
- custom spacing,
- major/minor subdivisions,
- theme and print variants,
- snap-to-grid,
- snap-to-Cell,
- snap-to-anchor,
- snap only on pointer release where possible,
- independent visual grid and snapping states.

Future technical grid styles require performance and export review before activation.

## Advanced export and presentation

Future directions:

- Organism true-vector SVG,
- multi-frame export,
- batch export queue,
- reusable presentation frames,
- advanced print presets,
- technical line-weight mapping,
- transparent-background variants,
- linked manifest/metadata,
- project reopening from generated assets where metadata exists.

## Performance scaling

Future performance work may include:

- texture/data-buffer renderer,
- higher visible Cell counts,
- label decluttering,
- spatial indexing,
- viewport culling,
- lower-quality interaction mode,
- deferred expensive derivations,
- worker-thread computation where justified.

Performance work must follow profiling evidence rather than speculative rewrites.

## Devices and platform

Deferred until the browser-first desktop product is stable:

- tablet layout,
- phone review mode,
- backend,
- authentication,
- cloud projects,
- collaboration,
- comments,
- team roles,
- billing/commercial systems,
- shared libraries.

Desktop 1440/1280 remains the active product target until a separate roadmap amendment changes it.

## Dependency gate

Each group requires a new architecture review after its direct prerequisites are complete. Nothing in this document authorises implementation.
