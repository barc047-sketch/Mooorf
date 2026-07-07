$ProjectName = "zonuert-canvas-lab"

Write-Host "Creating Vite React TS project: $ProjectName" -ForegroundColor Cyan
npm create vite@latest $ProjectName -- --template react-ts
Set-Location $ProjectName
npm install

npm i pixi.js @pixi/react d3-contour d3-delaunay d3-shape d3-quadtree d3-force rbush simplify-js polyclip-ts martinez-polygon-clipping matter-js @use-gesture/react zustand nanoid stats.js comlink
npm i motion gsap @gsap/react lenis animejs ogl three @react-spring/web
npm i lucide-react sonner cmdk vaul class-variance-authority clsx tailwind-merge tailwindcss-animate @floating-ui/react
npm i culori colorjs.io chroma-js tinycolor2 svg-path-commander rough-notation simplex-noise
npm i papaparse xlsx jszip pdf-lib html-to-image file-saver @tanstack/react-table
npm i -D @types/d3-contour @types/d3-delaunay @types/d3-shape @types/d3-quadtree @types/d3-force @types/rbush @types/simplify-js @types/papaparse @types/file-saver @types/stats.js vite-plugin-checker

npx shadcn@latest init
npx shadcn@latest add button slider tabs sheet dialog popover select switch tooltip separator badge input label sonner card drawer command table scroll-area dropdown-menu progress

New-Item -ItemType Directory -Force docs, skills, assets, assets/references, assets/textures, assets/overlays, assets/icons, assets/palettes, src/domain, src/domain/graph, src/store, src/views, src/views/canvas, src/views/table, src/components, src/components/studio, src/components/ui, src/lib, src/lib/geometry, src/lib/performance, src/lib/import, src/lib/export, src/lib/animation | Out-Null

Write-Host "Setup complete. Copy this package's CLAUDE.md, docs, skills, and assets into the project root." -ForegroundColor Green
