import type { ResourceStatus } from "../annotations/types";

export type IconCategory =
  | "architecture" | "landscape" | "diagram" | "annotation" | "wayfinding"
  | "environmental" | "accessibility" | "service" | "navigation" | "custom"
  | "shell" | "tools" | "insert" | "utility";
export type IconSourceType = "lucide" | "local-svg" | "local-png" | "uploaded";
export type IconBacking = "none" | "circle" | "square" | "pill";
export type IconTarget = "space";
export type IconOrigin = "lucide" | "mooorf-original" | "user-supplied";
export type IconUsage = "drawable-symbol" | "ui-control";
export type IconValidationStatus = "approved" | "pending" | "rejected";

export interface IconDefinition {
  id: string;
  name: string;
  category: IconCategory;
  sourceType: IconSourceType;
  sourceKey: string;
  tags: readonly string[];
  accessibleLabel: string;
  tooltip: string;
  defaultTint: string;
  defaultBacking: IconBacking;
  origin: IconOrigin;
  usage: IconUsage;
  validationStatus: IconValidationStatus;
  licence: string;
  attribution: string;
  attributionUrl?: string;
  requiresVisibleAttribution: boolean;
  builtIn: boolean;
  placeableTargets: readonly IconTarget[];
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
