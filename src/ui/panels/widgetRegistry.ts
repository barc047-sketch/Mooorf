/* V6K widget registry — metadata for the live floating widget system.
   Runtime rendering lives in src/ui/widgets/WidgetHost.tsx; this file stays
   the architecture map for docs/phases. */

import type { WidgetId } from "../../types";

export type WidgetPanelStatus = "live" | "prepared" | "future";

export interface WidgetPanelDefinition {
  id: WidgetId | "selected-space" | "stats" | "export";
  label: string;
  responsibility: string;
  launcher: "rail" | "dock" | "both";
  status: WidgetPanelStatus;
}

export const WIDGET_PANEL_DEFINITIONS: readonly WidgetPanelDefinition[] = [
  {
    id: "annotation",
    label: "Annotation",
    responsibility: "Label modes, text scale, visible fields, position, bounding box.",
    launcher: "rail",
    status: "live",
  },
  {
    id: "organism",
    label: "Organism",
    responsibility: "Style, attachment/reach, field, nuclei, motion, pockets, selection.",
    launcher: "both",
    status: "live",
  },
  {
    id: "layout",
    label: "Layout",
    responsibility: "Arrangement presets (x/y-only) and visual spread.",
    launcher: "rail",
    status: "live",
  },
  {
    id: "palette",
    label: "Palette",
    responsibility: "Palette mode, nucleus family ramps, organism membrane palettes, program mapping.",
    launcher: "both",
    status: "live",
  },
  {
    id: "saved",
    label: "Saved Views",
    responsibility: "Snapshot save/load/rename/duplicate/delete with timestamps.",
    launcher: "both",
    status: "live",
  },
  {
    id: "display",
    label: "Display",
    responsibility: "Theme, technical grid, label/nuclei visibility, density placeholder.",
    launcher: "rail",
    status: "live",
  },
  {
    id: "advanced",
    label: "Advanced",
    responsibility: "Debug toggles, renderer diagnostics, staged experimental features.",
    launcher: "rail",
    status: "live",
  },
  {
    id: "selected-space",
    label: "Selected Space",
    responsibility: "Future selected nucleus property editor.",
    launcher: "rail",
    status: "future",
  },
  {
    id: "stats",
    label: "Project Pulse",
    responsibility:
      "Spatial intelligence flagship — live program metrics from pure selectors (src/domain/stats). Family spec: docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md.",
    launcher: "rail",
    status: "live",
  },
  {
    id: "export",
    label: "Export",
    responsibility: "Future export frame and output settings.",
    launcher: "dock",
    status: "future",
  },
];
