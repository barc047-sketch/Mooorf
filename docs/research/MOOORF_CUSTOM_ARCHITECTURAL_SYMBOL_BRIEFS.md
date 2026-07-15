# MOOORF Custom Architectural Symbol Briefs

This document defines the vector specifications and construction briefs for the **eight original MOOORF custom architectural symbols**. These specifications serve as implementation-ready design blueprints for the production SVG implementation.

> [!NOTE]
> This document only contains the briefs for the 8 approved original custom symbols. The 12 additional custom-gap candidates identified in the gap audit (`M2_DRAWABLE_SYMBOL_GAP_PASS_2.md`) are separate research candidates and do **not** have full briefs here, as they are pending Owner approval.

---

## 1. Elevator Lift Cab

- **User Meaning**: Indicates a vertical transportation shaft cabin location, showing layout, dimensions, and door orientation.
- **Orientation**: Plan view (horizontal layout).
- **Geometry Construction Rules**:
  - Outer boundary: Square envelope of width and height matching cell bounds (1:1 aspect ratio).
  - sliding doors: Two thin parallel offset rectangles along the bottom edge, parted in the center to show a center-opening lift door.
  - Interior handrail: Single offset line along the remaining three sides with 1.5px padding.
  - Entry indicator: Centered arrow starting from exterior, pointing inside the cabin across the door line.
- **Optical Grid & Safe Zone**: 24px base grid; 2px padding safe zone on all sides (effective 20px x 20px design area).
- **Stroke/Fill Behaviour**: Strokes are 1.5px width; outer boundary has solid fill with 10% opacity, sliding doors have solid accent fill, entry arrow is stroke-only.
- **Open/Closed Path Rules**: Closed paths for cabin box and door panels; open path for handrail and entry arrow.
- **Minimum Readable Size**: 16px.
- **16/20/24/32 px Behaviour**: At 16px, simplify interior handrail to a single back-wall line and scale doors to 2px thickness. At 24px and above, show full multi-panel doors and handrail offset.
- **Rotation Behaviour**: Rotates in 90-degree increments to align with shaft entry points.
- **Tint/Backing Compatibility**: Transparent inner cabin to let floor materials show; solid backing behind door panels.
- **Search Tags**: elevator, lift, vertical-circulation, cab, cabin, shaft, transport.
- **Accessible Label**: Elevator cabin plan view.
- **Category**: `circulation`.
- **Likely Confusion Risks**: Avoid looking like a generic double-door entry or a simple cargo container box.
- **Export Requirements**: Must export cleanly to SVG path elements; do not use overlapping stroke boundaries.
- **Rejection Criteria for Misleading Substitutes**: Reject any Lucide keys like `ArrowUpDown` (generic arrow) or `Building` (facade) for this plan symbol.

---

## 2. Stairs Plan View

- **User Meaning**: Indicates a staircase run in plan view, showing riser treads, landing direction, and the upper-level cut line.
- **Orientation**: Plan view.
- **Geometry Construction Rules**:
  - Outer boundary: Rectangular bounding box with 1:2 aspect ratio.
  - Treads: Nine parallel lines spaced at equal intervals representing steps.
  - Up Arrow: Central line running across the treads, starting with a small circle (base step) and ending with a filled arrowhead (high step).
  - Cut Line: A diagonal double-zig-zag break line (standard drafting notation) cutting across the treads at 2/3 height. All treads past the cut line are rendered as dashed lines.
- **Optical Grid & Safe Zone**: 24px base grid; 1px horizontal and 2px vertical safe zone.
- **Stroke/Fill Behaviour**: 1.5px main boundary and treads; 1.0px arrow line and diagonal break line. Treads past break line are dashed (2px dash, 2px gap).
- **Open/Closed Path Rules**: Closed outer box; all treads, break line, and arrow are open paths.
- **Minimum Readable Size**: 20px (due to riser line density).
- **16/20/24/32 px Behaviour**: At 16px, reduce steps to five and remove the break line (show continuous treads). At 24px and above, render all nine steps with the diagonal break.
- **Rotation Behaviour**: Rotates freely in 90-degree steps to show stair run directions.
- **Tint/Backing Compatibility**: Backing must be transparent to allow stair treads to layer over floor textures.
- **Search Tags**: stairs, staircase, steps, vertical-circulation, stairwell, escape-route.
- **Accessible Label**: Stairs run plan view.
- **Category**: `circulation`.
- **Likely Confusion Risks**: Do not confuse with horizontal window slats or generic linear grids.
- **Export Requirements**: Vector path points must snap to integer grid values.
- **Rejection Criteria for Misleading Substitutes**: Reject Lucide `ChevronsUp` or `Grid` wrappers; stairs require a technical break line and directional arrow.

---

## 3. Escalator Section

- **User Meaning**: Indicates an escalator vertical run in cross-section view (typically for double-height space section drawings).
- **Orientation**: Section view.
- **Geometry Construction Rules**:
  - Diagonal Truss: Parallel diagonal lines running at a standard 30-degree angle.
  - Steps: Repeating zig-zag stepping profile along the diagonal run, transitioning to horizontal landing segments at both top and bottom.
  - Handrail: Continuous smooth glass balustrade outline running parallel above the steps with offset support brackets.
  - Direction Indicator: Double-arrowhead indicator at the side showing upward/downward movement.
- **Optical Grid & Safe Zone**: 24px grid; 2px padding safe zone.
- **Stroke/Fill Behaviour**: 1.5px structural framing; 1.0px zig-zag step profile and handrail.
- **Open/Closed Path Rules**: Closed balustrade loops; open zig-zag paths for step surfaces.
- **Minimum Readable Size**: 20px.
- **16/20/24/32 px Behaviour**: At 16px, simplify the step zig-zags to a single diagonal line and show balustrade as solid stroke only. At 24px, show detailed stepping profile.
- **Rotation Behaviour**: Mirroring horizontal flip instead of arbitrary rotation.
- **Tint/Backing Compatibility**: Balustrade can use a 20% transparent glass-blue tint.
- **Search Tags**: escalator, moving-stairs, mechanical-circulation, transit.
- **Accessible Label**: Escalator vertical section view.
- **Category**: `circulation`.
- **Likely Confusion Risks**: Avoid looking like a generic industrial conveyor belt.
- **Export Requirements**: Path coordinates must use relative bezier curve data.
- **Rejection Criteria for Misleading Substitutes**: Reject Lucide `ArrowUpRight` or linear step symbols.

---

## 4. Wardrobe Plan Outline

- **User Meaning**: Indicates a built-in wardrobe or closet storage cabinet, showing rod layout and drawer depths.
- **Orientation**: Plan view.
- **Geometry Construction Rules**:
  - Outer casing: Rectangular box matching wall recesses.
  - Hanging Rod: Double thin parallel lines running along the longitudinal centerline with 3px separation.
  - Hanger clips: Short diagonal tick marks projecting from the rod at 4px spacing to represent hangers.
- **Optical Grid & Safe Zone**: 24px grid; 1px padding.
- **Stroke/Fill Behaviour**: 1.5px outer cabinet casing; 1.0px hanging rod and tick marks.
- **Open/Closed Path Rules**: Closed cabinet box; open rod lines and ticks.
- **Minimum Readable Size**: 16px.
- **16/20/24/32 px Behaviour**: At 16px, simplify hanging rod to a single line and omit hanger ticks. At 24px, display detailed ticks and drawers.
- **Rotation Behaviour**: Rotates in 90-degree increments to snap against partition walls.
- **Tint/Backing Compatibility**: Cabinet space has optional white backing to mask floor materials underneath.
- **Search Tags**: wardrobe, closet, storage, cabinet, furniture, bedroom-closet.
- **Accessible Label**: Wardrobe closet outline plan.
- **Category**: `furniture`.
- **Likely Confusion Risks**: Avoid looking like a generic empty rectangle box.
- **Export Requirements**: Overlapping corners must be welded to single vertices.
- **Rejection Criteria for Misleading Substitutes**: Reject Lucide `Archive` (file boxes) or `Folder` templates.

---

## 5. Sink Plan

- **User Meaning**: Indicates a wash basin or plumbing sink fixture, showing bowl dimensions, mixer location, and drainage point.
- **Orientation**: Plan view.
- **Geometry Construction Rules**:
  - Outer rim: Rounded rectangle or circle (depending on style).
  - Inner bowl: Offset curve mimicking outer shape, spaced 2px inward.
  - Faucet Mixer: Small rectangle projecting from the back center wall, with two hot/cold tap notches.
  - Drain point: Small circle at the center of the inner bowl.
- **Optical Grid & Safe Zone**: 24px grid; 2px padding.
- **Stroke/Fill Behaviour**: 1.5px outer rim; 1.0px inner bowl, faucet, and drain circle.
- **Open/Closed Path Rules**: Closed outer rim and inner basin; open faucet ticks.
- **Minimum Readable Size**: 16px.
- **16/20/24/32 px Behaviour**: At 16px, simplify faucet to a single tick and inner bowl to a basic circle. At 24px, render double tap knobs and basin drain holes.
- **Rotation Behaviour**: Rotates in 90-degree steps to align with countertops.
- **Tint/Backing Compatibility**: Inner bowl uses white/light gray backing to cover counter texture.
- **Search Tags**: sink, washbasin, basin, vanity, bathroom-fixture, plumbing.
- **Accessible Label**: Wash basin sink plan.
- **Category**: `sanitary`.
- **Likely Confusion Risks**: Do not confuse with kitchen pans or generic round containers.
- **Export Requirements**: Clean geometric circles for drains.
- **Rejection Criteria for Misleading Substitutes**: Reject Lucide `ShowerHead` or generic circles.

---

## 6. Fence Gate Swing

- **User Meaning**: Indicates a perimeter fence or landscape gate location with swing path clearance.
- **Orientation**: Plan view.
- **Geometry Construction Rules**:
  - Gate posts: Two small solid-filled squares at the perimeter ends.
  - Gate leaf: A straight thin line extending diagonally (at 45 degrees) from one of the posts.
  - Swing Path: A thin, dashed 90-degree arc curve connecting the tip of the open gate leaf to the opposite gate post.
- **Optical Grid & Safe Zone**: 24px grid; 2px safe zone.
- **Stroke/Fill Behaviour**: 1.5px posts and leaf; 1.0px dashed swing path. Posts have solid black fill.
- **Open/Closed Path Rules**: Closed square posts; open path leaf and arc.
- **Minimum Readable Size**: 16px.
- **16/20/24/32 px Behaviour**: Scale line weights and post dimensions proportionally. Dash spacing must scale (1.5px dash at 16px, 3px dash at 24px).
- **Rotation Behaviour**: Mirrors and rotates to align with site fences.
- **Tint/Backing Compatibility**: Keep center swing area transparent to avoid covering landscape grass textures.
- **Search Tags**: gate, fence-gate, door-swing, entry, barrier.
- **Accessible Label**: Fence gate swing path outline.
- **Category**: `landscape`.
- **Likely Confusion Risks**: Do not mix up with building doors; fence posts must be highly distinct.
- **Export Requirements**: Swing arc must use a true circular path segment.
- **Rejection Criteria for Misleading Substitutes**: Reject standard door symbols or Lucide `DoorOpen`.

---

## 7. Floor Drain

- **User Meaning**: Indicates a floor drainage grate in wet rooms or service shafts.
- **Orientation**: Plan view.
- **Geometry Construction Rules**:
  - Outer rim: Concentric double square or circle.
  - Grate patterns: A series of parallel horizontal and vertical slots forming a cross-mesh grid.
  - Center screw: Tiny filled circular point at the intersection of grid lines.
- **Optical Grid & Safe Zone**: 24px grid; 2px safe zone.
- **Stroke/Fill Behaviour**: 1.5px outer rim; 1.0px internal grate slots.
- **Open/Closed Path Rules**: Closed outer boundary; open slot line segments.
- **Minimum Readable Size**: 16px.
- **16/20/24/32 px Behaviour**: At 16px, simplify grate slots to a single 4-quadrant crosshair. At 24px, show detailed 3x3 slot grid.
- **Rotation Behaviour**: Unaffected by rotation (symmetrical).
- **Tint/Backing Compatibility**: Inner grates have black fill with 15% opacity to show recess depth.
- **Search Tags**: drain, floor-drain, plumbing-drain, gully, waste-water.
- **Accessible Label**: Floor drainage drain grate.
- **Category**: `sanitary`.
- **Likely Confusion Risks**: Avoid looking like a generic ventilation grill or grid node.
- **Export Requirements**: Grate slot paths must use relative coordinates.
- **Rejection Criteria for Misleading Substitutes**: Reject Lucide `Grid` or `Hash` keys.

---

## 8. Architectural Section Cut

- **User Meaning**: Indicates a vertical cross-section line reference, showing cut direction and detail sheets.
- **Orientation**: Plan view (annotation annotation marker).
- **Geometry Construction Rules**:
  - Cut Line: A solid line extending from the detail circle.
  - Arrowhead: A large, equilateral triangle pointing in the view direction, attached directly to the circle.
  - Reference Circle: A split circle with a horizontal divider; top half holds Detail Number, bottom half holds Sheet Reference.
- **Optical Grid & Safe Zone**: 24px grid; 1px padding.
- **Stroke/Fill Behaviour**: 2.0px cut line and circle boundary; triangle arrowhead is solid black filled.
- **Open/Closed Path Rules**: Closed circle and triangle; open cut line.
- **Minimum Readable Size**: 24px (due to technical text scaling).
- **16/20/24/32 px Behaviour**: Only scales to standard annotation sizes (24px and 32px); not used at 16px.
- **Rotation Behaviour**: Rotates in 45-degree increments to show view directions.
- **Tint/Backing Compatibility**: Solid white backing inside reference circle to ensure text legibility.
- **Search Tags**: section, section-cut, detail-callout, elevation-tag, marker.
- **Accessible Label**: Architectural section cut line.
- **Category**: `annotation`.
- **Likely Confusion Risks**: Do not confuse with directional traffic arrows or level markers.
- **Export Requirements**: Clean separation of text elements from path boundaries.
- **Rejection Criteria for Misleading Substitutes**: Reject Lucide `ArrowUp` or generic slice wedges.
