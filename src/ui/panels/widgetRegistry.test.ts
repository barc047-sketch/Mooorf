import {
  WIDGET_DEFINITIONS,
  getWidgetDefinition,
  resolveWidgetGeometryStyle,
  type WidgetGeometry,
} from "./widgetRegistry";
import { readFileSync } from "node:fs";

const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
  }
};

const v7 = ["stats", "category-mix", "privacy-balance", "area-leaders", "data-health"] as const;
for (const id of v7) {
  const definition = getWidgetDefinition(id);
  equal(definition, WIDGET_DEFINITIONS[id], `${id} uses canonical metadata`);
  ok(definition.icon, `${id} owns a canonical icon`);
  ok(definition.geometry.width >= definition.geometry.minWidth, `${id} width respects minimum`);
}

equal(WIDGET_DEFINITIONS.stats.geometry.variant, "large", "Project Pulse is flagship geometry");
equal(WIDGET_DEFINITIONS["category-mix"].geometry.variant, "rail-horizontal", "Category Mix is a horizontal rail");
equal(WIDGET_DEFINITIONS["privacy-balance"].geometry.variant, "horizontal", "Privacy Balance is horizontal");
equal(WIDGET_DEFINITIONS["area-leaders"].geometry.variant, "rail-vertical", "Area Leaders is a vertical rail");
equal(WIDGET_DEFINITIONS["data-health"].geometry.variant, "vertical", "Data Health is vertical");

ok(
  WIDGET_DEFINITIONS["category-mix"].geometry.width >
    (WIDGET_DEFINITIONS["category-mix"].geometry.minHeight ?? 0),
  "Category Mix is wider than tall"
);
ok(
  (WIDGET_DEFINITIONS["area-leaders"].geometry.minHeight ?? 0) >
    WIDGET_DEFINITIONS["area-leaders"].geometry.width,
  "Area Leaders is taller than wide"
);

const inspectorGeometry = resolveWidgetGeometryStyle(WIDGET_DEFINITIONS.inspector.geometry, 1);
equal(inspectorGeometry.width, 332, "existing widget width remains unchanged without workspace sizing");
equal(inspectorGeometry.minWidth, 320, "existing widget minimum width remains unchanged");
equal(inspectorGeometry.minHeight, 360, "existing tall widget minimum height remains unchanged");
equal(inspectorGeometry.authoredMaxHeight, "748px", "existing tall widget maximum height remains unchanged");
equal(inspectorGeometry.height, undefined, "existing widgets do not gain a forced height");

const compactGeometry: WidgetGeometry = { variant: "compact", width: 264, minWidth: 244, maxHeight: 500 };
const standardGeometry: WidgetGeometry = { variant: "standard", width: 304, minWidth: 276, maxHeight: 600 };
equal(resolveWidgetGeometryStyle(compactGeometry, 1).width, 264, "compact sizing resolves authored pixels");
equal(resolveWidgetGeometryStyle(standardGeometry, 1).width, 304, "standard sizing resolves authored pixels");
equal(
  resolveWidgetGeometryStyle(WIDGET_DEFINITIONS["privacy-balance"].geometry, 1).width,
  420,
  "wide horizontal sizing remains registry-driven",
);
equal(
  resolveWidgetGeometryStyle(WIDGET_DEFINITIONS["area-leaders"].geometry, 1).minHeight,
  352,
  "tall vertical sizing remains registry-driven",
);

const workspaceGeometry: WidgetGeometry = {
  variant: "workspace",
  width: 640,
  minWidth: 520,
  minHeight: 500,
  aspectIntent: "wide",
  workspace: {
    width: "40vw",
    maxWidth: "44vw",
    height: "80vh",
    maxHeight: "85vh",
    viewportMargin: 24,
  },
};
const workspaceStyle = resolveWidgetGeometryStyle(workspaceGeometry, 1);
equal(
  workspaceStyle.width,
  "min(clamp(520px, 40vw, 44vw), calc(100dvw - 48px))",
  "workspace width supports the future 36-44vw panel and clamps to viewport margins",
);
equal(
  workspaceStyle.minWidth,
  "min(520px, calc(100dvw - 48px))",
  "workspace minimum width yields before constrained viewport overflow",
);
equal(
  workspaceStyle.height,
  "min(clamp(500px, 80vh, 85vh), calc(100dvh - 48px))",
  "workspace height supports the future 70-85vh panel and clamps to viewport margins",
);
equal(
  workspaceStyle.workspaceMinHeight,
  "500px",
  "workspace minimum height remains authored for the stack-aware CSS clamp",
);
equal(workspaceStyle.minHeight, undefined, "workspace minimum height does not outrank its viewport maximum");
equal(workspaceStyle.workspaceMaxWidth, "min(44vw, calc(100dvw - 48px))", "workspace max width stays bounded");
equal(workspaceStyle.workspaceMaxHeight, "min(85vh, calc(100dvh - 48px))", "workspace max height stays bounded");

equal(WIDGET_DEFINITIONS.connections.label, "RELATIONSHIP MANAGER", "Connections owns the Relationship Manager identity");
equal(WIDGET_DEFINITIONS.connections.geometry.variant, "workspace", "Relationship Manager reuses workspace sizing");
if (WIDGET_DEFINITIONS.connections.geometry.variant === "workspace") {
  equal(WIDGET_DEFINITIONS.connections.geometry.workspace.width, "40vw", "Relationship Manager targets 40vw");
  equal(WIDGET_DEFINITIONS.connections.geometry.workspace.height, "78vh", "Relationship Manager targets 78vh");
  equal(WIDGET_DEFINITIONS.connections.geometry.workspace.maxWidth, "44vw", "Relationship Manager stays within its desktop range");
  equal(WIDGET_DEFINITIONS.connections.geometry.workspace.maxHeight, "85vh", "Relationship Manager stays viewport bounded");
}

equal(WIDGET_DEFINITIONS["relationship-legend"].label, "RELATIONSHIPS", "detached Legend owns a minimal frame identity");
equal(WIDGET_DEFINITIONS["relationship-legend"].launcher, "widget", "Legend opens from Relationship Manager rather than a duplicate launcher");
equal(WIDGET_DEFINITIONS["relationship-legend"].geometry.variant, "workspace", "Legend reuses the canonical movable workspace frame");
if (WIDGET_DEFINITIONS["relationship-legend"].geometry.variant === "workspace") {
  equal(WIDGET_DEFINITIONS["relationship-legend"].geometry.minWidth, 260, "Legend supports a thin vertical composition");
  equal(WIDGET_DEFINITIONS["relationship-legend"].geometry.workspace.maxWidth, "82vw", "Legend supports a wide shallow composition");
  equal(WIDGET_DEFINITIONS["relationship-legend"].geometry.workspace.maxHeight, "82vh", "Legend remains viewport bounded");
}

const frameSource = readFileSync(new URL("../widgets/WidgetFrame.tsx", import.meta.url), "utf8");
const widgetCss = readFileSync(new URL("../widgets/widgets.css", import.meta.url), "utf8");
ok(frameSource.includes("resolveWidgetGeometryStyle(geometry, scale)"), "WidgetFrame consumes registry sizing metadata");
ok(frameSource.includes('"--wframe-stack-top"'), "WidgetFrame exposes its stack position to viewport sizing");
ok(widgetCss.includes('.wframe[data-geometry="workspace"]'), "workspace sizing remains inside the existing frame CSS");
ok(
  widgetCss.includes("calc(100dvh - var(--wframe-stack-top, 72px) - 24px)"),
  "workspace height bounds account for the frame stack position",
);

console.info("widget registry geometry contracts passed");
