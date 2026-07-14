# MOOORF C0 Editing Workspace — Canvas Map and Build Plan

**Status:** OWNER-DIRECTED PLAN — implementation begins only after exact C0.4F-A merge
**Purpose:** Complete the Canvas editing system without losing prior Organism, Materials, Connections, Inspector, Symbol or Annotation decisions.
**Production rule:** One Master Graph/store, one history path, one resource catalogue, one renderer-neutral appearance resolver. No duplicate UI state or mock product systems.

## 1. Product architecture

MOOORF has four different editing families. They must cooperate, but they must not be confused with one another.

### 1.1 Organism appearance targets

```text
Cell
Boundary
Membrane
Membrane Edge
Core
Void
```

These six targets share Project Default / Local Override / Mixed inheritance and the canonical appearance resolver.

### 1.2 Connection system — separate family

Connection is **not** a seventh Organism layer.

```text
Connection
├── Relationship meaning
├── Visual Connection line
├── future Morph Bridge
└── future Cell Behaviour
```

Initial production geometry is a straight centre-to-centre line that updates whenever either Cell moves.

### 1.3 Markup and Annotation system — separate family

Markup is not Cell appearance and is not a Connection.

Initial standalone object:

```text
Annotation Card
├── optional transparent PNG logo
├── heading
├── body
├── position and size
├── shared text-style preset
├── material/background
└── export visibility
```

The existing label-mode `AnnotationWidget` is not the future Annotation Card. It must be renamed/repositioned as Label Settings under the Inspector Content system.

### 1.4 Selection and Arrange commands

Selection and Arrange are editing commands, not persisted appearance targets.

- Selection UI never persists or exports.
- Alignment/distribution modifies positions through one history transaction.
- Cell area remains the sole owner of Cell size.

---

## 2. Final Canvas shell map

### 2.1 Permanent left vertical rail

Global navigation and workspace launch only:

- Canvas / Table
- project/files drawer
- Saved Views
- Data / Stats
- Display
- global system/theme
- Present / Export gateway

It must not duplicate detailed controls already owned by the bottom dock, Inspector or widgets.

### 2.2 Bottom dock

```text
LEFT EDITING ISLAND                  CENTRE CREATION                  RIGHT EDITING ISLAND
[Select] [Target] [Arrange]          [+ Cell] [Cluster] [Void]       [Connect] [Material] [Preset] [Markup] [Detail]
```

All primary buttons use circular geometry where practical. No fish-eye enlargement. Stable dimensions at rest and hover.

### 2.3 One shared contextual rail above the dock

Clicking a dock button loads its rail directly above that button. Only one rail may be open at a time.

Shared behaviour:

- click opens/closes,
- clicking another launcher switches rail,
- outside click closes,
- Escape closes,
- hover preview is temporary where supported,
- click commits one history transaction,
- reduced-motion mode removes spring/orbital motion,
- at narrow widths the rail becomes a horizontal strip above the dock.

---

## 3. Bottom-dock rails

### 3.1 Select rail

Initial live commands:

- Select All
- Clear Selection
- Invert Selection
- select by category/privacy when existing data supports it

Future/not falsely active:

- Marquee/Lasso
- Lock selection
- persistent Group

### 3.2 Target rail

Exactly six circular target buttons:

```text
Cell · Boundary · Membrane · Edge · Core · Void
```

The active target controls:

- Inspector Appearance context,
- Quick Material filtering,
- Preset filtering,
- Detail widget launcher,
- status signal for inherited/local/mixed.

Connection and Annotation never appear in this rail.

### 3.3 Arrange rail

Initial commands:

- Align Left
- Align Centre X
- Align Right
- Align Top
- Align Centre Y
- Align Bottom
- Distribute Horizontally
- Distribute Vertically
- Pack / Cluster
- Random Layout moved here from the old dock

All multi-object transforms commit as one Undo transaction. No Random Scale.

### 3.4 Connect rail

Initial commands:

- Create Straight Connection
- Select Connections
- Show / Hide selected line
- Delete selected connection
- quick line preset choices
- open Connection Settings

Creation workflow:

1. activate Connect,
2. click source Cell,
3. click target Cell,
4. create one canonical graph edge with separate semantic and visual fields,
5. render one straight centre-to-centre line,
6. line follows both Cells during drag,
7. action is one Undo transaction.

### 3.5 Material rail

One rail, filtered by current editing context:

- Cell → Cell materials
- Boundary → technical strokes
- Membrane → fields, gradients and shaders
- Membrane Edge → edge materials
- Core → nucleus materials
- Void → void-compatible materials
- selected Connection → line materials
- selected Annotation → annotation background/text-compatible materials

Contents:

- current material,
- project palette,
- recent,
- favourites,
- 6–10 compatible quick choices,
- `Browse All` opening the Material Browser.

Hover preview never enters history. Apply is one transaction.

### 3.6 Preset rail

Preset is a bundle, not a raw material.

Supports:

- active-target presets,
- complete Cell appearance presets,
- Connection line presets,
- Annotation card presets.

Examples:

- Technical Dashed Boundary
- Soft Glass Membrane
- Quiet Void
- Black Cell + White Core
- Adjacency Line
- Editorial Annotation Card

### 3.7 Markup rail

Initial live entry:

- Add Annotation Card
- Add simple Note only if it reuses the same canonical markup owner
- open Annotation Studio

Visible but truthfully future/disabled until implemented:

- Dimension
- North Arrow
- Environmental Arrow
- Project Block
- Frame
- technical annotation symbol

### 3.8 Detail launcher

The Detail button opens the dedicated settings widget for the active context.

- active Organism target → corresponding layer widget
- selected Connection → Connection Settings
- selected Annotation → Annotation Studio
- otherwise → Cell Settings fallback

---

## 4. Inspector remains the context hub

Rename the conceptual product surface from only `Cell Inspector` to `Inspector`, while preserving the accepted Cell workflow.

### 4.1 Cell / multi-selection context

Tabs:

1. Content
2. Appearance
3. Symbol

Responsibilities:

- selected object/scope summary,
- Project Default / Local Override / Mixed,
- essential frequently used controls,
- current material and preset preview,
- active target summary,
- compact `Open Detailed Settings`,
- compact `Browse Materials`,
- Copy/Paste/Reset Style,
- real Content and Symbol integration.

### 4.2 Connection context

When a Visual Connection is selected, Inspector switches context instead of pretending it is Cell appearance.

Compact sections:

- relationship type/direction/strength summary,
- line visibility/style/material summary,
- open Connection Settings,
- hide/delete actions.

### 4.3 Annotation context

When an Annotation Card is selected:

- heading/body summary,
- card preset/material summary,
- open Annotation Studio,
- duplicate/delete actions.

---

## 5. Dedicated detailed widgets

Use separate widget IDs and bodies for separate systems. They may coexist side-by-side. All reuse `WidgetFrame`, `WidgetHost`, shared controls, tokens and one store/history path.

### 5.1 Cell Settings

- fill visibility
- material/colour
- opacity
- future texture/gradient parameters only through registry support

### 5.2 Boundary Settings

- visibility
- solid / dashed / dotted / dash-dot / double / segmented bars
- width
- inner / centre / outer alignment
- offset
- dash/bar length
- gap
- double spacing
- colour/material
- opacity

### 5.3 Membrane Settings

Essential now:

- visibility
- material
- opacity
- existing Reach/Fusion/Density controls migrated from legacy Morph controls where ownership is valid

Expandable later:

- premium gradients/shaders
- blur, noise, flow, refraction, glass, iridescence
- animation and advanced geometry remain performance-gated

### 5.4 Membrane Edge Settings

- visibility
- width
- softness where supported
- material/colour
- opacity
- future glow/pulse parameters only through registry metadata

### 5.5 Core Settings

- visibility
- shape where renderer/export parity supports it
- size
- material/colour
- opacity
- Auto Contrast
- presentation-only offset X/Y if safe

### 5.6 Void Settings

- fill visibility/material/opacity
- edge visibility/material/width/opacity
- visual offset only if separate from geometry
- subtraction, area and clearance are never changed here

### 5.7 Connection Settings

Two clearly separated tabs/sections:

**Meaning**

- relationship type
- direction
- strength
- priority
- required/preferred
- notes

**Line**

- visible
- straight geometry only in V1
- centre-to-centre anchors
- solid/dashed/dotted
- width
- opacity
- material/colour
- direction marker if implemented truthfully
- screen-size default

Changing line style never changes meaning. Relationship may exist with line hidden.

### 5.8 Annotation Studio

- optional transparent PNG logo
- heading
- body
- position and size
- text style preset
- text size/colour
- material/background
- opacity
- export visibility
- duplicate/delete

Annotation Card is standalone markup and must not be stored inside `SpaceCell` content or appearance.

---

## 6. Material Browser and parameter instruments

One shared Material Browser serves every compatible target/context.

Modes:

- quick rail,
- one-third viewport Browser,
- maximum half-screen Material Studio for advanced shader/material editing.

Canvas remains visible.

Parameter metadata chooses the UI primitive:

- colour → swatches
- percentage/intensity → compact fader or volume bar
- numeric range → slider/fader
- angle → rotary knob
- enum → segmented control/dropdown
- boolean → switch
- gradient → gradient editor
- direction → XY/direction control
- project texture → asset slot

Future premium material/shader packs add registry definitions and parameter metadata, not new hard-coded Inspector forms.

Persist only material IDs and sparse parameter overrides. Never persist registry definitions, UI preview state or arbitrary shader source.

---

## 7. Existing Canvas control migration map

Every current control receives one final decision.

| Existing control/surface | Decision | New owner |
|---|---|---|
| Add Cell / Add 5 / Void centre controls | KEEP / refine | Centre creation cluster |
| Morph Style | MOVE | Membrane Preset rail |
| Attachment mode | MOVE / rename architecturally | Membrane Settings |
| Density / merge-distance quick slider | MOVE | Membrane Settings or Membrane quick preset |
| Palette dock popover | REPLACE | Material rail + Material Browser |
| Random Arrangement | MOVE | Arrange rail |
| Saved Views dock duplicate | REMOVE from dock | permanent global rail/widget |
| Import dock duplicate | REMOVE from editing dock | Project Drawer/global rail |
| Export dock duplicate | MOVE | Present/global gateway |
| Organism/Morph widget launcher duplicate | REPLACE | dedicated Membrane Settings |
| generic Advanced appearance widget | REPLACE | dedicated target widgets |
| existing AnnotationWidget label modes | RENAME/MOVE | Inspector Content → Label Settings |
| new Annotation Card | ADD | Markup rail + Annotation Studio |
| target selector inside old flat settings | REPLACE | shared Target rail + Inspector context |
| disconnected/no-op settings | REBIND or REMOVE | canonical owner only |

No visible no-op or duplicate control remains.

---

## 8. Production build strategy — one umbrella branch, internal checkpoints

No repeated research/audit cycle. Use one production branch after exact C0.4F-A merge:

`feature/c0-editing-workspace-completion`

### Checkpoint A — Canvas map and dock/rail foundation

- restructure bottom dock,
- implement reusable contextual rail,
- Select / Target / Arrange / Connect / Material / Preset / Markup / Detail launchers,
- move/remove duplicate legacy controls,
- preserve centre creation,
- 1440/1280 collision checks.

### Checkpoint B — Inspector, layer widgets, materials and symbols

- context-aware Inspector,
- six dedicated Organism target widgets,
- Project Default / Local Override / Mixed,
- history and ephemeral previews,
- Quick Material and Preset rails,
- large Material Browser foundation using existing registries,
- production Symbol tab using the audited C0.2 registry through a bounded forward-port; never merge the old divergent branch wholesale,
- no stale/no-op settings.

### Checkpoint C — Straight Connection foundation

- canonical relationship/visual fields,
- centre-to-centre line creation,
- line selection/delete/hide,
- live updates during Cell movement,
- Connection Settings,
- PNG/SVG/PDF/project persistence,
- one Undo transaction per command.

### Checkpoint D — Markup/Annotation foundation and hardening

- Markup rail,
- standalone Annotation Card,
- Annotation Studio,
- move/rename existing Label Settings,
- export and persistence,
- keyboard/accessibility,
- 1440/1280 final QA,
- focused tests, typecheck, diff check, one final production build.

Internal commits/checkpoints are allowed, but there is one final feature head and one Owner review gate. No separate audit by default unless a Blocker/High contradiction appears.

---

## 9. Explicitly deferred from this umbrella milestone

- curved, Bezier, orthogonal and elbow connections
- custom line anchors
- animated flow and complex line labels
- Morph Bridge physics
- attract/repel simulation
- advanced procedural Membrane geometry/motion beyond safely migrated existing controls
- premium marketplace, payments and licensing UI
- dimensions/north arrow/frame if their canonical markup model is not ready
- floors, dashboard, city packs and cloud collaboration
- deep 200+ Cell optimisation

---

## 10. Completion gate

The umbrella milestone is complete only when:

1. no visible setting is dead, stale or bound to the wrong owner,
2. the user can identify the active Organism target before editing,
3. Material and Preset rails filter by active context,
4. every Organism target has its own dedicated detailed widget,
5. Inspector remains a compact context hub rather than a giant settings form,
6. straight centre-to-centre Connections can be created, selected, edited, moved with Cells, deleted, saved and exported,
7. semantic Relationship meaning remains separate from line appearance,
8. Annotation Card is a standalone markup object and exports correctly,
9. existing Cell labels are not confused with Annotation Cards,
10. one store, one history path, one resource catalogue and one appearance resolver remain canonical,
11. Selection and editing chrome never persist or export,
12. 1440×900 and 1280×800 layouts pass without control collision,
13. focused tests, typecheck, diff check and one final production build pass,
14. Codex pushes one fixed head and stops at `WAITING_REVIEW`.
