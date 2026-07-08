# ZONUERT Task Queue

Short gateway queue. Full details live in [docs/TASK_QUEUE.md](docs/TASK_QUEUE.md).

## Urgent / Next

- V6G QA / stabilization
- Full organism/classic regression pass
- WebGL fallback/context lifecycle check
- 30-60 nuclei performance sampling
- Mobile/narrow viewport dock and label pass
- Table sync regression pass

## Workflow Complete

- V6F.0F.3 GitHub Push / Doc Sync
- Remote: `origin`
- Repo: https://github.com/barc047-sketch/Mooorf
- Branch: `main`
- GitHub is source of truth

## Urgent Bugs

- Recheck table sync after V6F.1
- Recheck WebGL lifecycle and fallback behavior after V6F.1
- Recheck mobile layout after production dock changes

## UI Polish

- Production bottom dock refinement
- Central `+ NUCLEUS` button polish
- Style / attachment / palette panel polish
- Right inspector later
- Floating widgets later

## Performance

- WebGL lifecycle
- DPR clamp
- Known Vite chunk warning around 500-580 kB
- 30-60 nuclei performance
- Avoid per-frame React state

## Refactor

- SpaceCell -> nucleus adapter
- Renderer modularization
- Share production/lab shader utilities only where safe

## Future Features

- Selection arc
- Cmd/Ctrl-scroll resize
- Floating widgets
- Floors
- Export
- Gallery/templates later
