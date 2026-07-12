# MOOORF Master Product Scope

**Status:** Canonical product scope and interface architecture  
**Version:** 1.0  
**Purpose:** Single source of truth for product design, implementation planning, AI coding prompts, QA, and future commercialisation  
**Repository baseline when authored:** `main` at `837d3d7`  
**Required reading before any future feature phase:** this file, `docs/PROJECT_MEMORY_INDEX.md`, `docs/FEATURE_MAP.md`, `docs/COMPONENT_INVENTORY.md`, and `docs/CODEX_PHASE_PROTOCOL.md`

---

## 0. Authority and change policy

This document defines the intended MOOORF product. It exists to stop future agents from:

- rebuilding duplicate systems,
- confusing visual decoration with architectural data,
- making the interface more complex than necessary,
- merging isolated prototypes directly into production,
- changing terminology from phase to phase,
- hiding the canvas behind panels,
- reintroducing shadows,
- making repetitive actions slow,
- or implementing commercial features before the core spatial workflow is stable.

When a later decision changes this document, update this file deliberately and record the reason in `docs/DECISIONS.md`. Do not silently diverge.

### Source-of-truth rule

```text
MASTER GRAPH = brain

Canvas
Table / Data
Dashboard / Analysis
Floors
Scenes
Materials
Relationships
Exports
Accounts / Entitlements
= views and services built around the same graph
```

No feature may create a second independent copy of spaces, floors, relationships, materials, or project metadata.

---

# 1. Product vision

MOOORF is a browser-first architectural spatial-programming, relationship-mapping, analysis, and presentation instrument.

The core workflow is:

```text
Add spaces
→ define data
→ arrange spatially
→ define relationships and behaviours
→ style with materials
→ analyse the graph
→ compose sheets/scenes
→ export static or animated outputs
```

The product must serve two users simultaneously:

```text
BEGINNER / DAILY USER
→ starts from template, upload, or blank canvas
→ adds spaces from one central button
→ uses presets and smart defaults
→ never needs to open advanced inspectors

ADVANCED USER
→ imports schedules
→ edits exact data in the full table
→ uses shortcuts, multi-select, exact spacing, behaviours, materials, analysis,
  scenes, exports, and eventually automation
```

These are not separate apps. MOOORF uses progressive disclosure:

```text
Level 1: immediate actions
Level 2: contextual essentials
Level 3: advanced inspectors and workspaces
```

---

# 2. Non-negotiable product rules

## 2.1 Visual language

```text
Blur: YES
Shadow: NO
Large glow: NO
Animated blur: NO
Delayed glass application: NO
Solid-black active buttons: NO
Canvas hidden by a browser/panel: NO
```

Use:

- stable backdrop blur from the first visible frame,
- high transparency,
- thin borders and inner keylines,
- restrained tonal separation,
- mixed geometry,
- circular resource previews,
- technical/editorial typography,
- short functional motion.

Active controls use:

```text
small signal dot
+ subtle inner keyline
+ very light tonal tint
```

Do not fill ordinary active controls solid black.

## 2.2 Motion language

- Repetitive actions must feel nearly instant.
- First-time entrances may use approximately 100–160 ms.
- Refocusing an existing widget must not replay its entrance.
- No spring overshoot for work tools.
- No blur animation.
- No decorative motion that blocks input.
- Visual Motion is separate from spatial Cell Behaviour.

## 2.3 Canvas meaning

- Cell size is area-driven.
- Random Scale is permanently removed.
- Selection must never change cell radius, strength, material, or membrane geometry.
- Plain cells are the default new-project view.
- Morph and Motion default off for a new project.
- Text defaults to screen-fixed size.
- Core Dot is an appearance option, not a transform handle.
- Relationships, visual lines, morph bridges, and behaviours remain separate concepts.

## 2.4 Canvas visibility

- The canvas remains visible during normal editing.
- The Material Browser never exceeds half of the available screen.
- Right inspectors remain slim.
- Full Table and Dashboard are deliberate workspace switches, not accidental overlays.
- Core rails visually float but stay predictably anchored.

---

# 3. Canonical terminology

| User-facing term | Internal / technical meaning |
|---|---|
| Space | Area-driven solid cell / space node |
| Void | Subtractive or exclusion cell |
| Morph | User-facing toggle and controls for the membrane |
| Membrane | Technical rendered organism field |
| Core Dot | Central dot within a cell |
| Label | Short text |
| Note | Paragraph / long-form text |
| Data Tag | Live graph-linked value |
| Labels & Markup | Dimensions, arrows, section/elevation markers, environment symbols |
| Panel | Glass / transparent / solid container |
| Relationship | Semantic architectural graph edge |
| Visual Connection | Drawn line representation |
| Morph Bridge | Rendered membrane connection |
| Cell Behaviour | Continuous physical/field rule |
| Keep Clear | Enforce a minimum edge-to-edge gap |
| Arrange | One-time positional transformation |
| Motion | Non-destructive visual animation |
| Table / Data | Detailed graph data-entry workspace |
| Dashboard | Composed analysis and project-intelligence workspace |
| Scenes | Saved presentation/view states |

Do not reintroduce “Paragraph” as a primary button. Use **Note**.  
Do not use “Untouch.” Use **Keep Clear**.  
Do not expose ORG/CLS as the final beginner-facing language.

---

# 4. Product-level site tree

```text
MOOORF
│
├── Public Website
│   ├── Home
│   ├── Product
│   ├── Templates
│   ├── Gallery
│   ├── Learn
│   ├── Pricing
│   ├── Sign In
│   └── Launch Studio
│
├── Authentication
│   ├── Continue as Guest
│   ├── Email Sign-up
│   ├── Email Verification
│   ├── Password
│   ├── Magic Link
│   ├── Reset Password
│   └── Account Recovery
│
├── User Dashboard
│   ├── New Project
│   ├── Recent Projects
│   ├── All Projects
│   ├── Favourites
│   ├── Templates
│   ├── Usage
│   ├── Subscription
│   ├── Billing
│   ├── Promo Code
│   ├── Account
│   └── Help
│
├── Studio
│   ├── Canvas Workspace
│   ├── Data / Table Workspace
│   ├── Dashboard Workspace
│   ├── Floors
│   ├── Scenes
│   ├── Layers
│   ├── Materials
│   ├── Analysis
│   ├── Files
│   └── Export
│
└── Internal Admin
    ├── Users
    ├── Plans
    ├── Entitlements
    ├── Promo Codes
    ├── Payments
    ├── Refunds
    ├── Student Verification
    ├── Templates
    ├── Feature Flags
    ├── Webhook Logs
    └── Error Logs
```

---

# 5. Canonical Studio shell

The Studio shell is a set of multiple floating instruments, not one continuous top bar.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Project cluster]   [Floor cluster]   [Undo/Redo]    [Quick icons] [Export]│
│                                                                             │
│ ╭──────╮ ╭─────────────╮                          ╭────╮ ╭────────────────╮  │
│ │ LEFT │ │ CONTEXTUAL  │                          │MAT.│ │ RIGHT          │  │
│ │ RAIL │ │ LEFT RAIL   │        WORKSPACE         │RAIL│ │ INSPECTOR      │  │
│ │      │ │             │ Canvas / Data / Dashboard│    │ │                │  │
│ ╰──────╯ ╰─────────────╯                          ╰────╯ ╰────────────────╯  │
│                                                                             │
│                  ╭────────────────────────────────────╮                     │
│                  │ COMMON CONTEXT RAIL                │                     │
│                  ╰────────────────────────────────────╯                     │
│                                                                             │
│  ╭────────────────────╮   ╭──────────────╮   ╭────────────────────────╮    │
│  │ LEFT ACTION DOCK   │   │   + SPACE    │   │ RIGHT ACTION DOCK      │    │
│  ╰────────────────────╯   ╰──────────────╯   ╰────────────────────────╯    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.1 Floating rules

### Anchored-floating

Visually detached from viewport edges but not freely movable:

- top project cluster,
- top floor cluster,
- undo/redo cluster,
- quick-view icons,
- long left rail,
- contextual left subrail,
- bottom left/right action docks,
- centre `+ Space`,
- common context rail,
- right vertical material rail.

### Movable / pinnable

- right inspector,
- Material Browser,
- export settings,
- analysis micro-widgets,
- secondary tool widgets,
- user-created Panels and Notes.

### Full workspace views

Not floating cards:

- full Data / Table workspace,
- full Dashboard workspace,
- full Presentation mode.

---

# 6. Top floating clusters

There is no single long top bar. Use separate floating docks.

## 6.1 Project cluster

```text
[ MOOORF mark ] [ Project name ] [ Save/sync state ] [ Cell usage ]
```

Actions:

- project menu,
- rename,
- save,
- save as,
- open,
- duplicate project,
- project settings,
- project information,
- recovery,
- close.

## 6.2 Floor cluster

```text
[ Current floor ] [ Previous ] [ Next ] [ Add floor ]
```

Advanced floor management remains in the left subrail.

## 6.3 History cluster

```text
[ Undo ] [ Redo ] [ History ]
```

## 6.4 Quick View cluster — icons only

```text
Morph
Motion
Grid
Labels
Full Screen
More
```

Rules:

- icon-only,
- tooltip on hover/long press,
- signal-dot active state,
- no solid-black active fill,
- no shadow.

### More View

- day/night,
- transparent canvas,
- connection visibility,
- markup visibility,
- Core Dot visibility,
- interface scale,
- widget scale,
- performance quality,
- reset view.

## 6.5 Export cluster

One direct Export button opens the export instrument. It is not hidden inside Files.

## 6.6 Account cluster

Avatar / initials opens:

- profile,
- dashboard,
- plan,
- usage,
- billing,
- settings,
- sign out.

---

# 7. Long left rail and workspace switcher

The top of the left rail is the primary three-workspace switcher:

```text
1. Canvas
2. Data / Table
3. Dashboard
```

These are equal views of the same master graph.

Complete long-left rail:

```text
LEFT RAIL
│
├── WORKSPACES
│   ├── Canvas
│   ├── Data / Table
│   └── Dashboard
│
├── START / REUSE
│   └── Templates
│
├── PROJECT STRUCTURE
│   ├── Floors
│   ├── Scenes
│   ├── Layers
│   └── History
│
├── PROJECT OPERATIONS
│   ├── Files
│   ├── Search / Commands
│   └── Shortcuts
│
└── SUPPORT
    ├── Learn
    ├── Help
    └── Feedback
```

The left rail remains narrow. A contextual subrail opens beside it.

---

# 8. Contextual left subrail

## 8.1 Canvas subrail

```text
CANVAS
├── Current floor
├── Saved views
├── Selection filters
├── Object visibility
├── Canvas settings
├── Fit All
├── Fit Selection
├── Reset View
└── Mini-map — later
```

## 8.2 Data / Table subrail

```text
DATA / TABLE
├── Table mode
│   ├── Full detailed table
│   ├── Canvas + bottom table
│   ├── Canvas + right table
│   └── Compact canvas overlay
│
├── Table type
│   ├── Space schedule
│   ├── Relationships
│   ├── Floors
│   ├── Materials
│   ├── Markup
│   └── Analysis results
│
├── Search
├── Filter
├── Sort
├── Group
├── Columns
├── Freeze
├── Bulk edit
├── Import
├── Download blank format
├── AI-fill instructions
└── Export table
```

## 8.3 Dashboard subrail

```text
DASHBOARD
├── Overview
├── Programme
├── Categories
├── Privacy
├── Area
├── Relationships
├── Circulation
├── Floors
├── Fields
├── Materials
├── Data Health
└── Reports
```

## 8.4 Templates subrail

```text
TEMPLATES
├── Browse Gallery
├── Featured
├── Recent
├── Favourites
├── Full Project Templates
├── Style Presets
├── Arrangement Presets
├── Behaviour Presets
├── Presentation Presets
├── Save Current as Template
└── Import Template
```

## 8.5 Floors subrail

- floor list,
- add,
- rename,
- duplicate,
- delete,
- reorder,
- show/hide,
- solo,
- ghost others,
- lock,
- move selection,
- copy selection,
- compare floors.

## 8.6 Scenes subrail

- scene list,
- save current,
- update,
- duplicate,
- rename,
- reorder,
- transition,
- delete.

## 8.7 Layers subrail

Layers:

- spaces,
- voids,
- Morph,
- relationships,
- visual connections,
- labels,
- notes,
- Data Tags,
- symbols,
- markup,
- Panels,
- background references,
- grid,
- frames.

Per layer:

- show/hide,
- lock,
- select all,
- focus,
- include/exclude from export.

## 8.8 History subrail

- undo,
- redo,
- recent actions,
- named checkpoints,
- recovery,
- version history.

## 8.9 Files subrail

- new,
- open,
- save,
- save as,
- duplicate project,
- import,
- export,
- project settings,
- project information,
- close.

---

# 9. Bottom interaction architecture

```text
LEFT EXPANDABLE DOCK       CENTRE PRIMARY ACTION       RIGHT EXPANDABLE DOCK

Select | Materials | Arrange      + SPACE      Connect | Markup | Present
```

## 9.1 Beginner collapsed state

```text
[ Select ]        [ + SPACE ]        [ Present ]
```

## 9.2 Expanded state

```text
[ Select | Materials | Arrange ] [ + SPACE ] [ Connect | Markup | Present ]
```

Expansion:

- 100–140 ms,
- no slow spring,
- no blur animation,
- no shadow.

## 9.3 Centre `+ Space`

Primary click:

```text
add one space
→ place intelligently near selection/current cluster/cursor/view centre
→ avoid overlap
→ keep visible
→ select it
→ reveal essential controls
```

Expanded Add tray:

```text
ADD
├── Space
├── Multiple Spaces
├── Void
├── Label
├── Note
├── Data Tag
├── Symbol
├── Panel
├── Frame
├── Upload
└── From Template
```

Connections remain under Connect. Dimensions and architectural markers remain under Markup.

---

# 10. Common context rail

One floating contextual rail sits above the bottom docks.

```text
SELECT
→ selection count | duplicate | delete | lock | focus

SPACE
→ name | area | category | privacy | floor | add another

VOID
→ type | area | subtract | buffer

MATERIALS
→ target | recent | favourites | browser

ARRANGE
→ preset icons | spacing | preview | apply

CONNECT
→ relationship | visual line | morph bridge | behaviour

MARKUP
→ label | note | dimension | symbol | sheet content

PRESENT
→ scene | visibility | animation | export
```

Rules:

- one rail only,
- essentials only,
- no stacked rails,
- no nested glass cards,
- advanced controls open in the right inspector.

---

# 11. Right vertical material rail

A slim vertical resource rail sits next to the inspector.

```text
MATERIAL RAIL
├── Active target
├── Recent
├── Favourites
├── Compatible
├── Recommended
├── Scrollable circular swatches
└── More Materials
```

Behaviour:

```text
Hover → temporary preview
Leave → restore
Click → apply and commit
More → open Material Browser
```

Geometry:

- approximately 48–60 px wide,
- 7–12 visible circular swatches,
- vertical scrolling,
- restrained magnification,
- no clipping,
- no shadow,
- stable blur.

The rail appears only when the selected object or active tool supports materials.

---

# 12. Right inspector

Desktop width:

- approximately 340–440 px,
- Material Browser maximum 50% viewport,
- canvas remains visible.

Universal structure:

```text
OBJECT / TOOL NAME
├── Essentials
├── Appearance
├── Behaviour
├── Data
├── Advanced ▸
└── Actions
```

Advanced is collapsed by default.

Inspector types:

- Space,
- Void,
- Relationship,
- Visual Connection,
- Morph Bridge,
- Cell Behaviour,
- Material,
- Label,
- Note,
- Data Tag,
- Symbol,
- Markup,
- Panel,
- Frame,
- Arrangement,
- Motion,
- Morph,
- Grid,
- Canvas,
- Background reference,
- Export.

---

# 13. Canvas workspace

## 13.1 Default startup

- plain cells,
- Morph off,
- Motion off,
- shadow absent,
- category colours retained,
- screen-fixed labels,
- Core Dot off or restrained auto-contrast,
- immediate interaction.

## 13.2 Performance requirements

- smooth pan and zoom,
- `requestAnimationFrame`-scheduled pointer updates,
- no per-raw-event React/Zustand flood,
- one history transaction per completed drag,
- transient preview separated from persistent store,
- no material recalculation caused only by selection,
- stable 20–30 cell group drag,
- no widget remount on refocus,
- no delayed glass.

## 13.3 Text scaling

```text
Screen Size — default
Adaptive — restrained clamp
World Size — drawing/presentation mode
```

Position follows the cell. Screen-size text does not become huge during zoom.

## 13.4 Radial context menu

Right-click anywhere on a cell:

```text
identify projected cell centre
→ place eight independent action circles around the cell
```

Rules:

- cell is the semantic centre,
- no centre circle,
- no centre icon,
- no background disc,
- no enclosing ring,
- no large panel,
- reorient actions near viewport edges,
- clamp buttons only as final fallback.

## 13.5 Canvas background references

Any non-MOOORF image/document loaded as a reference can be placed behind the graph.

```text
BACKGROUND REFERENCE
├── Source file
├── Position
├── Scale
├── Rotation
├── Opacity
├── Crop
├── Fit mode
├── Lock
├── Show / Hide
├── Send to Background
├── Per-floor visibility
├── Include in export
└── Remove
```

Supported initial reference types:

- PNG,
- JPG/JPEG,
- WEBP,
- SVG as reference,
- selected PDF page,
- GIF as animated reference where supported.

A reference is not automatically editable graph data.

---

# 14. Entire browser/canvas as upload space

When a compatible file is dragged over the browser:

```text
entire Studio becomes a translucent glass drop target
→ detect type
→ show likely action
→ drop anywhere
```

Resolver:

```text
MOOORF project / ZIP
→ validate and open editable project

JSON
→ detect project/config or reject safely

CSV / XLS / XLSX
→ preview, map columns, validate, import spaces/data

PNG / JPG / WEBP
→ detect embedded MOOORF metadata
→ reopen project if available
→ otherwise place as reference/background/frame content

SVG
→ place as reference or symbol
→ vector import later

PDF
→ choose page
→ add as reference

GIF
→ detect metadata
→ reopen animation project if available
→ otherwise animated reference
```

Do not claim that a plain raster image can reconstruct the graph when metadata is absent.

---

# 15. Reopen MOOORF-generated image

PNG/GIF export may contain:

- compact MOOORF metadata,
- project fingerprint,
- scene ID,
- export settings,
- optional compressed editable snapshot within safe limits.

Drop flow:

```text
MOOORF metadata found
→ Reopen Editable Project
→ Place as Reference
→ Inspect Export Information

No metadata
→ Place as Reference only
```

Because external services may strip metadata, serious exports should optionally include:

```text
image.png / animation.gif
project.mooorf
manifest.json
```

inside a ZIP pack.

---

# 16. Compact canvas data widget

A light, sharp-cornered, highly transparent glass widget overlays the canvas. It is anchored-floating and movable/pinnable where safe.

It has three modes.

## 16.1 Mode A — Compact stacked spaces

Each row:

```text
[ drag handle ] [ space name ] [ area ]
```

Behaviour:

- new spaces append in aligned order,
- rows never overlap,
- drag handle moves/reorders,
- selecting a row selects the cell,
- selecting a cell highlights the row,
- compact height,
- sharp or restrained corner radii,
- no shadow.

## 16.2 Mode B — Expanded vertical list

Shows more rows and optional fields:

- name,
- area,
- category,
- privacy,
- floor,
- type.

The whole widget may move together; internal rows remain aligned.

## 16.3 Mode C — Mini dashboard bar

```text
[ project name/logo ] [ spaces ] [ total area ] [ floors ] [ warnings ]
```

This is a quick project readout, not the full Dashboard.

The widget’s header provides one compact mode button:

```text
Compact Rows
Expanded List
Mini Dashboard
```

---

# 17. Data / Table workspace

The full Data workspace is the detailed project input surface.

## 17.1 Core tables

```text
Space Schedule
Relationship Matrix
Floor Summary
Materials
Markup Schedule
Project Metadata
Analysis Results
```

## 17.2 Space Schedule fields

At minimum:

- ID / short code,
- name,
- area,
- type: space/void,
- category,
- privacy,
- floor,
- description,
- material bindings,
- Core Dot,
- label mode,
- locked/visible,
- notes,
- custom fields,
- relationship count,
- warning state.

## 17.3 Project Metadata form

- project name,
- subtitle,
- description,
- client,
- location,
- architect/designer,
- project type,
- site area,
- FAR/FSI,
- coverage,
- units,
- floor count,
- date,
- revision,
- author,
- custom metadata.

## 17.4 Table interactions

- add row/space,
- multi-row paste,
- bulk edit,
- duplicate,
- delete,
- reorder,
- filter,
- sort,
- group,
- show/hide columns,
- freeze columns,
- search,
- validation,
- row ↔ cell sync,
- focus selection on canvas,
- undo/redo,
- CSV/XLSX import and export.

The table must never reset canvas positions.

---

# 18. Downloadable data format and AI-fill helper

The full Data workspace includes an **Import Assistant** section.

## 18.1 Download blank format

Buttons:

```text
Download CSV Template
Download XLSX Template
Download Example Dataset
Download Field Guide
```

The template includes canonical columns and short examples.

## 18.2 AI-fill instructions

A short instruction block above the prompt:

```text
1. Download the blank format.
2. Attach it to your preferred AI tool with your project brief.
3. Copy the prompt below.
4. Ask the AI to fill the file without changing column names.
5. Import the completed file back into MOOORF.
```

## 18.3 Copyable prompt box

```text
[ Generated prompt text                                      ] [ Copy icon ]
```

Prompt content should include:

- project type and brief,
- required column schema,
- allowed categories/privacy codes,
- area-unit requirement,
- instruction not to rename columns,
- instruction to preserve IDs where supplied,
- instruction to avoid invented regulations unless sources are provided,
- requested output format,
- warning to leave uncertain values blank.

The prompt is editable before copying.

Future options:

- beginner prompt,
- architecture-programme prompt,
- relationship-matrix prompt,
- material/style prompt,
- city/bylaw research prompt.

AI output is always validated on import.

---

# 19. Dashboard workspace

The Dashboard is a composed project-intelligence and presentation workspace, not a loose pile of widgets.

## 19.1 Structure

```text
DASHBOARD
├── Header
│   ├── Project name
│   ├── Description
│   ├── Current floor/filter
│   ├── Date/revision
│   └── Export
│
├── Primary metrics
│   ├── Total area
│   ├── Space count
│   ├── Void count
│   ├── Floor count
│   ├── Relationship count
│   └── Data health
│
├── Programme
│   ├── Category donut
│   ├── Privacy donut
│   ├── Area leaders
│   ├── Area distribution
│   └── Floor distribution
│
├── Relationships
│   ├── Relationship graph
│   ├── Adjacency matrix
│   ├── Sankey / flow
│   ├── connection strength
│   └── missing/conflicting links
│
├── Circulation
│   ├── paths
│   ├── shortest route
│   ├── entry/exit
│   ├── dead ends
│   └── centrality
│
├── Materials
│   ├── project palette
│   ├── category palette
│   ├── privacy palette
│   ├── material usage
│   └── active material collection
│
├── Fields
│   ├── category field
│   ├── privacy field
│   ├── density field
│   ├── access field
│   └── interaction field
│
├── Data health
│   ├── missing area
│   ├── missing category
│   ├── missing privacy
│   ├── broken references
│   ├── unknown materials
│   └── export warnings
│
└── Reports
    ├── charts
    ├── tables
    ├── visualisers
    └── export selected/all
```

## 19.2 Dashboard interactions

- filter by floor,
- filter by category,
- filter by privacy,
- select graph element → select canvas/table item,
- hover metric → highlight source objects,
- pin favourite visuals,
- rearrange dashboard blocks later,
- choose light/dark presentation lane,
- export individual transparent visuals.

---

# 20. Project metadata on canvas and sheet composition

Project metadata entered in the Data workspace can be displayed on the canvas through Markup → **Project Block**.

## 20.1 Project Block presets

```text
Editorial A2
Technical Title Block
Minimal Caption
Presentation Header
Custom
```

## 20.2 Editorial A2 concept

Default composition:

```text
large editorial project heading
left aligned
small body text below
project metadata / revision / author
optional thin rule
```

Alignment options:

```text
Left
Centre
Right
```

Controls:

- heading font family,
- heading weight,
- heading size,
- italic,
- case,
- letter spacing,
- body font family,
- body size,
- line height,
- maximum width,
- metadata fields shown,
- column count,
- alignment,
- background: none/glass/solid/material,
- border: none/hairline/editorial rule,
- padding,
- scale mode,
- attach to frame,
- include in export.

The Project Block reads from project metadata; it must not duplicate values manually unless explicitly detached.

---

# 21. Labels, Notes, typography, and Panels

## 21.1 Label

Short text with:

- font family,
- Light/Regular/Medium/Semibold/Bold/Black,
- italic,
- underline,
- strikethrough,
- size,
- line height,
- letter spacing,
- word spacing,
- case,
- tabular numerals,
- left/centre/right/justified,
- top/middle/bottom,
- auto/fixed width,
- wrap,
- max lines,
- rotation,
- Screen/Adaptive/World scale,
- hide below zoom,
- colour/material,
- background: none/solid/transparent/glass/material,
- presets.

## 21.2 Note

Long-form text with:

- heading,
- subheading,
- paragraph,
- caption,
- quote,
- bulleted list,
- numbered list,
- checklist,
- font/weight/italic/size,
- line height,
- spacing,
- indentation,
- alignment,
- one/two/three columns,
- width/height,
- padding,
- overflow/scroll,
- background,
- frame.

## 21.3 Data Tag

Graph-linked values:

- space name,
- area,
- category,
- privacy,
- floor,
- relationship count,
- custom field,
- prefix/suffix,
- units,
- decimal places,
- live or snapshot,
- typography/background.

## 21.4 Panel

User-facing glass/container object:

- Glass,
- Transparent,
- Solid,
- Outline,
- Material,
- blur,
- transparency,
- saturation,
- brightness,
- tint,
- optional noise,
- border/keyline,
- width/height/radius/rotation/padding,
- label/note/data/symbol/image content,
- free/horizontal/vertical/grid layout,
- pin to canvas/screen,
- include/exclude export.

Blur stays. Shadows do not exist.

---

# 22. Materials

## 22.1 Material targets

- Cell Fill,
- Core Dot,
- Cell Edge,
- Morph Fill,
- Morph Edge,
- Void Fill,
- Void Edge,
- Visual Connection,
- Relationship,
- Label,
- Label Background,
- Panel,
- Canvas,
- Grid,
- Frame.

## 22.2 Quick material system

- right vertical rail,
- recent,
- favourites,
- compatible,
- recommended,
- active-target filtering,
- hover preview,
- click commit.

## 22.3 Material Browser

Maximum half screen.

```text
Search
Filters
Solid
Tonal
Gradient
Pattern
Texture
Procedural
Custom
Imported
Circular Preview Grid
Selected Preview
Parameters
Compatibility
Performance Tier
Export Behaviour
Source
Licence
Favourite
Duplicate
Save Preset
Apply
```

## 22.4 Controls

Default:

- slider/track,
- exact numeric input,
- keyboard adjustment,
- reset.

Knobs only where circular meaning is genuine:

- angle,
- hue,
- sun direction,
- wind direction,
- gradient direction.

No jump-on-grab. Support vertical drag, precision modifier, wheel, and reset where a knob is retained.

---

# 23. Morph, Motion, Grid, Labels, Core Dot

## 23.1 Morph

Quick icon: On/Off.

Essentials:

- preset,
- reach,
- softness.

Advanced:

- mode: single/category/privacy/weighted/distance/hybrid,
- tension,
- threshold,
- fill/edge material,
- motion response,
- void response,
- bridge response,
- quality.

## 23.2 Motion

Quick icon: On/Off.

Essentials:

- Still,
- Subtle,
- Fluid,
- Dynamic.

Advanced:

- apply to Morph/Core Dot/connections/materials/scene,
- speed,
- intensity,
- amplitude,
- damping,
- flow direction,
- pause during edit,
- pause during drag,
- reduced motion.

Visual Motion does not change architectural positions.

## 23.3 Grid

Quick icon: On/Off.

Presets:

- none,
- dotted,
- fine line,
- technical,
- architectural,
- major/minor,
- isometric,
- radial.

Controls:

- spacing,
- major interval,
- opacity,
- thickness,
- colour,
- dynamic zoom,
- snap,
- export grid.

## 23.4 Labels

Quick icon: show/hide.

- name,
- area,
- category,
- privacy,
- ring labels,
- hide below zoom,
- Screen/Adaptive/World scale.

## 23.5 Core Dot

Lives under Materials/Appearance, not Quick View.

Modes:

- off,
- black,
- white,
- auto-contrast,
- material.

Controls:

- size,
- opacity,
- border,
- hide below zoom.

---

# 24. Select and movement

```text
SELECT
├── Single
├── Add/remove selection
├── Select all
├── Box select
├── Lasso — later
├── Group drag
├── Duplicate
├── Delete
├── Lock
├── Hide
├── Focus
├── Move to floor
└── Selection filters
```

Group drag:

- one primary-derived delta,
- same delta for all valid selected cells,
- preserve offsets,
- one undo transaction,
- no area/material changes.

Cells remain area-driven. Presentation objects may later be freely scaled.

---

# 25. Arrange and smart placement

Random Scale is removed.

## 25.1 Arrange

```text
Scope
├── Selected
├── Current floor
└── Visible

Align
├── Left
├── Centre
├── Right
├── Top
├── Middle
└── Bottom

Distribute
├── Horizontal
├── Vertical
├── Radial
└── Along path

Patterns
├── Horizontal
├── Vertical
├── Diagonal
├── Grid
├── Arc
├── Radial
├── Spiral
├── Golden Spiral
├── S-Curve
├── Cluster
├── Along Path
└── Seeded Random

Packing
├── Compact
├── Relaxed
├── Avoid Overlap
├── Keep Clear
└── Fit in Frame

Parameters
├── Spacing
├── Direction
├── Rotation
├── Radius
├── Curve
├── Density
├── Seed
├── Preserve Centre
└── Keep in View

Preview
Regenerate
Apply
Cancel
```

Preset buttons use miniature dot diagrams, often based on 3×3 circles, so the geometry is understood before reading the label.

## 25.2 Multi-add smart placement

When multiple spaces are added:

```text
selected cell centre
→ selected group centre
→ cursor
→ visible canvas centre
```

Then:

- search nearest valid positions,
- expanding ring/spiral,
- avoid overlap,
- remain near existing cluster,
- keep inside viewport,
- animate outward 120–180 ms,
- commit as one action.

---

# 26. Connect and Cell Behaviour

Keep four domains separate.

## 26.1 Relationship

Semantic meaning:

- adjacent,
- direct access,
- visual access,
- shared service,
- circulation,
- required,
- preferred,
- avoid,
- direction,
- strength,
- note.

## 26.2 Visual Connection

Drawing:

- straight,
- curved,
- width,
- material,
- dash,
- start/end marker,
- arrow,
- end cap,
- opacity,
- visibility.

## 26.3 Morph Bridge

Rendered membrane geometry:

- on/off,
- width,
- strength,
- softness,
- fill,
- edge,
- motion response,
- convert to visual line.

## 26.4 Cell Behaviour

```text
Solid + Solid
├── Merge
├── Touch
├── Keep Clear
├── Attract
├── Repel
├── Bridge
└── Ignore

Solid + Void
├── Subtract
├── Cut
├── Buffer
├── Keep Clear
├── Repel
└── Ignore

Void + Void
├── Merge
├── Keep Clear
├── Repel
└── Ignore
```

Keep Clear:

- minimum gap,
- response strength,
- softness,
- motion response,
- pair/category/project scope.

Keep Clear only responds when the minimum gap is violated. Repel pushes continuously. The outer Morph may still surround separated cells.

Behaviour calculations must use spatial indexing/nearby-pair evaluation rather than unchecked all-to-all work at scale.

---

# 27. Markup

```text
MARKUP
├── Label
├── Note
├── Data Tag
├── Project Block
├── Dimension
├── Area Tag
├── Level Marker
├── Entry Marker
├── Exit Marker
├── Movement Arrow
├── View Arrow
├── Section Marker
├── Elevation Marker
├── North Arrow
├── Sun Direction
├── Wind Direction
├── Warm Wind
├── Cool Wind
├── Scale Bar
├── Digital Scale
├── Boundary
├── Leader Line
├── Symbol
├── Panel
└── Frame
```

Universal markup controls:

- material,
- width,
- dash,
- arrowhead,
- text,
- text position,
- style,
- units,
- scale behaviour,
- rotation,
- opacity,
- attach/detach,
- export visibility.

---

# 28. Templates and beginner presets

Startup:

```text
Blank Canvas
Browse Templates
Upload / Drop File
```

## 28.1 Gallery filters

- Featured,
- Recent,
- Favourites,
- Architecture,
- Interior,
- Urban,
- Landscape,
- Exhibition,
- Diagramming,
- project type,
- visual style.

## 28.2 Template preview

- preview image,
- animated preview,
- included spaces,
- included materials,
- arrangement,
- relationships,
- scenes,
- recommended use,
- cell count,
- plan requirement,
- Use Template,
- Favourite.

## 28.3 Preset separation

```text
Full Template
→ data + spaces + layout + materials + views

Style Preset
→ appearance only

Arrangement Preset
→ positions only

Behaviour Preset
→ interaction rules only

Presentation Preset
→ scene/canvas/export styling only
```

Applying a style preset must not replace project data.

---

# 29. Presentation and export

## 29.1 Standard exports

- PNG,
- SVG,
- PDF,
- ZIP Pack,
- GIF,
- MOOORF project,
- video later.

## 29.2 GIF

Sources:

- current Motion,
- Morph Motion,
- path animation,
- arrangement transition,
- scene transition.

Controls:

- duration,
- FPS,
- resolution,
- quality,
- loop,
- background,
- include labels/grid/connections/markup/Panels/frame,
- preview.

## 29.3 Detailed ZIP Export Builder

ZIP export opens a dedicated checklist-based panel.

### Presets

```text
Minimal Image Pack
Presentation Pack
Complete Project Pack
Analysis Pack
Custom
```

### Main visuals

- current canvas PNG,
- transparent canvas PNG,
- SVG where supported,
- PDF sheets,
- GIF animations,
- scenes,
- floors,
- frames,
- background-included and background-free variants.

### Transparent isolated assets

Export as transparent PNG where applicable:

- spaces/cells only,
- Morph only,
- void field,
- relationships,
- visual connections,
- labels,
- markup,
- symbols,
- Project Block,
- grid,
- material palette,
- individual dashboard visuals.

### Dashboard and analysis visuals

Checklist:

- primary metric strip,
- Category donut,
- Privacy donut,
- Area leaders chart,
- Area distribution,
- Floor distribution,
- relationship graph,
- adjacency matrix,
- Sankey,
- circulation/path visuals,
- fields,
- material palette,
- Data Health summary,
- future registered visualisers.

Each visualiser should export:

- transparent PNG,
- optional SVG when genuinely vector,
- data CSV/JSON where relevant,
- title/caption metadata.

### Tables and data

- Space Schedule CSV/XLSX,
- Relationship Matrix,
- Floor Summary,
- Materials schedule,
- Markup schedule,
- Project Metadata,
- analysis tables,
- warnings report.

### Editable and supporting files

- `.mooorf` project,
- config,
- manifest,
- asset references,
- source/licence metadata,
- export settings,
- README/index,
- optional original uploaded references subject to permissions.

### ZIP controls

- check/uncheck every section,
- select all/none,
- preset selection,
- naming pattern,
- resolution,
- scale,
- transparent/background variants,
- light/dark lane,
- include/exclude watermark if plan requires,
- include/exclude editable project,
- estimated size,
- warnings,
- generate.

Do not claim vector export for systems that are raster-only.

---

# 30. Accounts, plans, and entitlements

Exact pricing and final limits remain open until commercial implementation.

Working plan logic:

```text
Guest
Free
Light
Max
Studio
```

Cell count is a primary entitlement. Candidate examples discussed:

- Free: approximately 6 cells,
- Light: approximately 69 cells,
- Max: approximately 200+ cells,
- Studio: configurable.

These are placeholders, not final contractual limits.

Central entitlement fields:

```text
maxCells
maxProjects
maxStorage
allowedExports
maxGifResolution
maxGifDuration
materialsTier
analysisTier
historyDays
customAssets
commercialUse
teamSeats
```

At a limit:

- existing project remains editable,
- deletion remains available,
- allowed exports remain available,
- Add Space shows an upgrade explanation,
- the project is never locked.

Do not scatter plan checks throughout UI components. Use one entitlement service.

---

# 31. Billing and administration

Billing architecture:

```text
Checkout
→ payment provider
→ verified server webhook
→ subscription record
→ entitlement recalculation
→ access
```

Never unlock paid features only from a frontend success screen.

Billing features:

- monthly/annual,
- UPI,
- cards,
- international payment support,
- upgrade/downgrade,
- cancel,
- invoices,
- billing history,
- promo codes,
- refunds,
- payment-failure recovery.

Admin:

- users,
- plans,
- entitlements,
- cell/project/storage/export limits,
- promo codes,
- payments,
- refunds,
- student verification,
- templates,
- feature flags,
- webhook logs,
- error logs,
- manual overrides.

Technology vendors must be revalidated at implementation time.

---

# 32. Beginner user flow

```text
Open MOOORF
→ choose Template, Upload, or Blank
→ click + Space
→ cells place nearby automatically
→ drag to adjust
→ choose material from right rail
→ choose Arrange preset
→ toggle Morph
→ optionally toggle Motion
→ add Project Block or simple label
→ export PNG/GIF/ZIP
```

No advanced inspector is required.

---

# 33. Advanced user flow

```text
Sign in
→ open/import project
→ download/fill/import table format
→ edit detailed data
→ switch to Canvas
→ organise Floors
→ multi-select and group drag
→ arrange with exact parameters
→ define Relationships
→ add Visual Connections
→ configure Cell Behaviour
→ style advanced Materials
→ add Labels, Notes, Project Block, and Markup
→ review Dashboard
→ save Scenes
→ export SVG/PDF/GIF/ZIP and data
```

---

# 34. Implementation roadmap

## Phase 0 — Preserve and document current product

- create archive tag/branch,
- capture screenshots at 1440, 1280, 1024, and 768–834,
- preserve current feature checklist,
- keep legacy shell available temporarily if required.

## Phase 1 — Canvas performance and interaction reset

- fixed-screen labels,
- smooth rAF pan/zoom/drag,
- instant widget refocus,
- stable blur,
- remove shadows,
- plain-cell startup,
- Morph/Motion/Core Dot settings,
- cell-centred radial.

## Phase 2 — New shell foundation

- multiple top floating clusters,
- long left rail,
- contextual left subrail,
- three-workspace switcher,
- split bottom docks,
- centre `+ Space`,
- common context rail,
- right material rail,
- right inspector foundation,
- active signal-dot language.

## Phase 3 — Canvas quick workflows

- smart add/multi-add placement,
- compact canvas data widget with three modes,
- background references,
- whole-canvas drag/drop.

## Phase 4 — Data / Table workspace

- full schedule,
- metadata form,
- row/cell sync,
- import/export,
- downloadable formats,
- AI prompt helper,
- validation.

## Phase 5 — Dashboard workspace

- metrics,
- charts/donuts,
- relationship graph/matrix/Sankey,
- fields,
- materials palette,
- Data Health,
- isolated transparent export.

## Phase 6 — Materials

- quick vertical rail,
- Quick Shelf,
- half-screen Browser,
- target-specific controls,
- favourites/recent,
- typography/background/Panel materials.

## Phase 7 — Arrange

- align/distribute,
- dot-icon presets,
- live preview,
- seeded random,
- smart packing,
- one undo transaction.

## Phase 8 — Connections and behaviours

- Relationships,
- Visual Connections,
- Morph Bridges,
- Keep Clear/Attract/Repel/Merge/Subtract/Bridge,
- spatial-index performance.

## Phase 9 — Markup and sheet composition

- Label,
- Note,
- Data Tag,
- Project Block,
- typography,
- dimensions,
- environmental markers,
- frames,
- A2/editorial presets.

## Phase 10 — Templates and scenes

- beginner gallery,
- full/style/arrangement/behaviour/presentation presets,
- preview images/animations,
- scenes and transitions.

## Phase 11 — Export completion

- transparent assets,
- GIF,
- detailed ZIP Export Builder,
- dashboard visual exports,
- tables/data/manifest,
- generated-image metadata reopening.

## Phase 12 — Project cloud and accounts

- dashboard,
- auth,
- cloud save,
- autosave,
- recovery,
- version history,
- storage,
- entitlements.

## Phase 13 — Billing and admin

- plans,
- payment gateway,
- webhooks,
- promo codes,
- admin,
- analytics/error monitoring.

## Phase 14 — Beta and publish

- student and professional beta,
- performance,
- data-loss/recovery tests,
- export verification,
- payment sandbox,
- accessibility pass,
- documentation,
- legal pages,
- production hosting,
- backups,
- monitoring,
- launch.

---

# 35. Acceptance criteria

A phase is not complete unless it preserves:

- Master Graph ownership,
- Canvas/Table/Dashboard synchronisation,
- area-driven cell geometry,
- plain-cell operation,
- Morph/Motion independence,
- fixed-screen label default,
- blur without shadow,
- fast repeat interactions,
- half-screen maximum Material Browser,
- readable beginner path,
- advanced exact controls,
- export truthfulness,
- project migration,
- undo/recovery,
- desktop/laptop/iPad behaviour.

---

# 36. Explicit no-go list

Do not:

- merge Claude prototype HTML/CSS/JS directly,
- create a second project state store,
- store registry definitions inside every project,
- use shadows to fake separation,
- animate blur,
- replay widget entrances on refocus,
- make the Material Browser full-screen,
- reintroduce Random Scale,
- confuse Relationship with line/bridge/behaviour,
- reconstruct fake editable data from a raster without metadata,
- export false SVG/vector claims,
- mutate area through appearance controls,
- hide the canvas during routine styling,
- lock a project because a plan limit was reached,
- implement payment unlocks only in the frontend,
- add broad features before core performance is stable.

---

# 37. AI implementation protocol

Every future agent prompt must:

1. Read this file first.
2. Verify latest GitHub main.
3. Read compact project indexes.
4. Use the existing Master Graph/store.
5. Search for reusable files/utilities before creating new ones.
6. State coder/model/effort/reason.
7. Keep Claude prototype isolated as design reference.
8. Preserve `.claude/launch.json`.
9. Avoid package sprawl.
10. Add focused contract tests.
11. Run one production build maximum.
12. Produce a compact manual QA checklist.
13. Update this scope only when a product decision genuinely changes.
14. Never silently change canonical terminology or ownership.

### Required prompt header

```text
CODER:
MODEL:
EFFORT:
EFFORT REASON:
ROLE:
WHY THIS MODEL:
PARALLEL AGENT:
```

### Ponytail report

```text
PONYTAIL:
- reused:
- adapted:
- new files justified:
- duplication avoided:
```

---

# 38. Open decisions to finalise later

These are intentionally not fixed yet:

- exact plan names,
- final cell limits,
- final prices,
- student verification rules,
- final cloud/payment vendors,
- final template launch library,
- video-export timing,
- team collaboration timing,
- final accessibility standard and release gate,
- vector Morph export approach,
- high-density renderer architecture above current limits.

Do not let these open decisions block the current product foundation.

---

# 39. Final product principle

```text
Simple on first use
Powerful when expanded
Fast during repetition
Architecturally meaningful
Visually original without decorative excess
Data and presentation always kept distinct
```
