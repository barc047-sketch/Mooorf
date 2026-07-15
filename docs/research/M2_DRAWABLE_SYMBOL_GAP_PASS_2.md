# Drawable Symbol Gap Audit - Second Pass

This document details the second-pass drawable-symbol gap audit for the MOOORF spatial canvas, evaluating architectural families and custom candidates to ensure professional plan drafting fidelity.

## Catalog Summary and Baseline

- **Existing Projected Geometries**: 144
- **Existing Searchable IDs**: 164 (including aliases)
- **New Recommended Geometries**: 20 (after auditing structural, sanitary, MEP, circulation, furniture, site, program, and annotation gaps)
- **Total Projected Geometries**: 164
- **Total Projected Searchable IDs**: 184 (including aliases)

---

## Gap Audit Matrix

### 1. Structural Family

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:structural:column` |
| **Display Name** | **Structural Column** |
| **Proposed Category** | `structural` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| column, pillar, structural-support, grid-node, concrete-column, steel-column |
| **Accessible Label** | Structural column marker |
| **Architectural Use** | Represents columns, load-bearing piers, or structural grid intersection members. |
| **Placeable Target** | `space` or grid intersection |
| **Visual Warning** | Do not confuse with generic UI dots or Core presentation elements. |
| **Collision Check** | Deduplicated against existing `layout-grid` and `grid` diagram icons. |
| **Priority** | **ESSENTIAL** |
| **Recommendation** | **ADD CUSTOM** - Standard architectural crosshair or solid filled circle/rectangle on a 24px grid. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:structural:beam` |
| **Display Name** | **Structural Beam** |
| **Proposed Category** | `structural` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| beam, girder, joist, header, framing, load-bearing |
| **Accessible Label** | Structural beam framing line |
| **Architectural Use** | Indicates overhead beams, transfer girders, or floor framing joist directions. |
| **Placeable Target** | `membrane` or `boundary` |
| **Visual Warning** | Must not look like standard cell boundaries; represented as dashed parallel lines. |
| **Collision Check** | No conflict with existing line representations. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Dash-patterned double line to show overhead structural framing. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:structural:wall` |
| **Display Name** | **Shear Wall Section** |
| **Proposed Category** | `structural` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| wall, shear-wall, concrete-wall, partition, brick-wall, load-bearing-wall |
| **Accessible Label** | Structural shear wall section |
| **Architectural Use** | Indicates structural shear walls, core wall sections, or massive partition plans. |
| **Placeable Target** | `space` or `boundary` |
| **Visual Warning** | Must be visually distinct from single line boundaries; uses double parallel lines with hatch. |
| **Collision Check** | Clear from cell boundaries. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Hashed double-line segment showing concrete or masonry wall thickness. |

---

### 2. Sanitary and Plumbing Family

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:sanitary:urinal-plan` |
| **Display Name** | **Urinal Plan View** |
| **Proposed Category** | `sanitary` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| urinal, wc, toilet, bathroom, restroom, plumbing-fixture |
| **Accessible Label** | Urinal fixture plan outline |
| **Architectural Use** | Indicates wall-mounted urinal fixture placements in commercial washrooms. |
| **Placeable Target** | `space` wall edges |
| **Visual Warning** | Avoid confusion with standard toilets or sinks; must show the clear projection cup. |
| **Collision Check** | Clean from Lucide `Toilet` icon. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Front wall attachment and oval cup projection matching plumbing standards. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:sanitary:bathtub-plan` |
| **Display Name** | **Bathtub Plan** |
| **Proposed Category** | `sanitary` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| bathtub, tub, bath, shower, bathroom, plumbing-fixture, wellness |
| **Accessible Label** | Bathtub fixture plan outline |
| **Architectural Use** | Outlines bathtub layout locations in residential and hotel washrooms. |
| **Placeable Target** | `space` corner or wall edge |
| **Visual Warning** | Do not confuse with simple rectangular tables. Must include drain circle and bevel edge. |
| **Collision Check** | Avoids overlap with dining table or desk layouts. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Rectangular tub outline with rounded inner tub walls and drain point. |

---

### 3. MEP and Life Safety Family

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:mep:electrical-panel` |
| **Display Name** | **Electrical Panel** |
| **Proposed Category** | `service` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| electrical-panel, db-box, breaker-panel, switchboard, electric-meter |
| **Accessible Label** | Electrical distribution panel |
| **Architectural Use** | Marks distribution boards, electrical panels, and service switchboards. |
| **Placeable Target** | `space` wall surface |
| **Visual Warning** | Must follow standard symbol: rectangle divided diagonally, one half solid black. |
| **Collision Check** | Distinct from any generic Lucide box or split icon. |
| **Priority** | **ESSENTIAL** |
| **Recommendation** | **ADD CUSTOM** - Standard divided technical black/white panel rectangle. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:mep:hvac-supply` |
| **Display Name** | **HVAC Supply Diffuser** |
| **Proposed Category** | `service` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| hvac-supply, diffuser, ac-vent, duct-supply, ventilation, cooling |
| **Accessible Label** | HVAC supply diffuser ceiling outlet |
| **Architectural Use** | Marks supply air diffusers and grilles on reflected ceiling or mechanical plans. |
| **Placeable Target** | `space` ceiling or duct path |
| **Visual Warning** | Avoid collision with simple crosshairs. Square with a smaller square and arrows. |
| **Collision Check** | Clean separation from structural column and intersection markers. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Three-tiered concentric square diffuser with outward air arrows. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:mep:hvac-return` |
| **Display Name** | **HVAC Return Grille** |
| **Proposed Category** | `service` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| hvac-return, exhaust-grille, ac-return, ventilation, air-extract |
| **Accessible Label** | HVAC return air grille |
| **Architectural Use** | Marks return or exhaust air grilles on reflected ceiling/MEP plans. |
| **Placeable Target** | `space` ceiling or duct path |
| **Visual Warning** | Must follow standard: square with a single diagonal slash, indicating return. |
| **Collision Check** | Distinct from custom section cut line or structural columns. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Technical square with single diagonal slash. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:mep:sprinkler` |
| **Display Name** | **Fire Sprinkler** |
| **Proposed Category** | `service` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| sprinkler, fire-protection, safety, fire-suppression, ceiling-sprinkler |
| **Accessible Label** | Fire protection sprinkler head |
| **Architectural Use** | Marks automatic fire sprinkler heads on life safety and MEP layouts. |
| **Placeable Target** | `space` ceiling |
| **Visual Warning** | Small size readability is critical; represented as circle with small outer ticks. |
| **Collision Check** | Distinct from simple dots or circles. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Circle with four crosshair ticks and center dot. |

---

### 4. Furniture and Fixtures Family

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:furniture:dining-table-layout` |
| **Display Name** | **Dining Table Plan** |
| **Proposed Category** | `architecture` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| dining-table, table-chairs, seating-layout, furniture, dining-group |
| **Accessible Label** | Dining table and chairs layout |
| **Architectural Use** | Shows dining furniture arrangements, spacing, and circulation requirements. |
| **Placeable Target** | `space` interior |
| **Visual Warning** | Do not confuse with a spreadsheet table. Must show table outline with perimeter chairs. |
| **Collision Check** | Clean from Lucide `Table` (spreadsheet layout). |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Circular or rectangular central table with 4 or 6 offset chair boxes. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:furniture:kitchen-counter-sink` |
| **Display Name** | **Kitchen Counter and Sink** |
| **Proposed Category** | `architecture` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| kitchen-counter, counter-sink, cooktop, pantry-layout, kitchen-cabinet |
| **Accessible Label** | Kitchen counter and sink layout |
| **Architectural Use** | Indicates kitchen pantry worktops, built-in sinks, and appliance layouts. |
| **Placeable Target** | `space` perimeter |
| **Visual Warning** | Must not look like a simple office desk. Must show faucet and basin outlines. |
| **Collision Check** | Different from bathroom `sink-layout` or `wardrobe-layout`. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Counter edge line with integrated double-basin sink and faucet outline. |

---

### 5. Circulation Family

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:circulation:ramp-plan` |
| **Display Name** | **Access Ramp Plan** |
| **Proposed Category** | `wayfinding` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| ramp, access-ramp, wheelchair-ramp, slope, transition |
| **Accessible Label** | Access ramp slope indicator |
| **Architectural Use** | Indicates changes in level with handicap access ramps and slope arrows. |
| **Placeable Target** | `space` transition zone |
| **Visual Warning** | Must show gradient arrow starting from low point pointing up. |
| **Collision Check** | Distinct from generic circulation directional arrows. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Parallel ramp lines with center direction line and arrowhead pointing UP. |

---

### 6. Site and Mobility Family

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:site:bench-layout` |
| **Display Name** | **Park Bench Plan** |
| **Proposed Category** | `landscape` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| bench, park-bench, outdoor-seating, landscape-seating |
| **Accessible Label** | Outdoor bench layout plan |
| **Architectural Use** | Outlines park benches, urban furniture, and public plaza seating groups. |
| **Placeable Target** | `space` or exterior landscape |
| **Visual Warning** | Avoid collision with simple wall segments. Must show backrest and armrest slats. |
| **Collision Check** | Distinct from interior `Sofa` or `Chair` icons. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Slatted rectangular outline showing backrest and armrest projections. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:site:bollard` |
| **Display Name** | **Security Bollard** |
| **Proposed Category** | `landscape` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| bollard, post, barrier, security-bollard, boundary-post, traffic-bollard |
| **Accessible Label** | Traffic security bollard |
| **Architectural Use** | Marks traffic control bollards, security posts, and pedestrian zone protection. |
| **Placeable Target** | `space` exterior edge |
| **Visual Warning** | Do not confuse with structural columns. Typically drawn as small circle with cross mark. |
| **Collision Check** | Avoids column collision by using smaller scale and double concentric circles. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Small concentric double circle indicating post top and foot base. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:site:fence-layout` |
| **Display Name** | **Fence Line Layout** |
| **Proposed Category** | `landscape` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| fence, wall, railing, property-line, barrier |
| **Accessible Label** | Property fence boundary |
| **Architectural Use** | Outlines boundary fences, perimeter screens, or balustrades. |
| **Placeable Target** | `membrane` or `boundary` |
| **Visual Warning** | Must look like standard fence notation (a line with regular cross marks). |
| **Collision Check** | Distinct from cell boundaries or wall hatch lines. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Vector line segment intersected by short perpendicular post ticks at 4px spacing. |

---

### 7. Programmatic/Special Space Family

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:program:healthcare` |
| **Display Name** | **Healthcare Clinic** |
| **Proposed Category** | `accessibility` |
| **Source Type** | `LUCIDE` |
| **Exact Lucide Key** | `HeartPulse` |
| **Verified Availability**| Yes (`lucide-react@1.23.0`) |
| **Licence/Provenance** | ISC License (Lucide Contributors) |
| **Search Tags / Aliases**| clinic, hospital, first-aid, medical, doctor, wellness |
| **Accessible Label** | Medical clinic and healthcare symbol |
| **Architectural Use** | Marks medical rooms, nursing stations, wellness rooms, or first-aid zones. |
| **Placeable Target** | `space` |
| **Visual Warning** | Avoid mixing with accessibility `heart` or `help` symbols. |
| **Collision Check** | Deduplicated from simple `Heart`. |
| **Priority** | **ESSENTIAL** |
| **Recommendation** | **ADD LUCIDE** - Use `HeartPulse` for healthcare and medical clinic zones. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:program:industrial` |
| **Display Name** | **Industrial Facility** |
| **Proposed Category** | `service` |
| **Source Type** | `LUCIDE` |
| **Exact Lucide Key** | `Factory` |
| **Verified Availability**| Yes (`lucide-react@1.23.0`) |
| **Licence/Provenance** | ISC License (Lucide Contributors) |
| **Search Tags / Aliases**| industrial, factory, mechanical-room, plant-room, workshop, warehouse |
| **Accessible Label** | Industrial plant and factory symbol |
| **Architectural Use** | Marks plant rooms, manufacturing floors, warehouse zones, and heavy services. |
| **Placeable Target** | `space` |
| **Visual Warning** | Must look industrial, with saw-tooth factory roof silhouette. |
| **Collision Check** | Distinct from civic landmark or office workspace. |
| **Priority** | **ESSENTIAL** |
| **Recommendation** | **ADD LUCIDE** - Use `Factory` to represent industrial and heavy mechanical zones. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:program:worship-neutral` |
| **Display Name** | **Quiet Sanctuary / Worship** |
| **Proposed Category** | `accessibility` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| worship, prayer, sanctuary, meditation, quiet, faith |
| **Accessible Label** | Multi-faith quiet sanctuary symbol |
| **Architectural Use** | Indicates multi-faith prayer rooms, meditation spaces, or quiet sanctuaries. |
| **Placeable Target** | `space` |
| **Visual Warning** | Must remain neutral. Do not use church, mosque, or specific religious silhouettes. |
| **Collision Check** | Distinct from generic quiet ear-off or wellness heart symbols. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Simple outline circle enclosing a stylized flame or radiant energy waves, representing light and reflection neutrally. |

---

### 8. Technical Annotation Family

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:annotation:level-marker` |
| **Display Name** | **Elevation Level Marker** |
| **Proposed Category** | `annotation` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| level-marker, elevation, height-datum, floor-level, datum |
| **Accessible Label** | Floor elevation level marker |
| **Architectural Use** | Indicates finished floor levels, datums, or heights in section/elevation views. |
| **Placeable Target** | `space` or level lines |
| **Visual Warning** | Technical drafting representation. Quarters filled black/white diagonally. |
| **Collision Check** | Distinct from center alignment or compass targets. |
| **Priority** | **ESSENTIAL** |
| **Recommendation** | **ADD CUSTOM** - Circle with crosshairs, top-right and bottom-left quadrants filled solid. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:annotation:elevation-marker` |
| **Display Name** | **Elevation Reference Tag** |
| **Proposed Category** | `annotation` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| elevation-marker, view-tag, direction-tag, detail-tag |
| **Accessible Label** | Elevation view reference tag |
| **Architectural Use** | Directs drawings to specific interior elevation views. |
| **Placeable Target** | `space` center |
| **Visual Warning** | Arrowhead pointing to the elevation direction with a coordinate circle. |
| **Collision Check** | Clean from general direction arrows. |
| **Priority** | **ESSENTIAL** |
| **Recommendation** | **ADD CUSTOM** - Square box with pointed arrow heads pointing in active elevation directions. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:annotation:revision-marker` |
| **Display Name** | **Revision Cloud Tag** |
| **Proposed Category** | `annotation` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| revision-tag, revision-delta, change-marker, markup-tag |
| **Accessible Label** | Drawing revision marker |
| **Architectural Use** | Directs markup to specific revised drawing segments. |
| **Placeable Target** | `space` or `boundary` |
| **Visual Warning** | Standard delta symbol: equilateral triangle enclosing a revision number. |
| **Collision Check** | Distinct from generic warning triangles. |
| **Priority** | **USEFUL** |
| **Recommendation** | **ADD CUSTOM** - Technical delta triangle outline with clear central numeral area. |

| Field | Details |
| :--- | :--- |
| **Canonical ID** | `icon:annotation:detail-marker` |
| **Display Name** | **Detail Callout Marker** |
| **Proposed Category** | `annotation` |
| **Source Type** | `CUSTOM` |
| **Exact Lucide Key** | N/A |
| **Verified Availability**| N/A |
| **Licence/Provenance** | Proprietary MOOORF Original |
| **Search Tags / Aliases**| detail-tag, callout-tag, detail-bubble, magnifying-tag |
| **Accessible Label** | Drawing detail reference callout |
| **Architectural Use** | Refers drawing reader to larger scale detail sheets (e.g. wall sections). |
| **Placeable Target** | `space` or `boundary` detail points |
| **Visual Warning** | Standard drafting format: circle split horizontally by a dividing line. |
| **Collision Check** | Distinct from simple cell cores or level markers. |
| **Priority** | **ESSENTIAL** |
| **Recommendation** | **ADD CUSTOM** - 24px split circle, top half for detail number, bottom half for sheet reference. |
