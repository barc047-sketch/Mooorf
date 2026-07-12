/* Canonical floating-widget metadata. Runtime body rendering stays in
   WidgetHost; label, icon, launcher ownership and authored geometry live here
   so rail, submenu and frame identity cannot drift. */

import {
  Activity,
  BarChart3,
  Bookmark,
  Download,
  Eye,
  LayoutGrid,
  ListOrdered,
  Palette,
  Scale,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Type,
  Upload,
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
  | "large";

export interface WidgetGeometry {
  variant: WidgetGeometryVariant;
  width: number;
  minWidth: number;
  minHeight?: number;
  maxHeight?: number;
  aspectIntent?: "balanced" | "wide" | "tall" | "flagship";
}

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
  annotation: {
    id: "annotation",
    label: "Annotation",
    responsibility: "Label modes, text scale, visible fields, position, bounding box.",
    launcher: "rail",
    status: "live",
    icon: Type,
    geometry: { variant: "standard", width: 288, minWidth: 260, maxHeight: 520, aspectIntent: "balanced" },
  },
  organism: {
    id: "organism",
    label: "Morph & Motion",
    responsibility: "Morph style, Membrane reach, Cells, Motion, pockets, and selection.",
    launcher: "both",
    status: "live",
    icon: SlidersHorizontal,
    geometry: { variant: "standard", width: 292, minWidth: 268, maxHeight: 610, aspectIntent: "balanced" },
  },
  layout: {
    id: "layout",
    label: "Layout",
    responsibility: "Arrangement presets (x/y-only) and visual spread.",
    launcher: "rail",
    status: "live",
    icon: LayoutGrid,
    geometry: { variant: "compact", width: 288, minWidth: 260, maxHeight: 440, aspectIntent: "balanced" },
  },
  palette: {
    id: "palette",
    label: "Palette",
    responsibility: "Palette mode, Cell family ramps, Membrane palettes, and program mapping.",
    launcher: "both",
    status: "live",
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
    responsibility: "Theme, technical grid, label/Cell visibility, and persistent interface scale.",
    launcher: "rail",
    status: "live",
    icon: Eye,
    geometry: { variant: "compact", width: 288, minWidth: 260, maxHeight: 470, aspectIntent: "balanced" },
  },
  advanced: {
    id: "advanced",
    label: "Advanced",
    responsibility: "Debug toggles, renderer diagnostics, staged experimental features.",
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
  {
    id: "selected-space",
    label: "Selected Space",
    responsibility: "Future selected Cell property editor.",
    launcher: "rail",
    status: "future",
  },
];
