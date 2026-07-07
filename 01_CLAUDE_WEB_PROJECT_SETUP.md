# Claude Web Project Setup

## Create project

Name:

```text
ZONUERT Canvas Lab
```

Project knowledge:
- upload this full ZIP
- upload screenshot reference
- upload style-token markdown
- paste final master prompt

## First message to Claude Web

```text
Read the uploaded ZIP. Use the Palmer screenshot and style-token markdown as the key visual references. Do not code yet. First give me a short architecture plan, file tree, package stack, animation plan, and build order.
```

## Second message

After the plan is good:

```text
Now generate the Vite React TypeScript project files phase by phase. Start with design tokens, Zustand store, app shell, loading intro, and editorial canvas shell.
```

## Manual run

If Claude gives files but cannot run them:

```powershell
npm create vite@latest zonuert-canvas-lab -- --template react-ts
cd zonuert-canvas-lab
npm install
```

Then install packages from `04_INSTALL_COMMANDS.md`, copy files, and run:

```powershell
npm run dev
```
