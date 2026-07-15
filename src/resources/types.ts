import type { AnnotationInstance } from "../annotations/types";
import type { GridSettings } from "../grid/types";
import type { IconPlacementSettings } from "../icons/types";
import type { MaterialBindings } from "../materials/types";

export interface ResourceSettings {
  schemaVersion: 2;
  materialBindings: MaterialBindings;
  grid: GridSettings;
  annotationInstances: AnnotationInstance[];
  iconPlacements: IconPlacementSettings[];
  iconFavourites: string[];
  iconRecents: string[];
}
