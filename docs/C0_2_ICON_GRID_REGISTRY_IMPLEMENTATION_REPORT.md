# C0.2 Icon and Grid Asset Registry — Implementation Report

## Source and scope

- Source: `92f4c644a9f27a3bdd6b61d1349e560a63235bd1`
- Branch: `feature/c0-2-icon-grid-asset-registry`
- Scope: immutable icon/grid metadata, validation, catalogue integration, focused persistence contracts, and implementation-status documentation.
- Runtime boundary: no Cell Inspector, placement controls, shortcut, Canvas renderer/shader, grid drawing/snapping/export, shell, product-store schema, backend, package, or dependency change.

## Registry evidence

| Contract | Result |
| --- | --- |
| Drawable icons | Exactly 77 active entries |
| Icon categories | 8: architecture, landscape, diagram, annotation, wayfinding, environmental, accessibility, service |
| Geometry source | Installed `lucide-react` icon keys |
| Licence/provenance | ISC; Lucide Contributors; canonical licence URL on every entry |
| Legacy compatibility | 6 aliases resolve to canonical namespaced IDs |
| Placement targets | `space` only |
| UI separation | 0 shell/navigation/tool/insert/utility controls in the drawable registry |
| Grid presets | Exactly 8 stable IDs |
| Live grid truth | Dotted active/current Organism render path; None active/off |
| Future grid truth | Fine Line, Technical, Architectural, Major/Minor, Isometric, Radial remain Future |

Every icon definition includes a unique canonical ID, source key, category/tags, accessible label, tooltip, tint/backing defaults, origin, usage, validation status, licence/attribution metadata, placement targets, built-in state, and resource status. Focused contracts resolve each Lucide source key against the installed package; runtime validation rejects unsafe executable or URL-backed references.

Grid definitions expose preview kind/label, supported parameters, snapping compatibility/mode/implementation state, camera behavior, day/night compatibility, material target, export behavior, and per-renderer support. Metadata never claims that the six Future presets render, snap, or export today.

## Catalogue and persistence

- `resourceCatalogue` discovers icon/grid entries through the existing immutable registry owners.
- Known legacy icon IDs canonicalize in catalogue lookups, ready/favourite/recent references, and icon placements.
- Unknown icon/resource IDs remain intact in snapshots and envelopes so missing future assets fail safely and can recover later.
- Project/config/saved-view formats continue to persist IDs and sparse values only. Registry metadata and geometry are not serialized.
- No schema-major change or parallel resource store was introduced.

## Excluded and licence-uncertain assets

- No claimed MOOORF proprietary/custom prototype geometry was imported because the supplied artifacts did not provide auditable source/provenance for those shapes.
- The artifact inventory conflicts internally: its detailed table enumerates 96 rows (95 after duplicate-ID reconciliation), while its state/plan claims 82. Production count is therefore based on verified installed geometry, not the disputed inventory total.
- Audited shell, navigation, tool, insert, and utility controls are intentionally excluded from drawable symbols and remain owned by existing UI registries.
- Triangular terminology is represented by the Future Isometric preset metadata; no duplicate triangular ID was added. Hexagonal was excluded because no canonical current owner/runtime contract exists.
- No licence-uncertain, raw SVG, binary, base64, Blob URL, external URL, or executable asset source was shipped.

## Verification

- Focused contracts: PASS — `iconRegistry.test.ts`, `gridRegistry.test.ts`, and `resourcePersistence.test.ts`.
- `git diff --check`: PASS.
- Production build: PASS — exactly one `npm run build`; 2,878 modules transformed; Vite completed in 9.23s.
- Built entry: 925.23 kB (300.67 kB gzip). The known chunk-size warning remains; no second baseline build was run.

## PONYTAIL

- reused: current icon/grid/resource catalogue, validation, placement, project/config/saved-view persistence, and installed Lucide owners
- adapted: verified Lucide geometry metadata, six legacy ID aliases, and audited grid metadata on the established eight IDs
- new files justified: this implementation report only; existing registry/test owners were extended
- duplication avoided: no parallel store, renderer, persistence layer, icon UI registry, grid runtime, or history system

## Handoff

C0.2 implementation returns to the Project Manager for Antigravity delta audit. C0.3 Icons & Symbols Inspector is not implemented and remains blocked until C0.2 audit and merge approval.
