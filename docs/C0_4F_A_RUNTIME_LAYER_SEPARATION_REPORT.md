# C0.4F-A Runtime Layer Separation — Implementation Report

Status: `WAITING_REVIEW`

- Base: `origin/main` at `c4600472ea76f651800c19b91cf8f67954ca992e`
- Branch: `feature/c0-4f-a-runtime-layer-separation`
- Worker: Codex
- Merge state: not merged; C0.4F-B not started

## Delivered

- Extended the canonical presentation schema to v2 with six Boundary styles (`solid`, `dashed`, `dotted`, `dash-dot`, `double`, `segmented-bars`), inner/centre/outer alignment, width, offset, dash/bar length, gap, double spacing, colour, and opacity. v1 presentation data migrates deterministically.
- Added one pure runtime projection in `src/canvas/presentationLayers.ts`. Both live renderers consume the existing `resolveCellAppearance` domain; no second store, registry, or resolver was added.
- Classic now renders Cell, Boundary, Membrane, Membrane Edge, Core, and Void as separate presentation layers. Membrane fill and edge can be enabled independently.
- Organism keeps the existing one-pass field shader and adds only three shared Membrane/Edge controls. A pointer-transparent Canvas2D overlay owns per-Cell Boundary/Core/Void and the edge-only Cell adapter; captures composite that overlay with WebGL.
- Selection is an explicit renderer-neutral temporary projection. It remains outside Cell appearance, project/config/saved-view persistence, copy/paste style, and clean export.
- Boundary width, offset, dash/bar length, gap, double spacing, Void edge width, and Membrane Edge width are world-scaled. These values change presentation only; area-driven radius, hit testing, clearance, field contribution, and Void subtraction semantics remain geometry-owned.
- Preserved the quiet Void baseline: 3.5% fill, full configured outer edge, and a 68% solid inner echo.

## Renderer support and truthful fallback

| Target | Classic | Organism/WebGL |
| --- | --- | --- |
| Cell | Canonical circle fill | Existing spatial field/plain-cell path; edge-only field uses Canvas2D Cell overlay |
| Boundary | All six technical styles | Solid supported; every non-solid request records `unsupported-organism-style` and renders solid |
| Membrane | Canonical shared Path2D fill | Canonical shared field visibility/colour/opacity |
| Membrane Edge | Independent Path2D stroke | Independent field edge visibility/colour/opacity/width |
| Core | Independent dot | Independent Canvas2D dot; shader-owned legacy dot disabled to prevent duplicate ownership |
| Void | Independent quiet fill and technical edge | Same overlay appearance; subtraction remains in the signed field |

No gradient editor, texture/hatch system, material browser, Inspector UI, arbitrary shader source, or major shader redesign was introduced. SVG/PDF vector parity for the new technical strokes remains C0.4F-B work.

## Verification

Focused contracts passed:

- `src/domain/presentation/presentationContracts.test.ts`
- `src/canvas/runtimePresentation.test.ts`
- `src/canvas/runtimeRendererIntegration.test.ts`
- `src/canvas/runtimeOrganismWiring.test.ts`
- `src/export/exportCore.test.ts`
- `src/import/importCore.test.ts`
- `src/resources/resourcePersistence.test.ts`

Additional gates:

- `tsc --noEmit -p tsconfig.app.json --pretty false` — passed.
- `git diff --check` — passed.
- Forbidden-scope check — no `.claude/`, `.references/`, package manifest, or lockfile changes.
- Production build — passed: 2,884 modules transformed; only the existing large-chunk warning remains. The first build-mode TypeScript preflight exposed missing fixture fields and strict test-object typing; both were corrected, the app-config typecheck passed, and the final production build completed.

Live browser evidence:

- 1440×900 and 1280×800 Organism canvases and presentation overlays matched viewport geometry; overlay `pointer-events` remained `none`; no console errors.
- Source-main comparison used exact base `c4600472...`; default Cell layout, shader body, Core contrast, selection, labels, and chrome remained visually equivalent after the edge-only adapter correction.
- Classic displayed all six Boundary styles simultaneously and distinctly.
- Organism reported five explicit fallbacks for the five non-solid requests and rendered solid strokes without fake dash support.
- Independent combinations verified: Cell off/Core on, Cell on/Core off, Boundary on, Cell only, Core only, Membrane Edge with Membrane fill off.
- A hidden-Cell sample remained draggable through the overlay; its label anchor moved and selection became primary. Zoom changed from 120% to 156% through the same overlay.

## Reuse and scope control

- Reused: central Zustand state, `resolveCellAppearance`, material/resource compatibility, palette resolvers, area geometry, hit testing, blob Path2D, Organism shader, capture bridge, and existing selection interaction state.
- Adapted: Classic renderer, blob paint/stroke adapter, Organism frame globals, Organism capture compositing, schema validation/migration, and the existing lab frame fixture.
- New files justified: one renderer-neutral runtime projection/draw adapter and three focused contract files. No duplicate UI control, settings owner, history system, registry, or resolver was created.

## Review gate

The branch is ready for independent audit. Do not merge and do not begin C0.4F-B without the Owner's next exact command.
