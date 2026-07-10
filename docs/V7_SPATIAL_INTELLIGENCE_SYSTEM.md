# V7 — Spatial Intelligence System

Status: **V7.1B production interface complete**. Project Pulse is the single rail
gateway and flagship; Category Mix, Privacy Balance, Area Leaders, and Data
Health are independent live instruments with authored semantic geometry.

Read with: `docs/V6N_REFERENCE_STYLE_LOCK.md`, `docs/DESIGN_SYSTEM_MEMORY.md`,
`docs/COMPONENT_INVENTORY.md`.

## Purpose

Stats widgets are **spatial diagnostic instruments**, not dashboard cards.
They read the live program (the store-owned `spaces` array — the runtime
master graph) through pure selectors and float over the canvas as
scientific/analytical glass. The canvas stays dominant; instruments support it.

Core rule: **Master Graph = brain.** Every metric is derived, never stored.
No widget may keep metric state, duplicate a calculation another widget owns,
or hardcode production numbers.

## Selector Ownership

- `src/domain/stats/selectors.ts` owns every live metric. Pure functions over
  `readonly SpaceCell[]`: same input, same output, no store imports.
- Widgets subscribe with `useLab((s) => s.spaces)` and derive via
  `useMemo(() => selector(spaces), [spaces])`. That is the entire data path —
  table edits, canvas edits, add/void/delete, and saved-view loads update
  automatically because the store array reference changes.
- Naming mirrors `src/domain/graph/selectors.ts` (`getCategoryShares` ↔
  `getCategoryTotals`, `getPrivacyBalance` ↔ `getPrivacyTotals`,
  `getAreaLeaders` ↔ `getLargestSpaces`). When the runtime migrates to
  `ZonuertProject` (V9+), swap the input type and reuse the graph selectors —
  widgets should not change.
- New metrics: add a selector here first, then consume it. Never compute in
  the component.

### Architectural data rules (enforced across the family)

- Voids (`kind: "void"`) never count toward programmed area; they are counted
  separately (`voidCount`).
- Non-finite / non-positive areas read as 0 m² and surface through
  `missingAreaCount` instead of skewing totals.
- Unknown category strings fall back through `getCategoryToken` →
  Uncategorized. Never crash on user text.
- Layout presets / Random move x/y only — metrics must be position-blind.

## Widget Family

| Widget | Content | Status |
| --- | --- | --- |
| **1. Project Pulse** | total program m², space count, void count, program mix band + legend, openness band, largest, dominant | **LIVE — flagship reference** |
| 2. Category Mix | top six categories + Other, area/share/count, token-colored distribution | **LIVE** |
| 3. Privacy Balance | public/shared/private/unknown evidence, dominant type, service-category context | **LIVE** |
| 4. Area Leaders | top five valid additive spaces; category/share; existing selection action | **LIVE** |
| 5. Data Health | blank/duplicate names, invalid program/void areas, uncategorized and unknown-privacy signals | **LIVE** |
| 6. Relationship Health | adjacency/connectivity — runtime `SpaceCell` has **no relationships**; graph `RelationshipEdge` exists only in the V4.5B domain layer. Future-ready: define selectors against `ZonuertProject` when the graph goes live (V9+) | future |
| 7. Floor Summary | runtime store has **no floor data**; `getFloorTotals` already exists in the graph layer. Integrate at V9 floors | future |

One `WidgetId` per shipped widget is registered in `WIDGET_DEFINITIONS`
(`src/ui/panels/widgetRegistry.ts`). The rail keeps one Stats launcher, which
opens Project Pulse. Its compact `InstrumentLauncher` popover opens the other
four independently through the existing `openWidget` action. No metric lives
in the rail/dock and there is no second widget manager.

## V7.1B Authored Geometry

Widget geometry is canonical metadata in `src/ui/panels/widgetRegistry.ts`,
not per-component CSS. `WidgetFrame` reads the semantic variant, authored
width/minimums/height intention, scale, icon, and one-line title while keeping
the existing drag/focus/minimize/close stack. At `<=640px` every variant still
becomes the existing inset full-width sheet.

| Instrument | Variant | Authored geometry |
| --- | --- | --- |
| Project Pulse | `large` | 332px wide; 248px minimum height; flagship asymmetry |
| Category Mix | `rail-horizontal` | 444px wide; 226px minimum height; paired rows + dominant band |
| Privacy Balance | `horizontal` | 420px wide; 214px minimum height; compact balance band |
| Area Leaders | `rail-vertical` | 276px wide; 352px minimum height; single ranked column |
| Data Health | `vertical` | 264px wide; 318px minimum height; diagnostic strip |

These shapes are authored, not user-resizable. `compact`, `standard`,
`horizontal`, `vertical`, `rail-horizontal`, `rail-vertical`, and `large` are
the reusable vocabulary for the full widget family.

## Information Hierarchy (per instrument)

1. **Hero readout** — one primary metric (`MetricReadout`), eyebrow label +
   large tabular value + muted unit. Max ~22px; never hero/marketing type.
2. **Side vitals** — 1–3 stacked mini readouts behind a hairline left border
   (asymmetric head: primary breathes left, vitals align right).
3. **Micro visualization** — `MicroDistribution` hairline band (4px), optional
   legend rows. Thin, precise, never a pie chart or decorative chart.
4. **Footer insights** — `InsightRow` key/value lines with hairline
   separators; values right-aligned, tabular.

Skip levels a widget doesn't need; never reorder them.

## Shared Primitives

`src/ui/widgets/stats/primitives.tsx` + `stats.css` (all token-driven):

- `MetricReadout { label, value, unit?, mini? }`
- `MicroDistribution { label, detail?, segments, legend? }` —
  `DistributionSegment { id, label, color, share }`; zero-share segments are
  skipped; an empty band renders the dormant gray bar automatically.
- `InsightRow { k, v }`
- `RankedMetricRow` — shared ranked area/share row with optional existing-store selection.
- `HealthSignal` — deterministic issue line; `--warning-data` is data evidence only.
- Format helpers: `formatInt` (whole, comma-grouped), `formatShare`
  (whole %), `formatCount` (two-digit padded).

Extend this file for family needs (`MiniRank`, `StatusDot`) — do not create a
parallel primitive set or import a chart library. Everything lives inside
`WidgetFrame` via `WidgetHost`; no second widget framework.

## Metric Formatting

- Areas: whole m², `formatInt` → `2,460` + unit `m²` (unit always muted,
  smaller, after the value).
- Shares: whole percent, `formatShare` → `68%`.
- Counts: `formatCount` → `15`, `01` (two-digit alignment in stacked vitals).
- All numerals `font-variant-numeric: tabular-nums`.
- Missing/unavailable values render `—`, never `0` when the truth is
  "unknown" and never `NaN`/`undefined` text.

## Data-Color Rules

- Category data colors come **only** from `CATEGORY_TOKENS` via selectors
  (`CategoryShare.color` = `token.base`). Never invent hues in a widget.
- Aggregated remainders ("Other · n") use `var(--fog)`.
- Balance/ratio bands that are not category data use neutral instrument
  tones: `var(--chrome-accent)` vs `color-mix(in srgb, var(--ink) 58%, transparent)`.
- Warnings (Data Health) use `var(--warning-data)` only when data actually
  warns. **No red UI chrome anywhere.** No rainbow, no gradients-as-decor.

## Compact / Expanded Behavior

- The existing `WidgetFrame` minimize (title-chip) is the compact state; there
  is no custom per-widget expanded mode. Widgets are sized so the default
  frame (~300px) shows everything without internal scrolling for typical
  programs; long lists (Category Mix, Area Leaders) cap visible rows
  (top N + aggregate) rather than growing tall.
- Frames are draggable, minimizable, closable, z-ordered by `openWidgets`,
  Escape closes the front widget, and ≤640px becomes a full-width sheet — all
  inherited, do not reimplement.

## Empty / Error States

- Zero cells → dormant instrument: eyebrow ("AWAITING PROGRAM"), one calm
  sentence, muted hint, dormant gray band. See `pulse-empty` in the flagship.
- Cells but zero measurable area → full instrument renders with `0 m²`,
  dormant bands, `—` details/insights (already handled by primitives).
- Selectors never throw on malformed data; they degrade to safe fallbacks.

## Future Graph / Floor Integration

- V9 floors: `FloorNode` + `getFloorTotals` exist in `src/domain/graph/`.
  Floor Summary consumes them once the runtime store carries floor ids.
- Graph relationships: Relationship Health waits for live `RelationshipEdge`
  data; do not fake connectivity from x/y proximity.
- Migration contract: keep selector signatures shape-compatible with the
  graph selectors so V9 swaps the data source, not the widgets.

## V7.1 Implementation Record

- Selector ownership: `selectCategoryMix`, `selectPrivacyBalance`,
  `selectAreaLeaders`, and `selectDataHealth` remain pure functions in the
  existing stats selector module. Edge cases are covered in
  `selectors.test.ts`; every numeric output remains finite.
- Runtime stability: each widget selects only the stable `spaces` array and
  derives its snapshot with `useMemo`. Newly allocated metric objects are
  never returned directly from a Zustand selector.
- Health classification is deterministic: invalid/non-positive/non-finite
  numeric data is blocking; incomplete metadata is attention; no architectural
  compliance or quality thresholds are invented.
- Next V7 work: Relationship Health and Floor Summary remain deferred until
  relationships and floor ids exist in the live runtime graph.

## V7.1B Interface Rules

- `settings.uiScale` is the single Interface Scale owner: Compact 88%, Standard
  100%, Comfortable 112%. It writes root `--ui-scale`, scales chrome only,
  clamps to 100% on mobile, persists in saved views, and migrates old snapshots
  to 1.0. Canvas coordinates, radii, areas, and camera math never read it.
- Normal editorial and technical labels are pure text: no background, border,
  blur, pill, or outer card. Glass is exclusive to explicit Pill mode and the
  small selected metadata/edit surface.
- The existing loader now exits after the first usable WebGL frame or the first
  Classic fallback frame. Its 380ms floor prevents flashing; a safety exit
  prevents a permanent blocked shell. The index is staged readiness, not fake
  download percentage.
- Widget label/icon/geometry metadata is canonical in the registry. Rail,
  Instruments submenu, and one-line WidgetFrame headers reuse the same Lucide
  icon object; `WidgetHost` remains the body and z-order owner.
