# MOOORF CONNECTIONS V1 — LOCKED MASTER SPECIFICATION

**Status:** AUTHORITATIVE / FROZEN FOR THIS PHASE  
**Lock date:** 2026-07-21  
**Project:** MOOORF  
**Owner:** Tanishq Solanki  
**Repository:** `barc047-sketch/Mooorf`  
**Primary local repository:** `/Users/tanisxq/Documents/ZONU0`  
**Active feature branch:** `work/next-feature`  
**Protected production branch:** `main`

---

# 0. ABSOLUTE AUTHORITY AND CHANGE-CONTROL RULE

This document is the **single authoritative source of truth for the MOOORF Connections V1 phase**.

It supersedes every earlier Connections concept, partial prompt, temporary Codex interpretation, UI experiment, or implementation assumption whenever any conflict exists.

It specifically supersedes:
- the earlier seven-permanent-button relationship-type Rail;
- the earlier assumption that the product has only six or seven fixed Connection types;
- the earlier idea that every semantic property must always be visible in the default Connection Inspector;
- the earlier separate “Connection Studio” concept when that duplicates the common style editor;
- the earlier assumption that advanced Connections surfaces must fit existing small widget dimensions;
- any implementation shortcut that converts the new dynamic Relationship Type Library back into a fixed enum-only product UI;
- any interpretation where `None`, blank, undefined, or missing type replaces `Custom`.

## 0.1 Non-negotiable anti-derailment rules

Until the Owner explicitly closes the Connections V1 phase:

1. **Do not reinterpret this specification.**
2. **Do not silently simplify it.**
3. **Do not silently expand scope.**
4. **Do not replace an agreed interaction with an easier-to-code interaction.**
5. **Do not introduce duplicate state owners.**
6. **Do not introduce duplicate renderers.**
7. **Do not introduce duplicate style editors.**
8. **Do not introduce duplicate widget/panel lifecycle systems.**
9. **Do not introduce duplicate history systems.**
10. **Do not introduce duplicate camera ownership.**
11. **Do not introduce duplicate export logic.**
12. **Do not reintroduce seven fixed type buttons in the Quick Rail.**
13. **Do not constrain advanced Connections workspaces to legacy small-widget sizing.**
14. **Do not remove or rewrite recovered working Task 3 renderer architecture unless a verified defect requires a surgical correction.**
15. If implementation exposes a genuine contradiction, **STOP and report the contradiction** instead of guessing.
16. New ideas discovered during implementation must be listed as **PROPOSED CHANGES** and must not be implemented until Owner approval.
17. Any Owner-approved architecture change must update this document first, then code.
18. Every Codex lead agent and every Connections subagent must read this document before changing Connections code.
19. The final implementation must be traceable back to this document requirement-by-requirement.
20. “Close enough” is not acceptable for this phase.

---

# 1. CURRENT RECOVERY AND GIT TRUTH

The interrupted overnight Connections run was recovered successfully.

## 1.1 Known safe commits

### Original remote feature head before overnight run

`c04e4fba1db003bd4e84583c9937e73ba9ae717b`

### Task 0 — specification freeze

`932969f859c098855b63a1b16b4271b526aad561`

Commit:

`docs(connections): freeze v1 interaction and renderer specification`

### Task 1 — Custom type / style inheritance foundation

`27483b9d9d1c5900b9b66abc88a2b28cbabca9e6`

Commit:

`feat(connections): add custom type and style inheritance foundation`

### Task 2 — rail-first drag authoring

`d52e1ef16fd5bea363fe222bc700c8aa1f5e6d03`

Commit:

`feat(connections): add rail-first drag authoring`

## 1.2 Known local recovery state

At recovery:

- active branch: `work/next-feature`
- local HEAD: `d52e1ef16fd5bea363fe222bc700c8aa1f5e6d03`
- remote feature HEAD: `c04e4fba1db003bd4e84583c9937e73ba9ae717b`
- main / origin main: `3f62032c54d76a014a781504cc5cd8e4b5ee63d9`
- local feature ahead of main by 7 commits
- remote feature ahead of main by 4 commits
- local branch had 3 unpushed commits beyond remote
- primary worktree contained partial uncommitted Task 3 renderer work
- no Task 4–7 implementation had started

## 1.3 Recovered Task 3 dirty boundary

Tracked modified files:

- `src/canvas/OrganismCanvasView.tsx`
- `src/canvas/organismCanvas.css`
- `src/canvas/organismStaticRuntime.test.ts`
- `src/canvas/runtimeOrganismWiring.test.ts`
- `src/domain/connections/p2SurfaceContracts.test.ts`
- `src/runtime/pf1d2Contracts.test.ts`
- `src/state/store.ts`
- `src/ui/QuickToggleBar.tsx`
- `src/ui/quickToggleBar.css`

Recovered untracked Task 3 product files:

- `src/canvas/connections/geometry.ts`
- `src/canvas/connections/instrumentation.ts`
- `src/canvas/connections/renderer.ts`
- `src/canvas/connections/rendererContracts.test.ts`

## 1.4 Recovery backup

Recovery preview backup created at:

`/tmp/mooorf-connections-recovery/20260721-141706`

This backup contained:
- tracked binary diff;
- four untracked Task 3 files;
- HEAD;
- porcelain status;
- SHA-256 checksums;
- preview screenshots.

Do not destroy or overwrite that backup during recovery completion.

---

# 2. VERIFIED RECOVERED IMPLEMENTATION STATUS

## 2.1 Task 0

**COMPLETE**

Specification freeze, implementation plan and governance were committed and independently reviewed.

## 2.2 Task 1

**COMPLETE**

Recovered implementation includes:
- `Custom` semantic type;
- style inheritance foundation;
- persistence/import/export continuity;
- bounded history corrections;
- registry/model/selectors changes;
- tests.

## 2.3 Task 2

**COMPLETE, but its old seven-button Rail presentation is now superseded by this locked spec**

Recovered implementation includes:
- unified Connection mode;
- `C` shortcut;
- centre-port authoring foundation;
- Quick Rail lifecycle;
- Custom default;
- selection;
- Manager fallback;
- Inspector integration;
- seven semantic definitions;
- tests.

The underlying architecture is reusable.

The old seven visible semantic buttons are **not** the final product UI.

## 2.4 Task 3

**PARTIAL, RECOVERED AND TECHNICALLY STRONG**

Verified in preview:

- TypeScript passed.
- 48/48 focused Task 3/affected suites passed.
- zero browser console errors/warnings.
- preview verified at 1440×900 and 1280×800.
- narrow Canvas verified with Manager open.
- Table round-trip retained renderer mount count `1`.
- persistent inherited-style lines work.
- boundary clipping works.
- deterministic parallel lanes work.
- Canvas2D batch rendering works.
- top-right ON/OFF works.
- hard OFF preserves authored data while visual/path/hit/label work goes to zero and renderer sleeps.
- manager/Inspector integration works.
- no remount regression during Table round trip.

Remaining Task 3 proof:
- true pointer-drag must be made fully reliable;
- direct line-click browser selection must be proven;
- Shift multi-selection must be proven;
- selected focus behaviour must be proven;
- dense scenes must be run;
- independent reviews/report/commit remain required.

---

# 3. PRODUCT PHILOSOPHY

The Connections system must serve two very different users without forcing either into the other workflow.

## 3.1 Basic diagram user

A basic user should be able to:

`C → draw → style individual line → optionally add title/body → done`

They do not need to understand advanced architectural semantics.

Every new Connection can remain `Custom`.

Every Custom Connection may have its own local visual style.

## 3.2 Advanced/professional user

An advanced user can first build a reusable Relationship Type library:

- Primary Circulation
- Secondary Circulation
- Staff Movement
- Fire Route
- Acoustic Separation
- Public Access
- Service Access
- Patient Flow
- Material Movement
- Visual Privacy
- etc.

Then:

`C → choose Relationship Type → draw repeatedly`

All new Connections inherit that Relationship Type’s defaults.

## 3.3 Fundamental UX rule

**Creating a Connection and classifying/styling a Connection are separate concepts.**

The user must never be forced to choose from many relationship semantics before being allowed to draw a line.

---

# 4. FINAL SYSTEM HIERARCHY

The final Connections V1 hierarchy is:

1. **Quick Rail**
2. **Canvas Connection interaction**
3. **Connection Inspector**
4. **Relationship Manager**
5. **One common Connection Style Panel**
6. **Connection Settings**
7. **Shared Relationship Type Library**
8. **Shared annotation system**
9. **Shared renderer/export projection**
10. **Future Matrix/Table projections**

No duplicate “Connection Studio” is required if it would replicate the common style panel.

---

# 5. QUICK RAIL — FINAL LOCKED DESIGN

The final Quick Rail is a single compact contextual rail over the **left-bottom control region only**.

Concept:

`[ ⤴ Connections ]          [ Custom ▼ ] [Manage] [×]`

Below/right of it remain the three existing central circular controls:

`○  ○  ○`

representing the existing Add / Cluster(or multi-add) / Void actions.

## 5.1 Layout rule

The Quick Rail:
- is aligned to the existing left-bottom panel/system;
- extends horizontally only as needed;
- its right edge should align cleanly before the three middle circular Add/Cluster/Void controls;
- must not cover those circular controls;
- must not consume the entire bottom width;
- leaves the right contextual region free for another future feature.

## 5.2 Quick Rail content

Exactly four conceptual actions:

1. Connections mode indicator/button
2. Current Relationship Type dropdown
3. Relationship Manager launcher
4. Close/exit

No permanent seven-button semantic selector.

## 5.3 Current type dropdown

Default:

`Custom`

The dropdown must support:
- built-in Relationship Types;
- user-created Relationship Types;
- effectively long/endless lists;
- search when the library grows;
- recent/frequently used types if beneficial;
- “Manage Relationship Types…” as a destination.

The selected type persists while Connection mode remains active.

Advanced workflow:

`Choose Primary Circulation → draw → draw → draw`

## 5.4 Mode exit

Connection mode exits through:
- `Esc`;
- pressing `C` again;
- Rail close button.

If Enter is used as a finish/commit key in an active keyboard authoring interaction, it must not create shortcut conflicts with editable controls. Enter must never globally exit while the user is editing text or using an input.

---

# 6. CONNECTION MODE

Pressing `C`:

1. activates Connection mode;
2. opens Quick Rail;
3. activates current/default Relationship Type;
4. reveals all valid visible authoring ports;
5. if the visual Connections layer is OFF, turns it ON for editing and reports that state clearly.

Default relationship type:

`Custom`

After a successful Connection:
- remain in Connection mode;
- retain selected Relationship Type;
- keep ports visible;
- allow immediate next connection.

---

# 7. CENTRE PORTS / CONNECTION POINTS

## 7.1 Default port model

Default authoring port layout:

`Center / Auto`

When Connection mode is active, every visible valid Cell displays its port.

Ports disappear when Connection mode exits.

## 7.2 Size

Locked target:

- visible diameter approximately **14–15 px**
- practical adjustable range approximately **8–18 px**
- invisible hit area approximately **26–30 px**

The port may be visually larger than earlier designs because it only exists in Connection mode.

## 7.3 Auto contrast

Port appearance must resolve automatically against each Cell’s actual fill/presentation colour.

Light Cell:
- dark contrasting port.

Dark Cell:
- light contrasting port.

Source/active state:
- accent indication;
- still preserve contrast.

Avoid:
- glow;
- heavy shadow;
- unstable blend modes.

Use deterministic colour/contrast resolution.

## 7.4 Port visibility

Do not show authoring ports on:
- Voids;
- hidden Cells;
- invalid targets;
- unavailable locked Cells;
- Cells outside the currently supported visible Organism subset.

## 7.5 Port rendering architecture

- no one React component per port;
- use a bounded/batched overlay;
- no store/history write merely because ports appear;
- no continuous animation;
- screen-stable visual size.

---

# 8. CONNECTION SETTINGS — PORT LAYOUT OPTIONS

A separate Connection Settings surface controls global authoring/UI behaviour.

V1 port layouts:

1. **Center / Auto**
2. **Cardinal 4**
   - Top
   - Right
   - Bottom
   - Left
3. **Horizontal 2**
   - Left
   - Right
4. **Vertical 2**
   - Top
   - Bottom

`Auto Edge` may remain future unless interaction behaviour is made deterministic and approved.

## 8.1 Authored geometry distinction

UI preference:
- port size;
- whether centre/cardinal/etc. ports are shown;
- port contrast;
- authoring hit target size.

Authored Connection geometry:
- if the user explicitly draws from `Right`, then `startAnchor = right`;
- if the user drops on `Top`, then `endAnchor = top`.

UI preferences are not semantic project Connection data.

Chosen anchors are authored Connection data.

---

# 9. TRUE POINTER DRAG — PRIMARY INTERACTION

Primary interaction:

`pointer down on source port → pointer capture → drag → target highlight → release → commit`

This must be genuinely reliable.

## 9.1 Gesture priority

When pointer-down begins on a Connection port:

**Connection authoring owns the gesture immediately.**

Priority:

1. Connection port / Connection editing handle
2. explicit inline editor/control
3. Cell drag
4. Canvas pan

Port drag must not accidentally become:
- Cell drag;
- Canvas pan;
- generic Cell selection gesture.

## 9.2 Pointer capture

Once a port drag starts:
- capture pointer;
- keep gesture ownership until release/cancel;
- Escape cancels current drag only;
- mode remains active after cancel.

## 9.3 Release rules

Valid target:
- commit one Connection;
- one history transaction;
- select new Connection if setting enabled;
- remain in mode.

Empty Canvas:
- cancel drag;
- no history;
- remain in mode.

Invalid target:
- no Connection;
- concise status feedback;
- remain in mode.

Exact duplicate:
- create nothing;
- create no history;
- select/emphasise existing Connection;
- report `Connection already exists`.

Different Relationship Type between same Cell pair:
- allowed.

## 9.4 Click-to-click fallback

Click source → click target remains an accessibility/trackpad fallback.

It must use the same canonical authoring/history pathway.

---

# 10. PAN / ZOOM DURING CONNECTION MODE

Connection mode must not trap the user.

While idle in Connection mode:
- existing pan works;
- existing wheel zoom works;
- existing temporary-pan conventions work.

During active drag:
- pointer ownership remains stable;
- bounded edge auto-pan may activate;
- existing camera owner/scheduler must be reused;
- no second camera system;
- no uncontrolled permanent loop.

---

# 11. RELATIONSHIP TYPES — CORE ARCHITECTURE

The product is no longer conceptually limited to six/seven fixed types.

The system owns a **Relationship Type Library**.

Factory types initially include:

1. Custom
2. Adjacency
3. Direct Access
4. Visual Link
5. Shared Support
6. Circulation Flow
7. Separation

The existing internal `visual-access` identifier may remain for compatibility while the user-facing label can be `Visual Link`.

## 11.1 Custom is mandatory

`Custom` is always a real type.

Never use:
- None;
- blank;
- undefined;
- missing type

as the normal default.

`Custom`:
- cannot be deleted;
- cannot be archived;
- is the guaranteed fallback;
- supports direct per-Connection styling;
- supports title/body annotation.

## 11.2 User-created Relationship Types

Users may create effectively unlimited project-specific types such as:

- Patient Flow
- Staff Movement
- Public Circulation
- Fire Escape
- Acoustic Separation
- Security Boundary
- Service Route
- Wet Area Dependency
- Material Movement
- Emergency Access
- Visual Privacy
- etc.

## 11.3 RelationshipTypeDefinition conceptual contract

A Relationship Type definition should support:

- `id`
- `name`
- `shortCode`
- `description`
- semantic defaults
- visual defaults
- annotation defaults
- built-in/factory marker
- archive state
- usage metadata derived from Connections

Do not perform a risky broad internal rename merely for terminology consistency if current compatibility can be preserved.

UI terminology is:

**Relationship Type**

---

# 12. SEMANTIC METADATA — PRESERVE BUT DO NOT CLUTTER DEFAULT UI

Current canonical Connection semantics may include:

- requirement
- direction
- strength
- priority
- notes
- enabled / relationship active

These fields should not be deleted simply because the default Inspector becomes cleaner.

They remain useful for:
- future Matrix analysis;
- future Table;
- rules/checking;
- advanced relationship semantics;
- import/export continuity.

However they should **not all remain permanently visible in the main default Connection Inspector**.

The default user experience must remain simple.

---

# 13. RELATIONSHIP MANAGER — FINAL MAJOR WORKSPACE

The Relationship Manager is a major professional workspace.

Header:

`[ TYPES ]    [ CONNECTIONS ]                         [system settings/tune icon]`

It is not constrained to the dimensions of legacy small widgets.

---

# 14. PANEL / WIDGET SIZING — HARD REQUIREMENT

Advanced Connections surfaces must be allowed to use custom sizes.

Do not force:
- Relationship Manager;
- Style Panel;
- long Relationship Type library;
- large Connection lists;
- split-pane editors

into old small widget dimensions.

The existing WidgetHost/WidgetFrame architecture should be **extended**, not replaced, to support flexible sizing modes.

Conceptual sizing capabilities:

- compact
- standard
- wide
- tall
- large workspace
- split workspace
- bounded custom dimensions

## 14.1 Suggested Relationship Manager desktop size

Target approximately:
- width: **36–44vw**
- height: **70–85vh**

40% of screen width is fully acceptable.

The exact implementation must remain responsive and bounded.

## 14.2 Responsive behaviour

At constrained widths:
- the Type library remains usable;
- style side pane can stack/collapse;
- controls must not become microscopic;
- no essential horizontal overflow.

## 14.3 Preserve existing panel architecture

Do not create a second widget manager.

Reuse:
- existing lifecycle;
- z-order;
- close behaviour;
- drag/positioning where applicable;
- visibility ownership.

Extend sizing capability cleanly.

---

# 15. RELATIONSHIP MANAGER — TYPES TAB

The Types tab is a potentially long/endless vertical style library.

Collapsed example:

`Custom                 ───────────────────────────────   edit`

`Adjacency              - - - - - - - - - - - - - -    edit`

`Direct Access          ──────────────────────────────▶   edit`

`Visual Link            · · · · · · · · · · · · · ·    edit`

`Shared Support         ═══════════════════════════════   edit`

`Circulation Flow       ──────────────────────────────▶   edit`

`Separation             ─ · ─ · ─ · ─ · ─ · ─ · ─ ·    edit`

`Patient Flow           ──────────────────────────────▶   edit`

etc.

## 15.1 Row anatomy

Each row should prioritise:

- Relationship Type name
- long live style preview
- optional usage count
- style/edit action
- lightweight expand affordance if metadata is needed

The long line preview is a primary visual identifier.

## 15.2 Row density

Collapsed rows should remain compact and scannable.

Approximate target:
- 48–56 px row height

20+ Relationship Types should remain easy to scan.

## 15.3 Row expansion

Clicking a row may expand lightweight metadata such as:
- short code;
- description;
- usage count;
- duplicate;
- archive/delete actions.

Do **not** place the entire advanced styling editor inline under every row.

That would make the long library unstable and excessively tall.

## 15.4 Style edit action

Clicking:
- line preview;
- edit/style icon

opens the **one common Connection Style Panel** in Relationship Type mode.

## 15.5 Add Relationship Type

At end of list:

`+ Add Relationship Type`

New types may initialise from Custom defaults.

The user then names/styles/configures them.

## 15.6 Type deletion/archive protection

Custom:
- never delete;
- never archive.

Unused project type:
- may be deleted.

Used type:
- do not orphan Connections;
- require reassignment;
- allow archive workflow.

Example:

`This type is used by 35 Connections. Reassign to [Custom ▼]`

Then archive/reassign safely.

## 15.7 Built-in factory types

Factory types may have project-specific visual defaults.

Provide:
- `Reset to Factory Default`

Do not destroy the stable identity of built-in types.

## 15.8 Large library performance

The Types list must be architected for long libraries.

For 100+ types:
- bounded rendering / virtualization where needed;
- only active detailed pane/editor needs heavy controls;
- no giant permanently mounted form per row.

---

# 16. RELATIONSHIP MANAGER — CONNECTIONS TAB

The second tab manages actual authored Connection records.

Example rows:

`Kitchen → Dining       Direct Access        ─────▶`

`Lobby → Gallery        Circulation Flow     ─────▶`

`Store ↔ Kitchen        Shared Support       ══════`

`Office ↔ Meeting       Custom               - - - -`

Capabilities to support in the appropriate stage:

- search;
- filter by Relationship Type;
- selected Cell filter;
- floor filter;
- cross-floor only;
- Relationship Active state;
- Custom/unclassified filter;
- local-style-override indicator;
- multi-select;
- bulk type assignment;
- bulk reset to type default;
- locate on Canvas;
- selection sync with Canvas;
- future Matrix sync.

For large projects:
- virtualize/bound list rendering.

---

# 17. ONE COMMON CONNECTION STYLE PANEL — HARD ARCHITECTURE RULE

There must be exactly **one reusable Connection styling system**.

The same panel is used for:

1. Custom Connection local style
2. Individual Connection override
3. Relationship Type default style

Conceptual contexts:

- `CUSTOM_CONNECTION`
- `CONNECTION_OVERRIDE`
- `RELATIONSHIP_TYPE`

The panel itself does not become a new permanent state owner.

It consumes:
- current resolved visual;
- editing scope;
- registries;
- preview session.

It emits:
- preview;
- commit;
- reset/cancel.

---

# 18. COMMON CONNECTION STYLE PANEL — CONTENT

The common style panel may include:

## Live preview

A real-time line sample.

## Geometry

Launch geometries:

- Straight
- Curved
- Orthogonal
- Elbow

Orthogonal/Elbow are deterministic, not full obstacle-avoidance routing.

## Stroke / line library

Initial production patterns:

- Solid
- Dashed
- Dotted
- Dash-dot
- Double
- Segmented

Architecture should support many more later without schema redesign.

Do not implement 40 patterns now merely because the system is extensible.

## Width

Slider + exact value.

## Opacity

Slider + exact value.

## Start marker

Initial registry can include:
- None
- Open Arrow
- Filled Arrow
- Open Triangle
- Filled Triangle
- Circle
- Filled Dot
- Square
- Diamond
- Bar
- Slash
- Cross
- Architectural Tick
- Chevron

## End marker

Same registry.

## Anchors

- Auto/Centre
- Top
- Right
- Bottom
- Left

## Annotation appearance

The Style Panel may control presentation aspects such as:
- title placement;
- body placement;
- offsets;
- alignment;
- title scale;
- body scale;
- line-relative positioning.

The actual title/body content and show/hide state remain annotation data, not purely visual style data.

---

# 19. STYLE INHERITANCE

Resolved appearance follows:

`Relationship Type visual default → sparse Connection override → resolved appearance → renderer/export`

Do not copy the full resolved type style into every Connection.

## 19.1 Custom Connection

For a basic user:
- `Custom`
- click `Edit Style`
- directly style that particular Connection.

The UI does not need to expose the technical phrase “Custom Type Default” to a beginner.

Under the hood, local sparse overrides remain valid architecture.

## 19.2 Relationship Type Connection

Normally inherits the Relationship Type visual default.

Inside Style Panel, advanced user can choose:

- Relationship Type
- This Connection

If `This Connection`, changes become sparse local override.

## 19.3 Reclassification

Changing a Connection from Custom to a Relationship Type:

If no local visual override:
- adopt new Relationship Type defaults.

If local override exists:
- preserve it unless user explicitly resets;
- clearly indicate local appearance retained;
- offer `Use Relationship Type Default`.

Do not silently destroy authored appearance.

---

# 20. CONNECTION INSPECTOR — FINAL DEFAULT UX

When one Connection is selected, the default Inspector should be clean.

Concept:

## CONNECTION

`Kitchen → Dining`

## TYPE

`[ Custom ▼ ]`

This dropdown loads:
- Custom;
- all built-in Relationship Types;
- all project-created Relationship Types;
- search for long libraries;
- Manage Relationship Types destination.

## TEXT

### Title
- Show on/off
- source can be Relationship Type name or Custom title
- custom title field when needed

### Body
- Show on/off
- body text field

## STYLE

- live miniature style preview
- `Edit Style`

## Core actions

- Reverse
- Delete

Advanced semantic metadata can be available deeper where required but must not clutter this default presentation.

---

# 21. CONNECTION ANNOTATION — TITLE AND BODY

Every Connection may have:

- Title
- Body

Both can appear directly on Canvas and in visual exports.

## 21.1 Title

Short text, e.g.:
- Direct Access
- Staff Only
- Primary Flow
- Visitor Route

Title source:
- hidden;
- Relationship Type name;
- custom title.

## 21.2 Body

Longer explanatory text, e.g.:

`Direct movement required between preparation and primary service zones.`

Body is first-class authored relationship annotation.

## 21.3 Default annotation behaviour

Custom:
- title optional/off by default;
- body off by default.

Relationship Types may define annotation defaults.

Individual Connections may override them.

---

# 22. ANNOTATION ON CANVAS

Body text is intentionally allowed on the Canvas.

This is required for:
- architectural analysis diagrams;
- presentation boards;
- thesis diagrams;
- relationship explanations;
- export-ready annotations.

A typical composition can be:

Title near line midpoint.

Body as a horizontal wrapped block above/below the line.

Do not force long body text to follow a curved path.

Recommended:
- title may optionally follow path;
- body remains horizontal.

---

# 23. ANNOTATION LOD / DENSE DIAGRAM PROTECTION

Many Connections with body text can become unreadable.

Therefore interactive LOD may use:

Near zoom:
- Title + Body

Medium zoom:
- Title

Far zoom:
- Lines only

This is presentation/runtime behaviour only.

Never delete or mutate annotation data because it is hidden at a zoom level.

Exports may explicitly render full annotations independently from the current interactive LOD.

---

# 24. ANNOTATION EXPORT PARITY

A pure resolved annotation model must feed:

- live Canvas;
- PNG;
- PDF;
- presentation ZIP.

Visual export must preserve:
- title;
- body;
- wrap;
- offset;
- alignment;
- visibility;
- relationship association.

Do not implement Canvas-only body annotations that disappear from export.

---

# 25. CONNECTION SETTINGS — GLOBAL AUTHORING / INTERACTION SETTINGS

Relationship Manager header contains a global system settings/tune control.

This opens **Connection Settings**, distinct from per-type style editing.

Suggested V1 structure:

## PORTS

- Layout: Center / Auto, Cardinal 4, Horizontal 2, Vertical 2
- Size: default approximately 14–15 px
- Contrast: Automatic

## AUTHORING

- Default Relationship Type: Custom
- Stay in Connection Mode: On
- Select Newly Created Connection: On
- Show Connections when `C` pressed: On
- Edge Auto-pan: On

## INTERACTION

- Line hit tolerance
- Fade unrelated Connections
- selection/focus behaviour

## MOTION

- System / Reduced

Keep this focused.

Do not turn Connection Settings into a dumping ground for every future feature.

---

# 26. QUICK RAIL MANAGE VS SETTINGS

Quick Rail manage icon/button:

- opens Relationship Manager.

Relationship Manager top-right system tune/settings icon:

- opens Connection Settings.

Per-type row style/edit icon:

- opens common Connection Style Panel in Relationship Type mode.

Per-Connection row style/edit icon:

- opens common Connection Style Panel in Connection Override mode.

Inspector `Edit Style`:

- opens same common Connection Style Panel.

This separation must remain clear.

---

# 27. PANEL / WORKSPACE DESIGN LANGUAGE

Advanced Connections UI should feel like a modern professional desktop design tool.

Principles:
- clean;
- restrained;
- sophisticated;
- highly visual;
- compact where information is repetitive;
- spacious where editing needs room;
- no giant generic forms;
- no unnecessary shadows;
- no glow-heavy UI;
- no mobile-card mentality on desktop;
- line previews communicate type identity;
- progressive disclosure;
- strong hierarchy;
- minimal cognitive load.

Relationship Manager can be a large split workspace.

A 40% viewport-width panel is allowed and expected when useful.

---

# 28. LINE HIT TESTING

Visible Connection lines may be only 1–3 px thick.

Users must not need pixel-perfect clicking.

Use an invisible screen-space hit corridor approximately:
- 10–14 px, adjustable/bounded as appropriate.

Hit testing must:
- choose nearest candidate;
- distinguish deterministic parallel lanes;
- remain aligned through zoom/pan;
- not require rendering fat visible lines.

---

# 29. LINE HOVER AND SELECTION

Hover:
- subtle line emphasis;
- endpoint Cells lightly keyline;
- no noisy permanent tooltip spam.

Click:
- select Connection;
- highlight endpoints;
- update Inspector;
- sync Manager selection.

Shift-click:
- additive/removal multi-selection.

Future Matrix selection must reuse this same selection owner.

---

# 30. FOCUS MODES

Selected Connection:
- selected line full emphasis;
- endpoints highlighted;
- unrelated Connections faded;
- sibling/related lines may remain partially visible.

Selected Cell:
- incident Connections full emphasis;
- unrelated Connections strongly faded.

This is essential for dense projects.

---

# 31. MULTIPLE CONNECTIONS BETWEEN SAME CELL PAIR

Different Relationship Types between the same pair are valid.

Exact semantic duplicate remains blocked.

Parallel lines use deterministic lanes.

Suggested lane pattern:

1 line:
- centre

2:
- ± small offset

3:
- centre + ± small offset

4:
- ± small + ± larger offset

Requirements:
- deterministic ordering;
- individual hit testing;
- stable on Cell movement;
- export parity;
- selected line can visually come forward.

Lane spacing should remain readable at normal zoom and degrade gracefully when zoomed far out.

---

# 32. CURRENT TASK 3 RENDERER — PRESERVE

Recovered Task 3 renderer work should remain the foundation.

Preserve unless a verified issue requires surgical correction:

- Canvas2D batch renderer;
- boundary clipping;
- four deterministic geometries;
- viewport culling;
- deterministic parallel lanes;
- bounded cache/invalidation;
- hit index;
- hard OFF performance gate;
- instrumentation;
- Table pause/resume without remount.

Do not restart the renderer.

Do not replace it with one React component per Connection.

Do not replace it with permanent SVG lines.

---

# 33. TOP-RIGHT CONNECTIONS VISIBILITY TOGGLE

The top-right control has one responsibility:

`Connections ON / OFF`

It is not:
- filter menu;
- style menu;
- Relationship Manager shortcut.

OFF is a hard performance gate.

When OFF:
- no Connection draw;
- no anchor resolution;
- no path resolution;
- no label/annotation layout;
- no Connection hit testing;
- no selection overlays;
- no ports;
- renderer sleeps.

Semantic authored Connections remain untouched.

Pressing `C` while OFF:
- turns visual layer ON for editing;
- enters Connection mode.

Leaving Connection mode does not automatically turn Connections OFF again.

---

# 34. PERFORMANCE CONTRACT

Non-negotiable:

- no React component per stored Connection;
- no React component per port;
- no store/history write on every pointer frame;
- no persisted path geometry;
- no persisted hit geometry;
- no permanent static render loop;
- no all-to-all unchecked pair computations;
- moving one Cell invalidates incident Connections only;
- viewport culling before expensive path work;
- bounded caches;
- static renderer sleeps;
- Table pauses Connection runtime with Organism;
- 500+ authored spaces does not mean 500 simultaneously rendered Organism Cells;
- current visible Organism nucleus cap remains 96 unless separately changed by an approved performance phase.

---

# 35. PERFORMANCE / QA SCENES

Before Task 3 closure:

## Scene A — normal
- 25 visible Cells
- ~50 Connections

## Scene B — professional
- 60 visible Cells
- ~200–300 Connections

## Scene C — current visible stress
- up to 96 visible Cells
- high visible Connection count, approximately 500–800 where feasible

## Scene D — large authored project
- 500+ authored spaces
- large Connection collection
- only supported visible subset rendered

Validate:
- bounded memory/cache;
- responsive Manager;
- no runaway renderer;
- selection remains usable;
- hard OFF zero-work gate;
- no false claim that 500 Organism Cells render simultaneously.

---

# 36. ZOOM/PAN TORTURE QA

Run repeated:

- zoom in
- zoom out
- pan
- zoom
- move Cell
- select line
- pan again
- switch Table/Canvas
- return

Verify:
- no endpoint drift;
- no line drift;
- no lane jump;
- hit corridor remains aligned;
- ports remain aligned;
- clipping remains correct;
- renderer does not remount unexpectedly.

---

# 37. HISTORY / DATA CONTINUITY QA

Verify:

Create Connection:
- line appears.

Undo:
- line disappears.

Redo:
- line returns with same type/style/lane.

Delete endpoint Cell:
- dependent Connection disappears immediately.

Undo Cell deletion:
- Cell and Connection restore correctly.

No duplicate history entries for:
- preview;
- hover;
- selection;
- cancel.

One completed authored action = one transaction.

---

# 38. RELATIONSHIP TYPE LIBRARY AND FUTURE MATRIX

The future Relationship Matrix must consume the same Relationship Type Library.

No hardcoded six-type Matrix vocabulary.

Example Matrix codes:

- ADJ
- ACC
- FLOW
- ACS
- etc.

If the user creates:

`Acoustic Separation`

with code:

`ACS`

it becomes available to:
- Quick Rail dropdown;
- Inspector dropdown;
- Manager filters;
- future Matrix;
- future Table;
- import/export;
- reports/analysis.

One definition everywhere.

---

# 39. FUTURE MATRIX SELECTION CONTRACT

Future behaviour:

Select Canvas line:
- Manager row selects;
- Matrix cell highlights.

Select Matrix cell:
- all Connections between that pair select;
- Canvas lines highlight.

Matrix edits must call the same canonical Connection commands/history path.

No Matrix-owned relationship records.

---

# 40. FUTURE TABLE CONTRACT

Future Connection Table projection may include:

- Source
- Target
- Relationship Type
- Title
- Body
- Active
- local override state
- advanced semantic metadata where needed

Requirements:
- stable Connection IDs;
- virtualization;
- multi-row editing;
- one history transaction per bulk action;
- shared filters;
- duplicate diagnostics;
- import/export continuity.

---

# 41. SHARED FILTER ARCHITECTURE

Canvas, Relationship Manager, future Table and future Matrix should share pure filter semantics.

Conceptual `ConnectionFilterSpec` may include:

- search
- relationship type IDs
- floor IDs
- selected Cell IDs
- active state
- Custom only
- local override only
- cross-floor only

Each surface may own its current filter UI state, but filtering logic should not diverge.

---

# 42. EXPORT CONTRACT

Visual exports:
- PNG
- PDF
- presentation ZIP

Semantic/data outputs:
- JSON
- relationship CSV

Organism SVG remains intentionally unavailable unless separately approved in a future phase.

Export scope may include:
- current visible view;
- all active Connections;
- selected Connections.

Live top-right visibility must not silently decide export without explicit export scope.

Exclude from export:
- ports;
- temporary preview;
- selection handles;
- hover state;
- onboarding;
- runtime instrumentation;
- camera feedback.

Include where requested:
- persistent lines;
- Relationship Type styling;
- title;
- body annotation.

---

# 43. EXISTING PRODUCT ARCHITECTURE TO PRESERVE

- Organism remains sole production renderer.
- Classic remains compile-only legacy.
- Master Graph remains the brain.
- Canvas/Table/Manager/Matrix/exports remain projections/controllers of central authored state.
- one Inspector owner;
- one history owner;
- one camera owner;
- one widget lifecycle owner;
- one export architecture;
- existing Label system remains intact;
- Flag/callout presentation remains separate from semantic Connections;
- Table activation pauses Organism/Connection runtime without destructive remounting.

---

# 44. FLAG / LABEL SEPARATION

Existing Cell Flag/callout remains presentation-only.

It must not become a semantic Connection.

Connections:
- represent relationships between Cells.

Flags:
- represent Cell annotations/callouts.

Do not conflate them.

---

# 45. UI MOTION

Allowed:
- Quick Rail fade/slide;
- port hover emphasis;
- source/target transition;
- new Connection fade-in;
- selected-line emphasis;
- Relationship Manager pane transition;
- lightweight Type row expansion.

Avoid:
- continuous line animation;
- bouncing ports;
- glow loops;
- stagger across every port;
- animated blur;
- spring overshoot;
- scene-wide animation after every style change.

Reduced Motion must be respected.

---

# 46. QUICK RAIL ANIMATION

Suggested:

- 150–180 ms
- opacity 0 → 1
- translateY ~8 px → 0
- scale ~0.985 → 1

Both positional/opacity changes must remain subtle.

No animated blur.

When closed:
- not focusable;
- no pointer interception.

---

# 47. ONBOARDING

First Connection mode activation may show a lightweight contextual hint:

`Press C to connect Cells`

`Drag a Connection point to another Cell`

After first success:

`Connection created · Esc to exit · C to toggle`

Do not use a blocking tutorial modal.

Dismissal is a local UI preference, not project semantic data.

---

# 48. IMPLEMENTATION METHODOLOGY

The remaining phase is not one giant unattended run.

Use bounded stages with preview/review between them.

Each stage:

1. verify current Git state;
2. read this master spec;
3. implement only the bounded scope;
4. focused tests;
5. TypeScript;
6. browser QA;
7. UX review;
8. code/performance review;
9. preview for Owner;
10. commit only after gates pass;
11. stop before next stage until Owner GO.

No merge to `main` until final Owner QA.

---

# 49. REVISED REMAINING IMPLEMENTATION PHASES

## R1 — Close recovered Task 3 safely

Do not start full Relationship Manager styling work yet.

Goals:
- make real port drag fully reliable;
- verify gesture ownership;
- direct line hover;
- direct line click;
- Shift multi-selection;
- selected Connection focus;
- selected Cell incident focus;
- zoom/pan torture;
- Undo/Redo;
- Cell delete/Undo renderer continuity;
- dense performance scenes;
- independent Spec review;
- independent Renderer/Performance review;
- independent Product/UX review;
- commit recovered Task 3 only after all gates pass.

Because this new master architecture changes Quick Rail presentation, do not over-polish the obsolete seven-button Rail during R1. Make only the minimal safe correction needed for current functional proof, then perform the dedicated UI/library correction stage.

## R2 — Architecture/UI correction to this locked master spec

Implement:
- single left Quick Rail;
- current Relationship Type dropdown;
- remove seven permanent semantic buttons;
- preserve right contextual region;
- flexible advanced workspace sizing support in existing widget system;
- Relationship Type Library foundation that combines factory and project-created types;
- Custom permanent fallback;
- simplified Connection Inspector;
- Connection annotation data model for Title/Body;
- Connection Settings foundation;
- common style-panel architecture/interfaces.

This stage must be surgically designed to preserve Tasks 0–3 working foundations.

## R3 — Relationship Manager + common Style Panel

Implement:
- large Relationship Manager workspace;
- Types tab;
- endless/virtualized Relationship Type library;
- compact rows;
- long live style previews;
- add type;
- safe archive/delete/reassign;
- built-in reset to factory;
- common style panel;
- Relationship Type editing mode;
- Custom Connection local style mode;
- individual Connection override mode;
- responsive split-pane behaviour.

## R4 — Connections tab + advanced management + annotations

Implement:
- Connections tab;
- search/filter;
- multi-select;
- bulk type changes;
- locate on Canvas;
- override indicators;
- Title/Body editing;
- Canvas annotation rendering;
- annotation LOD;
- style/text interplay;
- shared filters/projections.

## R5 — Connection Settings and advanced port layouts

Implement:
- Center/Auto;
- Cardinal 4;
- Horizontal 2;
- Vertical 2;
- configurable port size;
- auto contrast;
- authoring settings;
- hit tolerance;
- focus settings;
- edge auto-pan settings;
- ensure authored side anchors persist correctly.

## R6 — Export / Matrix / Table compatibility hooks

Implement:
- PNG annotation parity;
- PDF annotation parity;
- presentation ZIP annotation parity;
- relationship CSV;
- JSON continuity;
- Saved View continuity where appropriate;
- Matrix/Table projection contracts and tests;
- no full Matrix UI unless separately approved.

## R7 — Final performance hardening and owner QA

Implement/verify:
- all density scenes;
- hard OFF;
- Table pause;
- no remount regressions;
- accessibility;
- responsive large-panel QA;
- final whole-branch review;
- exactly one final production build;
- Project Engine status update;
- push feature branch only;
- no merge before Owner QA.

---

# 50. TASK 3 CLOSURE CHECKLIST

Before committing recovered Task 3:

- [ ] Real port pointer-drag works reliably.
- [ ] Drag does not accidentally pan Canvas.
- [ ] Drag does not accidentally drag Cell.
- [ ] Direct line hover response works.
- [ ] Direct line click selection works.
- [ ] Shift multi-selection works.
- [ ] Selected Connection focus works.
- [ ] Selected Cell incident focus works.
- [ ] Parallel lanes remain individually selectable.
- [ ] Zoom/pan alignment torture passes.
- [ ] Undo/Redo renderer continuity passes.
- [ ] Cell delete/Undo continuity passes.
- [ ] 25/50 scene passes.
- [ ] 60/200–300 scene passes.
- [ ] 96/high-density stress remains bounded.
- [ ] 500+ authored project remains bounded.
- [ ] OFF produces zero Connection visual work after settling.
- [ ] Table round-trip does not remount renderer.
- [ ] zero console errors.
- [ ] focused tests pass.
- [ ] TypeScript passes.
- [ ] Spec review clean.
- [ ] Renderer/Performance review clean.
- [ ] Product/UX review clean.

---

# 51. ACCESSIBILITY

Required:

- visible keyboard focus;
- no `C` shortcut while typing;
- click-to-click fallback;
- sufficiently large port hit targets;
- sufficiently large line hit corridor;
- non-colour-only semantic differences;
- reduced-motion support;
- Manager provides non-Canvas selection route;
- type dropdown keyboard/search accessibility;
- title/body controls accessible;
- invalid targets communicated through text/shape as well as colour.

---

# 52. RELATIONSHIP TYPE DEFAULT VISUALS

Factory type defaults should remain readable in monochrome.

Recommended starting grammar:

Custom:
- thin solid

Adjacency:
- fine dashed

Direct Access:
- medium solid

Visual Link:
- fine dotted

Shared Support:
- double

Circulation Flow:
- solid directional arrow

Separation:
- dash-dot or segmented

These are defaults, not immutable product identities.

Users may customize project type styles.

---

# 53. CONNECTION ACTIVE VS VISUAL VISIBILITY

Do not conflate:

**Relationship Active**
- whether the authored Connection participates in semantic project logic.

**Per-Connection visual visibility**
- whether that Connection is visually shown.

**Global Connections ON/OFF**
- whether the visual Connection runtime is active at all.

These are distinct concepts.

---

# 54. PROHIBITED SCOPE DURING CONNECTIONS V1

Unless separately Owner-approved, do not introduce:

- Material Registry coupling;
- Morph Bridge implementation;
- Cell Behaviour implementation;
- full Relationship Matrix UI;
- full Connection Table UI beyond approved projections;
- animated flow-line systems;
- line bundling;
- full obstacle-avoidance router;
- arbitrary waypoint editor;
- 40 production stroke patterns immediately;
- Classic renderer ownership;
- Organism SVG;
- new state-management library;
- new graphics framework;
- second widget system;
- broad unrelated refactors;
- merge to `main`.

---

# 55. SURGICAL IMPLEMENTATION STANDARD

Every remaining implementation must follow:

**Reuse before creating.**  
**Native before dependency.**  
**Smallest coherent diff.**  
**One owner per concern.**  
**No abstraction without a real consumer.**  
**No temporary parallel architecture left behind.**  
**No hardcoded fixed-type UI.**  
**No fixed-size-widget compromise for advanced workspaces.**  
**No renderer rewrite without evidence.**  
**No completion claim without fresh verification.**

---

# 56. CODEx / MULTI-AGENT RULES

For significant stages:

- one lead writer/integrator;
- specialist review agents may be read-only;
- avoid multiple agents simultaneously editing `store.ts`, `OrganismCanvasView.tsx`, Dock/Quick Rail, Inspector, or widget ownership;
- use task briefs and durable reports;
- record progress in `.superpowers/sdd/progress.md`;
- trust Git + ledger after any context loss;
- perform independent final review for each bounded stage;
- do not skip review because tests pass.

---

# 57. DOCUMENT GOVERNANCE

This file must remain in the repository as a durable architecture lock.

Recommended repository path:

`docs/connections/MOOORF_CONNECTIONS_V1_LOCKED_MASTER_SPEC.md`

If a file already exists at a different authoritative Connections contract path, this master document should either:
- become the top-level locked authority; or
- be referenced explicitly from the existing contract as the superseding V1 product/UX architecture.

Every future Connections task prompt should begin with:

> Read `docs/connections/MOOORF_CONNECTIONS_V1_LOCKED_MASTER_SPEC.md` in full. It is authoritative. Do not implement anything that conflicts with it. If another Connections document conflicts, this locked master spec wins unless the Owner has explicitly amended it.

---

# 58. OWNER-ONLY AMENDMENT PROTOCOL

Any future amendment must append a section:

## Amendment N — YYYY-MM-DD

- Owner-approved change:
- Reason:
- Sections superseded:
- Data migration impact:
- UI impact:
- Renderer impact:
- Export impact:
- Tests required:

No hidden reinterpretations.

---

# 59. FINAL PRODUCT MENTAL MODEL

For a beginner:

`C → drag → Custom line → optional text/style → done`

For an advanced user:

`Relationship Manager → build Relationship Types → style presets → C → choose type → draw repeatedly`

For a manager/analyst:

`Relationship Manager → Connections → search/filter/bulk/locate`

For future Matrix/Table:

`consume the same Relationship Type Library + canonical Connections`

For export:

`consume the same resolved visual + annotation projection`

---

# 60. FINAL LOCKED UI MAP

## Quick Rail

`[ Connections ] [ Current Type ▼ ] [ Manager ] [ Close ]`

Single left-side contextual rail.

Right contextual area remains free for future features.

## Canvas

- large auto-contrast ports;
- true drag;
- line preview;
- persistent lines;
- parallel lanes;
- title;
- body;
- selection;
- focus;
- direct editing.

## Inspector

- Relationship Type;
- Title;
- Body;
- style preview;
- Edit Style;
- Reverse;
- Delete;
- advanced semantics only through deeper optional disclosure when needed.

## Relationship Manager

Large flexible workspace:

`[ TYPES ] [ CONNECTIONS ] [ System Settings ]`

### Types
- endless vertical library;
- long line style preview;
- add type;
- metadata expansion;
- style edit;
- safe archive/delete/reassign.

### Connections
- actual authored records;
- search;
- filter;
- multi-select;
- bulk;
- locate.

## Common Connection Style Panel

One reusable implementation everywhere.

## Connection Settings

- ports;
- port size;
- auto contrast;
- authoring;
- selection;
- interaction;
- motion.

## Future

- Relationship Matrix;
- Table projection;
- analysis;
- advanced reports;
- export expansion.

---

# 61. FINAL AUTHORITY STATEMENT

**This architecture is locked.**

Until the Owner explicitly approves an amendment:

- `Custom` remains the permanent default/fallback.
- The Quick Rail remains a single left-side rail.
- The right contextual region remains reserved.
- Relationship Types remain an extensible project library.
- The Relationship Manager remains the central type/connection management workspace.
- The common Connection Style Panel remains the single styling UI.
- Title and Body remain first-class Connection annotations and must support Canvas + export.
- Connection Settings own authoring-port/interface behaviour.
- Advanced workspaces are allowed custom large dimensions and must not be restricted by legacy small-widget sizing.
- The recovered Task 3 renderer remains the base renderer architecture.
- Future Matrix/Table consume the same canonical relationship vocabulary and Connections.
- No alternative architecture may be substituted merely because it is easier to implement.

**END OF LOCKED MASTER SPECIFICATION**

---

## Amendment 1 — 2026-07-22

**Amendment — Connection Style Clipboard**

- **Owner-approved change:** A user may copy the resolved visual appearance of exactly one selected Connection with `Cmd+C` on macOS or `Ctrl+C` on Windows/Linux, then paste that appearance onto one or multiple selected Connections with `Cmd+V` / `Ctrl+V`.
- **Reason:** Connection style reuse must support fast single-target and multi-target editing without duplicating Connections or weakening sparse Relationship Type inheritance.
- **Sections superseded:** None. This amendment extends the Connection Inspector/style workflow and is binding for the later common Connection Style Panel.
- **Data migration impact:** None. The style clipboard is transient application/session UI state and is excluded from project JSON, `.mooorf`, Saved Views, and authored history.
- **UI impact:** Copy requires exactly one selected source Connection. Paste targets the current Connection selection and survives intervening selection changes. Multiple-source Copy is a no-op. Native copy/paste inside input, textarea, contenteditable, and other editable surfaces is never intercepted.
- **Renderer impact:** None.
- **Export impact:** None.
- **Tests required:** active/project Relationship Type selection; Connection click/Shift-click selection; single and atomic multi-delete; editable-target keyboard guards; resolved-style Copy with zero history; sparse single/multi Paste with one transaction; Undo/Redo; and proof that endpoints, IDs, Relationship Type, semantics, enabled state, annotations, visibility, anchors, selection, and runtime geometry are excluded.

Style copy/paste operates on visual appearance only: geometry, stroke pattern, start/end markers, and the existing canonical appearance scalars (`color`, `width`, `opacity`, `curve`, `markerSize`, `markerOffset`, `dashScale`). It excludes Connection identity, endpoints, Relationship Type and semantic metadata, enabled state, visual visibility, endpoint anchors, label/annotation content, selection, runtime lanes, and cached path data.

The clipboard stores the source Connection's resolved appearance. Paste derives the minimum sparse local visual override against each target Relationship Type default. Copy creates no history entry. One paste gesture across any number of targets creates one history transaction; Undo and Redo treat the target set atomically.

---

## Amendment 2 — 2026-07-22

**Amendment — Scalable Relationship Type Pickers, MRU, Bulk Type Editing, and Connection Delete Semantics**

### Relationship Type Picker Scalability

Quick Rail, single-Connection Inspector, bulk-Connection Inspector, and reassignment authoring paths use one shared Relationship Type picker primitive. The picker shows approximately five rows before internal vertical scrolling, presents a compact horizontal live preview resolved from each factory or project type's canonical visual style, opens upward from Quick Rail, and opens downward from widgets and Inspector. MRU ordering applies only to authoring pickers; Relationship Manager retains stable canonical ordering.

### Relationship Type MRU

Recently used Relationship Type IDs are per-user UI preference state, not canonical project semantic state. MRU is updated only when a type is actually assigned or used, never by hover, open, search, or focus. It does not enter Connection history, project export, `.mooorf` data, Saved View semantic data, or Relationship Manager ordering.

### Multi-Connection Type Editing

Inspector may assign one Relationship Type to multiple selected Connections. Mixed is presentation state only. One bulk assignment creates one history transaction, and each Connection's explicit visual, Title, Body, annotation, endpoint, anchor, enabled, and unrelated semantic fields remain intact.

### Delete Connection Semantics

Deleting a Connection removes its canonical Connection record entirely; it never means hide, archive, disable, opacity change, or deselection only. Multi-Connection delete removes all selected canonical records atomically, with one history transaction and one-step Undo restoration.

---

## Amendment 3 — 2026-07-22

**Amendment — Icon-First Live and Multi-Connection Style Editing**

### Icon-First Interaction Principle

Where a style property or action is understood visually, MOOORF prefers an icon, thumbnail, or graphical specimen over a text-first control. Tooltips, accessible labels, and compact secondary captions retain semantic clarity. Relationship Type names and other semantically necessary names remain textual.

### Live Style Editing

Connection Style Panel edits preview immediately on Canvas through transient draft state. Apply commits one history transaction. Cancel discards the transient draft, restores exact canonical appearance, and creates zero history.

### Multi-Connection Style Editing

The universal Style Panel supports one or multiple selected Connections. Differing values present as UI-only `Mixed`. Only fields explicitly touched by the user preview and apply across the fixed target set; untouched per-Connection differences remain unchanged. Live Canvas preview applies to every target. Apply is one bulk history transaction; Cancel restores each target's exact individual pre-edit appearance with zero history.

### Fixed Preview Specimens

Connection and Relationship Type previews use consistent intrinsic specimen dimensions. Their line specimens do not stretch merely because a container becomes wider; constrained layouts wrap or reposition without distorting markers or dash proportions.

### Quick Rail Selection Semantics

With no selected Connections, the Quick Rail Relationship Type picker controls the type used for subsequent authored Connections. With one or more selected Connections, choosing a Relationship Type atomically applies it to every selected Connection and also becomes the current authoring Relationship Type. Existing visual, annotation, endpoint, anchor, enabled, and unrelated semantic fields remain intact; one Undo restores every prior type.

---

## Amendment 4 — 2026-07-22

**Amendment — Adaptive Preview and Advanced Stroke Language**

### Adaptive Non-Stretching Preview

Connection visual previews adapt their centerline length to available layout space. Dash length, procedural wavelength, tooth spacing, marker proportions, amplitude, cap/join form, and stroke width retain intrinsic metrics; a longer preview renders more motif repetitions rather than non-uniformly scaling them.

### Canonical Stroke Grammar

Connection styles support canonical Butt, Square, and Round caps plus Miter, Bevel, and Round joins. Authored width uses a safe `0.5–64` range. Stroke patterns are registry-driven and remain independent from Straight, Curved, Orthogonal, and Elbow centerline geometry. Pattern scale controls applicable motif frequency, while pattern amplitude is authored and shown only for motif families that require transverse extent.

The transient style clipboard includes cap, join, advanced pattern ID, Pattern scale, and Pattern amplitude alongside the previously approved visual fields. Paste continues to derive only minimal sparse target overrides and never copies endpoints, anchors, semantics, annotations, visibility, selection, or runtime geometry.

### Procedural Pattern Ownership

Procedural patterns render around the canonical Connection centerline without changing endpoints, anchors, semantic geometry, hit-test ownership, or canonical graph storage. Preview and Canvas consume the same pattern registry and motif interpretation.

### Deferred R5 Settings

Fixed-on-screen versus Scale-with-Canvas visual scaling and advanced port layouts remain Connection Settings R5 work. Planned port layouts remain Auto/Center, Cardinal 4, Horizontal 2, and Vertical 2; this amendment does not authorize zoom compensation or advanced ports in R3B.

---

## Amendment 5 — 2026-07-22

**Amendment — Explicit Type Supersession, Vertical Hatch, Automatic Preview Adaptation, and Authored Selection Appearance**

### Authoring Relationship Type Supersession

An explicit Relationship Type choice from the single-Connection Inspector, multi-Connection Inspector, or Quick Rail with selected Connections assigns the chosen type and clears each affected Connection's sparse local visual override. The Connection immediately resolves to the selected type defaults. One atomic history transaction preserves and restores each target's prior Relationship Type and exact local visual override while leaving IDs, endpoints, anchors, enabled state, semantic metadata, Title, Body, and annotation overrides unchanged. Relationship Manager archive/delete reassignment remains a safety migration and continues preserving local visual overrides.

### Vertical Hatch Pattern

Vertical Hash remains backward compatible: it draws the canonical centerline plus repeated perpendicular marks. A separate Vertical Hatch pattern draws only repeated perpendicular marks, with no visible base centerline. Its invisible canonical path still owns endpoints, attachment geometry, marker placement, hit testing, and pattern placement. Hatch marks consume canonical color, width, opacity, cap/join where meaningful, Pattern Scale for spacing, and Pattern Amplitude for perpendicular length.

### Automatic Adaptive Preview Behavior

Adaptive non-stretching preview length is automatic responsive layout behavior, not an authored setting or user toggle. Available width changes the preview centerline length and repetition count without stretching motif wavelength, amplitude, thickness, or markers. Pattern Scale remains the explicit authored spacing/frequency control.

### Selection Appearance

Selection never replaces or covers a Connection's resolved authored or transient color, pattern, width, cap, join, opacity, or markers with a thick neutral-grey stroke. Procedural patterns, including Vertical Hatch, remain visually exact and never reveal a normally hidden canonical base centerline when selected. Any retained selection underlay must sit behind the authored motif, remain subtle and theme-aware, and use bounded screen-space expansion rather than scaling into a slab with authored width.

---

## Amendment 6 — 2026-07-22

**Amendment — Screen-Space Connection Visuals and Enter Apply**

### Screen-Space Connection Visuals

The default MOOORF Connection rendering mode uses screen-space-stable visual metrics. Canvas zoom changes Connection position and path extent, but does not proportionally scale authored stroke width, dash/gap metrics, procedural wavelength or amplitude, hash/hatch mark spacing or length, marker dimensions or offset, bounded selection expansion, ports, or practical interaction sizes. Color, authored opacity, categorical caps and joins, canonical style values, endpoints, topology and hit-test ownership remain unchanged.

R5 may expose `Fixed on Screen` and `Scale with Canvas`; `Fixed on Screen` is the preferred default. R3B provides one internal visual-scale seam only and adds no Connection Settings UI. Live Canvas drafts use the same screen-space resolution, while Manager, Quick Rail, Inspector and Style Panel specimens remain camera-independent adaptive UI previews. Export remains separately gated and authored styles never persist zoom-compensated values.

### Style Panel Enter Apply

Enter applies the active universal Style Panel draft through the same canonical Apply action when the keystroke is not already handled, is not part of IME composition, and is not owned by an open menu/listbox/popover, focused button or other native interactive control, textarea, or contenteditable surface. Numeric and eligible single-line Style inputs may finalize their current draft and Apply. Enter Apply creates exactly one history transaction and presents a compact shortcut affordance on the Apply control. Cancel and existing Escape behavior remain unchanged.

---

## Amendment 7 — 2026-07-22

**Amendment — Final Render-Scale Compensation and Visible Project Setting**

### Final Canvas Boundary

Connection visual scaling is resolved at the last Canvas draw boundary from the active 2D transform and the Canvas CSS/backing-store ratio. Camera zoom remains embedded in projected path geometry. Fixed-on-screen metrics compensate the measured final output scale; Scale-with-Canvas metrics additionally apply the bounded camera zoom. DPR, CSS sizing, invalid scale inputs, base and hover passes, procedural motifs, markers, and bounded selection expansion share this one interpretation. Hit tolerance remains practical screen-space interaction geometry in both modes.

### Global Visual Scale Setting

The Relationship Manager settings/tune surface exposes one project-level `VISUAL SCALE` segmented control: `Fixed on Screen` and `Scale with Canvas`. Fixed on Screen is the default for legacy and new projects. The selected mode lives in canonical Connection view settings, updates the mounted Canvas immediately without Apply or Connection history, survives Manager and Canvas/Table lifecycle changes, and round-trips through existing project/config persistence. It is never stored per Connection, per Relationship Type, or in Style Panel drafts. Camera-independent UI specimens remain adaptive and unscaled.

This amendment supersedes only Amendment 6's deferral of the visual-scale setting UI. R5 retains advanced port layouts and the other separately listed Connection settings; no advanced ports or broader R5 surface are authorized here.

## Amendment 8 — 2026-07-22

**Amendment — Standard Desktop Selection Semantics**

Ordered MOOORF list, table, and tree surfaces use established desktop conventions unless a surface explicitly defines another semantic: plain click selects one item and establishes its UI-only anchor; Shift-click selects the contiguous range in the current visible/filter order; Cmd-click on macOS or Ctrl-click on Windows/Linux toggles one item while preserving the remaining shared selection; Cmd/Ctrl+A selects the active surface's visible items when focus is not editable; and Delete/Backspace removes selected records only where that surface owns canonical deletion. Native text-editing shortcuts retain precedence in editable controls. Spatial Canvas surfaces remain non-linear: click selects one and Shift-click preserves the established additive/toggle behavior, with no fabricated spatial range. Anchors are UI-only, never canonical data, persistence or history, and virtualization never limits a range because range resolution uses the full filtered model order.

## Amendment 9 — 2026-07-22

**Amendment — Relationship Type Duplication and Universal Visual Clipboard**

The Relationship Manager TYPES surface may duplicate one factory or project Relationship Type into a new project type with a generated stable project ID and unique name/code. Duplication copies safe semantic defaults, resolved visual defaults, description and annotation defaults, begins at zero usage, and never copies Connection records, usage, archived/deleted state or immutable factory identity; Custom remains the unique fallback while a Custom duplicate is ordinary project data. The existing source-agnostic visual Connection clipboard is the one shared clipboard for resolved Connection or Relationship Type appearance. Type Copy writes only visual fields; Type Paste updates one project Type default or the established project-level factory override layer in one history transaction, immediately updating inheritors while Connection-local overrides remain authoritative. Clipboard copy is history-free, excludes semantic/type/annotation/topology data, and native editable-field Cmd/Ctrl+C/V precedence is retained.
