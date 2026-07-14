import { readFileSync } from "node:fs";

const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

const view = readFileSync(`${process.cwd()}/src/canvas/OrganismCanvasView.tsx`, "utf8");
const shader = readFileSync(`${process.cwd()}/src/experiments/organism-lab/organism-shader.ts`, "utf8");
const css = readFileSync(`${process.cwd()}/src/canvas/organismCanvas.css`, "utf8");

ok(view.includes("projectRuntimePresentation"), "Organism consumes the shared canonical runtime projection");
ok(!view.includes("resolveCellAppearance"), "Organism does not create a second appearance resolver");
ok(view.includes("projectCircleLayers"), "Organism projects the shared Cell/Boundary/Core/Void circle layers");
ok(view.includes("drawCircleLayers"), "Organism uses the shared Canvas2D layer adapter");
ok(
  view.includes("cell: !cachedPresentation.membrane.visible && cachedPresentation.membraneEdge.visible"),
  "Organism keeps Cell visible in the edge-only field without flattening the default shader baseline"
);
ok(view.includes("projectSelectionOverlay"), "Organism selection uses the explicit temporary projection");
ok(view.includes("presentationCanvasRef"), "Organism owns a lightweight presentation overlay");
ok(view.includes("cctx.drawImage(presentationCanvas"), "Organism capture includes runtime presentation layers");
ok(css.includes(".organism-presentation-canvas") && css.includes("pointer-events: none"), "Organism presentation overlay cannot block drag, pan, or zoom");

for (const uniform of ["uMembraneOpacity", "uMembraneEdgeOpacity", "uMembraneEdgeWidth"]) {
  ok(shader.includes(uniform), `Organism shader exposes bounded ${uniform} support`);
}
ok(view.includes("frame.membraneOpacity"), "Organism frame consumes canonical Membrane visibility/opacity");
ok(view.includes("frame.membraneEdgeOpacity"), "Organism frame consumes canonical Membrane Edge visibility/opacity");
ok(view.includes("frame.membraneEdgeWidth"), "Organism frame consumes canonical Membrane Edge width");
ok(!shader.includes("dash-dot") && !shader.includes("segmented-bars"), "Organism shader never claims unsupported technical Boundary styles");

console.info("runtime Organism wiring contracts passed");
