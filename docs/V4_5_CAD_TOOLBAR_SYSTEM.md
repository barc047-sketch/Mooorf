# V4.5A — CAD Toolbar System (spec only, not implemented)

Future bottom CAD toolbar, grouped. Each tool entry defines: `id, label, short_label, icon_source, shortcut, group, enabled, future_only, notes`.

## 1. Select / Navigate
| id | label | short_label | icon_source | shortcut | enabled | future_only |
|---|---|---|---|---|---|---|
| select | Select | Select | lucide | V | yes | no |
| pan | Pan | Pan | lucide | H | yes | no |
| zoom | Zoom | Zoom | lucide | Z | yes | no |
| fit-view | Fit View | Fit | lucide | Shift+1 | yes | no |

## 2. Space Tools
| id | label | shortcut | enabled | future_only |
|---|---|---|---|---|
| add-space | Add Space | A | yes | no |
| duplicate-space | Duplicate Space | Alt+D | no | yes |
| delete-space | Delete Space | Del | yes | no |
| lock-space | Lock Space | L | no | yes |
| hide-space | Hide Space | H+Shift | no | yes |

## 3. Shape Tools
| id | label | shortcut | enabled | future_only | notes |
|---|---|---|---|---|---|
| shape-circle | Circle | C | yes | no | default cell shape |
| shape-rect | Rectangle | R | no | yes | |
| shape-rounded-rect | Rounded Rectangle | Shift+R | no | yes | |
| shape-blob | Free Blob | B | no | yes | organism/blob phase |

## 4. Relationship Tools
| id | label | shortcut | enabled | future_only | notes |
|---|---|---|---|---|---|
| rel-connect | Connect | K | no | yes | graph edge |
| rel-direct-access | Direct Access | Shift+K | no | yes | |
| rel-visual-link | Visual Link | Alt+K | no | yes | |
| rel-avoid | Avoid | X | no | yes | negative relationship |
| rel-conflict | Conflict | Shift+X | no | yes | flags bylaw/adjacency conflict |

## 5. Layout Tools
| id | label | shortcut | enabled | future_only | notes |
|---|---|---|---|---|---|
| layout-align | Align | Ctrl+Shift+A | no | yes | |
| layout-group | Group | Ctrl+G | no | yes | |
| layout-ungroup | Ungroup | Ctrl+Shift+G | no | yes | |
| layout-distribute | Distribute | Ctrl+Shift+D | no | yes | |
| layout-cluster | Cluster | Ctrl+Shift+C | no | yes | organism-adjacent |
| layout-auto | Auto Layout | — | no | yes | later phase |

## 6. Floor Tools
| id | label | shortcut | enabled | future_only | notes |
|---|---|---|---|---|---|
| floor-all | All Floors | 0 | no | yes | V4.5B introduces floor model |
| floor-selected | Selected Floor | 1-9 | no | yes | |
| floor-add | Add Floor | Ctrl+F | no | yes | |
| floor-stack | Floor Stack | — | no | yes | later phase |

## 7. Analysis Tools
| id | label | shortcut | enabled | future_only | notes |
|---|---|---|---|---|---|
| stats-widget | Stats Widget | S | no | yes | see floating widget system |
| bylaw-check | Bylaw Check | — | no | yes | later phase |
| relationship-matrix | Relationship Matrix | — | no | yes | later phase |
| sankey | Sankey | — | no | yes | later phase |

## 8. Export Tools
| id | label | shortcut | enabled | future_only | notes |
|---|---|---|---|---|---|
| export-png | PNG | Ctrl+E | no | yes | Phase 7 |
| export-svg | SVG | — | no | yes | Phase 7 |
| export-pdf | PDF | — | no | yes | Phase 7 |
| export-zip | ZIP | — | no | yes | later phase |

## Rayon-style interpretation
- Bottom grouped icon dock (mirrors Rayon's editing-tools flyout: two-column grouped list, icon + label + shortcut per row).
- Hover/expand tool menus — a toolbar group expands into its grouped list on hover, not a flat single row.
- Shortcut labels shown right-aligned per tool row (e.g. `CC`, `⌘G`), matching the CAD reference's compact letter-shortcut style.
- Command palette (cmdk) planned as the future all-tool search surface, complementing the hover-expand groups.
- Right-side inspector (future): selected-object properties panel (name/status/anchor/position/size), inspired by the Rayon/plan-tool reference — not part of this phase, informs V4.5B/V5 layout planning only.

## Implementation notes (for later phases)
- Icon source: Lucide first, then Tabler/Iconoir if a needed glyph is missing.
- Groups render as grouped hover-expand clusters in the glass dock, not one flat row.
- Shortcut labels shown in tooltips; conflicts checked against [V4_5_INTERACTION_SHORTCUTS.md](V4_5_INTERACTION_SHORTCUTS.md).
- A command palette (cmdk) surfaces all tools by name/shortcut later.
- `future_only` tools may render visually disabled/greyed for roadmap legibility — not required this phase.
- **Do not implement toolbar UI in this phase.** This doc is the spec only.
