# ZONUERT Decisions

Short gateway decisions file. Full details live in [docs/DECISIONS.md](docs/DECISIONS.md).

## Workflow Decisions

- GitHub is the source of truth for code.
- Do not use Google Drive as the code workflow source of truth right now.
- Codex edits code, runs checks, and documents implementation work.
- ChatGPT plans, writes prompts, audits, and supports product decisions.
- Claude is reserved for design-heavy coding phases when needed.

## Product / Architecture Decisions

- Organism Lab is the preferred production renderer direction.
- Old canvas remains fallback until the new organism canvas is fully stable.
- Zustand `SpaceCell` remains the runtime source of truth for now.
- No master graph runtime migration yet.
- No new packages without clear need.
- Keep UI modular and replaceable.
