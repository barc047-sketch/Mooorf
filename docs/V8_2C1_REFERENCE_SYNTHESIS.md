# V8.2C1 — Reference Synthesis

Direct visual inspection of the six numbered references in
`.references/mooorf-desktop-v1/` (ZONU0, local-only), cross-checked against
the Antigravity `MOOORF_NUMBERED_REFERENCE_PACK_DELTA_AUDIT.md` and
`MOOORF_REFERENCE_ADOPT_ADAPT_REJECT.md`. Where my own read of an image and
an older audit disagreed, the direct visual read governs — the numbered pack
is the corrected baseline per `MOOORF_NUMBERED_REFERENCE_PACK_DELTA_AUDIT.md`.
No proprietary asset, brand, or exact layout is reproduced; principles only.

Canonical hierarchy (per `MOOORF_FINAL_SCOPE.md` §"Current reference
hierarchy" and the addendum): **06 primary shell → 02 bottom dock/common rail
→ 03 global drawer → 05/01 Dashboard → 04 sparse local Canvas**.

---

## 06 — primary_light_shell_layout (golf tracker)

- **Dominant visual mass:** the photographic/map canvas itself — course
  imagery fills the frame, chrome is a thin overlay skin.
- **Composition:** top-center dark capsule cluster (course name · Update ·
  hole distance · settings) floating free of the edges. Left edge: slim
  rounded-rect dark rail of small circular icon buttons, vertically centered,
  detached from top/bottom. Bottom-left: three dark glass instrument cards
  (Distances/Shots to Finish/Weather) sitting low, near-transparent. Top-right:
  one taller dark card (Statistics/Notes tabs, close ×, labeled metric rows).
- **Typography:** small (10–12px), light-weight, high-contrast white-on-dark
  glass; numerals right-aligned in metric rows.
- **Colour:** the canvas supplies all colour (course greens/blues); UI chrome
  is uniformly dark neutral glass regardless of canvas content.
- **Translucency:** strong — every cluster reads as frosted dark glass over
  the photo, soft-edged, no hard borders.
- **Density:** very low chrome density, generous canvas negative space.
- **Left-edge system:** narrow floating rail, icon-only, no labels, no
  section captions — reads as a launcher, not a menu.
- **Right-edge system:** one movable card, tab-switchable (Statistics/Notes),
  labelled rows with trailing numeric values.
- **Accessibility concern:** small captions on photographic backdrops would
  fail contrast without a controlled glass underlay — exactly why MOOORF's
  glass surfaces are validated tokens, not raw translucency over canvas.
- **Performance concern:** none directly transferable — static photo, not a
  live render loop.
- **ADOPT:** canvas-dominant asymmetric composition; detached floating
  clusters instead of a bar; narrow icon-only left rail; movable tabbed
  right card; instrument cards kept small and low-emphasis near the canvas
  edge rather than covering it.
- **ADAPT:** the top-center capsule becomes the Project/Floor/History
  cluster group (MOOORF has no single "Update" action); the bottom-left card
  trio becomes the common contextual rail + bottom docks; the right card
  becomes the pinnable Inspector.
- **REJECT:** literal golf content, hole-distance domain controls, the
  circular compass "W" widget.
- **MOOORF destination:** overall shell composition (§6 top clusters, §7
  left rail, §12 right inspector).

## 02 — lemon_expanded_bottom_toolbar (cardiology)

- **Dominant visual mass:** the full-bleed lemon-yellow backdrop behind a
  warm-grey rounded application frame; inside the frame, a horizontal
  timeline is the hero.
- **Composition:** top pill-row of category tabs (Treatment Dynamics/Visits/
  Medications/Labs/Allergies/Genetics); header metric strip (label-over-value
  pairs, no boxes); a curved-line timeline connecting small circular date
  nodes (two nodes carry a solid lemon fill = "active/flagged") to floating
  white rounded data cards (sparkline + delta, symptom icons, ECG trace);
  fixed bottom bar spanning full width holding small icon buttons on the left
  and a compact coloured segment scrubber (month ticks) on the right.
- **Typography:** bold uppercase micro-labels, large numeral-led metric
  values, tabular figures in the timeline deltas.
- **Colour:** neutral warm-grey/white everywhere; lemon is reserved
  exclusively for the two active timeline nodes and one accent dot — not a
  background, not a button fill.
- **Translucency:** low — this is a mostly opaque light surface, not glass.
- **Density:** high horizontal density in the bottom bar; moderate in the
  card row.
- **Bottom-edge system:** the strongest reference in the pack for a dense,
  full-width, icon-led control bar with a distinct scrubber region.
- **Active state:** solid lemon circle on the timeline nodes only — confirms
  MOOORF's rule that accent colour is a small dot/signal, never a filled
  control surface.
- **Accessibility concern:** white text directly on lemon would fail
  contrast — reinforces why MOOORF restricts lemon to a 2–3px dot/keyline.
- **Performance concern:** repainting 40+ small swatch/card elements on
  state change without memoisation.
- **ADOPT:** dense grouped bottom-bar geometry; small icon modules; one
  active/flagged accent dot language; card-off-timeline floating data
  pattern (informs the compact canvas table's row-append behaviour).
- **ADAPT:** the timeline becomes the dual bottom action docks + common
  context rail (MOOORF has no literal timeline); lemon becomes an optional,
  scarce accent token, never a fill.
- **REJECT:** solid lemon backgrounds/buttons, medical timeline structure,
  patient photo card.
- **MOOORF destination:** §9 bottom interaction architecture, §10 common
  context rail, dock expand/collapse density.

## 03 — global_project_drawer_reference (management overview)

- **Dominant visual mass:** a light overlay panel slid in over a dimmed,
  blurred photographic background (a person at a monitor) — the defocus
  itself is the clearest transferable idea in the whole pack.
- **Composition:** back-arrow + "Management Overview" heading top-left,
  search field below it, a vertical text-list nav (Main Dashboard/Files
  Management [selected, with a trailing ×]/Company Portfolio/Managing
  Tasks/Task Distribution/Company Indicators/Accounting/More) — no icons,
  pure list; to its right, a stack of file-type preview cards (AI Insights,
  Invoices, Reporting, Analysis), each a thumbnail + title + count + chevron;
  further right and partially behind, a second dashboard surface (Project
  Alerts, pipeline table, one gauge) is visible through the defocus,
  establishing the panel-over-workspace relationship.
- **Typography:** clean grotesk, large heading (~28px) down to 11px list
  rows.
- **Colour:** near-white panel, neutral ink text, no accent colour at all.
- **Translucency:** the panel itself is close to opaque; the *background*
  behind it is what is blurred/dimmed — this is the opposite translucency
  direction from a frosted-glass panel, and is the correct model for
  MOOORF's drawer scrim per `V8_2_PROJECT_DRAWER_ARCHITECTURE.md` (one flat
  scrim behind the drawer, not a blurred drawer body).
- **Density:** low-to-moderate, large touch targets, generous list-row
  height.
- **Left-edge system:** the selected row carries a filled pill + trailing
  dismiss control — informs the Project Drawer's global nav list styling.
- **Accessibility concern:** hairline row dividers are low-contrast on the
  near-white panel.
- **ADOPT:** left global-nav list + right horizontal card scroller
  composition; background-defocus-not-panel-blur direction; selected-row
  pill treatment.
- **ADAPT:** becomes the top-slide-down Project Drawer (this reference is a
  side panel; MOOORF's addendum and geometry map both call for top
  slide-down, so orientation is adapted, not the content model).
- **REJECT:** subscription/plan tiers, literal file-manager taxonomy.
- **MOOORF destination:** §6.1/§9 Project Drawer architecture — see
  `V8_2_PROJECT_DRAWER_ARCHITECTURE.md` for the full technical contract this
  reference confirms.

## 04 — sparse_dark_node_canvas (node/workflow editor)

- **Dominant visual mass:** the dark dotted-grid canvas — chrome occupies a
  sliver of the frame.
- **Composition:** small top-left mark; top toolbar tabs (Workflow/Edit/
  Help) plus a separate detached top-center pill cluster (nav arrows/queue/
  share/publish); a node graph of rounded dark boxes connected by curved
  bezier wires flowing left→right (Model → Prompt nodes → Generator →
  Preview, the preview node carrying a colourful gradient thumbnail); a
  bottom-center floating compact compose pill with small icon buttons; a
  slim vertical icon stack at the right edge (zoom controls); tiny
  coordinate/zoom readouts pinned to the bottom corners.
- **Typography:** small monospace-leaning labels on nodes, minimal caption
  text.
- **Colour:** graphite/near-black base, white/grey strokes and text; the
  one saturated moment is the generated-image thumbnail itself (not chrome).
- **Translucency:** dark frosted glass on node bodies and the bottom pill.
- **Density:** extremely sparse — this is the clearest "canvas as 95% of the
  frame" reference in the pack.
- **Right-edge system:** the zoom/utility icon stack — directly informs a
  slim vertical control column distinct from the material rail.
- **Accessibility concern:** fine bezier wires and small node captions on
  near-black would fail contrast without the white-stroke-on-dark discipline
  shown here.
- **ADOPT:** sparse chrome-to-canvas ratio; bottom-center compact pill for
  local/contextual actions; detached top-center micro-cluster; right-edge
  vertical icon stack.
- **ADAPT:** node-and-wire visual language becomes Morph Bridges / Visual
  Connections conceptually, never a literal node editor (MOOORF explicitly
  keeps Relationship/Visual Connection/Morph Bridge/Cell Behaviour separate
  concepts, §26).
- **REJECT:** generative-AI domain controls, freeform coordinate nodes with
  no area semantics, literal node-editor interaction model.
- **MOOORF destination:** default plain-cell Canvas state (§13.1), bottom
  common context rail placement discipline, right-edge zoom cluster.

## 05 — dark_dashboard_density (Urban Sound)

- **Dominant visual mass:** one large hexbin heatmap occupying the left
  ~60% of the frame — a genuine single hero visual, not a card grid.
- **Composition:** narrow dark left nav rail (icon+label rows grouped under
  Overview/Metrics/Account captions, avatar pinned at the bottom); header row
  (Dashboard title, date selector, search, icon buttons); hero heatmap card
  with its own header (title, live-status dot, date, expand icon) and a
  legend key docked to its right edge; a narrow right column of three
  stacked supporting cards (big-number metric + sparkline, a status list,
  a horizontal predictive bar).
- **Typography:** clean grotesk, a very large hero numeral (56%) against
  small 10–11px supporting labels — strong primary/secondary hierarchy.
- **Colour:** near-black/graphite base; the hero visual carries the only
  saturated colour (blue hex cells); supporting cards stay monochrome except
  for one green "on track" dot and one red badge.
- **Translucency:** subtle card separation via tone, not heavy blur.
- **Density:** very high inside the hero and cards, but hierarchy (one big
  thing + small support) keeps it legible — the "not an equal-card SaaS
  grid" model MOOORF's scope explicitly requires.
- **ADOPT:** one-dominant-visual + narrow supporting-card column structure;
  hero-card-with-legend pattern; left rail icon+label grouping under section
  captions (contrast with MOOORF's own icon-only rail, but the *grouping*
  idea transfers to the contextual subrail).
- **ADAPT:** hexbin heatmap becomes the relationship graph/adjacency matrix/
  material field depending on active Dashboard section (§19.1 Relationships).
- **REJECT:** IoT/noise-sensor domain content, device-health list semantics.
- **MOOORF destination:** Dashboard workspace composition, dark cinematic
  Dashboard mode while Canvas stays light by default (§19).

## 01 — floating_organism_analytics (energy insights case-study)

- **Dominant visual mass:** a large low-poly green/prismatic crystalline
  object centered in a pure-black frame — the clearest "spatial object as
  hero" reference in the pack.
- **Composition:** large editorial two-line heading top-left ("USER
  INSIGHTS") with a pill tag ("Research") beside it and a short paragraph
  top-right — a genuine editorial title block, not a dashboard header; three
  dark glass instrument cards float at different depths around/behind the
  hero object (a big-percentage metric with a lemon gradient progress bar
  and a two-line recommendation list; a small line-chart card; a bar-chart
  card) — cards overlap the hero object's silhouette, reinforcing that they
  relate spatially to it rather than sitting in a rail.
- **Typography:** large deck-style editorial heading (~40px) against small
  (10–11px) card labels — the widest type-scale gap in the whole pack.
- **Colour:** pure black background; lemon is the single accent, used only
  inside chart data (progress fill, bars) — never chrome.
- **Translucency:** strong dark frosted glass on every card, soft-glow
  bleed from the hero object through the glass.
- **Density:** low overall (large negative space around the hero) but high
  inside each card.
- **Accessibility concern:** small captions over a glowing organic
  background need the same controlled-glass-underlay discipline as
  reference 06.
- **Performance concern:** multiple floating glass cards over a rendered
  hero object is exactly the "≤2 concurrent backdrop-filter layers" budget
  in `V8_2C0_PERFORMANCE_MATRIX.md` — this reference is decorative
  inspiration, not a literal instruction to stack unlimited glass.
- **ADOPT:** editorial heading + pill tag title block; hero-object-with-
  orbiting-instrument-card composition; lemon reserved for data only.
- **ADAPT:** becomes the Dashboard/Presentation hero mode specifically
  (§19.1 header + primary metrics), with the "hero object" being the
  relationship graph, material field, or a presentation Scene — not a
  permanent Canvas-workspace treatment.
- **REJECT:** literal solar-panel/energy domain content, "Research" case-
  study framing.
- **MOOORF destination:** Dashboard/Presentation hero mode, Project Block
  editorial heading treatment (§20.2).

---

## Cross-reference conflicts resolved

- References 01/05 both propose dark Dashboard density; 05 governs default
  Dashboard structure (nav + hero + support column), 01 governs the
  Presentation/hero variant specifically — both coexist as documented in
  `MOOORF_DESKTOP_UI_REFERENCE_ADDENDUM.md` §2.4 and §2.7.
- Reference 03's panel is a *side* drawer; the addendum and
  `MOOORF_DESKTOP_SHELL_GEOMETRY_MAP.md` both fix the Project Drawer as
  *top* slide-down. Orientation from the geometry map wins; only the
  nav-list + card-scroller content model is taken from 03.
- The AG delta audit's per-image colour readings (e.g. "violet-indigo" for
  01) do not match direct inspection (01 is black/lemon, not violet). This
  synthesis uses the direct visual read; the delta audit's ADOPT/ADAPT/
  REJECT verdicts were still consistent and are retained.
