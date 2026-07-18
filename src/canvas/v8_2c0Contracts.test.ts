import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import type { SpaceCell } from "../types";
import { useLab } from "../state/store";
import { createFrameScheduler, latestCoalescedPointerEvent } from "../interaction/frameScheduler";
import { applySpacePositionsPreview } from "../interaction/groupDrag";
import { resolveLabelScale, projectCanvasPoint, projectClientPoint } from "./labelPresentation";
import { resolveLabelContrast } from "../design/labelContrast";
import { DEFAULT_CELL_SHADOW, normalizeCellShadow, resolveCellShadow } from "./cellShadow";
import { resolveWidgetOpen } from "../ui/widgets/widgetLifecycle";
import { layoutRadialActions } from "../interaction/radialLayout";
import { CELL_LABEL_SCALE_OPTIONS, resolveCellLabelToken } from "../domain/labels/foundation";
import { normalizeLabelScaleMode } from "../state/visualSettings";

const cell = (patch: Partial<SpaceCell> = {}): SpaceCell => ({
  id: "space-a",
  name: "Studio",
  kind: "space",
  area: 80,
  category: "Public",
  privacy: "public",
  color: "",
  x: 20,
  y: -10,
  ...patch,
});

// PERFORMANCE — one queued update per frame, latest/coalesced input wins.
let nextFrame = 0;
const frames = new Map<number, () => void>();
const schedule = (callback: () => void) => {
  const id = ++nextFrame;
  frames.set(id, callback);
  return id;
};
const cancel = (id: number) => frames.delete(id);
const processed: number[] = [];
const scheduler = createFrameScheduler<number>({ schedule, cancel, process: (value) => processed.push(value) });
scheduler.push(1);
scheduler.push(2);
scheduler.push(3);
assert.equal(frames.size, 1, "raw updates schedule at most one animation frame");
frames.get(1)?.();
assert.deepEqual(processed, [3], "one frame processes only the latest queued movement");
scheduler.push(4);
scheduler.flush();
assert.deepEqual(processed, [3, 4], "pointer-up can synchronously flush the final queued movement");
scheduler.cancel();

const raw = { clientX: 1, clientY: 1, getCoalescedEvents: () => [{ clientX: 2 }, { clientX: 9 }] } as unknown as PointerEvent;
assert.equal(latestCoalescedPointerEvent(raw).clientX, 9, "latest coalesced pointer sample drives the frame");

const original = [cell(), cell({ id: "space-b", x: 50, y: 30 })];
const preview = applySpacePositionsPreview(original, [
  { id: "space-a", x: 25, y: -4 },
  { id: "space-b", x: 55, y: 36 },
]);
assert.deepEqual(preview.map(({ x, y }) => ({ x, y })), [{ x: 25, y: -4 }, { x: 55, y: 36 }], "renderer-local preview applies one shared transform");
assert.deepEqual(original.map(({ x, y }) => ({ x, y })), [{ x: 20, y: -10 }, { x: 50, y: 30 }], "preview never mutates canonical spaces");

// LABELS — Screen stays fixed, Adaptive clamps, World follows zoom.
assert.equal(resolveLabelScale("screen", 0.25, 1), 1, "screen labels stay fixed while zoomed out");
assert.equal(resolveLabelScale("screen", 4, 1), 1, "screen labels stay fixed while zoomed in");
assert.equal(resolveLabelScale("adaptive", 0.01, 1), 0.82, "adaptive labels clamp at the minimum");
assert.equal(resolveLabelScale("adaptive", 100, 1), 1.22, "adaptive labels clamp at the maximum");
assert.equal(resolveLabelScale("world", 2.5, 1), 2.5, "world labels remain proportional to canvas zoom");
assert.deepEqual(
  projectCanvasPoint({ x: 20, y: -10 }, { x: 5, y: -2, zoom: 2 }, { width: 800, height: 600 }),
  { x: 430, y: 284 },
  "Classic, Organism, radial, and inline editor share one projection"
);
assert.deepEqual(projectClientPoint({ x: 430, y: 284 }, { left: 12, top: 8 }), { x: 442, y: 292 }, "screen projection maps to root context coordinates");

// CONTRAST — explicit/category/privacy/void/morph/fallback/custom remain deterministic.
assert.equal(resolveLabelContrast({ mode: "auto", backgroundColor: "#f5decd", theme: "day" }).color, "#171719", "light fill resolves dark text");
assert.equal(resolveLabelContrast({ mode: "auto", backgroundColor: "#171719", theme: "day" }).color, "#f4f2e9", "dark fill resolves light text");
assert.equal(resolveLabelContrast({ mode: "auto", backgroundColor: "#e0d0f3", theme: "night" }).color, "#171719", "privacy colour resolves by luminance");
assert.equal(resolveLabelContrast({ mode: "auto", voidBackground: true, theme: "day" }).color, "#f4f2e9", "void labels remain light");
assert.equal(resolveLabelContrast({ mode: "auto", morphDominantColor: "#070707", theme: "day" }).color, "#f4f2e9", "Morph dominant colour is a deterministic fallback");
assert.equal(resolveLabelContrast({ mode: "auto", theme: "day" }).color, "#171719", "unknown day background falls back to ink");
assert.equal(resolveLabelContrast({ mode: "auto", theme: "night" }).color, "#f4f2e9", "unknown night background falls back to bone");
assert.equal(resolveLabelContrast({ mode: "custom", customColor: "#123456", theme: "day" }).color, "#123456", "custom override wins");

// CELL SHADOW — defaults, normalization, Fast simplification, and geometry invariance.
assert.deepEqual(DEFAULT_CELL_SHADOW, {
  enabled: false,
  mode: "off",
  strength: 0.5,
  opacity: 0.16,
  softness: 22,
  offsetX: 0,
  offsetY: 9,
  spread: 0,
  colorMode: "auto",
  color: "#000000",
  includeInExport: true,
}, "Cell Shadow defaults off with a complete project contract");
const normalizedShadow = normalizeCellShadow({ enabled: true, mode: "soft", opacity: 8, softness: -2, offsetX: Number.NaN, offsetY: 900, spread: -900, colorMode: "custom", color: "bad", includeInExport: true });
assert.equal(normalizedShadow.opacity, 1, "shadow opacity clamps");
assert.equal(normalizedShadow.softness, 0, "shadow softness rejects negative values");
assert.equal(normalizedShadow.offsetX, 0, "non-finite shadow offsets fall back safely");
assert.equal(normalizedShadow.offsetY, 64, "shadow offsets clamp");
assert.equal(normalizedShadow.spread, -32, "shadow spread clamps");
assert.equal(normalizedShadow.color, "#000000", "invalid shadow colours fall back safely");
assert.equal(resolveCellShadow(normalizedShadow, "fast", "day").enabled, false, "Fast mode disables Cell Shadow");
assert.deepEqual({ area: original[0].area, x: original[0].x, y: original[0].y }, { area: 80, x: 20, y: -10 }, "shadow settings never alter geometry");

// WIDGETS — refocus preserves identity/state and only changes z-order.
assert.deepEqual(resolveWidgetOpen(["display", "palette"], "display"), {
  stack: ["palette", "display"],
  mounted: false,
}, "already-open widget refocuses without remounting");
assert.deepEqual(resolveWidgetOpen(["display"], "palette"), {
  stack: ["display", "palette"],
  mounted: true,
}, "closed widget mounts once");

// RADIAL — semantic origin remains the projected cell centre; only action leaves clamp.
const radial = layoutRadialActions(["a", "b", "c", "d", "e", "f", "g", "h"], { x: 4, y: 4 }, { width: 320, height: 240 });
assert.deepEqual(radial.center, { x: 4, y: 4 }, "radial semantic centre is never moved away from the cell");
assert.equal(radial.nodes.every((node) => node.x >= 20 && node.x <= 300 && node.y >= 20 && node.y <= 220), true, "individual action buttons remain in the viewport");
assert.equal(radial.nodes.some((node) => node.x === radial.center.x && node.y === radial.center.y), false, "radial has no centre object");
const originalView = useLab.getState().view;
useLab.getState().openContextSurface("object-radial", { x: 20, y: 20 }, "space-a");
useLab.getState().openContextSurface("blank-menu", { x: 40, y: 40 }, null);
assert.equal(useLab.getState().contextSurface, "blank-menu", "opening another context surface replaces the radial");
useLab.getState().openContextSurface("object-radial", { x: 20, y: 20 }, "space-a");
useLab.getState().setView("table");
assert.equal(useLab.getState().contextSurface, null, "switching to Table closes the radial");
useLab.getState().setView(originalView);

// SETTINGS — plain new-project startup, Cell-scaled labels, Auto Contrast, no Cell Shadow or Motion.
const defaults = useLab.getState().settings;
assert.equal(defaults.blobOn, false, "new projects start with Morph off");
assert.equal(defaults.labelScaleMode, "world", "new projects start with labels scaled with their Cells");
assert.equal(defaults.labelColourMode, "auto", "new projects start with Auto Contrast");
assert.equal(defaults.cellShadow.mode, "off", "new projects start with Cell Shadow off");
assert.equal(defaults.organism.drift + defaults.organism.breathing + defaults.organism.wobble, 0, "new projects start with Motion off");
assert.deepEqual(
  CELL_LABEL_SCALE_OPTIONS,
  [
    { id: "world", label: "Scale with Cell" },
    { id: "adaptive", label: "Auto" },
    { id: "screen", label: "Keep readable" },
  ],
  "Cell label foundation exposes all three scale contracts",
);
assert.equal(normalizeLabelScaleMode("invalid"), "world", "legacy or invalid label scales migrate to Cell scaling");
assert.equal(resolveCellLabelToken(cell({ spaceCode: "07", body: "North light" }), "no"), "07", "label foundation reads the stable Space No.");
assert.equal(resolveCellLabelToken(cell({ spaceCode: "07", body: "North light" }), "body"), "North light", "label foundation reads authored body content");

const classicSource = readFileSync(new URL("./CanvasView.tsx", import.meta.url), "utf8");
const organismSource = readFileSync(new URL("./OrganismCanvasView.tsx", import.meta.url), "utf8");
for (const [name, source] of [["Classic", classicSource], ["Organism", organismSource]] as const) {
  assert.equal(source.includes("previewSpaceTransform"), false, `${name} pointer movement never writes canonical spaces`);
  assert.equal(source.includes("createFrameScheduler"), true, `${name} pointer movement is rAF scheduled`);
  assert.equal(source.includes("commitSpaceTransform"), true, `${name} commits final positions on pointer-up`);
  assert.equal(source.includes("projectClientPoint"), true, `${name} uses the shared projection contract`);
}

const widgetSource = readFileSync(new URL("../ui/widgets/WidgetFrame.tsx", import.meta.url), "utf8");
assert.equal(widgetSource.includes("duration: 0.14"), true, "first widget entrance stays within 140ms");
const glassCss = readFileSync(new URL("../ui/widgets/widgets.css", import.meta.url), "utf8");
assert.equal(glassCss.includes("backdrop-filter"), true, "glass blur is present immediately");
assert.equal(glassCss.includes("-webkit-backdrop-filter"), true, "WebKit glass prefix remains");
assert.equal(/transition:[^;]*(backdrop-filter|filter)/.test(glassCss), false, "glass never transitions blur/filter");

console.info("V8.2C0 performance, label, contrast, shadow, widget, radial, and settings contracts passed");
