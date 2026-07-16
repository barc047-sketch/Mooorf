import { readFileSync } from "node:fs";

const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

const view = readFileSync(`${process.cwd()}/src/canvas/OrganismCanvasView.tsx`, "utf8");
const detachedExport = readFileSync(`${process.cwd()}/src/export/organismExport.ts`, "utf8");
const shader = readFileSync(`${process.cwd()}/src/experiments/organism-lab/organism-shader.ts`, "utf8");
const css = readFileSync(`${process.cwd()}/src/canvas/organismCanvas.css`, "utf8");

// Source-wiring and selector ownership contracts; runtime behaviour is covered by the PF1 suites.
ok(view.includes("projectRuntimePresentation"), "Organism consumes the shared canonical runtime projection");
ok(!view.includes("resolveCellAppearance"), "Organism does not create a second appearance resolver");
ok(view.includes("projectCircleLayers"), "Organism projects the shared Cell/Boundary/Core/Void circle layers");
ok(view.includes("drawOrganismCircleOverlay"), "Organism uses the shared Canvas2D layer adapter");
ok(view.includes("plainMode") && view.includes("backgroundColour"), "Organism masks its plain legacy body before drawing canonical Cell appearance");
ok(view.includes('boundaryFallbackCount = "0"'), "Organism reports truthful technical Boundary support");
ok(view.includes("projectOrganismDebugPresentation"), "Organism debug projection keeps geometry markers separate from Core");
ok(view.includes("projectSelectionOverlay"), "Organism selection uses the explicit temporary projection");
ok(view.includes("presentationCanvasRef"), "Organism owns a lightweight presentation overlay");
ok(view.includes("renderDetachedOrganismExport(snapshot, options, w, h)"), "Organism delegates capture to detached authored export");
ok(detachedExport.includes("buildClassicSvg"), "Detached Organism export builds authored presentation overlays");
ok(detachedExport.includes("drawSvgOverlay(output, overlay)"), "Detached Organism export composites authored presentation overlays");
ok(!view.includes("drawImage(presentationCanvas"), "Mounted live presentation Canvas is not used as export truth");
ok(css.includes(".organism-presentation-canvas") && css.includes("pointer-events: none"), "Organism presentation overlay cannot block drag, pan, or zoom");

for (const uniform of ["uMembraneOpacity", "uMembraneEdgeOpacity", "uMembraneEdgeWidth"]) {
  ok(shader.includes(uniform), `Organism shader exposes bounded ${uniform} support`);
}
ok(view.includes("frame.membraneOpacity"), "Organism frame consumes canonical Membrane visibility/opacity");
ok(view.includes("frame.membraneEdgeOpacity"), "Organism frame consumes canonical Membrane Edge visibility/opacity");
ok(view.includes("frame.membraneEdgeWidth"), "Organism frame consumes canonical Membrane Edge width");
ok(!shader.includes("dash-dot") && !shader.includes("segmented-bars"), "Organism shader never claims unsupported technical Boundary styles");

console.info("runtime Organism wiring contracts passed");
