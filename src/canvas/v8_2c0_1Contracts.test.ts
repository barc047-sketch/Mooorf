import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import type { SpaceCell } from "../types";
import { useLab } from "../state/store";
import { createDemandFrameLoop } from "../interaction/frameScheduler";
import { resolveSelectionRingState } from "../interaction/selection";
import { resolveOrganism } from "./organismProductionSettings";

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

// RUNTIME — invalidate once, render once, then sleep; continuous Motion is explicit.
let nextFrame = 0;
const frames = new Map<number, (now: number) => void>();
const rendered: number[] = [];
let continueRendering = false;
const loop = createDemandFrameLoop({
  schedule: (callback) => {
    const id = ++nextFrame;
    frames.set(id, (now) => {
      frames.delete(id);
      callback(now);
    });
    return id;
  },
  cancel: (id) => frames.delete(id),
  render: (now) => {
    rendered.push(now);
    return continueRendering;
  },
});
loop.invalidate();
loop.invalidate();
assert.equal(frames.size, 1, "multiple invalidations schedule one frame");
frames.get(1)?.(16);
assert.deepEqual(rendered, [16], "dirty Canvas renders once");
assert.equal(frames.size, 0, "idle Canvas sleeps after the required frame");
continueRendering = true;
loop.invalidate();
frames.get(2)?.(32);
assert.equal(frames.size, 1, "settling or Motion requests the next frame");
continueRendering = false;
frames.get(3)?.(48);
assert.equal(frames.size, 0, "Canvas sleeps as soon as continuous work ends");
loop.setContinuous(true);
assert.equal(frames.size, 1, "Motion wakes one scheduler");
loop.setContinuous(false);
frames.get(4)?.(64);
assert.equal(frames.size, 0, "Motion Off releases the scheduler");
loop.cancel();

// EDITING — one canonical edit transaction with one Undo and one Redo.
useLab.setState({
  spaces: [cell()],
  selectedIds: ["space-a"],
  primarySelectedId: "space-a",
  selectedId: "space-a",
  transformUndoStack: [],
  transformRedoStack: [],
});
useLab.getState().commitSpaceEdit("space-a", { name: "Gallery", area: 120 });
assert.deepEqual(
  useLab.getState().spaces.map(({ name, area }) => ({ name, area })),
  [{ name: "Gallery", area: 120 }],
  "inline edit commits Name and Area atomically"
);
assert.equal(useLab.getState().transformUndoStack.length, 1, "inline edit creates one history transaction");
useLab.getState().undoSpaceTransform();
assert.deepEqual(
  useLab.getState().spaces.map(({ name, area }) => ({ name, area })),
  [{ name: "Studio", area: 80 }],
  "one Undo restores the prior Name and Area"
);
useLab.getState().redoSpaceTransform();
assert.deepEqual(
  useLab.getState().spaces.map(({ name, area }) => ({ name, area })),
  [{ name: "Gallery", area: 120 }],
  "one Redo restores the committed Name and Area"
);

// MOTION — reduced motion suppresses decorative work without changing settings.
const settings = useLab.getState().settings;
const movingSettings = {
  ...settings,
  organism: { ...settings.organism, motionEnabled: true, drift: 0.28, breathing: 0.3, wobble: 0.12 },
};
assert.equal(resolveOrganism(movingSettings).motionActive, true, "Motion On requests continuous rendering");
assert.equal(resolveOrganism(movingSettings, true).motionActive, false, "reduced motion suppresses decorative rendering");
assert.equal(movingSettings.organism.drift, 0.28, "reduced motion never mutates project settings");

// SELECTION — one external state: primary solid, secondary dashed, hover only when unselected.
assert.equal(resolveSelectionRingState(false, false, false), "none", "normal Cell has no selection ring");
assert.equal(resolveSelectionRingState(false, false, true), "hover", "hover gets one subtle external keyline");
assert.equal(resolveSelectionRingState(true, true, true), "primary", "selected plus hover keeps only primary selection");
assert.equal(resolveSelectionRingState(true, false, true), "secondary", "secondary selection remains distinct and singular");

const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const organismSource = readFileSync(new URL("./OrganismCanvasView.tsx", import.meta.url), "utf8");
const editorSource = readFileSync(new URL("./InlineCellEditor.tsx", import.meta.url), "utf8");
const contextSource = readFileSync(new URL("../ui/context/ContextSurfaceHost.tsx", import.meta.url), "utf8");
const dockSource = readFileSync(new URL("../ui/Dock.tsx", import.meta.url), "utf8");
const shellCss = readFileSync(new URL("../ui/shell.css", import.meta.url), "utf8");
const organismCss = readFileSync(new URL("./organismCanvas.css", import.meta.url), "utf8");

const activeRendererMatch = appSource.match(
  /rendererMode === "organism"\s*\?\s*\(\s*(<OrganismCanvasView[\s\S]*?\/>)\s*\)\s*:\s*<CanvasView\s*\/>/,
);
assert.notEqual(activeRendererMatch, null, "App mounts exactly one renderer strategy");
const activeRendererSource = activeRendererMatch?.[1] ?? "";
assert.equal(activeRendererSource.includes("active={!tableActive}"), true, "active Organism receives App workspace ownership");
assert.equal(activeRendererSource.includes("onResumeReady={handleOrganismResumeReady}"), true, "active Organism receives App readiness ownership");
assert.equal(activeRendererSource.includes("<CanvasView"), false, "active Organism path does not mount Classic Canvas");
assert.equal(organismSource.includes('from "./CanvasView"'), false, "active Organism does not import Classic Canvas");
assert.equal(organismSource.includes('setSettings({ rendererMode: "classic" })'), false, "Organism never switches the canonical renderer automatically");
assert.equal(organismSource.includes("createDemandFrameLoop"), true, "active Organism uses demand-driven rendering");
assert.equal(dockSource.includes("ORG"), false, "ordinary UI does not expose ORG");
assert.equal(dockSource.includes("CLS"), false, "ordinary UI does not expose CLS");
assert.equal(dockSource.includes("useTransform"), false, "Dock has no proximity magnification transform");
assert.equal(dockSource.includes("useSpring"), false, "Dock has no neighbour scaling spring");
assert.equal(/\.nucleus-orb:hover\s*\{[^}]*scale\(/s.test(shellCss), false, "Add Space never scales on hover");
assert.equal(/\.dock-btn:hover[^}]*\{[^}]*transform:/s.test(shellCss), false, "bottom controls keep stable hover geometry");

assert.equal(editorSource.includes("commitSpaceEdit"), true, "inline editor uses canonical history-aware commit");
assert.equal(editorSource.includes(".select()"), true, "opening the editor selects existing Name text");
assert.equal(editorSource.includes("onDoubleClick"), true, "editor isolates double-click from Canvas gestures");
assert.equal(contextSource.includes('contextSurface === "inline-editor"'), true, "context host preserves editor ownership during outside commit");

assert.equal(organismSource.includes("MovingBorder"), false, "production Cell selection has no animated/debug nucleus ring");
assert.equal(organismSource.includes("organism-cell-keyline"), true, "Organism renders one shared external Cell keyline");
assert.equal(organismCss.includes('[data-ring="primary"]'), true, "primary selection is a solid external ring");
assert.equal(organismCss.includes('[data-ring="secondary"]'), true, "secondary selection is a dashed external ring");

console.info("V8.2C0.1 Canvas stabilization contracts passed");
