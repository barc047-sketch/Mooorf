import type { ResourceStatus } from "../annotations/types";

export type GridPresetId = "dotted" | "fine-line" | "technical" | "architectural" | "major-minor" | "isometric" | "radial" | "none";
export type GridVariant = "black-on-white" | "white-on-black" | "custom";
export type GridParameterId = "foreground" | "background" | "opacity" | "lineWeight" | "spacing" | "majorInterval" | "snap" | "dynamicZoomDensity" | "exportGrid";
export type GridPreviewKind = "dots" | "square" | "technical" | "architectural" | "major-minor" | "isometric" | "radial" | "off";
export type GridSnapMode = "none" | "orthogonal" | "isometric" | "radial";
export type GridCameraBehavior = "camera-synced" | "center-locked" | "none";
export type GridTheme = "day" | "night";
export type GridExportMode = "optional-raster" | "excluded";

export interface GridSettings {
  presetId: GridPresetId;
  foreground: string;
  background: string;
  opacity: number;
  lineWeight: number;
  spacing: number;
  majorInterval: number;
  snap: boolean;
  dynamicZoomDensity: boolean;
  exportGrid: boolean;
}

export interface GridPresetDefinition {
  id: GridPresetId;
  name: string;
  description: string;
  variant: GridVariant;
  renders: boolean;
  defaults: GridSettings;
  tags: readonly string[];
  status: ResourceStatus;
  preview: { kind: GridPreviewKind; label: string };
  supportedParameters: readonly GridParameterId[];
  snapping: { compatible: boolean; mode: GridSnapMode; implemented: boolean };
  cameraBehavior: GridCameraBehavior;
  themeCompatibility: readonly GridTheme[];
  compatibleMaterialTargets: readonly ["grid"];
  exportBehavior: { mode: GridExportMode; implemented: boolean };
  rendererSupport: { classic: boolean; organism: boolean };
}
