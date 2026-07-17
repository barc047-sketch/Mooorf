import type { LabelScaleMode, SpaceCell } from "../../types";

/** Contract-only foundation for future Cell and floating-card text. No renderer
 * consumes a layout preset in Step 1. */
export type CellLabelToken = "no" | "name" | "area" | "body";
export type LabelJustification = "left" | "centre" | "right";
export type LabelAlignment = "top" | "middle" | "bottom";

export interface LabelTypography {
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface CellLabelStyleContract {
  token: CellLabelToken;
  typography: LabelTypography;
  justify: LabelJustification;
  align: LabelAlignment;
}

export const CELL_LABEL_TOKENS: readonly CellLabelToken[] = ["no", "name", "area", "body"];
export const CELL_LABEL_SCALE_OPTIONS: ReadonlyArray<{ id: LabelScaleMode; label: string }> = [
  { id: "world", label: "Scale with Cell" },
  { id: "adaptive", label: "Auto" },
  { id: "screen", label: "Keep readable" },
];
export const DEFAULT_FUTURE_CELL_LABEL_SCALE: LabelScaleMode = "world";

export const resolveCellLabelToken = (space: Pick<SpaceCell, "spaceCode" | "name" | "area" | "body">, token: CellLabelToken): string => {
  if (token === "no") return space.spaceCode ?? "";
  if (token === "name") return space.name;
  if (token === "area") return Number.isFinite(space.area) ? `${space.area} m²` : "";
  return space.body ?? "";
};

/** Registry is deliberately data-only until a later visual-layout stage. */
export const CELL_LABEL_LAYOUT_REGISTRY: Readonly<Record<string, readonly CellLabelStyleContract[]>> = {};
