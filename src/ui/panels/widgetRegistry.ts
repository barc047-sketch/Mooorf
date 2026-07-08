export type WidgetPanelId =
  | "organism"
  | "annotation"
  | "palette"
  | "saved-views"
  | "selected-space"
  | "stats"
  | "export";

export type WidgetPanelStatus = "live" | "prepared" | "future";

export interface WidgetPanelDefinition {
  id: WidgetPanelId;
  label: string;
  responsibility: string;
  launcher: "rail" | "dock" | "both";
  status: WidgetPanelStatus;
}

export const WIDGET_PANEL_DEFINITIONS: readonly WidgetPanelDefinition[] = [
  {
    id: "organism",
    label: "Organism",
    responsibility: "Detailed organism field, nuclei, attachment, motion, pockets, and debug settings.",
    launcher: "both",
    status: "live",
  },
  {
    id: "annotation",
    label: "Annotation",
    responsibility: "Canvas label mode and selection display behavior.",
    launcher: "rail",
    status: "live",
  },
  {
    id: "palette",
    label: "Palette",
    responsibility: "Nucleus and organism palette choices; category mapping remains future work.",
    launcher: "both",
    status: "prepared",
  },
  {
    id: "saved-views",
    label: "Saved Views",
    responsibility: "Future snapshots of spaces, camera, renderer, palette, annotation, and organism settings.",
    launcher: "dock",
    status: "prepared",
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
    label: "Stats",
    responsibility: "Future selector-backed metrics and warnings.",
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

