# Claude Setup Routes

## Route A — Claude Web Project

Use if you only logged into Claude in browser.

Steps:
1. Create a Claude Project named `ZONUERT Canvas Lab`.
2. Upload this final ZIP.
3. Upload/confirm:
   - `palmer_editorial_canvas_screenshot.png`
   - `palmer_style_reference_tokens.md`
4. Paste `03_FINAL_MASTER_PROMPT_FOR_CLAUDE.md`.
5. Ask Claude to first output:
   - architecture
   - file tree
   - package list
   - build phases
   - risk notes
6. Then tell Claude to generate files phase by phase.

## Route B — Claude Code Local

Best route.

Steps:
1. Install Claude Code.
2. Create `X:\Zonuert-Canvas-Lab`.
3. Scaffold Vite React TS project.
4. Copy this package into project root.
5. Install packages from `04_INSTALL_COMMANDS.md`.
6. Add MCPs from `05_MCP_SETUP_COMMANDS.md`.
7. Run Claude Code.
8. Paste `03_FINAL_MASTER_PROMPT_FOR_CLAUDE.md`.

## Route C — GitHub Repo

Create new repo:

```text
zonuert-canvas-lab
```

Then let Claude Code work through repo. Do not use your existing V1 repo yet.
