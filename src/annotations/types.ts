import type { MaterialParameterDefinition } from "../materials/types";

export type AnnotationDefinitionId = "text" | "paragraph" | "data-label" | "north-direction" | "sun-direction" | "wind-direction" | "hot-wind" | "cold-wind" | "scale-bar" | "digital-scale" | "dimension" | "area-label" | "floor-marker" | "entry" | "exit" | "movement-arrow" | "section-marker" | "view-direction";
export type AnnotationCategory = "text" | "data" | "direction" | "scale" | "measure" | "navigation" | "section";
export type AnnotationTarget = "blank" | "space" | "void" | "canvas" | "frame" | "line" | "relationship";
export type ResourceStatus = "active" | "future";

export interface AnnotationDefinition {
  id: AnnotationDefinitionId;
  name: string;
  category: AnnotationCategory;
  iconKey: string;
  description: string;
  defaultShortcut?: string;
  supportedTargets: readonly AnnotationTarget[];
  parameterSchema: readonly MaterialParameterDefinition[];
  status: ResourceStatus;
  tags: readonly string[];
}

export interface AnnotationInstance {
  id: string;
  definitionId: AnnotationDefinitionId;
  targetId?: string;
  parameterValues: Record<string, string | number | boolean | readonly string[]>;
  enabled: boolean;
}
