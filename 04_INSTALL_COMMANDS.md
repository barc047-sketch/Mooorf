# Install Commands — Final Package

## Create project

```powershell
cd X:\
npm create vite@latest zonuert-canvas-lab -- --template react-ts
cd zonuert-canvas-lab
npm install
```

## Renderer / canvas / geometry

```powershell
npm i pixi.js @pixi/react
npm i d3-contour d3-delaunay d3-shape d3-quadtree d3-force
npm i rbush simplify-js polyclip-ts martinez-polygon-clipping
npm i matter-js @use-gesture/react zustand nanoid stats.js comlink
```

## Premium animation

```powershell
npm i motion gsap @gsap/react lenis animejs ogl three
npm i @react-spring/web
```

Use:
- GSAP for loading screen/cinematic sequence
- Motion for UI transitions
- Lenis only if scroll sections are added later
- OGL/Three only for gradient/noise shader experiments, not required for core canvas

## UI / icons / glass components

```powershell
npm i lucide-react sonner cmdk vaul
npm i class-variance-authority clsx tailwind-merge tailwindcss-animate
npm i @floating-ui/react
```

## Color / visual utilities

```powershell
npm i culori colorjs.io chroma-js tinycolor2
npm i svg-path-commander rough-notation simplex-noise
```

## Import / export / table

```powershell
npm i papaparse xlsx jszip pdf-lib html-to-image file-saver
npm i @tanstack/react-table
```

## Dev / types / testing

```powershell
npm i -D @types/d3-contour @types/d3-delaunay @types/d3-shape @types/d3-quadtree @types/d3-force
npm i -D @types/rbush @types/simplify-js @types/papaparse @types/file-saver @types/stats.js
npm i -D vite-plugin-checker
npm init playwright@latest
```

## shadcn/ui

```powershell
npx shadcn@latest init
npx shadcn@latest add button slider tabs sheet dialog popover select switch tooltip separator badge input label sonner card drawer command table scroll-area dropdown-menu progress
```

## One-shot package install

```powershell
npm i pixi.js @pixi/react d3-contour d3-delaunay d3-shape d3-quadtree d3-force rbush simplify-js polyclip-ts martinez-polygon-clipping matter-js @use-gesture/react zustand nanoid stats.js comlink motion gsap @gsap/react lenis animejs ogl three @react-spring/web lucide-react sonner cmdk vaul class-variance-authority clsx tailwind-merge tailwindcss-animate @floating-ui/react culori colorjs.io chroma-js tinycolor2 svg-path-commander rough-notation simplex-noise papaparse xlsx jszip pdf-lib html-to-image file-saver @tanstack/react-table
```

## Do not overuse

Do not use all animation libraries at once.
Choose:
- GSAP loader
- Motion UI
- Pixi/Canvas runtime
