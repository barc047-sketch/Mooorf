export type GridPresetId = "dotted" | "fine-line" | "technical" | "architectural" | "major-minor" | "isometric" | "radial" | "none";
export type GridVariant = "black-on-white" | "white-on-black" | "custom";

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
}
