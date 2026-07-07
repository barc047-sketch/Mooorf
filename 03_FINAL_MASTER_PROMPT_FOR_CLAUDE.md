# FINAL MASTER PROMPT — ZONUERT EDITORIAL ANIMATED CANVAS LAB

You are building a standalone canvas-only prototype for ZONUERT.

Do not touch the deployed ZONUERT V1 repo.
Do not build backend, login, cloud save, payments, public gallery, credits, or full dashboard.

## Read first

Read these files before editing:

```text
CLAUDE.md
docs/PRODUCT_BRIEF.md
docs/PALMER_REFERENCE_ANALYSIS.md
docs/UI_STYLE_BRIEF.md
docs/ANIMATION_AND_LOADING_SPEC.md
docs/CANVAS_RENDERER_SPEC.md
docs/TABLE_CANVAS_SYNC_SPEC.md
docs/PERFORMANCE_AND_TOKEN_STRATEGY.md
docs/LIBRARY_AND_GITHUB_INDEX.md
docs/ACCEPTANCE_TESTS.md
docs/TASK_QUEUE.md
```

Use these references:

```text
assets/references/palmer_editorial_canvas_screenshot.png
assets/references/palmer_style_reference_tokens.md
```

Use the public site as a visual/interaction reference:

```text
https://www.palmer-dinnerware.com/
```

Do not clone the Palmer brand literally. Translate the interaction and editorial quality into ZONUERT.

---

## Target feeling

The result must feel like:

```text
Palmer-style editorial object canvas
+
iOS glassmorphism software controls
+
ZONUERT spatial program cells
+
organism/blob field
+
high-end animated motion system
```

It should not feel like a generic SaaS dashboard.

---

## Visual direction

From Palmer:
- warm cream canvas
- floating objects as main content
- top-center view toggle
- bottom-center controls
- bottom-right zoom / drag hint
- minimal text
- hairline borders
- tight Swiss typography
- irregular scattered composition
- lots of negative space

ZONUERT translation:
- architecture spaces become floating circular editorial cells
- area controls size
- category/privacy controls color/detail
- cells have object-like depth/shadow
- table view edits the same graph data
- canvas/table switch is glassmorphism
- organism/blob field can softly merge cells
- day mode = warm gallery canvas
- night mode = Graph Noir Red

---

## Required loading intro

Build a premium animated loading screen before the canvas appears.

### Loading screen composition

- full-screen overlay
- base background can be dark/night or cream/day depending initial theme
- one colorful animated gradient mass behind the countdown
- gradient element covers about 30% of the screen
- gradient sits in one corner, preferably top-right or bottom-left
- gradient should feel like soft liquid/glass/aurora, not cheap rainbow
- red timer/link text in a corner
- countdown number visible
- small label like `loading canvas`, `initializing organism`, or `preparing graph`
- progress should feel editorial, minimal, and expensive

### Countdown behavior

Required:
- countdown from 100 to 0 or 0 to 100
- number in corner
- red text
- monospaced/tight typography feel
- progress updates smoothly
- after complete, overlay exits with smooth motion

Suggested text:
- `loading spatial graph`
- `preparing canvas`
- `initializing cells`
- `enter canvas`

### Loader animation

Use GSAP or Motion.

Include:
- gradient blob slowly morphing/moving
- subtle blur
- optional noise overlay
- red countdown text
- small corner link-like timer
- canvas reveal after countdown

Do not make the loader loud or childish.
It should feel like a high-end agency/portfolio intro.

---

## Required animations

Make interactions feel expensive.

Use tasteful motion, not over-animation.

### Must animate

- loading screen entry/exit
- cells appearing on first load
- cells floating into position
- canvas/table switch
- bottom dock button hover/press
- left rail hover/selection
- zoom controls press
- cell selection
- drag start/drag end
- merge distance slider feedback
- organism blob settling after movement
- day/night transition
- table row hover/edit focus
- import success/error toast
- add demo cells staggered reveal

### Motion rules

- use spring/ease, not linear robotic movement
- respect reduced-motion if easy
- use transform/opacity where possible
- do not animate expensive layout constantly
- keep canvas performance first
- no infinite heavy motion loops on idle

Preferred:
- Motion for React UI transitions
- GSAP for loader and cinematic intro
- PixiJS/Canvas rAF for canvas object motion

---

## App structure

### Views

1. Loading Intro
2. Canvas View
3. Table View

### Canvas view

Full-screen:
- no page scroll
- infinite drag-to-explore canvas
- scattered circular cells
- off-white day background
- Graph Noir Red night background
- bottom dock
- left rail
- bottom-right zoom controls
- top-center view toggle / experience toggle
- optional organism blob layer

### Table view

Separate view, not below canvas:
- same Zustand store
- edit space name/area/category/privacy
- switch back to canvas
- no reset

---

## Core data model

```ts
type SpaceCell = {
  id: string;
  name: string;
  area: number;
  category: string;
  privacy: string;
  color?: string;
  x: number;
  y: number;
  radius: number;
  locked?: boolean;
  selected?: boolean;
};
```

Central store owns:
- spaces
- camera
- settings
- selectedSpaceId
- demoCells
- loadingComplete

Table and canvas are synchronized views.

---

## Required controls

### Top-center toggle

Palmer-style outlined pill:
- icon
- label
- `canvas view` / `table view`

### Bottom dock

Glass/cream/ink style:
- menu
- canvas/table
- add space
- add 10 demo cells
- import
- palette
- merge distance
- blob toggle
- theme toggle
- reset
- fit
- export PNG

### Left vertical rail

- select
- move
- relationship placeholder
- style
- import
- settings

### Bottom-right zoom

- minus
- zoom percent
- plus
- drag-to-explore hint

### HUD

- cell count
- zoom
- merge distance
- theme
- renderer type
- FPS if easy

---

## Organism blob behavior

The blob must not look like pipe connectors.

Correct:
many cells → one continuous soft organism body

Wrong:
circle → bridge → circle

Behavior:
- cells close together merge into soft shared mass
- as cells separate, necks thin
- beyond mergeDistance, connection breaks
- blob under cells
- cells crisp above blob
- no thick outlines
- no red halo spam

Implementation:
- Canvas 2D field/metaball/marching squares
- or PixiJS shader/filter
- or procedural hull as first convincing pass

Use the simplest method that looks premium and remains smooth.

---

## Table sync requirements

- edit name in table → canvas label updates
- edit area → radius updates
- edit category/privacy → style updates
- drag cell → position persists
- switch canvas/table/canvas → no reset
- add space → appears in both
- import CSV → appears in both

---

## Performance

Target:
- 20 cells smooth
- 50 acceptable
- 75+ stress test

Rules:
- requestAnimationFrame
- debounce expensive blob
- reduce blob quality while interacting
- avoid React update on every pointer event if possible
- clamp devicePixelRatio in fullscreen
- use Canvas/Pixi for live objects
- React only for UI overlay

---

## Final deliverable

Build the project so:

```powershell
npm run dev
npm run build
```

work.

At the end update:

```text
docs/HANDOFF.md
docs/BUGS.md
docs/DECISIONS.md
```

Final report:
1. renderer used
2. animation system used
3. loading screen implemented
4. canvas/table sync status
5. blob status
6. performance tested cell count
7. build status
8. next recommended step
