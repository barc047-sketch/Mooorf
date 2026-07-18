import type { LabelScaleMode, SpaceCell } from "../../types";
import { LABEL_BASE_SIZE_WORLD, LABEL_FONT_FAMILY_CSS, LABEL_WEIGHT_VALUES, type LabelRoleId } from "./layoutContract";
import { CELL_LABEL_PRESETS, resolveEffectiveRoleStyle } from "./presets";

/** Step 1 foundation, now backed by the production Cell Label Layout system
 * in layoutContract.ts / presets.ts / resolveLayout.ts. */
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

const TOKEN_ROLES: ReadonlyArray<{ token: CellLabelToken; role: LabelRoleId }> = [
  { token: "no", role: "no" },
  { token: "name", role: "name" },
  { token: "area", role: "areaNumber" },
  { token: "body", role: "body" },
];

/** Step 1 registry, projected from the production preset definitions so the
 * data-only contract and the visual system can never drift apart. */
export const CELL_LABEL_LAYOUT_REGISTRY: Readonly<Record<string, readonly CellLabelStyleContract[]>> =
  Object.fromEntries(
    CELL_LABEL_PRESETS.map((preset) => [
      preset.id,
      TOKEN_ROLES.flatMap(({ token, role }) => {
        const style = resolveEffectiveRoleStyle(preset.id, role, undefined);
        if (!style.visible) return [];
        return [{
          token,
          typography: {
            family: LABEL_FONT_FAMILY_CSS[style.fontFamily],
            size: LABEL_BASE_SIZE_WORLD * style.size,
            weight: LABEL_WEIGHT_VALUES[style.weight],
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
          },
          justify: style.align === "justify" ? "left" : style.align,
          align: "middle",
        } satisfies CellLabelStyleContract];
      }),
    ])
  );
