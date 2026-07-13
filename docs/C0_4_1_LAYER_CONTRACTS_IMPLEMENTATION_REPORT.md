# C0.4.1 Layer Contracts Implementation Report

**Status:** Implemented on `feature/c0-4-1-layer-contracts-resolvers`; independent audit required before merge  
**Source:** `a0f7b33d4e13ad72d5203141d7688794ad377446` (`origin/main`)  
**Scope:** contracts, defaults, pure resolution, and persistence migration only

## Canonical owners

| Owner | Responsibility |
| --- | --- |
| `src/domain/presentation/types.ts` | Six target IDs, target/material compatibility, default/override/resolved types |
| `src/domain/presentation/defaults.ts` | Complete current-compatible project hierarchy |
| `src/domain/presentation/validation.ts` | Safe normalization, sparse persistence, cloning, migration, explicit reset |
| `src/domain/presentation/resolveAppearance.ts` | Pure complete projection through existing colour/palette/material owners |
| `src/types.ts` / `src/state/store.ts` | Central graph Cell extension and project-setting ownership |
| Existing export/import/transfer modules | Project, config, saved-view, export, and recovery persistence |

No renderer, shader, React component, CSS file, or material-registry definition is an appearance-default owner.

## Type and default hierarchy

`SpaceCell` keeps architectural fields and adds only `appearance?: CellAppearanceOverrides`. The project separately owns `ProjectPresentationDefaults`:

```text
ProjectPresentationDefaults
├── cell
├── boundary       (visible, solid, width, offset, paint)
├── membrane
├── membraneEdge   (separate owner)
├── core           (visible, dot, size, paint)
└── void           (fill, edge, immutable semantic invariants)
```

The six canonical IDs are `cell`, `boundary`, `membrane`, `membrane-edge`, `core`, and `void`. Selection is deliberately excluded. Labels, Flags, and Annotation Cards remain documented future extensions rather than inactive persisted objects.

Current-compatible defaults are Cell visible, Boundary off/solid at width 1.5 and offset 0, Membrane following legacy `blobOn`, Membrane Edge independently off, Core following `showNuclei` with dot size 0.34, and Void visible with current fill/edge ownership. Material IDs come from `settings.resources.materialBindings`.

## Override and reset semantics

- An omitted target or field inherits its project default.
- Validation extracts only supported booleans, finite numbers, canonical hex colours, and bounded reference IDs.
- Values equal to project defaults are omitted; invalid finite ranges clamp deterministically.
- Unknown IDs remain serialized for recovery. Resolution reports `unknown-fallback` or `incompatible-fallback` and activates a known compatible registry ID.
- The canonical reset command removes one complete target override. There is no `undefined`/`null` reset sentinel.
- Registry definitions, material objects, functions, and renderer objects cannot persist inside Cells.

## Resolution and visual equivalence

`resolveCellAppearance` is pure and imports neither the store nor a renderer. It delegates Cell/Boundary/Core/Void colour precedence to `getNucleusColor`, Organism colours to the existing Organism palette path, and compatibility to the existing immutable material registry.

Source-main visual output remains exact because neither Classic nor Organism imports this new domain in C0.4.1. Focused contracts additionally compare resolved Cell fill, Boundary ring, Core colour, and Void fill/edge against the current canonical colour resolver. The resolver cannot alter Cell area, radius, hit testing, selection, relationships, or Void subtraction/clearance.

## Migration and persistence

- Project/config settings always normalize to a complete presentation hierarchy.
- Old data without the hierarchy derives Membrane from `blobOn`, Core from `organism.showNuclei`, and material references from normalized existing resources.
- Per-Cell data normalizes to supported sparse fields against the applicable project/saved-view defaults.
- Project snapshot, full project, config, saved view, and recovery cloning deep-copy appearance/defaults.
- Future presentation schema versions reject without changing the existing project/config major version.

## Deliberately deferred

- C0.4.2 selection-overlay isolation and all later C0.4 slices
- renderer consumption, new draw calls, shader changes, or export styling
- Cell Inspector controls, target rails, Material Browser UI
- dashed, dotted, double, technical, gradient, pattern, or hatch Boundaries
- additional Core shapes, advanced Membrane geometry/motion
- Cell Label Layout, Flags, Annotation Cards, and Area editing changes

## Validation gate

The feature branch must pass the focused presentation contracts, directly affected import/export/resource contracts, `git diff --check`, and exactly one final production build. Independent Antigravity architecture and migration audit remains the next gate; this branch is not self-approved or merged.
