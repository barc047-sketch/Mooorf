import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Connection } from "../graph/types";
import {
  createDefaultRelationshipLegendConfig,
  normalizeRelationshipLegendConfig,
  projectRelationshipLegend,
  resolveRelationshipLegendSpecimenStyle,
} from "./relationshipLegend";
import {
  createProjectRelationshipType,
  getAllRelationshipTypes,
} from "./relationshipTypes";
import { createDefaultProjectConnectionStyles } from "./styles";

const source = (relativePath: string): string =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const connection = (id: string, typeId: string): Connection => ({
  id,
  fromSpaceId: "source",
  toSpaceId: "target",
  enabled: true,
  semantic: {
    typeId,
    requirement: "preferred",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: "",
  },
});

const fixture = () => {
  const styles = createDefaultProjectConnectionStyles();
  const active = createProjectRelationshipType({
    id: "rt_active",
    name: "Primary Circulation",
    shortCode: "PC",
    description: "Primary circulation relationship",
    visualDefaults: {
      strokePatternId: "wave",
      appearance: { color: "#a13030", width: 4, opacity: 0.64 },
    },
  }, [], styles, 1);
  const archived = {
    ...createProjectRelationshipType({
      id: "rt_archived",
      name: "Archived Route",
      shortCode: "AR",
    }, [active], styles, 2),
    archived: true,
  };
  return {
    active,
    archived,
    styles,
    types: getAllRelationshipTypes([active, archived], styles),
  };
};

test("Legend projection derives live canonical active Types in stable Manager order", () => {
  const { active, types } = fixture();
  const projection = projectRelationshipLegend({
    types,
    connections: [connection("a", active.id)],
    config: createDefaultRelationshipLegendConfig(),
    bounds: { width: 920, height: 520 },
  });

  assert.deepEqual(
    projection.items.map((item) => item.typeId),
    types.filter((type) => !type.archived).map((type) => type.id),
  );
  assert.equal(projection.items.some((item) => item.typeId === "rt_archived"), false);
  const item = projection.items.find((entry) => entry.typeId === active.id);
  assert.equal(item?.name, "Primary Circulation");
  assert.equal(item?.code, "PC");
  assert.equal(item?.description, "Primary circulation relationship");
  assert.equal(item?.stylePreview.strokePatternId, "wave");
  assert.equal(item?.stylePreview.appearance.color, "#a13030");

  const renamedTypes = types.map((type) => type.id === active.id
    ? { ...type, name: "Main Circulation", visualDefaults: {
      ...type.visualDefaults,
      strokePatternId: "zigzag" as const,
    } }
    : type);
  const updated = projectRelationshipLegend({
    types: renamedTypes,
    connections: [connection("a", active.id)],
    config: createDefaultRelationshipLegendConfig(),
    bounds: { width: 920, height: 520 },
  });
  const updatedItem = updated.items.find((entry) => entry.typeId === active.id);
  assert.equal(updatedItem?.name, "Main Circulation");
  assert.equal(updatedItem?.stylePreview.strokePatternId, "zigzag");
});

test("Used Only derives inclusion from canonical Connections without changing canonical order", () => {
  const { active, types } = fixture();
  const config = {
    ...createDefaultRelationshipLegendConfig(),
    scope: "used-only" as const,
  };
  const projection = projectRelationshipLegend({
    types,
    connections: [
      connection("project", active.id),
      connection("factory", "visual-access"),
      connection("repeat", active.id),
    ],
    config,
    bounds: { width: 760, height: 420 },
  });
  assert.deepEqual(projection.items.map((item) => item.typeId), ["visual-access", active.id]);
});

test("Auto is deterministic, responds to both dimensions, and respects readable width", () => {
  const { types } = fixture();
  const activeTypes = types.filter((type) => !type.archived);
  const repeatedTypes = Array.from({ length: 18 }, (_, index) => ({
    ...activeTypes[index % activeTypes.length]!,
    id: `type-${index}`,
    name: `Type ${index + 1}`,
  }));
  const config = createDefaultRelationshipLegendConfig();
  const wide = projectRelationshipLegend({
    types: repeatedTypes,
    connections: [],
    config,
    bounds: { width: 1180, height: 560 },
  });
  const wideAgain = projectRelationshipLegend({
    types: repeatedTypes,
    connections: [],
    config,
    bounds: { width: 1180, height: 560 },
  });
  const short = projectRelationshipLegend({
    types: repeatedTypes,
    connections: [],
    config,
    bounds: { width: 1180, height: 190 },
  });
  const narrow = projectRelationshipLegend({
    types: repeatedTypes,
    connections: [],
    config,
    bounds: { width: 290, height: 760 },
  });

  assert.deepEqual(wide, wideAgain);
  assert.ok(wide.layout.columns > narrow.layout.columns);
  assert.ok(short.layout.columns >= wide.layout.columns);
  assert.equal(narrow.layout.columns, 1);
  assert.ok(wide.layout.itemWidth >= wide.layout.minimumItemWidth);
});

test("Horizontal fills down first with four default rows and semantic row changes", () => {
  const { types } = fixture();
  const activeTypes = types.filter((type) => !type.archived);
  const repeatedTypes = Array.from({ length: 10 }, (_, index) => ({
    ...activeTypes[index % activeTypes.length]!,
    id: `horizontal-${index}`,
  }));
  const defaults = createDefaultRelationshipLegendConfig();
  const projection = projectRelationshipLegend({
    types: repeatedTypes,
    connections: [],
    config: { ...defaults, layoutMode: "horizontal" },
    bounds: { width: 680, height: 520 },
  });
  assert.equal(projection.layout.rows, 4);
  assert.deepEqual(
    projection.items.slice(0, 6).map(({ row, column }) => [row, column]),
    [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1]],
  );

  const recomposed = projectRelationshipLegend({
    types: repeatedTypes,
    connections: [],
    config: { ...defaults, layoutMode: "horizontal", horizontalRows: 2 },
    bounds: { width: 680, height: 520 },
  });
  assert.equal(recomposed.layout.rows, 2);
  assert.deepEqual(
    recomposed.items.slice(0, 4).map(({ row, column }) => [row, column]),
    [[0, 0], [1, 0], [0, 1], [1, 1]],
  );
});

test("Vertical fills across first and derives columns from available width", () => {
  const { types } = fixture();
  const activeTypes = types.filter((type) => !type.archived);
  const repeatedTypes = Array.from({ length: 8 }, (_, index) => ({
    ...activeTypes[index % activeTypes.length]!,
    id: `vertical-${index}`,
  }));
  const config = {
    ...createDefaultRelationshipLegendConfig(),
    layoutMode: "vertical" as const,
  };
  const wide = projectRelationshipLegend({
    types: repeatedTypes,
    connections: [],
    config,
    bounds: { width: 780, height: 520 },
  });
  const narrow = projectRelationshipLegend({
    types: repeatedTypes,
    connections: [],
    config,
    bounds: { width: 300, height: 520 },
  });
  assert.ok(wide.layout.columns > narrow.layout.columns);
  assert.deepEqual(
    wide.items.slice(0, wide.layout.columns + 1).map(({ row, column }) => [row, column]),
    [
      ...Array.from({ length: wide.layout.columns }, (_, column) => [0, column]),
      [1, 0],
    ],
  );
});

test("Legend config normalizes semantic controls and density changes presentation only", () => {
  const defaults = createDefaultRelationshipLegendConfig();
  assert.deepEqual(defaults, {
    layoutMode: "auto",
    horizontalRows: 4,
    density: "standard",
    specimenLength: "standard",
    specimenWeight: "legible",
    textWidth: 120,
    textAlign: "left",
    textPlacementX: "right",
    textPlacementY: "middle",
    scope: "all-active",
    showStyle: true,
    showName: true,
    showCode: false,
    showDescription: false,
  });
  assert.deepEqual(normalizeRelationshipLegendConfig({
    layoutMode: "sideways",
    horizontalRows: 99,
    density: "tiny",
    specimenLength: "huge",
    specimenWeight: "heavy",
    textWidth: 999,
    textAlign: "justified",
    textPlacementX: "freeform",
    textPlacementY: "baseline",
    scope: "archived",
    showStyle: false,
    showName: false,
    showCode: false,
    showDescription: false,
  }), {
    ...defaults,
    horizontalRows: 6,
    textWidth: 320,
    showStyle: false,
  }, "normalization preserves at least one identifying text field");

  const { types } = fixture();
  const compact = projectRelationshipLegend({
    types,
    connections: [],
    config: { ...defaults, density: "compact", showCode: true, showDescription: true },
    bounds: { width: 760, height: 520 },
  });
  const large = projectRelationshipLegend({
    types,
    connections: [],
    config: { ...defaults, density: "large", showCode: true, showDescription: true },
    bounds: { width: 760, height: 520 },
  });
  assert.ok(large.layout.itemHeight > compact.layout.itemHeight);
  assert.deepEqual(
    large.items.map(({ typeId, name, code, description, stylePreview }) => ({
      typeId, name, code, description, stylePreview,
    })),
    compact.items.map(({ typeId, name, code, description, stylePreview }) => ({
      typeId, name, code, description, stylePreview,
    })),
  );
});

test("specimen length and weight are semantic, independent, and preview-only", () => {
  const { active, types } = fixture();
  const defaults = createDefaultRelationshipLegendConfig();
  const short = projectRelationshipLegend({
    types,
    connections: [],
    config: { ...defaults, specimenLength: "short" },
    bounds: { width: 920, height: 520 },
  });
  const standard = projectRelationshipLegend({
    types,
    connections: [],
    config: { ...defaults, specimenLength: "standard" },
    bounds: { width: 920, height: 520 },
  });
  const long = projectRelationshipLegend({
    types,
    connections: [],
    config: { ...defaults, specimenLength: "long" },
    bounds: { width: 920, height: 520 },
  });
  assert.ok(short.layout.specimenLengthMaximum < standard.layout.specimenLengthMaximum);
  assert.ok(standard.layout.specimenLengthMaximum < long.layout.specimenLengthMaximum);
  assert.ok(short.layout.minimumItemWidth < standard.layout.minimumItemWidth);
  assert.ok(standard.layout.minimumItemWidth < long.layout.minimumItemWidth);

  const authored = active.visualDefaults;
  const thin = {
    ...authored,
    appearance: { ...authored.appearance, width: 0.5 },
  };
  const legible = resolveRelationshipLegendSpecimenStyle(thin, "legible");
  const truth = resolveRelationshipLegendSpecimenStyle(thin, "true");
  assert.equal(legible.appearance.width, 1);
  assert.equal(truth.appearance.width, 0.5);
  assert.equal(thin.appearance.width, 0.5, "Legend preview normalization cannot mutate canonical Type width");
  assert.equal(legible.strokePatternId, truth.strokePatternId);
  assert.equal(legible.appearance.dashScale, truth.appearance.dashScale);
  assert.equal(legible.appearance.patternAmplitude, truth.appearance.patternAmplitude);
  assert.equal(legible.startMarkerId, truth.startMarkerId);
  assert.equal(legible.endMarkerId, truth.endMarkerId);
});

test("semantic text width and placement participate in pure Legend composition without phantom height", () => {
  const { types } = fixture();
  const activeTypes = types.filter((type) => !type.archived);
  const library = Array.from({ length: 12 }, (_, index) => ({
    ...activeTypes[index % activeTypes.length]!,
    id: `text-layout-${index}`,
  }));
  const defaults = createDefaultRelationshipLegendConfig();
  const narrowText = projectRelationshipLegend({
    types: library,
    connections: [],
    config: { ...defaults, textWidth: 80 },
    bounds: { width: 1000, height: 360 },
  });
  const wideText = projectRelationshipLegend({
    types: library,
    connections: [],
    config: { ...defaults, textWidth: 320 },
    bounds: { width: 1000, height: 360 },
  });
  assert.equal(narrowText.layout.textWidth, 80);
  assert.equal(wideText.layout.textWidth, 320);
  assert.ok(wideText.layout.minimumItemWidth > narrowText.layout.minimumItemWidth);
  assert.ok(wideText.layout.columns < narrowText.layout.columns, "Text Width drives deterministic reflow");

  const top = projectRelationshipLegend({
    types: library,
    connections: [],
    config: { ...defaults, textAlign: "right", textPlacementX: "left", textPlacementY: "top" },
    bounds: { width: 1000, height: 360 },
  });
  const bottom = projectRelationshipLegend({
    types: library,
    connections: [],
    config: { ...defaults, textAlign: "center", textPlacementX: "center", textPlacementY: "bottom" },
    bounds: { width: 1000, height: 360 },
  });
  assert.equal(top.layout.itemHeight, bottom.layout.itemHeight, "Y placement is semantic placement, not extra row height");
  assert.equal(top.layout.requiredHeight, bottom.layout.requiredHeight, "text alignment and placement do not reserve phantom height");
  assert.deepEqual(
    top.items.map(({ typeId, name, code, description, stylePreview }) => ({ typeId, name, code, description, stylePreview })),
    bottom.items.map(({ typeId, name, code, description, stylePreview }) => ({ typeId, name, code, description, stylePreview })),
    "text alignment and placement never mutate canonical Type output",
  );
});

test("dynamic content height reserves no hidden Code or Description baselines", () => {
  const { types } = fixture();
  const defaults = createDefaultRelationshipLegendConfig();
  const nameOnly = projectRelationshipLegend({
    types,
    connections: [],
    config: defaults,
    bounds: { width: 760, height: 420 },
  });
  const code = projectRelationshipLegend({
    types,
    connections: [],
    config: { ...defaults, showCode: true },
    bounds: { width: 760, height: 420 },
  });
  const description = projectRelationshipLegend({
    types,
    connections: [],
    config: { ...defaults, showDescription: true },
    bounds: { width: 760, height: 420 },
  });
  assert.ok(nameOnly.layout.itemHeight <= 26, "Style + Name must use a compact single-line row");
  assert.ok(code.layout.itemHeight > nameOnly.layout.itemHeight);
  assert.ok(description.layout.itemHeight > nameOnly.layout.itemHeight);
  assert.ok(description.layout.itemHeight > code.layout.itemHeight);
});

test("the current Legend minimum reflows wide compact content before enforcing vertical height", () => {
  const { types } = fixture();
  const activeTypes = types.filter((type) => !type.archived);
  const sevenTypes = Array.from({ length: 7 }, (_, index) => ({
    ...activeTypes[index % activeTypes.length]!,
    id: `shallow-${index}`,
  }));
  const config = { ...createDefaultRelationshipLegendConfig(), density: "compact" as const };
  const roomy = projectRelationshipLegend({
    types: sevenTypes,
    connections: [],
    config,
    bounds: { width: 1000, height: 520 },
  });
  const shallow = projectRelationshipLegend({
    types: sevenTypes,
    connections: [],
    config,
    bounds: { width: 1000, height: 0 },
  });

  assert.ok(shallow.layout.columns >= roomy.layout.columns, "minimum sizing may reflow across before rejecting a shallower resize");
  assert.ok(shallow.layout.rows <= 2, "seven compact Style + Name entries fit in a shallow wide strip");
  assert.ok(shallow.layout.requiredHeight < 80, "the readable shallow minimum is row content plus compact insets, not the old workspace floor");

  const withCode = projectRelationshipLegend({
    types: sevenTypes,
    connections: [],
    config: { ...config, showCode: true },
    bounds: { width: 1000, height: 0 },
  });
  const withDescription = projectRelationshipLegend({
    types: sevenTypes,
    connections: [],
    config: { ...config, showDescription: true },
    bounds: { width: 1000, height: 0 },
  });
  const large = projectRelationshipLegend({
    types: sevenTypes,
    connections: [],
    config: { ...config, density: "large" },
    bounds: { width: 1000, height: 0 },
  });
  assert.ok(withCode.layout.requiredHeight > shallow.layout.requiredHeight, "Code ON raises only the current semantic minimum");
  assert.ok(withDescription.layout.requiredHeight > shallow.layout.requiredHeight, "Description ON raises only the current semantic minimum");
  assert.ok(large.layout.requiredHeight > shallow.layout.requiredHeight, "Large density raises only the current semantic minimum");

  const manyTypes = Array.from({ length: 50 }, (_, index) => ({
    ...activeTypes[index % activeTypes.length]!,
    id: `many-${index}`,
  }));
  const usedOnly = projectRelationshipLegend({
    types: manyTypes,
    connections: manyTypes.slice(0, 6).map((type, index) => connection(`used-${index}`, type.id)),
    config: { ...config, scope: "used-only" },
    bounds: { width: 1000, height: 0 },
  });
  const allActive = projectRelationshipLegend({
    types: manyTypes,
    connections: [],
    config,
    bounds: { width: 1000, height: 0 },
  });
  assert.ok(usedOnly.layout.requiredHeight < allActive.layout.requiredHeight, "switching from a grown library to Used Only releases the prior height floor");
});

test("ordinary deterministic grid composition remains bounded for 6, 20, 50, and 120 Types", () => {
  const { types } = fixture();
  const activeTypes = types.filter((type) => !type.archived);
  for (const count of [6, 20, 50, 120]) {
    const library = Array.from({ length: count }, (_, index) => ({
      ...activeTypes[index % activeTypes.length]!,
      id: `library-${count}-${index}`,
      name: `Library Type ${index + 1}`,
    }));
    const projection = projectRelationshipLegend({
      types: library,
      connections: [],
      config: createDefaultRelationshipLegendConfig(),
      bounds: { width: 980, height: 540 },
    });
    assert.equal(projection.items.length, count);
    assert.equal(new Set(projection.items.map(({ row, column }) => `${row}:${column}`)).size, count);
    assert.ok(projection.layout.contentHeight >= projection.layout.itemHeight);
    assert.ok(projection.items.every((item) =>
      Number.isFinite(item.bounds.x)
      && Number.isFinite(item.bounds.y)
      && item.bounds.width >= projection.layout.minimumItemWidth));
  }
});

test("detached Legend UI reuses one pure export-ready projection and adaptive real-style previews", () => {
  const legend = source("./relationshipLegend.ts");
  const manager = source("../../ui/widgets/ConnectionsWidget.tsx");
  const widget = source("../../ui/widgets/RelationshipLegendWidget.tsx");
  const host = source("../../ui/widgets/WidgetHost.tsx");
  const frame = source("../../ui/widgets/WidgetFrame.tsx");
  const css = source("../../ui/widgets/widgets.css");
  const preview = source("../../ui/RelationshipTypePicker.tsx");
  const registry = source("../../ui/panels/widgetRegistry.ts");

  assert.doesNotMatch(legend, /from ["']react|useState|useMemo|HTMLElement|document\./);
  assert.match(widget, /projectRelationshipLegend/);
  assert.match(widget, /RelationshipTypeStylePreview/);
  assert.match(widget, /ResizeObserver/);
  assert.match(widget, /requiredWidth|requiredHeight/);
  assert.match(widget, /minimumProjection/);
  assert.match(widget, /height:\s*0/);
  assert.match(widget, /--relationship-legend-min-height/);
  assert.match(widget, /minimumHeight:\s*0/);
  assert.match(widget, /data-text-align/);
  assert.match(widget, /data-text-placement-x/);
  assert.match(widget, /data-text-placement-y/);
  assert.match(widget, /--relationship-legend-text-width/);
  assert.doesNotMatch(widget, /LEGEND SETTINGS|fieldset|horizontalRows.*onChange/s);
  assert.doesNotMatch(widget, /overflow-(?:x|y)|scroll/i);
  assert.match(manager, /aria-label="Open Relationship Legend"/);
  assert.match(manager, /openWidget\("relationship-legend"\)/);
  assert.match(manager, /LEGEND SETTINGS/);
  assert.match(manager, /Layout|Scope|Content|Density|Horizontal rows|Specimen Length|Specimen Weight|Text Width|Text Align|Text X|Text Y/);
  assert.match(manager, /relationship-legend-settings glass/);
  assert.match(manager, /relationship-legend-length-sample/);
  assert.match(manager, /textWidth|textAlign|textPlacementX|textPlacementY/);
  assert.match(manager, /<SliderRow[\s\S]*label="Hit tolerance"/);
  assert.match(manager, /<SliderRow[\s\S]*label="Unrelated fade"/);
  assert.doesNotMatch(manager, /<input\s+type="range"/);
  assert.match(manager, /config\.layoutMode === "horizontal"/);
  assert.doesNotMatch(manager, /RelationshipLegendWorkspace|projectRelationshipLegend|legendOpen/);
  assert.match(host, /"relationship-legend":\s*\(\)\s*=>\s*<RelationshipLegendWidget\s*\/>/);
  assert.match(frame, /rememberWidgetFrameSize/);
  assert.match(frame, /ResizeObserver/);
  assert.match(frame, /frameless/);
  assert.match(frame, /wframe-frameless-controls/);
  assert.match(frame, /wframe-frameless-drag-region/);
  assert.match(css, /\.wframe\[data-widget="relationship-legend"\][^{]*\{[^}]*resize:\s*both/s);
  assert.doesNotMatch(css, /\.wframe\[data-widget="connections"\][^{]*\{[^}]*resize:\s*both/s);
  assert.match(registry, /"relationship-legend":[\s\S]*?maxWidth:\s*"82vw"[\s\S]*?maxHeight:\s*"82vh"/);
  assert.match(registry, /connections:[\s\S]*?maxWidth:\s*"44vw"[\s\S]*?maxHeight:\s*"85vh"/);
  assert.match(css, /\.relationship-legend-grid/);
  assert.match(css, /\.relationship-legend-canvas\s*\{[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(css, /\.relationship-legend-canvas\s*\{[^}]*overflow:\s*auto/s);
  assert.match(css, /\.wframe\[data-widget="relationship-legend"\]\s*\{[^}]*min-height:\s*var\(--relationship-legend-min-height/s);
  assert.match(css, /\.connection-visual-scale-setting:not\(\.glass\)/);
  assert.match(css, /\.relationship-legend-settings\.glass/);
  assert.match(css, /\.relationship-legend-length-sample/);
  assert.match(css, /data-text-placement-x/);
  assert.match(css, /data-text-placement-y/);
  assert.doesNotMatch(css, /\.relationship-legend-empty\s*\{[^}]*min-height:\s*180px/s);
  assert.match(css, /\.wframe-frameless-controls\s*\{[^}]*flex-direction:\s*column/s);
  assert.doesNotMatch(widget, /RELATIONSHIPS/);
  assert.doesNotMatch(widget, /legendItemPositions|setLegendItemPosition|draggable/);
  assert.doesNotMatch(legend, /x:\s*type|y:\s*type|localStorage|sessionStorage/);
  assert.match(preview, /buildConnectionStrokeMotif/);
  assert.match(preview, /motif\.paths/);
  assert.match(preview, /motif\.marks/);
  assert.match(preview, /data-specimen-length/);
  assert.match(preview, /previewMinimumStrokeWidth/);
});
