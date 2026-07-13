# C0.3 Cell Inspector V2 — Reuse Map

## Recovered and adapted

| Source | Reused/adapted in V2 | Not adopted |
|---|---|---|
| Claude interrupted V2 `index.html` | Three tabs, Cell fixtures, inline-editor shell, text presets, symbol/library structure, Cell Style controls, selection-mode control, Material Browser connection. | No inferred production state or unverified behavior claims. |
| Accepted C0.3 V1 prototype at `e97e599` | Search/categories, recents, favourites, hover preview/revert, apply/replace/remove, placement/backing math, theme, pin/close, compact library grid. | UI command glyphs in drawable library, `Include in Export`, large Remove button, V1 mock-state limitations. |
| Production `92f4c64` tokens and widget geometry | Semantic text/glass tokens, stable blur, no panel shadow, compact right-side instrument density, 1440/1280 geometry. | Prototype code is not imported into `src/`; production WidgetFrame ownership is only documented. |
| V1 Material Studio lab | Search/category/browser hierarchy, circular materials, selected preview, compatibility/provenance concepts, explicit Browser separation. | Full Browser inside Inspector, target ownership, prototype material arrays, rAF magnification. |

## Exact reference paths

- Accepted symbol prototype: `design-prototypes/c0-3-icons-symbols-inspector/`
- Recovered V2: `design-prototypes/c0-3-cell-inspector-v2/`
- V1 Material Browser reference: `/Users/tanisxq/Documents/ZONU0-CLAUDE/design-prototypes/v8-2-ui-system/`
- Production tokens: `src/styles/tokens.css` at `92f4c64`
- Production frame geometry: `src/ui/widgets/WidgetFrame.tsx`, `src/ui/widgets/widgets.css`, and `src/ui/panels/widgetRegistry.ts` at `92f4c64`

## Missing V2 rail evidence

Targeted inspection found no Claude V2 target rail or Quick Materials rail prototype. Therefore:

- no V2 rail geometry is claimed recovered,
- no target taxonomy is claimed implemented,
- no compatible-material preview/commit flow is claimed verified,
- C0.5–C0.7 remain future handoff metadata.

This is a deliberate truthfulness boundary: design metadata is never reported as implemented behavior.

## Production Ponytail

Before production implementation:

1. Reuse central selection, graph/store, history, persistence, export, and renderer owners.
2. Reuse WidgetHost/WidgetFrame and existing inline editor before adding components.
3. Consume C0.2 registry APIs after acceptance; never duplicate icon/material definitions.
4. Add adapters for sparse overrides and mixed selection before changing schemas.
5. Keep the Inspector, target rail, Quick Materials, and Material Browser as distinct surfaces.
