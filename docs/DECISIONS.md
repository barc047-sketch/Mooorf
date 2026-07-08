# Decisions

- Use Palmer as interaction/style reference, not brand clone.
- Build separate canvas lab, not V1 repo.
- First-class loading intro is required.
- Day mode uses cream/ink editorial style.
- Night mode uses Graph Noir Red.
- Motion must feel premium and restrained.
- Table and canvas use same central store.
- Organism blob remains under cells.
- No backend/auth/cloud/payment in lab.

## Setup decisions (Prompt 01)
- **React upgraded 18 → 19.** `@pixi/react@8` peer-requires React ≥19; greenfield lab, no legacy constraint. All UI libs (motion/vaul/cmdk/floating-ui) support 19.
- **Full core stack installed now** (Prompt 01 directive), not deferred per-phase. 43 runtime + 16 dev deps.
- **No three/ogl/lenis/animejs/react-spring** — Prompt 01 says Canvas/Pixi + GSAP + Motion is enough. Blueprint's heavier list intentionally ignored.
- **Tailwind v4 + shadcn** via `@tailwindcss/vite`. This shadcn registry uses **Base UI** (`@base-ui/*`), not Radix. Editorial token system in `src/styles/tokens.css` is kept; shadcn vars live in `src/index.css`. Reconcile the two visual systems during UI phases (shadcn's `@apply bg-background/text-foreground` on body may need overriding by tokens).
- **fetch MCP omitted** — no npm package; canonical server is Python (`uvx mcp-server-fetch`) and `uv` isn't installed. Native WebFetch/WebSearch cover it.
- Path alias `@/*` → `src/*` (tsconfig + vite).

## Model / effort strategy
- Setup, audit, and review can use Opus 4.8.
- Normal execution should use Fable 5 at high effort.
- Do not use Ultracode/xhigh for simple setup, table sync, shell work, docs, or small UI fixes.
- Reserve Ultracode/xhigh only for: organism/blob renderer, difficult canvas performance work, final animation polish, complex visual bug fixing. Reason: Ultracode/xhigh burns usage faster — use only when the visual/canvas difficulty justifies it.

## Asset/library-first rule
For UI and animation, use approved component/resource libraries first: shadcn/ui, Radix UI, Skiper UI, Cult UI, Watermelon UI, Magic UI, Aceternity UI, React Bits, 21st.dev Magic, Lucide, Sonner, Motion, GSAP.
Custom design/code is allowed only when: the component is unique to the ZONUERT canvas, a library component cannot solve it cleanly, or it affects renderer/blob/graph-sync/camera/drag/import-export.
Do not copy Palmer branding or copyrighted assets — Palmer is interaction/style reference only.

## V4.5A visual/resource system (docs only)
- Visual target reaffirmed and expanded: Palmer editorial canvas + Rayon-style CAD toolbar/inspector usability + Superpower-style soft glass metric widgets + dark-scan dotted-grid/orbit-selection interaction pattern + Graph Noir Red identity.
- Full spec split across 10 docs (see docs/V4_5_RESOURCE_LINKS.md index in RESOURCE_INDEX.md) — CAD toolbar groups, component-library rules, glass/shader tokens, floating widget system, interaction shortcuts, canvas grid/scale, selection arc, metric text animation, resource links.
- No UI built this phase — spec/registry only, to prevent random UI drift before V4.5B (graph/floor/import) lands.
- Selection arc: custom SVG allowed if smaller than a circular-slider dependency; otherwise library-first per Ponytail rule.

## V4.5B master graph (architecture)
- **Dual-model transition, not a rewrite:** new `src/domain/graph/` layer (ZonuertProject + selectors + adapters) added alongside the working `SpaceCell` store. Existing canvas/store untouched in V4.5B; V5 migrates the store to the graph with `SpaceCell` as a render projection (path in CENTRAL_GRAPH_SCHEMA.md).
- Stats are selector-computed only; `meta.far`/`ground_coverage`/`total_built_up_area` are explicit targets/caches, never actuals.
- Counting rules: locked + hidden spaces count in all stats; built-up excludes OUT; divide-by-zero → 0.
- Legacy `Privacy` maps P0/P1→public, P2→shared, P3–P5→private (adapters.ts).

## Phase 5 table sync
- Table edits legacy `SpaceCell` directly (categories stay free strings, privacy public/shared/private) — no graph-code migration in V5, per readiness audit recommendation. Graph adapters remain ready.
- TanStack Table skipped for V5: plain row-map over shadcn Table primitives is smaller/simpler at ≤50 cells with no sorting/filtering. Adopt TanStack only when sort/filter/virtualization is actually needed.
- Area edits use a local string draft committing only valid parses (clamp ≥ 1 m²) — keeps the store numeric-safe while allowing the field to be cleared mid-typing.

## Visual direction (reaffirmed)
Final visual target: Palmer editorial object canvas + iOS glassmorphism controls + Graph Noir Red architecture tool + premium animated agency-level interface.
Must preserve: Palmer-style warm cream day canvas, Graph Noir Red night mode, top-center Canvas/Table pill, bottom glass dock, left vertical rail, bottom-right zoom controls, red corner loader countdown, ~30% colorful gradient loader, scattered editorial circular cells, premium restrained typography. Must avoid: generic SaaS UI, random neon, childish animation, pipe bridges, red halo spam.

## V6F.0B production canvas UI architecture
- Production UI is organized into replaceable zones: left rail for modes/tools, bottom dock for primary creation and organism controls, right inspector for selected nucleus properties, floating widgets for selector-backed metrics, and hidden advanced/lab panels for renderer tuning.
- The bottom dock's center action becomes a high-emphasis `+ NUCLEUS` button. It creates store-owned `SpaceCell` data, never renderer-only nuclei.
- Organism style and palette are separate systems: style controls rendering behavior; palette controls color language, highlights, warnings, and future category influence.
- Advanced Organism Lab controls are preserved conceptually but hidden from production MVP. Debug views stay debug-only.
- Palette metadata should eventually live in `src/design/palettes.ts`; CSS tokens remain the implementation surface. No package installs are needed for V6F.0B.

## V6F.0C reference folder
- Production canvas UI references live at `assets/references/01` and are mood/structure references only.

## V6F.0D GitHub-only workflow
- GitHub is the source of truth for code.
- Do not use Google Drive as the code workflow source of truth right now.
- Codex is responsible for code editing, implementation, and checks.
- ChatGPT is responsible for planning, prompts, audits, and product decisions.
- Claude is reserved for design-heavy coding when needed.
- No remote, commit, or push should happen without explicit instruction.

## V6F.1 production organism canvas
- Production canvas now defaults to the WebGL organism renderer.
- Classic `CanvasView` remains as a first-class fallback via the dock renderer toggle.
- The V6E Organism Lab route remains preserved for advanced/debug exploration.
- Zustand `SpaceCell` remains the runtime product-data source of truth; the organism renderer receives adapted nuclei only.
- TableView remains unchanged and continues to sync through the same store.

## V6H production dock UI
- Production dock controls are grouped left/center/right: renderer/style/attachment/reach, high-emphasis `+ NUCLEUS`, and palette/demo/import/export.
- `settings.paletteMode` is a UI-ready setting only; category color mapping and renderer palette behavior remain deferred to V6I or a later explicit palette phase.
