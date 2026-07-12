export type MaterialCategory = "solid" | "hue" | "gradient" | "shader" | "texture" | "pattern" | "custom";

export type MaterialTarget =
  | "space-fill" | "core-dot" | "space-boundary" | "organism" | "organism-edge"
  | "void-fill" | "void-edge" | "canvas" | "grid" | "line" | "relationship"
  | "text" | "text-background" | "frame";

export type MaterialParameterType =
  | "colour" | "number" | "range" | "angle" | "percentage" | "boolean"
  | "enum" | "gradient" | "texture-reference";

export type MaterialParameterValue = string | number | boolean | readonly string[];

export interface MaterialParameterOption { value: string; label: string; }

export interface MaterialParameterDefinition {
  id: string;
  label: string;
  type: MaterialParameterType;
  defaultValue: MaterialParameterValue;
  minimum?: number;
  maximum?: number;
  step?: number;
  unit?: string;
  options: readonly MaterialParameterOption[];
  targetCompatibility: readonly MaterialTarget[];
}

export type MaterialPerformanceTier = "low" | "medium" | "high";
export type MaterialExportFallback = "preserve" | "rasterize" | "approximate-solid" | "omit" | "unsupported";

export interface MaterialDefinition {
  id: string;
  name: string;
  category: MaterialCategory;
  description: string;
  preview: { kind: "swatch" | "gradient" | "pattern" | "texture"; values: readonly string[] };
  compatibleTargets: readonly MaterialTarget[];
  parameters: readonly MaterialParameterDefinition[];
  performanceTier: MaterialPerformanceTier;
  rendererSupport: { classic: boolean; organism: boolean };
  exportFallback: MaterialExportFallback;
  source: { type: "system" | "palette-adapter" | "registry-code" | "local-asset"; key: string };
  licence: string;
  attribution: string;
  builtIn: boolean;
  version: number;
  tags: readonly string[];
}

export type MaterialSourceMode = "global" | "category" | "privacy" | "object";

export interface MaterialBinding {
  materialId: string;
  parameterOverrides: Record<string, MaterialParameterValue>;
  sourceMode: MaterialSourceMode;
  opacity: number;
  enabled: boolean;
}

export interface MaterialBindings {
  spaceFill: MaterialBinding;
  coreDot: MaterialBinding;
  spaceBoundary: MaterialBinding;
  organism: MaterialBinding;
  organismEdge: MaterialBinding;
  voidFill: MaterialBinding;
  voidEdge: MaterialBinding;
  canvas: MaterialBinding;
  grid: MaterialBinding;
  line: MaterialBinding;
  relationship: MaterialBinding;
  text: MaterialBinding;
  textBackground: MaterialBinding;
  frame: MaterialBinding;
}

export interface MaterialCollection {
  id: string;
  name: string;
  kind: "nucleus-palette" | "organism-palette";
  sourcePaletteId: string;
  materialIds: readonly string[];
  tags: readonly string[];
}
