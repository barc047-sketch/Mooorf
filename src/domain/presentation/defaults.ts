import { DEFAULT_RESOURCE_SETTINGS } from "../../resources/resourcePersistence";
import type { ResourceSettings } from "../../resources/types";
import type { MaterialBinding } from "../../materials/types";
import type { PresentationPaintDefaults, ProjectPresentationDefaults } from "./types";

export const PRESENTATION_SCHEMA_VERSION = 1 as const;

export interface LegacyPresentationSettings {
  blobOn?: boolean;
  organism?: { showNuclei?: boolean };
  resources?: ResourceSettings;
}

const paint = (binding: MaterialBinding): PresentationPaintDefaults => ({
  materialId: binding.materialId,
  colour: null,
  opacity: binding.opacity,
});

/** Builds the complete hierarchy from current production owners. This is also
 * the migration source for projects created before appearance data existed. */
export const createProjectPresentationDefaults = (
  legacy: LegacyPresentationSettings = {}
): ProjectPresentationDefaults => {
  const bindings = (legacy.resources ?? DEFAULT_RESOURCE_SETTINGS).materialBindings;
  return {
    schemaVersion: PRESENTATION_SCHEMA_VERSION,
    cell: { visible: true, paint: paint(bindings.spaceFill) },
    boundary: {
      visible: false,
      style: "solid",
      width: 1.5,
      offset: 0,
      paint: paint(bindings.spaceBoundary),
    },
    membrane: { visible: legacy.blobOn === true, paint: paint(bindings.organism) },
    membraneEdge: { visible: false, width: 1, paint: paint(bindings.organismEdge) },
    core: {
      visible: legacy.organism?.showNuclei !== false,
      shape: "dot",
      size: 0.34,
      paint: paint(bindings.coreDot),
    },
    void: {
      visible: true,
      fill: paint(bindings.voidFill),
      edge: paint(bindings.voidEdge),
      edgeWidth: 1.5,
    },
  };
};

export const DEFAULT_PROJECT_PRESENTATION = createProjectPresentationDefaults();
