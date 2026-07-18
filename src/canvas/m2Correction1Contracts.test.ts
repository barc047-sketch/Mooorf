import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createProjectPresentationDefaults } from "../domain/presentation/defaults";
import { resolveCellAppearance } from "../domain/presentation/resolveAppearance";
import { normalizeProjectPresentationDefaults } from "../domain/presentation/validation";
import { areaToRadius } from "../lib/geometry";
import { iconRegistry } from "../icons/iconRegistry";
import { normalizeIconPlacement } from "../icons/iconValidation";
import { buildClassicSvg } from "../export/svgExport";
import {
  DEFAULT_RESOURCE_SETTINGS,
  normalizeResourceSettings,
  RESOURCE_SCHEMA_VERSION,
} from "../resources/resourcePersistence";
import { useLab } from "../state/store";
import type { SpaceCell } from "../types";
import * as presentation from "./presentationLayers";

const initial = useLab.getInitialState();

const cell = (id: string, x: number, y: number, area = 80, kind: "space" | "void" = "space"): SpaceCell => ({
  id,
  name: `Cell ${id}`,
  body: `Body ${id}`,
  kind,
  area,
  category: kind === "void" ? "Void" : "Work",
  privacy: "shared",
  color: "",
  x,
  y,
});

const centroid = (spaces: readonly SpaceCell[]) => ({
  x: spaces.reduce((sum, space) => sum + space.x, 0) / Math.max(1, spaces.length),
  y: spaces.reduce((sum, space) => sum + space.y, 0) / Math.max(1, spaces.length),
});

const resetStore = (spaces: SpaceCell[], selectedIds: string[] = [], primarySelectedId: string | null = null) => {
  useLab.setState({
    spaces,
    selectedIds,
    primarySelectedId,
    selectedId: primarySelectedId,
    camera: { x: 0, y: 0, zoom: 1 },
    settings: {
      ...initial.settings,
      rendererMode: "organism",
      resources: normalizeResourceSettings(DEFAULT_RESOURCE_SETTINGS),
    },
    transformUndoStack: [],
    transformRedoStack: [],
    resourcesPreview: null,
  });
};

test("current layout presets arrange only the selected subset and create one undo transaction", () => {
  const before = [cell("a", -120, -20), cell("b", 80, 40), cell("fixed", 900, 700)];
  resetStore(before, ["a", "b"], "b");
  const beforeCentroid = centroid(before.slice(0, 2));

  useLab.getState().applyLayoutPreset("colony");
  const arranged = useLab.getState();
  const fixed = arranged.spaces.find((space) => space.id === "fixed")!;
  const selected = arranged.spaces.filter((space) => space.id === "a" || space.id === "b");
  const afterCentroid = centroid(selected);

  assert.deepEqual({ x: fixed.x, y: fixed.y }, { x: 900, y: 700 }, "unselected entities remain fixed");
  assert.ok(selected.some((space, index) => space.x !== before[index].x || space.y !== before[index].y), "selected entities visibly move");
  assert.ok(Math.abs(afterCentroid.x - beforeCentroid.x) < 1e-9, "selected subset preserves its x centroid");
  assert.ok(Math.abs(afterCentroid.y - beforeCentroid.y) < 1e-9, "selected subset preserves its y centroid");
  assert.equal(arranged.transformUndoStack.length, 1, "one preset action creates one history transaction");
  assert.deepEqual(
    selected.map(({ id, name, body, area, category, privacy, kind }) => ({ id, name, body, area, category, privacy, kind })),
    before.slice(0, 2).map(({ id, name, body, area, category, privacy, kind }) => ({ id, name, body, area, category, privacy, kind })),
    "arrangement preserves non-positional Cell data",
  );

  useLab.getState().undoSpaceTransform();
  assert.deepEqual(useLab.getState().spaces.map(({ id, x, y }) => ({ id, x, y })), before.map(({ id, x, y }) => ({ id, x, y })), "Undo restores the complete pre-arrangement layout");
});

test("no-selection arrangement affects all renderer-visible entities and Random preserves their centroid", () => {
  const before = Array.from({ length: 100 }, (_, index) => cell(`v${index}`, index * 110, index % 2 ? 40 : -40, 20));
  resetStore(before);
  const visibleBeforeCentroid = centroid(before.slice(0, 96));

  useLab.getState().applyLayoutPreset("random");
  const after = useLab.getState().spaces;
  const visibleAfterCentroid = centroid(after.slice(0, 96));

  assert.ok(after.slice(0, 96).some((space, index) => space.x !== before[index].x || space.y !== before[index].y), "visible entities move");
  assert.deepEqual(after.slice(96).map(({ x, y }) => ({ x, y })), before.slice(96).map(({ x, y }) => ({ x, y })), "entities outside the Organism render cap remain fixed");
  assert.ok(Math.abs(visibleAfterCentroid.x - visibleBeforeCentroid.x) < 1e-9, "Random preserves the arranged subset x centroid");
  assert.ok(Math.abs(visibleAfterCentroid.y - visibleBeforeCentroid.y) < 1e-9, "Random preserves the arranged subset y centroid");
  assert.equal(useLab.getState().transformUndoStack.length, 1, "Random creates one history transaction");
});

test("batch Add Cells is radius-aware, multi-selects the batch, and undoes/redoes as one action", () => {
  const existing = cell("existing", 0, 0, 900);
  resetStore([existing], [existing.id], existing.id);

  useLab.getState().addSpaces(5);
  const addedState = useLab.getState();
  const added = addedState.spaces.filter((space) => space.id !== existing.id);
  assert.equal(added.length, 5);
  assert.deepEqual(addedState.selectedIds, added.map((space) => space.id), "the new batch becomes one multi-selection");
  assert.equal(addedState.primarySelectedId, added[added.length - 1]?.id ?? null, "the final new Cell is the primary member of the batch selection");
  assert.equal(addedState.transformUndoStack.length, 1, "one batch add creates one history transaction");

  const all = [existing, ...added];
  for (let left = 0; left < all.length; left += 1) {
    for (let right = left + 1; right < all.length; right += 1) {
      const a = all[left];
      const b = all[right];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      assert.ok(distance >= areaToRadius(a.area) + areaToRadius(b.area) + 4, `${a.id} and ${b.id} start visibly separated`);
    }
  }

  const addedIds = added.map((space) => space.id);
  useLab.getState().undoSpaceTransform();
  assert.deepEqual(useLab.getState().spaces.map((space) => space.id), [existing.id], "Undo removes the complete new batch");
  assert.deepEqual(useLab.getState().selectedIds, [existing.id], "Undo restores the prior selection");
  useLab.getState().redoSpaceTransform();
  assert.deepEqual(useLab.getState().spaces.map((space) => space.id), [existing.id, ...addedIds], "Redo restores the complete new batch");
  assert.deepEqual(useLab.getState().selectedIds, addedIds, "Redo restores the batch multi-selection");
});

test("Symbol pane stays canonical while Canvas preview remains ephemeral", () => {
  const source = readFileSync(new URL("../ui/widgets/SymbolInspectorPane.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /resourcesPreview\s*\?\?\s*state\.settings\.resources/, "pane geometry never subscribes to ephemeral resourcesPreview");
  assert.match(source, /commitSymbolPreview/, "slider release commits the store-owned ephemeral preview without reading it into pane geometry");

  const target = cell("symbol-target", 0, 0);
  resetStore([target], [target.id], target.id);
  const placement = normalizeIconPlacement({
    iconId: "icon:architecture:door",
    targetSpaceId: target.id,
    tintMode: "auto",
    tint: "#cc0000",
  });
  useLab.getState().previewSymbolPlacement(target.id, placement);
  assert.equal(useLab.getState().settings.resources.iconPlacements.length, 0, "preview never mutates canonical pane resources");
  assert.equal(useLab.getState().resourcesPreview?.iconPlacements.length, 1, "Canvas projection receives the ephemeral preview");
  assert.equal(typeof (useLab.getState() as unknown as { commitSymbolPreview?: unknown }).commitSymbolPreview, "function", "store exposes one preview commit owner");
});

test("resource migration preserves legacy tint while new Auto Contrast and Void targets are canonical", () => {
  assert.equal(RESOURCE_SCHEMA_VERSION, 3);
  const legacy = normalizeResourceSettings({
    ...DEFAULT_RESOURCE_SETTINGS,
    schemaVersion: 2,
    iconPlacements: [{ iconId: "icon:door", targetSpaceId: "legacy", tint: "#336699" }],
  });
  assert.equal(legacy.iconPlacements[0]?.tintMode, "custom", "legacy placements retain their authored visible tint");
  assert.equal(legacy.iconPlacements[0]?.tint, "#336699");
  const automatic = normalizeIconPlacement({ iconId: "icon:door", targetSpaceId: "void-a", tintMode: "auto", tint: "#ff0000" });
  assert.equal(automatic.tintMode, "auto");
  assert.equal(iconRegistry.listByTarget("void").length, 133, "every approved presentation symbol is discoverable for Voids");
});

test("Void Edge defaults solid and reuses all six shared stroke projections", () => {
  const defaults = normalizeProjectPresentationDefaults(createProjectPresentationDefaults());
  assert.equal(defaults.schemaVersion, 6);
  assert.equal(defaults.void.style, "solid");
  const voidCell = cell("void-stroke", 0, 0, 80, "void");
  const context = {
    paletteMode: "core" as const,
    colorSource: "category" as const,
    nucleusPaletteId: "editorial-aurora",
    organismPaletteId: "mode",
    areaRange: { min: 80, max: 80 },
    spaces: [voidCell],
    theme: "day" as const,
  };
  for (const style of ["solid", "dashed", "dotted", "dash-dot", "segmented-bars", "double"] as const) {
    const appearance = resolveCellAppearance({ ...voidCell, appearance: { void: { style } } }, defaults, context);
    const layers = presentation.projectCircleLayers(voidCell, appearance, 50, 1, "classic");
    assert.equal(layers.void?.strokes.length, style === "double" ? 2 : 1, `${style} uses the shared stroke-count projection`);
    assert.equal(layers.void?.strokes[0]?.renderedStyle, style, `${style} remains truthful on Void Edge`);
    if (style === "solid") assert.deepEqual(layers.void?.strokes[0]?.lineDashPx, [], "default solid Void Edge has no mandatory dash");
  }
});

test("presentation-only Void symbols use Auto Contrast in Classic SVG without changing geometry", () => {
  const voidCell = cell("void-symbol", 0, 0, 144, "void");
  const defaults = createProjectPresentationDefaults();
  const presentationDefaults = normalizeProjectPresentationDefaults({
    ...defaults,
    void: {
      ...defaults.void,
      fill: { ...defaults.void.fill, colour: "#000000", opacity: 1 },
    },
  });
  const placement = normalizeIconPlacement({
    iconId: "icon:architecture:door",
    targetSpaceId: voidCell.id,
    tintMode: "auto",
    tint: "#ff0000",
    backing: "circle",
  });
  const resources = { ...DEFAULT_RESOURCE_SETTINGS, iconPlacements: [placement] };
  const radiusBefore = areaToRadius(voidCell.area);
  const svg = buildClassicSvg({
    spaces: [voidCell],
    camera: { x: 0, y: 0, zoom: 1 },
    cssWidth: 800,
    cssHeight: 600,
    paletteMode: "core",
    nucleusPaletteId: "editorial-aurora",
    presentationDefaults,
    resources,
    theme: "day",
    background: null,
    includeLabels: false,
    paddingPx: 0,
  });
  assert.match(svg, /<g opacity="1">[\s\S]*stroke="#f4f2e9"/, "Void symbol exports as clean vector geometry with resolved Auto Contrast tint");
  assert.equal(areaToRadius(voidCell.area), radiusBefore, "symbol projection never changes Void Area/radius geometry");
});
