# Drawable Symbol Gap Audit - Second Pass

This document details the second-pass drawable-symbol gap audit for the MOOORF spatial canvas, evaluating architectural families and custom candidates to ensure professional plan drafting fidelity.

## Catalog Summary and Baseline

- **Baseline/Current symbols**: 77
- **Proposed Lucide Candidates to ADD**: 59
- **Proposed Lucide Candidates to ALIAS**: 14
- **Twelve Additional Custom-Gap Candidates (Pending Owner Approval)**: 12
- **Eight Original Custom Symbols (Approved Briefs)**: 8
- **Projected Research Ceiling**: **156 active geometries** / **176 searchable IDs** (including 20 custom-related symbols, 59 new Lucide symbols, 14 new aliases, and 6 baseline aliases)

> [!IMPORTANT]
> The final count of 156 active geometries and 176 searchable IDs is a projected research ceiling. It is **not** automatically approved M2 scope. Baseline and verified Lucide candidates will be staged first. Custom symbols require explicit Owner approval, and later structural/MEP/program symbols can be released as later domain packs.

---

## Gap Audit Matrix: Twelve Additional Custom-Gap Candidates

The following 12 additional custom-gap candidates are research specifications representing critical floor-planning gaps. They are **not** production-approved and require explicit Owner approval before implementation.

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

### 4. Circulation Family

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

### 5. Site and Mobility Family

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
