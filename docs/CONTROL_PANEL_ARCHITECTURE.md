# V6F.0B — Control Panel Architecture

Status: planning only. No React components or renderer code are changed in this phase.

## Control Hierarchy

```text
Canvas UI
|-- Left Rail
|   |-- Canvas
|   |-- Table
|   |-- Floors
|   |-- Relationships
|   |-- Stats
|   |-- Export
|   |-- Settings
|   `-- Organism Lab / Advanced
|-- Bottom Dock
|   |-- Organism Style
|   |-- Attachment
|   |-- Reach / Density / Offset
|   |-- Palette
|   |-- Theme
|   |-- Add Nucleus
|   |-- Table / Import
|   |-- Export
|   `-- Reset / Randomize
|-- Right Inspector
|   |-- Selected Nucleus
|   |-- Area / Size
|   |-- Label
|   |-- Category
|   |-- Privacy
|   |-- Floor
|   |-- Relationships
|   |-- Notes
|   `-- Advanced
|-- Floating Widgets
|   |-- Total Area
|   |-- Selected Space Area
|   |-- Category Ratio
|   |-- Privacy Ratio
|   |-- Graph Health
|   |-- Floor Stats
|   |-- Warnings
|   `-- Export Frame
`-- Advanced / Lab
    |-- Organism
    |-- Nuclei
    |-- Attachment / Offset
    |-- Motion
    |-- Pockets
    `-- Debug
```

## Control Table

| Control | Purpose | Source of truth | MVP | Class | Store setting now | Future graph field |
|---|---|---:|---|---|---|---|
| Canvas | Show organism canvas | Zustand view | yes | production | `view` | view state only |
| Table | Show editable schedule | Zustand view | yes | production | `view` | view state only |
| Floors | Filter/manage floor view | graph/store | later | production | none | `floors`, `space.floor_id` |
| Relationships | Show adjacency/flow tools | graph/store | later | production | none | `relationships`, `flows` |
| Stats | Toggle floating metrics | selectors/UI state | later | production | none | computed selectors |
| Export | Open export actions | UI/export state | yes placeholder | production | none | export metadata later |
| Settings | Open app settings | UI state | later | production | `theme` partly | project/ui settings |
| Organism Lab / Advanced | Hidden dev tuning entry | route/UI state | no | advanced | lab-local | renderer preset metadata |
| Organism Style | Choose organism visual mode | UI setting -> renderer | yes | production | `settings.morphMode` | render preset |
| Attachment | Choose merge character | UI setting -> renderer | yes | production | `settings.attachMode` | render preset |
| Reach / Density / Offset | Fine-tune organism spread | UI setting -> renderer | yes | production | `settings.mergeDistance` | render preset |
| Palette | Choose color family | UI setting/design tokens | yes | production | partial style mode only | project palette id |
| Theme | Day/night mode | Zustand/app theme | yes | production | `theme` | project preference later |
| Add Nucleus | Create a new space/nucleus | Zustand spaces | yes | production | `addSpace` | `spaces[]` |
| Table / Import | Enter table or import placeholder | view/import state | yes placeholder | production | `setView` | import contract |
| Reset View | Fit camera / reset viewport | camera state | optional | production | `setCamera` | UI state only |
| Randomize Layout | Reposition nuclei, if exposed | store positions | optional | production | `moveSpace` | `space.x/y` |
| Selected Nucleus | Show selected space summary | Zustand selected/spaces | yes | production | `selectedId` | `spaces[]` |
| Area / Size | Edit area and radius projection | space data | yes | production | `updateSpace.area` | `space.area` |
| Label | Edit display name | space data | yes | production | `updateSpace.name` | `space.name` |
| Category | Classify program type | space data | yes | production | `updateSpace.category` | `space.category` |
| Privacy | Classify access level | space data | yes | production | `updateSpace.privacy` | `space.privacy` |
| Floor | Assign floor | graph/store | later | production | none | `space.floor_id` |
| Relationships | Selected adjacency summary | graph/store | later | production | none | `relationships[]` |
| Notes | Annotation placeholder | graph/store | later | production | none | `space.notes` later |
| Show Labels | Toggle canvas labels | UI setting | yes | production | none | UI setting only |
| Show Grid | Toggle technical grid | UI setting | yes | production | none | UI setting only |
| Show Nuclei | Toggle nucleus dots/rings | UI setting -> renderer | yes | production | lab setting only | render preset |
| Total Area | Display total built area | graph selector | later | production | none | computed |
| Selected Space Area | Display selected area | graph selector/store | later | production | selected/spaces | computed |
| Category Ratio | Category breakdown | graph selector | later | production | none | computed |
| Privacy Ratio | Privacy breakdown | graph selector | later | production | none | computed |
| Graph Health | Missing-data summary | graph selector | later | production | none | computed warnings |
| Floor Stats | Per-floor totals | graph selector | later | production | none | computed |
| Warnings | Bylaw/data warnings | graph selector | later | production | none | computed warnings |
| Export Frame | Define export crop/state | UI/export state | later | production | camera | export settings |
| Mass | Global organism energy | renderer setting | no | advanced | lab-only | render preset |
| Iso Level | Body threshold | renderer setting | no | advanced | lab-only | render preset |
| Surface Tension | Kernel falloff character | renderer setting | no | advanced | lab-only | render preset |
| Edge Softness | Antialias/edge softness | renderer setting | no | advanced | lab-only | render preset |
| Connection Bias | Long-tail connection strength | renderer setting | no | advanced | lab-only | render preset |
| Nucleus Count | Lab-generated count | lab preset | no | advanced | lab-only | not production-owned |
| Radius Min/Max | Lab radius generation bounds | lab preset | no | advanced | lab-only | not production-owned |
| Strength | Nucleus field strength | renderer setting | no | advanced | lab-only | optional per-space influence |
| Size Variation | Lab radius variation | lab preset | no | advanced | lab-only | not production-owned |
| Offset X/Y | Shift generated layout | renderer setting | no | advanced | lab-only | render preset |
| Radial Offset | Push satellites from core | renderer setting | no | advanced | lab-only | render preset |
| Angular Offset | Rotate generated layout | renderer setting | no | advanced | lab-only | render preset |
| Motion Response | Smoothing speed | renderer setting | no | advanced | lab-only | render preset |
| Drift | Idle drift amount | renderer setting | no | advanced | lab-only | render preset |
| Breathing | Radius pulse amount | renderer setting | no | advanced | lab-only | render preset |
| Wobble | Small motion variation | renderer setting | no | advanced | lab-only | render preset |
| Pockets | Cellular void behavior | renderer setting | no | advanced | lab-only | render preset |
| Field Debug | Visualize scalar field | renderer debug | no | debug | lab-only | debug only |
| Nuclei Debug | Show nucleus diagnostics | renderer debug | no | debug | lab-only | debug only |
| Shader Diagnostics | Context/perf diagnostics | renderer debug | no | debug | lab-only | debug only |
| Performance Counters | FPS/DPR/uniform count | renderer debug | no | debug | lab-only | debug only |

## Component Modularity

Conceptual components:
- `CanvasShell`
- `LeftRail`
- `BottomDock`
- `DockGroup`
- `DockButton`
- `DockSlider`
- `DockPopover`
- `RightInspector`
- `InspectorSection`
- `FloatingWidget`
- `PalettePanel`
- `OrganismStylePanel`
- `AttachmentPanel`
- `AdvancedOrganismPanel`
- `NucleusActionButton`

Replacement rule: any panel can be replaced without touching the organism renderer, table sync, master graph, or export pipeline.

## Reference-Driven Notes

- Bottom dock grouping follows the `assets/references/01` bottom-panel reference: left-side style/attachment/palette clusters, a stronger center creation action, and right-side table/export/settings actions.
- Compact popovers should feel like reference sub-panels: dense, segmented, icon-led, and anchored to the dock or inspector without becoming full-screen modals.
- Left rail hierarchy follows the grey rail references: primary modes first, secondary tools below, with restrained active states and no parameter editing inside the rail itself.
- Right inspector/sub-panels borrow the detail-widget references: selected nucleus details are grouped into small sections with clear labels, not one long undifferentiated form.
- The high-emphasis `+ NUCLEUS` button borrows the dark active-button language: larger than surrounding controls, allowed to use a controlled dark gradient or red accent, and reserved as the main creation command.

## Source Ownership

- Product data remains in the central store/graph.
- The renderer receives projected nuclei and emits interaction deltas.
- Dragging a nucleus commits `moveSpace(id, x, y)`.
- Table edits commit through existing update actions.
- UI-only panel state can live in local or lightweight UI store, but must not become product data.

## Libraries / Assets Recommendation

| Library or asset | Already available | Why needed | Install now | Risk | Use phase |
|---|---:|---|---:|---|---|
| Existing `src/ui` shell | yes | Preserve current dock/rail language | no | low | V6F.1 |
| Base UI / shadcn primitives | yes | Popovers, menus, switches, selects | no | low | V6F.1+ |
| Lucide React | yes | Dock/rail icons | no | low | V6F.1+ |
| Motion | yes | Panel transitions and active chips | no | low | V6F.1+ |
| GSAP | yes | Loader and possible premium text/micro animation | no | medium if overused | later polish |
| Floating UI | yes | Anchored dock popovers/inspectors | no | low | V6F.1+ |
| cmdk | yes | Future command palette | no | low | later |
| Sonner | yes | Import/export status toasts | no | low | later |
| TanStack Table | yes | Rich table if sorting/filtering returns | no | medium bundle size | later |
| colorjs / culori / chroma / tinycolor | yes | Palette interpolation and contrast checks | no | low | palette phase |
| html-to-image / file-saver | yes | PNG/export download path | no | medium canvas/WebGL capture limits | export phase |
| pdf-lib / jszip | yes | PDF/ZIP export later | no | medium scope | export phase |
| stats.js | yes | Debug performance counter | no | low | debug |
| Tweakpane-like inspector | no | Faster advanced renderer tuning | no | could bloat/control style drift | V6G or debug |
| Extra icon packs | no | Only if Lucide lacks glyphs | no | visual inconsistency | later |
| Palette generation source | no | Generate curated palettes | no | uncontrolled colors | later |
| Shader/material preset library | no | Optional style preset management | no | dependency weight | later |
| Design token generator | no | Token export/documentation | no | process overhead | later |

Do not install packages in V6F.0B.

## Implementation Notes For V6F.1

- Add a production organism canvas/adaptor rather than mutating the old canvas first.
- Keep the Organism Lab route intact.
- Keep classic canvas fallback until organism integration is stable.
- Start with existing dock/rail components and add only reduced controls.
- Do not expose advanced/lab parameters unless needed for debugging.
