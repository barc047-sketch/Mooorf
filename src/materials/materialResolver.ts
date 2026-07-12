import { getNucleusColor, type AreaRange, type NucleusColor } from "../design/colorMapping";
import type { ColorSource, PaletteMode, SpaceCell } from "../types";
import type { MaterialBinding } from "./types";

export interface LegacyMaterialContext {
  paletteMode: PaletteMode;
  areaRange?: AreaRange;
  nucleusPaletteId?: string;
  organismPaletteId?: string;
  colorSource: ColorSource;
}

export interface ResolvedLegacyCellMaterial { binding: MaterialBinding; color: NucleusColor; }

export const resolveLegacyCellMaterial = (
  space: Pick<SpaceCell, "category" | "privacy" | "area" | "kind"> & Partial<Pick<SpaceCell, "id" | "color">>,
  context: LegacyMaterialContext
): ResolvedLegacyCellMaterial => ({
  binding: {
    materialId: space.kind === "void" ? "system:void" : `palette:${context.nucleusPaletteId ?? "auto"}`,
    parameterOverrides: {},
    sourceMode: space.color ? "object" : context.colorSource,
    opacity: 1,
    enabled: true,
  },
  color: getNucleusColor(space, context.paletteMode, context.areaRange, context.nucleusPaletteId, context.colorSource),
});
