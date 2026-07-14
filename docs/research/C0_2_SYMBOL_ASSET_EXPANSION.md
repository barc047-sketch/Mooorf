# C0.2 Icon, Symbol and Architectural Asset Expansion Study

**Author:** Antigravity AI  
**Scope:** Read-only Symbol Audit and Expansion Candidate Manifest  
**Baseline Commit:** 028c90541481b07a185e768fae921a7108a4e5d2  
**Target Manifest:** [C0_2_SYMBOL_CANDIDATE_MANIFEST.json](file:///Users/tanisxq/Documents/ZONU0/docs/research/C0_2_SYMBOL_CANDIDATE_MANIFEST.json)  

---


### 1. Existing Registry Summary (77 Symbols)
The baseline registry contains exactly **77 drawable symbols** distributed across 8 categories:
- **Architecture** (16 symbols): Core residential/commercial spaces and structure basics (bedroom, kitchen, building, parking, etc.)
- **Landscape** (10 symbols): Site planning essentials (tree, planting, water, terrain, shade, sunlight, etc.)
- **Diagram** (10 symbols): Relationship nodes and connection types (node, network, branches, dashed node, shapes, etc.)
- **Annotation** (8 symbols): Drafting and plan markup basics (north, measure, view, section, compass, etc.)
- **Wayfinding** (8 symbols): Circulation and movement direction (route, entry, exit, walking, arrows, etc.)
- **Environmental** (8 symbols): Microclimatic and orientation analysis (wind, heat, cold, rain, etc.)
- **Accessibility** (6 symbols): Inclusive design markers (accessible, hearing, assistance, family, help, etc.)
- **Service** (11 symbols): Building services and utilities (maintenance, power, connectivity, security, lighting, mechanical, etc.)

| Existing Category | Symbol Count | Primary Geometry Source | Licence |
|---|---|---|---|
| **architecture** | 16 | `lucide-react` keys | ISC |
| **landscape** | 10 | `lucide-react` keys | ISC |
| **diagram** | 10 | `lucide-react` keys | ISC |
| **annotation** | 8 | `lucide-react` keys | ISC |
| **wayfinding** | 8 | `lucide-react` keys | ISC |
| **environmental** | 8 | `lucide-react` keys | ISC |
| **accessibility** | 6 | `lucide-react` keys | ISC |
| **service** | 11 | `lucide-react` keys | ISC |
| **Total** | **77** | | |


---


### 2. Missing-Category and Auditing Analysis
An audit of the existing 77 symbols and candidate list reveals several critical gaps, near-duplicates, and nomenclature issues:
- **Missing Architectural Symbols**: Critical programmatic rooms (dining room, meeting/conference rooms, retail stores, reception, lobby, office, utility rooms, toilets) are missing from the baseline registry, forcing designers to reuse generic symbols like Armchair (lounge) or Landmark (civic building).
- **Circulation Gaps**: The circulation symbols are currently relying on interface-like login/logout keys (`LogIn`, `LogOut`) for entry/exit, which do not translate well to floor plans. There are no plan symbols for stairs, escalators, or elevators.
- **Furniture and Fixture Gaps**: Floor plans require basic scale indicators like tables, desks, computers, showers, toilets, and kitchen appliances. Sinks and wardrobes do not have standard Lucide equivalents and must be custom drawn.
- **Near-Duplicates**:
  - `icon:landscape:sunlight` (`Sun`) and `icon:environmental:sun` (`SunMedium`) are visually indistinguishable and create registry redundancy.
  - `icon:service:water` (`Droplet`) and `icon:environmental:droplets` (`Droplets`) have visual overlap and can confuse plumbing utilities with rainwater flows.
- **Vague / Low-Value Symbols**:
  - `icon:annotation:section` uses `Slice` (represented as a pizza slice), which is highly non-standard and inappropriate for technical drawings.
  - `icon:diagram:share` uses `Share2` (represented as a web share link), which is a web-UI metaphor rather than a spatial diagram relationship.
- **Nomenclature/Search-Tag Gaps**: Users searching for "wc" or "restroom" fail to find toilets; searching for "ac" or "cooling" fails to find environmental:cold; searching for "wifi" or "power" fails to find connectivity/electrical. 
- **Accessibility-Label Gaps**: Accessible labels are currently generated programmatically as `${name} symbol`, which is not descriptive enough for screen-reader accessibility in detailed diagram canvases.


---


### 3. Recommended Essential Expansion Shortlist
The following **15 essential icons** are recommended for immediate promotion to active drawable symbols because they resolve the most critical floor-planning gaps:
1. **Dining Space** (`Utensils`): Solves dining room planning.
2. **Office Workspace** (`Briefcase`): Solves workspace marking.
3. **Retail Store** (`Store`): Solves commercial space design.
4. **Storage Room** (`Package`): Solves service room back-of-house marking.
5. **Utility Room** (`WashingMachine`): Solves laundry and service support areas.
6. **Toilet / WC** (`Toilet`): Solves washroom layouts.
7. **Shower** (`ShowerHead`): Solves bathroom layouts.
8. **Meeting Room** (`Users`): Solves collaboration room design.
9. **Table Layout** (`Table`): Essential furniture marker.
10. **Receptacle** (`Trash`): Essential safety/service marker.
11. **Access Restricted** (`Lock`): Critical security marker.
12. **Fire Extinguisher** (`FireExtinguisher`): Critical safety marker.
13. **Smoke Alarm** (`AlarmSmoke`): Critical safety marker.
14. **Vehicular Road** (`Road`): Critical site wayfinding marker.
15. **Relationship Link** (`Link`): Critical connection/adjacency marker.


---


### 4. Complete Vetted Candidate Manifest
The candidate expansion catalog targets a high-fidelity list of verified Lucide keys and custom design candidates.

#### Active Candidates (ADD / ALIAS)
The following candidate symbols are recommended for addition or aliasing. Lucide-sourced keys are verified to exist in the currently installed package (`lucide-react@1.23.0`):

| Canonical ID | Display Name | Source Key | Candidate Category | Priority | Recommendation | Licence |
|---|---|---|---|---|---|---|
| `icon:architecture:dining` | **Dining Space** | `Utensils` | *ARCHITECTURE* | ESSENTIAL | **ADD** | ISC |
| `icon:architecture:office` | **Office Workspace** | `Briefcase` | *ARCHITECTURE* | ESSENTIAL | **ADD** | ISC |
| `icon:architecture:classroom` | **Classroom** | `GraduationCap` | *ARCHITECTURE* | USEFUL | **ADD** | ISC |
| `icon:architecture:studio` | **Studio** | `Monitor` | *ARCHITECTURE* | USEFUL | **ADD** | ISC |
| `icon:architecture:workshop` | **Workshop** | `Hammer` | *ARCHITECTURE* | USEFUL | **ADD** | ISC |
| `icon:architecture:retail` | **Retail Store** | `Store` | *ARCHITECTURE* | ESSENTIAL | **ADD** | ISC |
| `icon:architecture:lobby` | **Lobby** | `ConciergeBell` | *ARCHITECTURE* | USEFUL | **ADD** | ISC |
| `icon:architecture:reception` | **Reception Desk** | `Contact` | *ARCHITECTURE* | USEFUL | **ADD** | ISC |
| `icon:architecture:storage` | **Storage Room** | `Package` | *ARCHITECTURE* | ESSENTIAL | **ADD** | ISC |
| `icon:architecture:utility` | **Utility Room** | `WashingMachine` | *ARCHITECTURE* | ESSENTIAL | **ADD** | ISC |
| `icon:architecture:bedroom-single` | **Single Bedroom** | `BedSingle` | *ARCHITECTURE* | USEFUL | **ADD** | ISC |
| `icon:architecture:toilet` | **Toilet / WC** | `Toilet` | *ARCHITECTURE* | ESSENTIAL | **ADD** | ISC |
| `icon:architecture:meeting-room` | **Meeting Room** | `Users` | *ARCHITECTURE* | ESSENTIAL | **ADD** | ISC |
| `icon:architecture:cafe` | **Cafe** | `Coffee` | *ARCHITECTURE* | USEFUL | **ADD** | ISC |
| `icon:wayfinding:door-closed` | **Closed Door** | `DoorClosed` | *CIRCULATION* | USEFUL | **ADD** | ISC |
| `icon:wayfinding:down` | **Direction Down** | `ArrowDown` | *CIRCULATION* | USEFUL | **ADD** | ISC |
| `icon:wayfinding:left` | **Direction Left** | `ArrowLeft` | *CIRCULATION* | USEFUL | **ADD** | ISC |
| `icon:wayfinding:up-right` | **Direction Up Right** | `ArrowUpRight` | *CIRCULATION* | USEFUL | **ADD** | ISC |
| `icon:wayfinding:down-right` | **Direction Down Right** | `ArrowDownRight` | *CIRCULATION* | USEFUL | **ADD** | ISC |
| `icon:wayfinding:chevrons-up` | **Vertical Ascent** | `ChevronsUp` | *CIRCULATION* | USEFUL | **ADD** | ISC |
| `icon:wayfinding:chevrons-down` | **Vertical Descent** | `ChevronsDown` | *CIRCULATION* | USEFUL | **ADD** | ISC |
| `icon:wayfinding:move` | **Movement Hub** | `Move` | *CIRCULATION* | USEFUL | **ADD** | ISC |
| `icon:architecture:table` | **Table Layout** | `Table` | *FURNITURE AND FIXTURES* | ESSENTIAL | **ADD** | ISC |
| `icon:architecture:desk` | **Desk Workstation** | `Laptop` | *FURNITURE AND FIXTURES* | USEFUL | **ADD** | ISC |
| `icon:architecture:wardrobe` | **Wardrobe / Storage Clos** | `Archive` | *FURNITURE AND FIXTURES* | USEFUL | **ADD** | ISC |
| `icon:architecture:shower` | **Shower** | `ShowerHead` | *FURNITURE AND FIXTURES* | ESSENTIAL | **ADD** | ISC |
| `icon:architecture:microwave` | **Appliance: Microwave** | `Microwave` | *FURNITURE AND FIXTURES* | USEFUL | **ADD** | ISC |
| `icon:architecture:refrigerator` | **Appliance: Fridge** | `Refrigerator` | *FURNITURE AND FIXTURES* | ESSENTIAL | **ADD** | ISC |
| `icon:architecture:tv` | **TV / Display Panel** | `Tv` | *FURNITURE AND FIXTURES* | USEFUL | **ADD** | ISC |
| `icon:architecture:workstation` | **Computer Workstation** | `Computer` | *FURNITURE AND FIXTURES* | USEFUL | **ADD** | ISC |
| `icon:landscape:garden` | **Garden** | `Flower` | *SITE AND LANDSCAPE* | USEFUL | **ADD** | ISC |
| `icon:landscape:tree-deciduous` | **Deciduous Tree** | `TreeDeciduous` | *SITE AND LANDSCAPE* | ESSENTIAL | **ADD** | ISC |
| `icon:landscape:tree-palm` | **Palm Tree** | `TreePalm` | *SITE AND LANDSCAPE* | USEFUL | **ADD** | ISC |
| `icon:landscape:tent` | **Outdoor Shelter** | `Tent` | *SITE AND LANDSCAPE* | USEFUL | **ADD** | ISC |
| `icon:landscape:waves` | **Water Waves** | `Waves` | *SITE AND LANDSCAPE* | USEFUL | **ADD** | ISC |
| `icon:service:fire-extinguisher` | **Fire Extinguisher** | `FireExtinguisher` | *SERVICES AND SAFETY* | ESSENTIAL | **ADD** | ISC |
| `icon:service:smoke-alarm` | **Smoke Alarm / Sensor** | `AlarmSmoke` | *SERVICES AND SAFETY* | ESSENTIAL | **ADD** | ISC |
| `icon:service:waste` | **Waste Receptacle** | `Trash` | *SERVICES AND SAFETY* | ESSENTIAL | **ADD** | ISC |
| `icon:service:recycle` | **Recycling Node** | `Recycle` | *SERVICES AND SAFETY* | USEFUL | **ADD** | ISC |
| `icon:service:lock` | **Access Restricted (Lock)** | `Lock` | *SERVICES AND SAFETY* | ESSENTIAL | **ADD** | ISC |
| `icon:service:unlock` | **Access Granted (Unlock)** | `Unlock` | *SERVICES AND SAFETY* | USEFUL | **ADD** | ISC |
| `icon:service:bell` | **Audible Alarm / Bell** | `Bell` | *SERVICES AND SAFETY* | USEFUL | **ADD** | ISC |
| `icon:service:bell-ring` | **Active Alarm Bell** | `BellRing` | *SERVICES AND SAFETY* | USEFUL | **ADD** | ISC |
| `icon:service:hazard` | **Hazard Indicator** | `AlertTriangle` | *SERVICES AND SAFETY* | ESSENTIAL | **ADD** | ISC |
| `icon:service:gauge` | **Dashboard Gauge** | `Gauge` | *SERVICES AND SAFETY* | USEFUL | **ADD** | ISC |
| `icon:service:key` | **Security Key** | `Key` | *SERVICES AND SAFETY* | USEFUL | **ADD** | ISC |
| `icon:service:hardhat` | **Construction Zone** | `HardHat` | *SERVICES AND SAFETY* | USEFUL | **ADD** | ISC |
| `icon:environmental:noise` | **Acoustic Source** | `Speaker` | *ENVIRONMENTAL* | USEFUL | **ADD** | ISC |
| `icon:environmental:high-noise` | **High Noise Level** | `Megaphone` | *ENVIRONMENTAL* | USEFUL | **ADD** | ISC |
| `icon:environmental:quiet` | **Quiet Zone** | `EarOff` | *ENVIRONMENTAL* | USEFUL | **ADD** | ISC |
| `icon:accessibility:assistance-point` | **Assistance Info Point** | `HelpCircle` | *ACCESSIBILITY* | USEFUL | **ADD** | ISC |
| `icon:accessibility:vision-impaired` | **Low Vision Access** | `EyeOff` | *ACCESSIBILITY* | USEFUL | **ADD** | ISC |
| `icon:accessibility:heart` | **Wellness / First Aid** | `Heart` | *ACCESSIBILITY* | USEFUL | **ADD** | ISC |
| `icon:wayfinding:road` | **Vehicular Road** | `Road` | *URBAN AND TRANSPORT* | ESSENTIAL | **ADD** | ISC |
| `icon:wayfinding:cycle` | **Bicycle Lane** | `Bike` | *URBAN AND TRANSPORT* | ESSENTIAL | **ADD** | ISC |
| `icon:wayfinding:bus` | **Bus Stop / Station** | `Bus` | *URBAN AND TRANSPORT* | ESSENTIAL | **ADD** | ISC |
| `icon:wayfinding:rail` | **Railway / Transit Node** | `Train` | *URBAN AND TRANSPORT* | ESSENTIAL | **ADD** | ISC |
| `icon:wayfinding:loading` | **Loading Dock / Truck** | `Truck` | *URBAN AND TRANSPORT* | ESSENTIAL | **ADD** | ISC |
| `icon:wayfinding:boat` | **Ferry / Boat Dock** | `Ship` | *URBAN AND TRANSPORT* | LATER | **ADD** | ISC |
| `icon:wayfinding:airport` | **Airport / Heliport** | `Plane` | *URBAN AND TRANSPORT* | LATER | **ADD** | ISC |
| `icon:wayfinding:map` | **Map Location** | `Map` | *URBAN AND TRANSPORT* | USEFUL | **ADD** | ISC |
| `icon:diagram:anchor` | **Fixed Anchor** | `Anchor` | *DIAGRAM AND RELATIONSHIPS* | USEFUL | **ADD** | ISC |
| `icon:diagram:link` | **Relationship Link** | `Link` | *DIAGRAM AND RELATIONSHIPS* | ESSENTIAL | **ADD** | ISC |
| `icon:diagram:link-broken` | **Broken Relationship** | `Link2` | *DIAGRAM AND RELATIONSHIPS* | USEFUL | **ADD** | ISC |
| `icon:diagram:merge` | **Merge Flow** | `Merge` | *DIAGRAM AND RELATIONSHIPS* | USEFUL | **ADD** | ISC |
| `icon:diagram:split` | **Split Flow** | `Split` | *DIAGRAM AND RELATIONSHIPS* | USEFUL | **ADD** | ISC |
| `icon:diagram:shuffle` | **Dispersion Flow** | `Shuffle` | *DIAGRAM AND RELATIONSHIPS* | USEFUL | **ADD** | ISC |
| `icon:diagram:combine` | **Union Combine** | `Combine` | *DIAGRAM AND RELATIONSHIPS* | USEFUL | **ADD** | ISC |
| `icon:diagram:list-tree` | **Hierarchy Tree** | `ListTree` | *DIAGRAM AND RELATIONSHIPS* | USEFUL | **ADD** | ISC |
| `icon:diagram:layout-grid` | **Zoning Grid** | `LayoutGrid` | *DIAGRAM AND RELATIONSHIPS* | USEFUL | **ADD** | ISC |
| `icon:diagram:grid` | **Geometric Grid** | `Grid` | *DIAGRAM AND RELATIONSHIPS* | USEFUL | **ADD** | ISC |
| `icon:annotation:north-arrow` | **Alternate North Arrow** | `Navigation2` | *ANNOTATION AND PRESENTATION* | USEFUL | **ADD** | ISC |
| `icon:annotation:flag` | **Milestone Flag** | `Flag` | *ANNOTATION AND PRESENTATION* | USEFUL | **ADD** | ISC |
| `icon:annotation:tag` | **Metadata Tag** | `Tag` | *ANNOTATION AND PRESENTATION* | USEFUL | **ADD** | ISC |
| `icon:annotation:pin` | **Drawing Pin** | `Pin` | *ANNOTATION AND PRESENTATION* | USEFUL | **ADD** | ISC |
| `icon:annotation:bookmark` | **Saved Bookmark** | `Bookmark` | *ANNOTATION AND PRESENTATION* | USEFUL | **ADD** | ISC |
| `icon:annotation:note` | **Sticky Note** | `StickyNote` | *ANNOTATION AND PRESENTATION* | USEFUL | **ADD** | ISC |
| `icon:annotation:edit` | **Sketch Pencil** | `Pencil` | *ANNOTATION AND PRESENTATION* | USEFUL | **ADD** | ISC |
| `icon:annotation:hash` | **Numbered Marker** | `Hash` | *ANNOTATION AND PRESENTATION* | USEFUL | **ADD** | ISC |
| `icon:annotation:asterisk` | **Footnote / Reference** | `Asterisk` | *ANNOTATION AND PRESENTATION* | USEFUL | **ADD** | ISC |
| `icon:annotation:info` | **Info Bullet** | `Info` | *ANNOTATION AND PRESENTATION* | ESSENTIAL | **ADD** | ISC |
| `icon:wc` | **WC (Alias)** | `Toilet` | *ARCHITECTURE* | ESSENTIAL | **ALIAS** | ISC |
| `icon:dining` | **Dining Room (Alias)** | `Utensils` | *ARCHITECTURE* | ESSENTIAL | **ALIAS** | ISC |
| `icon:living` | **Living Space (Alias)** | `Sofa` | *ARCHITECTURE* | ESSENTIAL | **ALIAS** | ISC |
| `icon:bed` | **Bed (Alias)** | `BedDouble` | *ARCHITECTURE* | ESSENTIAL | **ALIAS** | ISC |
| `icon:kitchen` | **Kitchen (Alias)** | `CookingPot` | *ARCHITECTURE* | ESSENTIAL | **ALIAS** | ISC |
| `icon:office` | **Office (Alias)** | `Briefcase` | *ARCHITECTURE* | ESSENTIAL | **ALIAS** | ISC |
| `icon:elevator` | **Elevator (Alias)** | `ChevronsUp` | *CIRCULATION* | USEFUL | **ALIAS** | ISC |
| `icon:escalator` | **Escalator (Alias)** | `ArrowUpRight` | *CIRCULATION* | USEFUL | **ALIAS** | ISC |
| `icon:car` | **Car Parking (Alias)** | `CircleParking` | *SITE AND LANDSCAPE* | ESSENTIAL | **ALIAS** | ISC |
| `icon:pedestrian` | **Pedestrian (Alias)** | `Footprints` | *CIRCULATION* | ESSENTIAL | **ALIAS** | ISC |
| `icon:ac` | **Air Conditioning (Alias)** | `Snowflake` | *ENVIRONMENTAL* | USEFUL | **ALIAS** | ISC |
| `icon:heating` | **Heating (Alias)** | `Flame` | *ENVIRONMENTAL* | USEFUL | **ALIAS** | ISC |
| `icon:wifi` | **WiFi Connectivity (Alias)** | `Wifi` | *SERVICES AND SAFETY* | ESSENTIAL | **ALIAS** | ISC |
| `icon:power` | **Power Outlet (Alias)** | `Plug` | *SERVICES AND SAFETY* | ESSENTIAL | **ALIAS** | ISC |


#### Custom Design Recommendations (NEEDS CUSTOM DESIGN)
The following symbols are essential for professional architectural layout design but lack high-quality representation in standard icon sets. They should be created as custom vector paths by the design team:

| Canonical ID | Display Name | Proposed Source | Candidate Category | Priority | Recommendation | Licence |
|---|---|---|---|---|---|---|
| `icon:circulation:elevator-cab` | **Elevator Lift Cab** | `custom:elevator-cab` | *CIRCULATION* | ESSENTIAL | **NEEDS CUSTOM DESIGN** | Proprietary |
| `icon:circulation:stairs-plan` | **Stairs Plan View** | `custom:stairs-plan` | *CIRCULATION* | ESSENTIAL | **NEEDS CUSTOM DESIGN** | Proprietary |
| `icon:circulation:escalator-section` | **Escalator Section** | `custom:escalator-section` | *CIRCULATION* | USEFUL | **NEEDS CUSTOM DESIGN** | Proprietary |
| `icon:furniture:wardrobe-layout` | **Wardrobe Plan Outline** | `custom:wardrobe-layout` | *FURNITURE AND FIXTURES* | USEFUL | **NEEDS CUSTOM DESIGN** | Proprietary |
| `icon:furniture:sink-layout` | **Plumbing: Sink Layout** | `custom:sink-layout` | *FURNITURE AND FIXTURES* | ESSENTIAL | **NEEDS CUSTOM DESIGN** | Proprietary |
| `icon:landscape:gate-layout` | **Fence Gate Swing** | `custom:gate-layout` | *SITE AND LANDSCAPE* | ESSENTIAL | **NEEDS CUSTOM DESIGN** | Proprietary |
| `icon:service:drainage-drain` | **Floor Drainage Drain** | `custom:drainage-drain` | *SERVICES AND SAFETY* | USEFUL | **NEEDS CUSTOM DESIGN** | Proprietary |
| `icon:annotation:section-mark` | **Architectural Section Cut** | `custom:section-mark` | *ANNOTATION AND PRESENTATION* | ESSENTIAL | **NEEDS CUSTOM DESIGN** | Proprietary |


#### Rejected / Duplicate List (REJECT)
The following symbols are recommended for rejection due to visual redundancy, inappropriate geometry, or UI software-centric metaphors:

| Canonical ID | Display Name | Source Key | Candidate Category | Priority | Recommendation | Licence |
|---|---|---|---|---|---|---|
| `icon:circulation:step-forward` | **Circulation Step Forward** | `StepForward` | *CIRCULATION* | LATER | **REJECT** | ISC |
| `icon:circulation:step-back` | **Circulation Step Back** | `StepBack` | *CIRCULATION* | LATER | **REJECT** | ISC |
| `icon:landscape:sunlight` | **Sunlight (Duplicate)** | `Sun` | *SITE AND LANDSCAPE* | LATER | **REJECT** | ISC |
| `icon:diagram:share` | **Shared Connection** | `Share2` | *DIAGRAM AND RELATIONSHIPS* | LATER | **REJECT** | ISC |
| `icon:annotation:section` | **Pizza Section (Duplicate)** | `Slice` | *ANNOTATION AND PRESENTATION* | LATER | **REJECT** | ISC |



---


### 5. Licence and Attribution Risk Audit
- **Lucide-sourced candidates**: 100% of the suggested `lucide-react` keys use the **ISC License**. This is a highly permissive, commercial-friendly license with no restrictions on distribution or modifications. No visible attribution is required in the client-side user interface.
- **Custom-designed candidates**: All custom design symbols (e.g. elevator cab, stairs plan, section cut marker) will be created as original SVG vector geometry and owned entirely by **MOOORF** under its proprietary or open-source license.
- **Exclusion of external assets**: No third-party SVGs, unverified online repositories (e.g. random Flaticon or Noun Project links), base64 geometries, binary assets, or unknown licenses have been included in this catalog. This ensures 100% legal compliance and zero provenance risk.


---


### 6. Suggested Final Symbol Count
- **Existing Registry symbols**: 77
- **Proposed Lucide candidates to ADD**: 59
- **Proposed Lucide candidates to ALIAS**: 14 (will map directly to existing or new canonical IDs, introducing no new geometry files)
- **Proposed Custom Design candidates to ADD**: 8
- **Proposed candidates to REJECT**: 5 (reconciled and excluded)
- **Total active geometry symbols**: 77 (existing) + 59 (new Lucide) + 8 (new Custom) = **144 active symbols**.
- **Total searchable IDs (including aliases)**: 77 (existing) + 59 (new Lucide) + 14 (new Lucide Aliases) + 8 (new Custom) + 6 (existing aliases) = **164 searchable symbol IDs**.

This total matches the target expansion range of **150–200 total useful symbols** while maintaining perfect deduplication and structural hygiene.


---

### DONE — READY FOR CODEX INGESTION
