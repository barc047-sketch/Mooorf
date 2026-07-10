/* Canonical floating-widget metadata. Runtime body rendering stays in
   WidgetHost; label, icon, launcher ownership and authored geometry live here
   so rail, submenu and frame identity cannot drift. */

import {
  Activity,
  BarChart3,
  Bookmark,
  Eye,
  LayoutGrid,
  ListOrdered,
  Palette,
  Scale,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Type,
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
  id: WidgetId | "selected-space" | "export";
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
    label: "Organism",
    responsibility: "Style, attachment/reach, field, nuclei, motion, pockets, selection.",
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
    responsibility: "Palette mode, nucleus family ramps, organism membrane palettes, program mapping.",
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
    responsibility: "Theme, technical grid, label/nuclei visibility, and persistent interface scale.",
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
};

export const getWidgetDefinition = (id: WidgetId): WidgetDefinition => WIDGET_DEFINITIONS[id];

export const WIDGET_PANEL_DEFINITIONS: readonly WidgetPanelDefinition[] = [
  ...Object.values(WIDGET_DEFINITIONS),
  {
    id: "selected-space",
    label: "Selected Space",
    responsibility: "Future selected nucleus property editor.",
    launcher: "rail",
    status: "future",
  },
  {
    id: "export",
    label: "Export",
    responsibility: "Future export frame and output settings.",
    launcher: "dock",
    status: "future",
  },
];
