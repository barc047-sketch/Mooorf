# ZONUERT Canvas Lab

Browser-first spatial planning canvas for exploring architectural programs as cells, tables, and the upcoming organism-field canvas.

## Current Status

V6F.0D is the GitHub-only coding workflow setup. V6F.0B and V6F.0C are complete. Next implementation phase is V6F.1 Production Organism Canvas Integration.

Current production direction: Organism Lab becomes the production canvas direction, while the old canvas remains a fallback until the new renderer is stable.

## Tech Stack

- Framework: React 19 + Vite
- Language: TypeScript
- Package manager: npm
- Build tool: Vite + `tsc -b`
- UI/component libraries: shadcn/Base UI primitives, Lucide, Motion, GSAP, Vaul, cmdk, Sonner
- State management: Zustand
- Canvas/rendering: current 2D canvas path plus isolated WebGL2 Organism Lab prototype
- Data/docs: central graph domain docs, table/canvas sync docs, import/export specs

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

No `lint`, `typecheck`, or `test` scripts are currently defined. `npm run build` runs TypeScript build plus Vite production build.

## Routes

- Main app: `/`
- Organism Lab prototype: `/experiments/organism-lab`

## Project Structure

- `src/` — app runtime
- `src/canvas/` — current canvas renderer and blob path
- `src/experiments/organism-lab/` — isolated WebGL2 organism prototype
- `src/state/` — Zustand store
- `src/views/` — table view
- `src/domain/graph/` — future graph/domain layer
- `docs/` — full handoff, task queue, architecture, decisions, bugs, and specs
- `assets/references/01/` — production canvas UI reference images

## GitHub Workflow

GitHub is the code backup and source of truth. Do not use Google Drive as the source of truth for code right now.

Role split:
- GitHub: code backup and source of truth
- Codex: code editing, implementation, checks, and local workflow setup
- ChatGPT: planning, prompts, audits, product decisions
- Claude: design-heavy coding only when needed

## Root Gateway Docs

- [HANDOFF.md](HANDOFF.md)
- [TASK_QUEUE.md](TASK_QUEUE.md)
- [DECISIONS.md](DECISIONS.md)
- [BUGS.md](BUGS.md)
- [CODEX_RULES.md](CODEX_RULES.md)

Detailed canonical docs live in `docs/`.
