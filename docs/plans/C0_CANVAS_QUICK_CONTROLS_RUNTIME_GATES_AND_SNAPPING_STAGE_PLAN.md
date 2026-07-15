# MOOORF Canvas Quick Controls, Runtime Gates and Snapping Stage Plan

**Status:** Owner-directed plan; not yet authorized for Codex implementation.

## 1. Product rule

A visible Off state must be truthful in two ways:

1. the feature is not drawn;
2. expensive work owned only by that feature stops running.

Quick controls must reuse canonical settings and commands. They must never create a second appearance store, snapping store, motion engine, grid model or renderer path.

## 2. Correct milestone placement

### M1 Correction 3 — real Inspector command path

Before any merge, repair the actual visible Dock/Rail `i` command in the Owner-facing application shell.

Contract:

`docs/worker-briefs/C0_M1_CORRECTION_3_OWNER_PATH_INSPECTOR_LAUNCH.md`

M1 remains blocked until the Owner confirms the real button opens the full Inspector.

### M2 — Advanced Appearance, Symbols and Runtime Power Gates

M2 remains inside the same Inspector:

`Content | Appearance | Symbol`

M2 adds advanced appearance instruments and establishes the runtime gate matrix required by the future quick bar.

#### Cell → Surface → Shadow

Expose a compact primary control plus an advanced disclosure:

- Shadow Off / Soft / Defined,
- **Shadow Strength** slider as the primary fast control,
- opacity,
- softness,
- offset X,
- offset Y,
- spread,
- Auto/custom colour,
- include in export,
- reset, history, persistence and export parity.

Reuse the existing canonical `CellShadowSettings`. Do not add another shadow model.

#### Membrane and motion instruments

Retain:

- Cell Gradient and Solid colour modes,
- Field Edge Softness,
- independent Membrane Edge Softness,
- tension,
- iso level,
- mass/influence,
- connection bias,
- Reach/Fusion/Morph style,
- motion controls where truthful.

#### Runtime power-gate matrix

M2 must distinguish authored settings from execution gates. Turning a system off preserves its authored parameters so turning it back on restores the previous design.

| System | Off visual result | Required runtime result |
| --- | --- | --- |
| Membrane family | no Field or Edge | skip field/palette/spatial-colour preparation that exists only for Membrane; no continuous render solely for Membrane |
| Membrane Edge | no edge band | skip edge-band projection/uniform work |
| Shadow | no shadow | skip shadow resolution/mask/uniform work |
| Motion | static geometry | `setContinuous(false)` when no other continuous consumer exists; do not call motion advancement or motion offsets |
| Labels | no labels | do not build/sync hidden label DOM every frame |
| Grid | no grid | no grid DOM and no grid sync work |
| Snapping | no snap guides or magnetism | no candidate generation or distance testing outside active drag |

Rules:

- a disabled Membrane with disabled Motion must leave the canvas idle with no owned `requestAnimationFrame` loop;
- a disabled system may wake for an explicit edit, camera move, resize or export, then return to idle;
- Field/Edge/Shadow/Motion Off must be measurable in executable tests using counters or injected schedulers;
- no power gate may alter Cell area, centres, hit testing, Void subtraction or saved geometry;
- performance modes may reduce quality, but explicit Off must skip the feature rather than merely set opacity to zero.

### M3 — Canvas Command Shell, Compact Quick Bar and Snap Foundation

M3 replaces the earlier narrow “bottom dock only” milestone. It is split into two Owner-review checkpoints before dispatch.

#### M3A — final Dock and bottom-left Quick Bar

##### Bottom Dock

Retain the planned command architecture:

```text
LEFT                    CENTRE                     RIGHT
[Select] [Target]       [+ Cell] [Cluster] [Void] [Connect] [Material] [Preset] [Markup] [Detail]
```

Only expose commands whose underlying feature is live. No fake Connect/Material/Markup buttons before their milestone.

##### Bottom-left compact Quick Bar

Place a separate mini collapsible bar at the lower-left, clear of the vertical Rail and canvas status text.

Collapsed state:

- one small caret/controls button,
- optional tiny active-system count/status dots,
- no large text.

Expanded state uses stable 28–30 px icon buttons:

1. Membrane master power,
2. Cell Shadow,
3. Motion,
4. Labels,
5. Grid,
6. Snapping master + menu caret once M3B is implemented.

Interaction rules:

- one click toggles the canonical system power/visibility;
- hover/focus shows a plain tooltip;
- active state is obvious but not visually loud;
- keyboard navigation follows bar order;
- Escape collapses an open menu, then the bar;
- the bar itself is ephemeral UI state and never exports;
- toggles call the same store commands used by Inspector/Display, never duplicate values;
- turning a feature off immediately invokes its M2 runtime gate.

Suggested icons:

- Membrane: activity/wave,
- Shadow: layered-circle or sun-shadow,
- Motion: pulse/wind,
- Labels: type,
- Grid: grid,
- Snapping: magnet.

#### M3B — Snapping Foundation and collapsible menu

Adapt the attached Figma-style reference rather than copying it literally. MOOORF uses Cells, circular boundaries, Voids, selection bounds, future Connections and future Annotations.

##### Menu composition

A magnet button toggles global snapping. A small adjacent caret opens the menu.

Each row contains:

- active checkmark,
- geometry icon,
- label,
- optional shortcut on the right,
- disabled explanatory state only when the future geometry genuinely does not exist.

##### M3B live snap modes

Implement only modes that are truthful with the current Cell/Void canvas:

- **Center** — Cell and Void centres,
- **Nearest** — nearest valid point on another Cell/Void boundary,
- **Quadrant** — 0°, 90°, 180°, 270° points on circular boundaries,
- **Direction** — horizontal, vertical and optional 45° alignment from the drag origin,
- **Bounding box** — corners, edge midpoints and centre of the current selection bounds,
- **Grid** — nearest point on the live orthogonal/dotted grid,
- **Axis** — X/Y alignment with nearby Cell centres,
- **Cursor magnet effect** — bounded screen-space attraction and visible guide feedback.

##### Future rows unlocked by later milestones

Do not misuse these names before the required geometry exists:

- **Endpoint** — enabled by M5 Connections,
- **Midpoint** — enabled by M5 Connection segments,
- **Perpendicular** — enabled by M5 line/Connection geometry,
- **Intersection** — enabled by M5 line/boundary intersections,
- **Auto-link annotations** — enabled by M6 Annotation anchors.

The rows may be absent before their owner milestone. A disabled placeholder is acceptable only in the expanded menu when it clearly states the dependency and does not pretend to work.

##### Snap engine rules

- one canonical snap settings object and one candidate resolver;
- snapping evaluates only during active drag/creation, never continuously at idle;
- thresholds are screen-space pixels so zoom does not make snapping unusable;
- priority is deterministic: explicit anchor > centre/axis > quadrant/nearest > grid;
- show temporary guide lines/markers; guides never persist or export;
- magnetic preview is ephemeral; the final drop commits one history transaction;
- holding a modifier temporarily suppresses snapping without changing saved settings;
- Void remains subtractive; snapping never changes its semantics;
- multi-selection snaps as a rigid group through its selection bounds;
- no snap result may silently resize a Cell or change Area.

##### Existing grid reality

The current registry contains active Dotted metadata and future grid presets, but all grid snapping flags are currently `implemented: false`. M3B must implement the first truthful orthogonal snap path rather than merely exposing the existing `snap` boolean.

### M4 — Materials and Presets

The Quick Bar does not become a Material Browser. M4 continues to own:

- Quick Material rail,
- presets,
- full Material Browser/Studio,
- recents/favourites/hover preview.

It reuses M1/M2 Cell Gradient/Solid and canonical material IDs.

### M5 — Connections and Snap Extensions

M5 adds straight centre-to-centre Connections and then unlocks:

- Endpoint,
- Midpoint,
- Perpendicular,
- Intersection,
- Connection-aware Direction snapping.

Connection semantics remain separate from visual line styling.

### M6 — Annotation and Snap Extensions

M6 adds Annotation Card/Studio and unlocks:

- Auto-link annotations,
- annotation anchor snapping,
- leader/label attachment guides.

### M7 — Advanced Arrange, Grid Presets and Snap Extensions

M7 no longer owns the first snapping implementation. It owns:

- advanced Arrange commands,
- Fine Line, Technical, Architectural and Major/Minor grid rendering,
- Isometric and Radial grids when renderer support is truthful,
- advanced grid parameters and export parity,
- advanced snap priorities and dense-scene optimization.

## 3. Performance acceptance targets

For M2/M3:

- idle canvas with Membrane, Motion, Shadow, Labels and Grid off owns no continuous animation frame;
- toggling a system off stops its owned work within one bounded settling frame;
- 1440×900 and 1280×800 remain collision-free;
- quick-bar interaction does not trigger full project recomputation;
- snapping candidate generation remains bounded to visible/relevant geometry and active gestures;
- performance diagnostics are development-only and never exposed in clean exports.

## 4. Updated milestone sequence

1. M1 Correction 3 — actual Inspector launcher path.
2. M1 final Owner acceptance and merge.
3. M2 — Advanced Appearance, Symbol tab and runtime power gates.
4. M3A — final command shell and compact Quick Bar.
5. M3B — snapping foundation/menu.
6. M4 — Materials and Presets.
7. M5 — Straight Connections plus line snap extensions.
8. M6 — Annotation/Markup plus auto-link snapping.
9. M7 — advanced Arrange/Grid/Snap.
10. M8 — Table/Import completion.
11. M9 — Floors/Stats/Dashboard.

Every milestone is shown to the Owner before Codex dispatch.