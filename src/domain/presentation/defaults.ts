import { DEFAULT_RESOURCE_SETTINGS } from "../../resources/resourcePersistence";
import type { ResourceSettings } from "../../resources/types";
import type { MaterialBinding } from "../../materials/types";
import type { PresentationPaintDefaults, ProjectPresentationDefaults } from "./types";

export const PRESENTATION_SCHEMA_VERSION = 6 as const;

export interface LegacyPresentationSettings {
  blobOn?: boolean;
  organism?: { showNuclei?: boolean };
  resources?: ResourceSettings;
  annotationDetail?: { textScale?: number };
  labelColourMode?: "auto" | "black" | "white" | "custom";
  labelCustomColour?: string;
}

const legacyTextSize = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(1.8, Math.max(0.65, value))
    : 1;

const legacyTextColour = (legacy: LegacyPresentationSettings): string => {
  if (legacy.labelColourMode === "white") return "#f7f6f2";
  if (legacy.labelColourMode === "custom" && /^#[0-9a-f]{6}$/i.test(legacy.labelCustomColour ?? "")) {
    return legacy.labelCustomColour!.toLowerCase();
  }
  return "#171715";
};

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
    text: {
      preset: "technical",
      size: legacyTextSize(legacy.annotationDetail?.textScale),
      colourMode: legacy.labelColourMode && legacy.labelColourMode !== "auto" ? "custom" : "auto",
      colour: legacyTextColour(legacy),
      /* Sparse Cell Label Layout config; empty means Centre Stack over the
       * preset registry, matching the pre-phase composition. */
      labels: {},
    },
    cell: { visible: true, paint: paint(bindings.spaceFill) },
    boundary: {
      visible: false,
      style: "solid",
      width: 1.5,
      offset: 0,
      alignment: "centre",
      dashLength: 8,
      gapLength: 6,
      secondaryLineSpacing: 3,
      paint: paint(bindings.spaceBoundary),
    },
    membrane: {
      visible: legacy.blobOn === true,
      colourMode: "cell-gradient",
      solidMaterialId: "system:black",
      paint: paint(bindings.organism),
    },
    membraneEdge: { visible: false, width: 1, softness: 0.08, paint: paint(bindings.organismEdge) },
    core: {
      visible: legacy.organism?.showNuclei !== false,
      shape: "dot",
      size: 0.34,
      offsetX: 0,
      offsetY: 0,
      paint: paint(bindings.coreDot),
    },
    void: {
      visible: true,
      fillVisible: true,
      edgeVisible: true,
      fill: { ...paint(bindings.voidFill), opacity: bindings.voidFill.opacity * 0.035 },
      edge: paint(bindings.voidEdge),
      edgeWidth: 1.5,
      style: "solid",
      dashLength: 8,
      gapLength: 6,
      secondaryLineSpacing: 3,
    },
  };
};

export const DEFAULT_PROJECT_PRESENTATION = createProjectPresentationDefaults();
