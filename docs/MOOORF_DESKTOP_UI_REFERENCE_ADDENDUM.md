# MOOORF Desktop UI Reference Addendum

**Status:** Canonical addendum to `docs/MOOORF_MASTER_PRODUCT_SCOPE.md`  
**Version:** 1.0  
**Scope:** Desktop-first UI composition, performance, contrast, export queue, global project drawer, and reference-image interpretation  
**Target devices for current implementation:** 1440px desktop and 1280px laptop only

This addendum is required reading for every shell, Canvas, export, typography, and dashboard phase. It refines the master scope without replacing it.

---

## 1. Device priority

Current implementation is desktop-first only.

```text
PRIMARY
- 1440px desktop
- 1280px laptop

DEFERRED UNTIL THE END
- iPad landscape
- iPad portrait
- tablet
- phone
- touch-specific shell redesign
```

Do not spend current implementation time on tablet or phone layouts. Keep architecture responsive-safe, but optimize and validate only 1440 and 1280 until the desktop product is complete.

Recommended working constraints:

- minimum supported Studio width for current phase: approximately 1180–1200px,
- below that width, show a clear desktop-required message rather than compressing the full Studio into an unusable layout,
- use shared geometry tokens rather than hard-coded one-off coordinates so later device adaptation remains possible,
- preserve Canvas visibility at both 1440 and 1280.

---

## 2. Reference hierarchy and what to extract

The supplied references are not to be copied literally. They establish layout, proportion, density, contrast, and motion principles.

### 2.1 Primary layout reference — white/green golf interface

Use this as the strongest shell-composition reference.

Adopt:

- Canvas-dominant composition,
- narrow long left rail,
- slim right-side inspector,
- detached top control clusters,
- broad floating bottom contextual rail,
- pale, quiet, high-transparency surfaces,
- strong spatial separation without heavy borders,
- controls placed around the content rather than covering it,
- balanced asymmetry,
- large central working field.

Adapt:

- add MOOORF's centre `+ Space` button,
- add left and right expandable bottom docks,
- add the common contextual rail above the bottom docks,
- add the vertical material rail beside the inspector,
- preserve the Canvas as the dominant visual mass.

Do not copy:

- golf-specific controls,
- image-map interactions,
- literal brand assets,
- soft shadows.

### 2.2 Bottom rail reference — lemon cardiology interface

Use this as the strongest reference for expanded bottom-dock behaviour.

Adopt:

- compressed multi-category control density,
- small icon-led modules,
- one active timeline/tool region,
- clear visual grouping,
- bright accent used sparingly as a navigational signal,
- long horizontal tool surfaces that remain visually light.

Adapt:

- the lemon tone becomes an optional accent theme, not the entire MOOORF background,
- use the geometry for expanded left/right docks and the common rail,
- keep active state as signal dot + keyline + light tint, not a solid lemon fill,
- preserve fast 100–140ms expansion.

Do not copy:

- large continuous grey shell,
- solid active pills everywhere,
- medical-specific timeline structure.

### 2.3 Global project drawer reference — white management interface with foreground figure

Use this as the primary reference for the global top slide-down menu.

Adopt:

- layered information depth,
- a primary navigation list plus project cards,
- clear separation between global navigation and local workspace,
- soft background defocus while global navigation is active,
- horizontally scannable project cards,
- editorial whitespace.

MOOORF implementation:

```text
Top-left circular launcher
→ click
→ full-width Project Drawer slides down from top
→ background Canvas pauses and visually defocuses
→ global project actions become available
```

The drawer is horizontal and contains:

```text
PROJECT DRAWER
├── Projects
│   ├── Recent
│   ├── New Project
│   ├── Open / Upload
│   ├── Favourites
│   ├── Deleted / Recovery
│   └── Project cards in horizontal scroll
├── Templates
├── Files
├── Settings
├── Account
├── Help
├── Shortcuts
└── Search / Commands
```

Important performance rule:

- use one full-screen scrim/backdrop layer only,
- pause nonessential Canvas animation while open,
- never stack several backdrop-filter surfaces,
- do not animate blur amount,
- drawer animation uses only transform and opacity,
- keep the blurred background effect visually strong but computationally bounded.

### 2.4 Dashboard reference — dark environmental dashboard

Use this for Dashboard composition and cinematic Analysis mode.

Adopt:

- one large hero visual,
- supporting cards arranged asymmetrically,
- floating analysis instruments over a central spatial object,
- restrained accent colour,
- strong hierarchy between primary and secondary metrics,
- high information density without equal-weight cards.

Do not convert the Dashboard into a generic SaaS grid. Use one dominant chart/field/graph plus secondary instruments.

### 2.5 Node-canvas reference — dark generative workflow

Use this for sparse Canvas composition and contextual tool placement.

Adopt:

- large uninterrupted work area,
- contextual controls close to selected content,
- minimal permanent chrome,
- tool surfaces that feel like instruments,
- quiet technical metadata,
- local rather than global visual emphasis.

Do not turn MOOORF into a generic node editor. Relationships, visual connections, Morph bridges, and Cell Behaviour remain separate architectural concepts.

### 2.6 Urban-sound dashboard reference

Use this for compact analytics density and left-rail navigation.

Adopt:

- narrow navigation rail,
- one major analytical graphic,
- small supporting metric stack,
- clear metric labelling,
- compact dark-mode Dashboard variant.

Avoid:

- excessive card repetition,
- boxed grid layouts with no spatial hierarchy,
- small text that fails contrast.

### 2.7 Floating organism analytics reference

Use this for future presentation and Dashboard visualisers.

Adopt:

- organism or spatial model as the hero object,
- analysis cards floating around it,
- charts that visually relate back to the spatial object,
- large editorial heading and small body text,
- transparent or dark presentation exports.

This is a Dashboard/presentation reference, not the default editing shell.

---

## 3. Final desktop shell composition

At 1440 and 1280, the Studio uses the following hierarchy:

```text
TOP
- top-left circular global drawer launcher
- project cluster
- floor cluster
- undo/redo cluster
- icon-only Quick View cluster
- Export / Download Center cluster
- account cluster

LEFT
- long workspace rail
- contextual left subrail when required

CENTRE
- Canvas / Data / Dashboard workspace

RIGHT
- vertical material rail when relevant
- slim movable/pinnable inspector

BOTTOM
- left expandable action dock
- centre + Space
- right expandable action dock
- one common contextual rail above them
```

Core rails are anchored-floating. Inspectors and secondary panels may move and pin. Full Data and Dashboard remain workspace views, not floating cards.

---

## 4. Global top slide-down Project Drawer

The top-left launcher is a circular icon-only control.

Opening behaviour:

- slides down from the top,
- occupies enough height to show project cards and global controls without becoming a full replacement page,
- uses one stable glass layer,
- pauses Morph Motion and decorative Canvas animation,
- background is dimmed and defocused,
- keyboard focus is trapped in the drawer,
- Escape closes it,
- reopening must be instant if already mounted.

Suggested desktop geometry:

```text
1440px: approximately 58–64vh maximum
1280px: approximately 62–68vh maximum
```

Project cards:

- horizontal scroll,
- preview image,
- project name,
- last edited,
- cell count,
- floor count,
- sync/local state,
- plan-limit warning only when relevant,
- context menu,
- pin/favourite.

Global sections:

```text
Projects
Templates
Files
Settings
Account
Help
Shortcuts
Commands
```

Shortcut hints appear beside applicable actions using compact outlined text, not 3D keycaps.

---

## 5. Shortcut-hint system

Shortcut visibility should be widespread but not visually noisy.

Show shortcuts in:

- global Project Drawer,
- tooltips,
- context menus,
- command palette,
- Shortcuts sheet,
- inspector actions,
- Add, Arrange, Connect, Markup, and Present menus,
- export and file actions.

Display rule:

```text
Mac detected
→ show Mac shortcut first

Windows detected
→ show Windows shortcut first

Shortcuts sheet
→ always show both Mac and Windows
```

Visual rule:

- small outlined or plain text key notation,
- no shadow,
- no raised keycap,
- low emphasis until hover/focus,
- remain readable on glass.

---

## 6. Automatic text contrast

Canvas text must never disappear against cells, Morph colours, background references, or dark mode.

### 6.1 Canvas label modes

Every Canvas text object supports:

```text
Text Colour
- Auto Contrast — default
- Black
- White
- Material / Custom
```

Auto Contrast resolves using the colour/material behind the text.

Preferred implementation order:

1. resolve from the selected cell/material's known luminance,
2. for multi-colour Morph fields, resolve from the nucleus/cell's dominant resolved colour,
3. for background references, use a low-frequency sampled luminance map or cached contrast sample,
4. fall back to theme-safe black/white,
5. never use synchronous WebGL framebuffer reads every frame.

Do not rely on `mix-blend-mode` as the primary solution because it is unpredictable, difficult to export consistently, and can become unreadable over complex images.

Optional readability support:

- subtle 1px contrast keyline or micro-backplate,
- never a large text shadow,
- optional transparent Label Background material.

Contrast choice should target clear readability rather than exact aesthetic matching.

### 6.2 UI grey text

Do not use arbitrary low-contrast grey text.

Define semantic tokens:

```text
text-primary
text-secondary
text-muted
text-disabled
text-on-accent
text-on-dark-glass
text-on-light-glass
```

Each token must be validated against the actual glass surface behind it. UI text does not sample the whole Canvas continuously; its anchored glass surface provides a controlled underlay.

No information may depend only on colour.

---

## 7. Cell shadow rule

Global UI shadows remain prohibited.

Cell shadows are allowed as an optional Canvas appearance effect.

```text
CELL SHADOW
- Off — default
- Soft
- Defined
- Custom — later
```

Controls:

- enabled,
- opacity,
- softness,
- offset,
- spread,
- colour/auto,
- include in export,
- global project default,
- optional per-cell override later.

Constraints:

- shadow must never affect hit testing,
- shadow must never change area/radius/geometry,
- shadow must not be used on every UI panel,
- disable or simplify automatically in Fast performance mode,
- Morph shadow is separate and deferred unless it can be rendered cheaply.

---

## 8. Smoothness architecture

MOOORF should look advanced without being highly animated. Interaction latency matters more than decorative motion.

### 8.1 Canvas interaction

- schedule pointer movement through `requestAnimationFrame`,
- use coalesced pointer events where available,
- calculate from initial anchor + current delta,
- keep transient drag state renderer-local or in one ephemeral transform channel,
- commit canonical positions once at pointer-up,
- create one Undo entry per action,
- do not write history during pointermove,
- do not recompute materials because selection changed,
- do not remount Canvas labels or widgets during camera movement.

### 8.2 UI composition

- keep frequently used surfaces mounted,
- refocus rather than remount,
- animate transform and opacity only,
- no blur animation,
- avoid nested backdrop-filter,
- avoid layout reads followed by writes in tight loops,
- use CSS transforms for movement,
- use one z-layer contract,
- freeze or simplify nonessential animation while dragging, panning, zooming, opening the global drawer, or exporting.

### 8.3 Heavy work

Move heavy operations off the main thread where practical:

- ZIP generation,
- GIF encoding,
- chart/visualiser rasterisation,
- large arrangement calculations,
- large table parsing,
- metadata packing,
- background-image preprocessing,
- future relationship/field analysis.

Use Web Workers and OffscreenCanvas where browser support and architecture justify them.

### 8.4 Loading strategy

- lazy-load Data workspace,
- lazy-load Dashboard visualisers,
- lazy-load full Material Browser,
- lazy-load advanced exporters,
- virtualise long tables,
- virtualise material galleries,
- memoise derived graph selectors,
- code-split heavy workspaces,
- never load future tools into the initial Canvas bundle unnecessarily.

### 8.5 Performance quality modes

```text
Automatic
High Quality
Balanced
Fast
```

Fast mode may reduce:

- Cell Shadow quality,
- Morph preview resolution,
- Motion frequency,
- background-reference sampling frequency,
- live chart updates,
- material preview quality.

It must never alter project data.

---

## 9. Export queue and Download Center

Export speed is secondary to Canvas responsiveness. Heavy exports may take time and must not freeze the Studio.

### 9.1 Export task queue

```text
EXPORT JOB
- Queued
- Preparing
- Rendering
- Packaging
- Ready
- Downloaded
- Failed
- Cancelled
```

Rules:

- process heavy jobs away from the main interaction path,
- one or a limited number of heavy jobs at a time,
- preserve Canvas input responsiveness,
- show progress honestly,
- allow cancellation before final packaging where safe,
- surface warnings without blocking unrelated work,
- never fake instant completion.

Browser limitation:

- local export jobs require the browser tab to remain available,
- later cloud export may continue server-side and email/provide a link,
- do not claim background completion after the browser has suspended or closed a local job.

### 9.2 Download Center

The top Export cluster includes a Download Center / inbox icon with a badge.

It contains:

- queued jobs,
- active job progress,
- recent completed downloads,
- failed jobs,
- retry,
- cancel,
- download again,
- reveal export settings,
- clear history.

### 9.3 Completion notification

When a file becomes ready or downloads, show a mail-like floating glass notification on the Canvas.

```text
EXPORT READY
Project_Name_Presentation_Pack.zip
[Download] [Open Download Center] [Dismiss]
```

Visual rules:

- stable blur,
- no shadow,
- high transparency,
- thin keyline,
- compact icon,
- filename and format,
- no large celebratory animation,
- auto-dismiss after a reasonable period unless interaction is required,
- stack multiple notifications cleanly.

---

## 10. Dashboard and chart contrast

Dashboard charts must use semantic contrast rules, not only visual fashion.

- chart labels must remain readable in light and dark Dashboard modes,
- legends use text plus shape/pattern where needed,
- grey secondary text must pass controlled-surface contrast,
- exported transparent PNGs must include a compatible light/dark text variant or user-selectable export theme,
- line charts and matrices need non-colour differentiation where practical,
- large hero visual remains dominant; supporting charts remain secondary.

---

## 11. Revised implementation order

Desktop-only order:

```text
1. Merge scope and archive current version
2. Merge audited group drag
3. Canvas performance + auto contrast + fixed-screen labels
4. Desktop floating shell at 1440 and 1280
5. Global top Project Drawer
6. Beginner Add Space workflow
7. Data workspace + compact Canvas table
8. Dashboard composition
9. Material rail + half-screen Material Browser
10. Arrange
11. Connections + Cell Behaviour
12. Markup + typography + A2 sheet composition
13. Background references + universal upload
14. Templates
15. Export queue + Download Center + ZIP/GIF platform
16. Desktop hardening and accessibility
17. Accounts, plans, billing, and launch
18. Tablet/iPad adaptation
19. Phone/mobile decisions last
```

---

## 12. Desktop acceptance criteria

At both 1440 and 1280:

- Canvas remains the dominant area,
- left rail, right inspector, top clusters, bottom docks, and common rail do not collide,
- project drawer opens without jank,
- no repeated widget entrance animation,
- blur is visible from the first frame,
- no UI shadow exists,
- optional Cell Shadow defaults off,
- cell labels automatically choose readable black/white contrast,
- UI grey text remains readable on every glass surface,
- Quick View remains icon-only with tooltips,
- shortcut hints appear in menus/tooltips without clutter,
- heavy exports enter a queue and do not freeze interaction,
- completed exports produce a mail-like glass notification,
- Dashboard uses one dominant visual hierarchy rather than an equal-card grid,
- no tablet/phone compromises distort the desktop shell during current implementation.

---

## 13. No-go list

Do not:

- implement tablet or phone shell work before desktop completion,
- use solid-black active buttons as the ordinary active state,
- add UI shadows back,
- hide unreadable black labels inside dark Morph regions,
- use `mix-blend-mode` as the sole text-contrast system,
- perform synchronous framebuffer reads every frame for text contrast,
- run ZIP/GIF/chart export work on the main interaction loop,
- animate blur,
- stack multiple full-screen backdrop filters,
- let the global Project Drawer become a second unrelated project system,
- show permanent shortcut chips so aggressively that the interface becomes noisy,
- copy reference images literally or use their proprietary assets.
