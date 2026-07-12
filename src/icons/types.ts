import type { ResourceStatus } from "../annotations/types";

export type IconCategory = "architecture" | "landscape" | "diagram" | "annotation" | "navigation" | "custom";
export type IconSourceType = "lucide" | "local-svg" | "local-png" | "uploaded";
export type IconBacking = "none" | "circle" | "square" | "pill";

export interface IconDefinition {
  id: string;
  name: string;
  category: IconCategory;
  sourceType: IconSourceType;
  sourceKey: string;
  tags: readonly string[];
  defaultTint: string;
  defaultBacking: IconBacking;
  licence: string;
  attribution: string;
  builtIn: boolean;
  status: ResourceStatus;
}

export interface IconPlacementSettings {
  iconId: string;
  targetSpaceId: string;
  scale: number;
  rotation: number;
  opacity: number;
  tint: string;
  backing: IconBacking;
  boundary: boolean;
  hideBelowZoom: number;
}
