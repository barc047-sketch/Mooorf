/* Canonical floating-widget metadata. Runtime body rendering stays in
   WidgetHost; label, icon, launcher ownership and authored geometry live here
   so rail, submenu and frame identity cannot drift. */

import {
  Activity,
  BarChart3,
  Bookmark,
  Download,
  Eye,
  Info,
  LayoutGrid,
  ListOrdered,
  Minus,
  Palette,
  Scale,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Type,
  Upload,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import type { WidgetId } from "../../types";

export type WidgetPanelStatus = "live" | "prepared" | "future";
export type WidgetGeometryVariant =
  | "compact"
  | "standard"
  | "horizontal"
  | "vertical"
  | "rail-horizontal"
  | "rail-vertical"
  | "large"
  | "workspace";

interface WidgetGeometryBase {
  width: number;
  minWidth: number;
  minHeight?: number;
  maxHeight?: number;
  aspectIntent?: "balanced" | "wide" | "tall" | "flagship";
}

export interface FixedWidgetGeometry extends WidgetGeometryBase {
  variant: Exclude<WidgetGeometryVariant, "workspace">;
  workspace?: never;
}

export interface WorkspaceWidgetGeometry extends WidgetGeometryBase {
  variant: "workspace";
  minHeight: number;
  workspace: {
    width: `${number}vw`;
    maxWidth: `${number}vw`;
    height: `${number}vh`;
    maxHeight: `${number}vh`;
    viewportMargin?: number;
  };
}

export type WidgetGeometry = FixedWidgetGeometry | WorkspaceWidgetGeometry;

export interface ResolvedWidgetGeometryStyle {
  width: number | string;
  minWidth: number | string;
  height?: string;
  minHeight?: number | string;
  authoredMaxHeight?: string;
  workspaceMinHeight?: string;
  workspaceMaxWidth?: string;
  workspaceMaxHeight?: string;
}

const scaledPixels = (value: number, scale: number) => Math.round(value * scale);

export const resolveWidgetGeometryStyle = (
  geometry: WidgetGeometry,
  scale: number,
): ResolvedWidgetGeometryStyle => {
  const width = scaledPixels(geometry.width, scale);
  const minWidth = scaledPixels(geometry.minWidth, scale);
  const minHeight = geometry.minHeight ? scaledPixels(geometry.minHeight, scale) : undefined;
  const authoredMaxHeight = geometry.maxHeight
    ? `${scaledPixels(geometry.maxHeight, scale)}px`
    : undefined;

  if (geometry.variant !== "workspace") {
    return { width, minWidth, minHeight, authoredMaxHeight };
  }

  const margin = Math.max(0, Math.round(geometry.workspace.viewportMargin ?? 24));
  const safeWidth = `calc(100dvw - ${margin * 2}px)`;
  const safeHeight = `calc(100dvh - ${margin * 2}px)`;
  const scaledMinWidth = `${minWidth}px`;
  const scaledMinHeight = `${scaledPixels(geometry.minHeight, scale)}px`;

  return {
    width: `min(clamp(${scaledMinWidth}, ${geometry.workspace.width}, ${geometry.workspace.maxWidth}), ${safeWidth})`,
    minWidth: `min(${scaledMinWidth}, ${safeWidth})`,
    height: `min(clamp(${scaledMinHeight}, ${geometry.workspace.height}, ${geometry.workspace.maxHeight}), ${safeHeight})`,
    workspaceMinHeight: scaledMinHeight,
    workspaceMaxWidth: `min(${geometry.workspace.maxWidth}, ${safeWidth})`,
    workspaceMaxHeight: `min(${geometry.workspace.maxHeight}, ${safeHeight})`,
  };
};

export interface WidgetPanelDefinition {
  id: WidgetId | "selected-space";
  label: string;
  responsibility: string;
  launcher: "rail" | "dock" | "both" | "widget";
  status: WidgetPanelStatus;
  icon?: LucideIcon;
  geometry?: WidgetGeometry;
}

export interface WidgetDefinition extends WidgetPanelDefinition {
  id: WidgetId;
  icon: LucideIcon;
  geometry: WidgetGeometry;
}

export const WIDGET_DEFINITIONS: Readonly<Record<WidgetId, WidgetDefinition>> = {
  inspector: {
    id: "inspector",
    label: "Inspector",
    responsibility: "Canonical Cell content, coordinated text and six-target appearance editing.",
    launcher: "both",
    status: "live",
    icon: Info,
    geometry: { variant: "vertical", width: 332, minWidth: 320, minHeight: 360, maxHeight: 748, aspectIntent: "tall" },
  },
  "cell-settings": {
    id: "cell-settings", label: "Cell Detail", responsibility: "Nested Cell Surface, Boundary and Core/nucleus controls over three canonical targets.", launcher: "dock", status: "live", icon: Palette,
    geometry: { variant: "vertical", width: 324, minWidth: 296, maxHeight: 748, aspectIntent: "tall" },
  },
  "membrane-settings": {
    id: "membrane-settings", label: "Membrane Detail", responsibility: "Nested shared Field and Edge controls plus proven Fusion and Reach ownership.", launcher: "dock", status: "live", icon: Activity,
    geometry: { variant: "vertical", width: 320, minWidth: 292, maxHeight: 748, aspectIntent: "tall" },
  },
  "void-settings": {
    id: "void-settings", label: "Void Detail", responsibility: "Nested Fill and Edge controls; subtraction and geometry remain data-owned.", launcher: "dock", status: "live", icon: Minus,
    geometry: { variant: "vertical", width: 310, minWidth: 282, maxHeight: 680, aspectIntent: "tall" },
  },
  annotation: {
    id: "annotation",
    label: "Legacy Label Display",
    responsibility: "Compatibility-only label modes and placement; M1 text appearance is Inspector-owned.",
    launcher: "widget",
    status: "prepared",
    icon: Type,
    geometry: { variant: "standard", width: 288, minWidth: 260, maxHeight: 520, aspectIntent: "balanced" },
  },
  organism: {
    id: "organism",
    label: "Legacy Morph & Motion",
    responsibility: "Compatibility body only; supported Morph/Fusion/Reach moved to Membrane Settings.",
    launcher: "widget",
    status: "prepared",
    icon: SlidersHorizontal,
    geometry: { variant: "standard", width: 292, minWidth: 268, maxHeight: 610, aspectIntent: "balanced" },
  },
  layout: {
    id: "layout",
    label: "ARRANGE",
    responsibility: "Arrangement V2 registry, transient x/y preview and one-transaction apply.",
    launcher: "rail",
    status: "live",
    icon: LayoutGrid,
    geometry: { variant: "standard", width: 324, minWidth: 288, maxHeight: 680, aspectIntent: "balanced" },
  },
  palette: {
    id: "palette",
    label: "Legacy Palette",
    responsibility: "Compatibility body only; M1 paint controls reuse canonical palette resolution.",
    launcher: "widget",
    status: "prepared",
    icon: Palette,
    geometry: { variant: "standard", width: 304, minWidth: 276, maxHeight: 600, aspectIntent: "balanced" },
  },
  saved: {
    id: "saved",
    label: "Saved Views",
    responsibility: "Snapshot save/load/rename/duplicate/delete with timestamps.",
    launcher: "both",
    status: "live",
    icon: Bookmark,
    geometry: { variant: "vertical", width: 300, minWidth: 272, minHeight: 260, maxHeight: 560, aspectIntent: "tall" },
  },
  display: {
    id: "display",
    label: "Display",
    responsibility: "Camera framing, label zoom/fit, canvas visibility and persistent display preferences.",
    launcher: "rail",
    status: "live",
    icon: Eye,
    geometry: { variant: "vertical", width: 318, minWidth: 288, minHeight: 420, maxHeight: 748, aspectIntent: "tall" },
  },
  "label-studio": {
    id: "label-studio",
    label: "Label Studio",
    responsibility: "Project-default Cell label composition, fit, Ring arcs and Flag callouts through the canonical text channel.",
    launcher: "widget",
    status: "live",
    icon: Type,
    geometry: { variant: "vertical", width: 372, minWidth: 320, minHeight: 480, maxHeight: 748, aspectIntent: "tall" },
  },
  connections: {
    id: "connections",
    label: "Connections",
    responsibility: "Semantic Connection creation, selection and bounded endpoint-aware reopening.",
    launcher: "dock",
    status: "live",
    icon: Waypoints,
    geometry: { variant: "vertical", width: 344, minWidth: 312, minHeight: 430, maxHeight: 748, aspectIntent: "tall" },
  },
  "connection-studio": {
    id: "connection-studio",
    label: "Connection Studio",
    responsibility: "Registry-owned Connection type-default scope and visual grammar workspace.",
    launcher: "widget",
    status: "live",
    icon: Waypoints,
    geometry: { variant: "vertical", width: 360, minWidth: 320, minHeight: 260, maxHeight: 620, aspectIntent: "tall" },
  },
  advanced: {
    id: "advanced",
    label: "Performance",
    responsibility: "PF1C live Organism preview quality plus renderer diagnostics and staged experimental features.",
    launcher: "rail",
    status: "live",
    icon: Settings2,
    geometry: { variant: "vertical", width: 288, minWidth: 260, minHeight: 240, maxHeight: 520, aspectIntent: "tall" },
  },
  stats: {
    id: "stats",
    label: "Project Pulse",
    responsibility:
      "Spatial intelligence flagship — live program metrics from pure selectors (src/domain/stats). Family spec: docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md.",
    launcher: "rail",
    status: "live",
    icon: Activity,
    geometry: { variant: "large", width: 332, minWidth: 304, minHeight: 248, maxHeight: 430, aspectIntent: "flagship" },
  },
  "category-mix": {
    id: "category-mix",
    label: "Category Mix",
    responsibility: "Programmed-area distribution by normalized category token.",
    launcher: "widget",
    status: "live",
    icon: BarChart3,
    geometry: { variant: "rail-horizontal", width: 444, minWidth: 380, minHeight: 226, maxHeight: 330, aspectIntent: "wide" },
  },
  "privacy-balance": {
    id: "privacy-balance",
    label: "Privacy Balance",
    responsibility: "Evidence-only area balance across normalized privacy groups.",
    launcher: "widget",
    status: "live",
    icon: Scale,
    geometry: { variant: "horizontal", width: 420, minWidth: 360, minHeight: 214, maxHeight: 310, aspectIntent: "wide" },
  },
  "area-leaders": {
    id: "area-leaders",
    label: "Area Leaders",
    responsibility: "Selectable top-five additive-space ranking by valid area.",
    launcher: "widget",
    status: "live",
    icon: ListOrdered,
    geometry: { variant: "rail-vertical", width: 276, minWidth: 248, minHeight: 352, maxHeight: 520, aspectIntent: "tall" },
  },
  "data-health": {
    id: "data-health",
    label: "Data Health",
    responsibility: "Deterministic numeric and metadata completeness signals with table handoff.",
    launcher: "widget",
    status: "live",
    icon: ShieldCheck,
    geometry: { variant: "vertical", width: 264, minWidth: 244, minHeight: 318, maxHeight: 500, aspectIntent: "tall" },
  },
  export: {
    id: "export",
    label: "Export",
    responsibility:
      "PNG/PDF/CSV/JSON/SVG export and the ZIP presentation pack. Generation lives in src/export/exportService.ts.",
    launcher: "dock",
    status: "live",
    icon: Download,
    geometry: { variant: "vertical", width: 308, minWidth: 280, minHeight: 420, maxHeight: 680, aspectIntent: "tall" },
  },
  import: {
    id: "import",
    label: "File Intake",
    responsibility: "Local project, configuration, CSV, XLS, and XLSX review with atomic apply and Undo.",
    launcher: "dock",
    status: "live",
    icon: Upload,
    geometry: { variant: "vertical", width: 330, minWidth: 296, minHeight: 420, maxHeight: 680, aspectIntent: "tall" },
  },
};

export const getWidgetDefinition = (id: WidgetId): WidgetDefinition => WIDGET_DEFINITIONS[id];

export const WIDGET_PANEL_DEFINITIONS: readonly WidgetPanelDefinition[] = [
  ...Object.values(WIDGET_DEFINITIONS),
];
