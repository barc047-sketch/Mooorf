# V7 — Spatial Intelligence System

Status: system defined; **Project Pulse implemented as the flagship production
reference**. Sol implements the remaining family from this document.

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

### Architectural data rules (already enforced in the flagship)

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
| 2. Category Mix | full `getCategoryShares` list: per-category area, share, count; restrained token colors | Sol |
| 3. Privacy Balance | `getPrivacyBalance`: public / shared / private area + share; service ratio via category token `service` share | Sol |
| 4. Area Leaders | `getAreaLeaders(spaces, 5)` ranked compact list (MiniRank pattern) | Sol |
| 5. Data Health | `missingAreaCount`, `uncategorizedCount`, zero-area warnings; extend selectors with further checks as needed | Sol |
| 6. Relationship Health | adjacency/connectivity — runtime `SpaceCell` has **no relationships**; graph `RelationshipEdge` exists only in the V4.5B domain layer. Future-ready: define selectors against `ZonuertProject` when the graph goes live (V9+) | future |
| 7. Floor Summary | runtime store has **no floor data**; `getFloorTotals` already exists in the graph layer. Integrate at V9 floors | future |

One `WidgetId` per shipped widget; register in `WIDGET_DEFS`
(`src/ui/widgets/WidgetHost.tsx`) and launch from the rail. Rail = launcher
only; no metrics in rail or dock.

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

## Implementation Guidance for Sol

1. Read this doc + `src/ui/widgets/stats/ProjectPulseWidget.tsx` — it is the
   normative reference for structure, tone, and data flow.
2. Per widget: add the `WidgetId` union member (`src/types.ts`), the
   `WIDGET_DEFS` entry (eyebrow `INTELLIGENCE`, width ≈ 296–304), a rail
   launcher in the existing `stats`/intelligence section (or group launchers
   into one section — do not add a second rail), and update
   `src/ui/panels/widgetRegistry.ts`.
3. Selectors first (pure, tested by hand in preview via `window.lab`), then
   compose the widget from the shared primitives. New CSS only extends
   `stats.css` with `pulse-*`-family classes.
4. QA per widget: add one/add five, add void (area must not move), table
   edits, Random/layout neutrality, saved-view load, minimize/close, day +
   night, 390px sheet, zero console warnings, no red chrome.
5. Do not: duplicate metric state, put stats in dock/rail bodies, install
   chart packages, exceed the information hierarchy, or restyle WidgetFrame.
