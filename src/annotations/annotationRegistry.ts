import type { AnnotationCategory, AnnotationDefinition, AnnotationDefinitionId, AnnotationTarget } from "./types";

const future = (id: AnnotationDefinitionId, name: string, category: AnnotationCategory, iconKey: string, supportedTargets: readonly AnnotationTarget[], defaultShortcut?: string): AnnotationDefinition => ({
  id, name, category, iconKey, description: `${name} annotation metadata; canvas behavior is not implemented.`, defaultShortcut,
  supportedTargets, parameterSchema: [], status: "future", tags: name.toLowerCase().split(/\s+/),
});

export const ANNOTATION_DEFINITIONS: readonly AnnotationDefinition[] = [
  future("text", "Text", "text", "Type", ["blank", "space", "frame"], "T"),
  future("paragraph", "Paragraph", "text", "Pilcrow", ["blank", "frame"], "P"),
  future("data-label", "Data Label", "data", "Tag", ["space", "void"]),
  future("north-direction", "North Direction", "direction", "Navigation", ["canvas", "frame"], "N"),
  future("sun-direction", "Sun Direction", "direction", "Sun", ["canvas", "frame"]),
  future("wind-direction", "Wind Direction", "direction", "Wind", ["canvas", "frame"]),
  future("hot-wind", "Hot Wind", "direction", "Flame", ["canvas", "frame"]),
  future("cold-wind", "Cold Wind", "direction", "Snowflake", ["canvas", "frame"]),
  future("scale-bar", "Scale Bar", "scale", "Ruler", ["canvas", "frame"]),
  future("digital-scale", "Digital Scale", "scale", "Gauge", ["canvas", "frame"]),
  future("dimension", "Dimension", "measure", "BetweenHorizontalStart", ["space", "line", "frame"], "D"),
  future("area-label", "Area Label", "data", "ScanText", ["space"]),
  future("floor-marker", "Floor Marker", "data", "Layers", ["space", "frame"]),
  future("entry", "Entry", "navigation", "LogIn", ["space", "frame"]),
  future("exit", "Exit", "navigation", "LogOut", ["space", "frame"]),
  future("movement-arrow", "Movement Arrow", "navigation", "MoveRight", ["canvas", "space", "frame"]),
  future("section-marker", "Section Marker", "section", "Slice", ["canvas", "frame"]),
  future("view-direction", "View Direction", "direction", "Eye", ["canvas", "space", "frame"]),
];

const byId = new Map(ANNOTATION_DEFINITIONS.map((item) => [item.id, item]));
export const annotationRegistry = Object.freeze({
  get: (id: string) => byId.get(id as AnnotationDefinitionId) ?? null,
  list: () => ANNOTATION_DEFINITIONS,
  listByCategory: (category: AnnotationCategory) => ANNOTATION_DEFINITIONS.filter((item) => item.category === category),
  listByTarget: (target: AnnotationTarget) => ANNOTATION_DEFINITIONS.filter((item) => item.supportedTargets.includes(target)),
  search: (query: string) => { const needle = query.trim().toLowerCase(); return needle ? ANNOTATION_DEFINITIONS.filter((item) => `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(needle)) : ANNOTATION_DEFINITIONS; },
});
