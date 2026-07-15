# MOOORF UI Command Icon Map

This document establishes the UI command icon map for the MOOORF spatial editing application. These icons represent interface controls and commands, and they are strictly separated from user-placeable floor plan drawable symbols.

---

## Quick Bar Commands

| Command | Primary Lucide Key | Alternate Key | Recommended Selection & Reasoning | Active-State Treatment | Off/Disabled-State Treatment | Tooltip / ARIA Label | Collision Check | Custom Glyph Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Membrane** | `Layers` | `Torus` | `Layers` - Standard design metaphor for stacked translucent fields. | Signal dot on label; active light fill. | Neutral gray; 50% opacity. | "Toggle Membrane visibility" | Distinct from custom cell surfaces. | No |
| **Shadow** | `Contrast` | `SunDim` | `Contrast` - Clean geometric representation of shading contrasts. | Accent color border. | Neutral border. | "Configure cell drop shadows" | Avoids color picker swatches. | No |
| **Motion** | `Activity` | `Play` | `Activity` - Represents continuous signal/motion waveform. | Wave animation / pulsing. | Static icon; muted gray. | "Toggle canvas animations" | Separated from media players. | No |
| **Labels** | `Type` | `CaseSensitive` | `Type` - Unambiguous text/typography indicator. | High contrast accent fill. | Slash outline overlay. | "Show/hide plan labels" | Clear of annotations/text. | No |
| **Grid** | `Grid` | `LayoutGrid` | `Grid` - Classic linear grid backdrop indicator. | Accent line border. | Gray outline. | "Toggle canvas grid visibility" | Distinguish from grid snapping. | No |
| **Snapping/Magnet** | `Magnet` | `Link` | `Magnet` - Highly recognized metaphor for magnetic grid snapping. | Active magnet angle tint. | Disabled slash mark. | "Enable/disable snapping" | Clean from connect/links. | No |
| **collapse/expand** | `Minimize2` | `Maximize2` | `Minimize2` / `Maximize2` - Universal panel scaling controls. | Dynamic directional rotation. | Static outline. | "Expand/collapse panel" | Avoids side-rail collisions. | No |

---

## Snapping Menu Commands

| Command | Primary Lucide Key | Alternate Key | Recommended Selection & Reasoning | Active-State Treatment | Off/Disabled-State Treatment | Tooltip / ARIA Label | Collision Check | Custom Glyph Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Center** | `CircleDot` | `Target` | `CircleDot` - Represents precise centroid geometry snapping. | Accent dot fill. | Muted open outline. | "Snap to geometry centers" | Distinct from Target selector. | No |
| **Nearest** | `custom:nearest-snap` | `MapPin` | `custom:nearest-snap` - No clean Lucide equivalent; requires custom dot-on-curve glyph. | Colored snap node. | Hidden snap indicator. | "Snap to nearest point on line" | Avoids map marker confusion. | **Yes** |
| **Quadrant** | `custom:quadrant-snap` | `PieChart` | `custom:quadrant-snap` - Standard CAD 90-degree quadrant snap point. | Segmented ring illumination. | Neutral outline ring. | "Snap to quadrant points" | Distinguish from pie charts. | **Yes** |
| **Direction** | `Compass` | `Move` | `Compass` - Standard alignment orientation control. | Accent needle tint. | Muted gray dial. | "Snap along directional paths" | Clean from north arrows. | No |
| **Bounding Box** | `Frame` | `Box` | `Frame` - Represents structural crop/outer boundary bounds. | Highlighted boundary box. | Muted double lines. | "Snap to bounding box boundaries"| Avoids 3D box models. | No |
| **Grid Snapping** | `Grid3X3` | `Hash` | `Grid3X3` - Distinguishes snapping from grid visibility. | Dot on grid gridlines. | Open grid gridlines. | "Snap to background grid" | Distinguish from Grid visibility. | No |
| **Axis** | `Move3d` | `Ruler` | `Move3d` - Represents axial alignment (X/Y/Z) locks. | Axis lines highlighted. | Gray coordinates. | "Lock snaps to active axis" | Separated from level tools. | No |
| **Cursor Magnet** | `Wand2` | `Sparkles` | `Wand2` - Metaphor for interactive mouse pointer magnetizing. | Sparkle ticks at tip. | Muted wand stick. | "Enable cursor magnetism" | Distinct from master snap. | No |
| **master Snapping** | `Magnet` | `Link2` | `Magnet` - Global toggle matching quick controls. | Solid fill; active color. | Gray slash overlay. | "Toggle global snapping" | Shares Quick Bar status. | No |
| **Endpoint** | `Square` | `SquareDot` | `Square` - Universal CAD endpoint snap marker. | Solid square marker. | Muted box. | "Snap to line endpoints" | Distinct from add void. | No |
| **Midpoint** | `Triangle` | `TriangleAlert` | `Triangle` - Universal CAD midpoint snap marker. | Solid triangle marker. | Muted triangle outline. | "Snap to line midpoints" | Avoids warning indicators. | No |
| **Perpendicular** | `custom:perpendicular` | `Angle` | `custom:perpendicular` - Right-angle intersection marker. | Accent right-angle square. | Gray corner box. | "Snap perpendicular to line" | No Lucide equivalent. | **Yes** |
| **Intersection** | `custom:intersection` | `Plus` | `custom:intersection` - Crossing diagonal snap target. | Solid crosshair intersection.| Muted lines intersection. | "Snap to line intersections" | Distinct from add cells. | **Yes** |
| **connection anchor** | `Anchor` | `Link2` | `Anchor` - Marks physical connection terminals on nodes. | Accent anchor hook tint. | Gray outline. | "Snap to connection anchors" | Clean from diagrams. | No |
| **Auto-link** | `GitCommit` | `Link2` | `GitCommit` - Represents automatic node-to-node links. | Highlighted node dots. | Open line. | "Auto-link nearby spaces" | Avoids document link icons. | No |
| **annotation anchor** | `Pin` | `MapPin` | `Pin` - Pinpoint anchor for technical callouts. | Solid pin tip. | Gray pin head. | "Snap annotations to cell nodes" | Clear of map pins. | No |
| **leader attachment**| `CornerDownRight` | `GitMerge` | `CornerDownRight` - Represents callout leader line routing. | Bold vector angle. | Hairline corner. | "Snap annotation leader lines" | Clear of git versioning. | No |

---

## Canvas Editing Launchers

| Command | Primary Lucide Key | Alternate Key | Recommended Selection & Reasoning | Active-State Treatment | Off/Disabled-State Treatment | Tooltip / ARIA Label | Collision Check | Custom Glyph Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Select** | `MousePointer2` | `Hand` | `MousePointer2` - Standard cursor selection tool. | Active pointer scale; color. | Neutral gray pointer. | "Select spaces and elements" | Clean from snapping pointer. | No |
| **Target** | `Crosshair` | `Locate` | `Crosshair` - Precise canvas targeting/focus tool. | Pulse animations; red. | Black circle. | "Target cell for editing" | Specifically distinct from Select. | No |
| **Arrange** | `BringToFront` | `SendToBack` | `BringToFront` - Visual layering and sorting command. | Accent layers highlight. | Flat layers. | "Arrange element layering" | Distinct from zoning grids. | No |
| **Connect** | `Cable` | `GitBranch` | `Cable` - Physical routing wire/line link. | Accent cable nodes. | Muted wire line. | "Establish connection path" | Distinguish from share link. | No |
| **Material** | `Palette` | `Paintbrush` | `Palette` - Accesses full material library/browser. | Palette color swatches active.| Outline paint pot. | "Open Material Browser" | Distinguish from color picker. | No |
| **Preset** | `Sparkles` | `Bookmark` | `Sparkles` - Visual presets and quick styles. | Glow shadow overlay. | Flat gray stars. | "Apply visual presets" | Avoids file bookmarks. | No |
| **Markup** | `PenTool` | `Highlighter` | `PenTool` - Freehand sketching and plan markup. | Ink tip highlighted. | Cap on pen. | "Open drawing markup tools" | Clear of UI pencils. | No |
| **Detail** | `Maximize2` | `ZoomIn` | `Maximize2` - Technical detail zooming callout. | Accent scaling box. | Standard crop boxes. | "Open detail sheet viewer" | Distinct from collapse panels. | No |
| **Inspector** | `SlidersHorizontal` | `Info` | `SlidersHorizontal` - Unambiguous system configuration. | Active slider positions color.| Inline static sliders. | "Open Cell Inspector panel" | Specifically distinct from Info. | No |
| **Add Cell** | `Plus` | `PlusCircle` | `Plus` - Clean, lightweight cell adding tool. | Bold outline. | Muted outline. | "Add new Space Cell" | Avoids duplicate additions. | No |
| **Add Cluster** | `Boxes` | `PackagePlus` | `Boxes` - Represents structural packing/groups of cells. | Segmented boxes active fill. | Flat boxes outline. | "Create Cell Cluster" | Avoids generic directory box. | No |
| **Add Void** | `CircleSlash` | `MinusCircle` | `CircleSlash` - Subtractive layout void stamp. | Red accents / active. | Muted circle outline. | "Stamp subtractive layout Void" | Avoids trash deletions. | No |
| **Import** | `FileUp` | `FolderOpen` | `FileUp` - Imports drawing project files. | Icon upload arrow animates. | Neutral arrow. | "Import MOOORF project" | Clear of general cloud files. | No |
| **Export** | `FileDown` | `Share` | `FileDown` - Exports current vector project files. | Icon download arrow highlights.| Neutral arrow. | "Export drawing project" | Avoids web share links. | No |
| **Saved Views** | `Camera` | `Eye` | `Camera` - Standard snapshot viewport reference. | Lens color active. | Muted body outline. | "Open Saved Views gallery" | Distinguish from canvas views. | No |
| **Random Arrangement**| `Shuffle` | `Dices` | `Shuffle` - Procedural arrangement shuffle. | Colored directional arrows. | Gray flat paths. | "Randomize cell arrangement" | Avoids game dice. | No |
