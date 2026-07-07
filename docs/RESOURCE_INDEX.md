# RESOURCE INDEX — ZONUERT Canvas Lab

Canonical index of installed dependencies, MCPs, and reference links.
Raw link dump lives in `docs/LIBRARY_AND_GITHUB_INDEX.md`.

## Installed & wired (Prompt 01 setup)

### Renderer / state / geometry
`pixi.js` `@pixi/react` · `d3-contour` `d3-delaunay` `d3-shape` `d3-quadtree` `d3-force` · `rbush` `simplify-js` · `matter-js` · `@use-gesture/react` · `zustand` `nanoid` `stats.js` `comlink`

### Animation / UI
`gsap` `@gsap/react` (loader/cinematic) · `motion` (UI transitions) · `lucide-react` `sonner` `cmdk` `vaul` `@floating-ui/react` · `class-variance-authority` `clsx` `tailwind-merge` `tailwindcss-animate`

### Color / import / export / table
`culori` `colorjs.io` `chroma-js` `tinycolor2` `simplex-noise` · `papaparse` `xlsx` `jszip` `pdf-lib` `html-to-image` `file-saver` · `@tanstack/react-table`

### UI system
`tailwindcss` v4 (+ `@tailwindcss/vite`) · `shadcn` (Base UI registry) — components in `src/components/ui/*`, util in `src/lib/utils.ts`, config `components.json`. Alias `@/*` → `src/*`.

### Dev / types
`@types/*` for d3/rbush/papaparse/file-saver/stats.js/node · `vite-plugin-checker`

### Deliberately NOT installed (Prompt 01 guidance)
`three` `ogl` `lenis` `animejs` `@react-spring/web` — heavy 3D/scroll/extra animation stacks. Canvas/Pixi + GSAP + Motion is sufficient. Add only if a phase truly needs it (record in DECISIONS.md).
`@types/simplify-js` — does not exist on npm; `simplify-js` ships usable types.

## MCP servers (project scope: this repo)
| MCP | Command | Status |
|-----|---------|--------|
| zonuert-files (filesystem) | `npx -y @modelcontextprotocol/server-filesystem <proj>` | ✔ connected |
| memory | `npx -y @modelcontextprotocol/server-memory` | ✔ connected |
| sequential-thinking | `npx -y @modelcontextprotocol/server-sequential-thinking` | ✔ connected |
| playwright | `npx @playwright/mcp@latest` | ✔ connected |
| context7 | `npx -y @upstash/context7-mcp --api-key ***` | ✔ connected (keyed) |
| magic (21st.dev) | `npx -y @21st-dev/magic@latest API_KEY=***` | ✔ connected (keyed) |
| fetch | (Python `uvx mcp-server-fetch`) | ⚠ skipped — no npm pkg, `uv/uvx` not installed. Native WebFetch/WebSearch used instead. |

Keys live in `~/.claude.json` (project scope), NOT in this repo. Treat as secrets; rotate if exposed.
Optional/documented-only (not added): Serena (needs `uv`), Claude Context (needs Zilliz + OpenAI keys).

## High aesthetic UI / shadcn-style resources
- Skiper UI — https://skiper-ui.com/
- Cult UI — https://www.cult-ui.com/
- Watermelon UI — https://ui.watermelon.sh/
- Magic UI — https://github.com/magicuidesign/magicui
- Aceternity UI — https://ui.aceternity.com/
- React Bits — https://github.com/DavidHDev/react-bits
- 21st.dev Magic MCP — https://github.com/21st-dev/magic-mcp (installed, keyed, see MCP table above)

**Usage rule:** use these for bottom docks, glass panels, animated buttons, sliders, drawers, tool rails, command menus, loaders, cards, table shells, hover states, micro-interactions, empty states, animated backgrounds. Do not build generic handmade UI if an existing component/block can be adapted.

**Core UI rules (unchanged):** shadcn/Radix first for primitives · Lucide for icons · Sonner for toast · Motion/GSAP for animation · TanStack Table for table behavior · custom code only for canvas/rendering/state logic.

## Key reference links
- Palmer (visual north star) — https://www.palmer-dinnerware.com/
- PixiJS — https://github.com/pixijs/pixijs · Pixi React — https://github.com/pixijs/pixi-react
- GSAP — https://github.com/greensock/GSAP · Motion — https://github.com/motiondivision/motion
- shadcn/ui — https://github.com/shadcn-ui/ui · TanStack Table — https://github.com/TanStack/table
- d3-contour — https://github.com/d3/d3-contour · d3-delaunay — https://github.com/d3/d3-delaunay
- use-gesture — https://github.com/pmndrs/use-gesture · Zustand — https://github.com/pmndrs/zustand
- Context7 — https://github.com/upstash/context7 · MCP servers — https://github.com/modelcontextprotocol/servers
- Anthropic Skills — https://github.com/anthropics/skills

Full categorized list: `docs/LIBRARY_AND_GITHUB_INDEX.md`.

## V4.5A visual/resource system (docs only, spec not yet implemented)
`docs/V4_5_VISUAL_DIRECTION.md` · `docs/V4_5_CAD_TOOLBAR_SYSTEM.md` · `docs/V4_5_COMPONENT_LIBRARY_RULES.md` · `docs/V4_5_GLASS_SHADER_TOKENS.md` · `docs/V4_5_FLOATING_WIDGET_SYSTEM.md` · `docs/V4_5_INTERACTION_SHORTCUTS.md` · `docs/V4_5_CANVAS_GRID_AND_SCALE_SYSTEM.md` · `docs/V4_5_SELECTION_ARC_SYSTEM.md` · `docs/V4_5_METRIC_TEXT_ANIMATION.md` · `docs/V4_5_RESOURCE_LINKS.md`

Adds to approved UI resources: glasscn-ui, Tabler Icons, Iconoir, React Icons (see V4_5_COMPONENT_LIBRARY_RULES.md for full list).
