# GitHub Workflow

## Repository

- URL: https://github.com/barc047-sketch/Mooorf
- Remote: `origin`
- Branch: `main`

GitHub is the source of truth for ZONUERT code. Google Drive is not used for the code workflow right now.

## Clone

```bash
git clone https://github.com/barc047-sketch/Mooorf.git
cd Mooorf
npm install
```

## Pull Latest

```bash
git checkout main
git pull origin main
```

## Push

```bash
git status
npm run build
git push
```

## Roles

- GitHub: code backup and source of truth.
- Codex: code editing, implementation, and local checks.
- ChatGPT: planning, prompt making, audit, and product decisions.
- Claude: design-heavy coding only when needed.

## Rules

- Never commit secrets, `.env` files, API keys, tokens, or private local settings.
- Do not commit `node_modules`, `dist`, build outputs, `.DS_Store`, or TypeScript build info.
- Always run `npm run build` before a final report when code or workflow changes are made.
- Keep the old canvas fallback until the production organism canvas is stable.
- Do not start later roadmap phases without explicit instruction.

## Next Phase

Next remains V6F.1 Production Organism Canvas Integration.
