# Claude Code Local Setup — Windows

## Install Claude Code

```powershell
irm https://claude.ai/install.ps1 | iex
```

Verify:

```powershell
claude --version
```

Alternative:

```powershell
npm install -g @anthropic-ai/claude-code
```

## Create lab

```powershell
cd X:\
npm create vite@latest zonuert-canvas-lab -- --template react-ts
cd zonuert-canvas-lab
npm install
```

## Copy setup package files

Extract this ZIP and copy into project root:

```text
CLAUDE.md
docs/
skills/
assets/
03_FINAL_MASTER_PROMPT_FOR_CLAUDE.md
04_INSTALL_COMMANDS.md
05_MCP_SETUP_COMMANDS.md
```

## Install packages

Run commands from:

```text
04_INSTALL_COMMANDS.md
```

## Add MCPs

Run the minimum MCPs from:

```text
05_MCP_SETUP_COMMANDS.md
```

## Start Claude

```powershell
claude
```

Inside Claude:

```text
/init
/memory
/mcp
```

Then paste:

```text
Read CLAUDE.md and 03_FINAL_MASTER_PROMPT_FOR_CLAUDE.md. Use the Palmer screenshot and style-token markdown as visual references. Give a short implementation plan first, then build phase by phase.
```
