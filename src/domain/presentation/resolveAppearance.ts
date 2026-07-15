import { getNucleusColor, getOrganismPalette } from "../../design/colorMapping";
import { materialRegistry } from "../../materials/materialRegistry";
import { resolveLegacyCellMaterial, type LegacyMaterialContext } from "../../materials/materialResolver";
import type { MaterialTarget } from "../../materials/types";
import { styleColors } from "../../experiments/organism-lab/organism-controls";
import type { MorphMode, SpaceCell, Theme } from "../../types";
import { normalizeCellAppearanceOverrides } from "./validation";
import type {
  CellAppearanceOverrides,
  MaterialResolutionStatus,
  PresentationPaintDefaults,
  PresentationPaintOverride,
  ProjectPresentationDefaults,
  ResolvedPresentationPaint,
  ResolvedCellAppearance,
  ResolvedMembraneAppearance,
} from "./types";

export interface PresentationResolveContext extends LegacyMaterialContext {
  theme?: Theme;
  morphMode?: MorphMode;
  spaces?: readonly SpaceCell[];
}

type AppearanceSpace = SpaceCell & { appearance?: CellAppearanceOverrides };

const firstCompatibleMaterial = (target: MaterialTarget): string =>
  materialRegistry.listByTarget(target)[0]?.id ?? "system:ink";

const isLegacyAdapterReference = (materialId: string, target: MaterialTarget): boolean =>
  (materialId === "palette:auto" && ["space-fill", "space-boundary", "core-dot"].includes(target)) ||
  (materialId === "organism:mode" && ["organism", "organism-edge"].includes(target));

const resolveMaterialReference = (
  requestedMaterialId: string,
  fallbackMaterialId: string,
  target: MaterialTarget
): { requestedMaterialId: string; materialId: string; status: MaterialResolutionStatus } => {
  const requested = materialRegistry.get(requestedMaterialId);
  if (requested?.compatibleTargets.includes(target) || isLegacyAdapterReference(requestedMaterialId, target)) {
    return { requestedMaterialId, materialId: requestedMaterialId, status: "resolved" };
  }
  const fallback = materialRegistry.get(fallbackMaterialId);
  const materialId = fallback?.compatibleTargets.includes(target) || isLegacyAdapterReference(fallbackMaterialId, target)
    ? fallbackMaterialId
    : firstCompatibleMaterial(target);
  return {
    requestedMaterialId,
    materialId,
    status: requested ? "incompatible-fallback" : "unknown-fallback",
  };
};

const resolvedPaint = (
  defaults: PresentationPaintDefaults,
  override: PresentationPaintOverride | undefined,
  target: MaterialTarget,
  fallbackColour: (materialId: string) => string
): ResolvedPresentationPaint => {
  const requestedMaterialId = override?.materialId ?? defaults.materialId;
  const reference = resolveMaterialReference(requestedMaterialId, defaults.materialId, target);
  return {
    ...reference,
    colour: override?.colour ?? defaults.colour ?? fallbackColour(reference.materialId),
    opacity: override?.opacity ?? defaults.opacity,
  };
};

const resolvedMembrane = (
  defaults: ProjectPresentationDefaults["membrane"],
  override: CellAppearanceOverrides["membrane"],
  fallbackColour: (materialId: string) => string
): ResolvedMembraneAppearance => {
  const paint = resolvedPaint(defaults.paint, override?.paint, "organism", fallbackColour);
  if (defaults.colourMode !== "solid" || defaults.solidMaterialId === "custom") {
    return {
      visible: override?.visible ?? defaults.visible,
      colourMode: defaults.colourMode,
      solidMaterialId: defaults.solidMaterialId,
      paint,
    };
  }
  const material = materialRegistry.get(defaults.solidMaterialId);
  const colour = material?.compatibleTargets.includes("organism") ? material.preview.values[0] : null;
  return {
    visible: override?.visible ?? defaults.visible,
    colourMode: defaults.colourMode,
    solidMaterialId: defaults.solidMaterialId,
    paint: colour ? {
      requestedMaterialId: defaults.solidMaterialId,
      materialId: defaults.solidMaterialId,
      status: "resolved",
      colour,
      opacity: paint.opacity,
    } : paint,
  };
};

/** Complete deterministic projection. It does not import the store or either
 * renderer, and changing appearance cannot affect Cell geometry or Void logic. */
export const resolveCellAppearance = (
  space: AppearanceSpace,
  defaults: ProjectPresentationDefaults,
  context: PresentationResolveContext
): ResolvedCellAppearance => {
  const overrides = normalizeCellAppearanceOverrides(space.appearance, defaults);
  const legacyMaterial = resolveLegacyCellMaterial(space, context);
  const nucleusFor = (materialId: string) => {
    const paletteId = materialId.startsWith("palette:") ? materialId.slice("palette:".length) : context.nucleusPaletteId;
    if (paletteId === context.nucleusPaletteId) return legacyMaterial.color;
    return getNucleusColor(space, context.paletteMode, context.areaRange, paletteId, context.colorSource);
  };
  const style = styleColors(context.morphMode ?? "cellular-reverse", context.theme ?? "day");
  const organismFor = (materialId: string) => {
    const paletteId = materialId.startsWith("organism:") ? materialId.slice("organism:".length) : context.organismPaletteId;
    return getOrganismPalette(
      context.paletteMode,
      context.theme ?? "day",
      { bodyHex: style.bodyHex, bgHex: style.bgHex },
      paletteId,
      {
        spaces: context.spaces ?? [space],
        areaRange: context.areaRange,
        nucleusPaletteId: context.nucleusPaletteId,
        colorSource: context.colorSource,
      }
    );
  };
  return {
    text: {
      preset: overrides?.text?.preset ?? defaults.text.preset,
      size: overrides?.text?.size ?? defaults.text.size,
      colourMode: overrides?.text?.colourMode ?? defaults.text.colourMode,
      colour: overrides?.text?.colour ?? defaults.text.colour,
    },
    cell: {
      visible: overrides?.cell?.visible ?? defaults.cell.visible,
      paint: resolvedPaint(defaults.cell.paint, overrides?.cell?.paint, "space-fill", (id) => nucleusFor(id).fill),
    },
    boundary: {
      visible: overrides?.boundary?.visible ?? defaults.boundary.visible,
      style: overrides?.boundary?.style ?? defaults.boundary.style,
      width: overrides?.boundary?.width ?? defaults.boundary.width,
      offset: overrides?.boundary?.offset ?? defaults.boundary.offset,
      alignment: overrides?.boundary?.alignment ?? defaults.boundary.alignment,
      dashLength: overrides?.boundary?.dashLength ?? defaults.boundary.dashLength,
      gapLength: overrides?.boundary?.gapLength ?? defaults.boundary.gapLength,
      secondaryLineSpacing:
        overrides?.boundary?.secondaryLineSpacing ?? defaults.boundary.secondaryLineSpacing,
      paint: resolvedPaint(defaults.boundary.paint, overrides?.boundary?.paint, "space-boundary", (id) => nucleusFor(id).ring),
    },
    membrane: resolvedMembrane(defaults.membrane, overrides?.membrane, (id) => organismFor(id).bodyHex),
    membraneEdge: {
      visible: overrides?.membraneEdge?.visible ?? defaults.membraneEdge.visible,
      width: overrides?.membraneEdge?.width ?? defaults.membraneEdge.width,
      paint: resolvedPaint(defaults.membraneEdge.paint, overrides?.membraneEdge?.paint, "organism-edge", (id) => organismFor(id).accentHex),
    },
    core: {
      visible: overrides?.core?.visible ?? defaults.core.visible,
      shape: "dot",
      size: overrides?.core?.size ?? defaults.core.size,
      paint: resolvedPaint(defaults.core.paint, overrides?.core?.paint, "core-dot", (id) => nucleusFor(id).fill),
    },
    void: {
      visible: overrides?.void?.visible ?? defaults.void.visible,
      fillVisible: overrides?.void?.fillVisible ?? defaults.void.fillVisible,
      edgeVisible: overrides?.void?.edgeVisible ?? defaults.void.edgeVisible,
      fill: resolvedPaint(defaults.void.fill, overrides?.void?.fill, "void-fill", (id) => nucleusFor(id).fill),
      edge: resolvedPaint(defaults.void.edge, overrides?.void?.edge, "void-edge", (id) => nucleusFor(id).ring),
      edgeWidth: overrides?.void?.edgeWidth ?? defaults.void.edgeWidth,
      semantics: {
        subtractive: true,
        areaContribution: 0,
        appearanceAffectsGeometry: false,
        appearanceAffectsHitTesting: false,
        appearanceAffectsClearance: false,
      },
    },
  };
};
