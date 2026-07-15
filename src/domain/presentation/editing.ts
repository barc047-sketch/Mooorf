import type {
  CellAppearanceOverrides,
  PresentationDefaultsKey,
  PresentationTargetId,
  ProjectPresentationDefaults,
  TextAppearanceOverride,
  TextStylePresetId,
} from "./types";
import { PRESENTATION_TARGET_CONTRACTS } from "./types";
import {
  cloneCellAppearanceOverrides,
  normalizeCellAppearanceOverrides,
  resetCellAppearanceTarget,
} from "./validation";

export type InheritanceState = "project-default" | "local-override" | "mixed";
export type AppearanceFamilyId = "cell" | "membrane" | "void";

export interface AppearanceFamilyDefinition {
  id: AppearanceFamilyId;
  label: string;
  targets: readonly PresentationTargetId[];
  detailWidgetId: "cell-settings" | "membrane-settings" | "void-settings";
}

export const APPEARANCE_FAMILIES: readonly AppearanceFamilyDefinition[] = [
  { id: "cell", label: "Cell", targets: ["cell", "boundary", "core"], detailWidgetId: "cell-settings" },
  { id: "membrane", label: "Membrane", targets: ["membrane", "membrane-edge"], detailWidgetId: "membrane-settings" },
  { id: "void", label: "Void", targets: ["void"], detailWidgetId: "void-settings" },
];

export const appearanceFamilyForTarget = (target: PresentationTargetId): AppearanceFamilyId =>
  APPEARANCE_FAMILIES.find((family) => family.targets.includes(target))?.id ?? "cell";

export const appearanceFamilyDefinition = (family: AppearanceFamilyId): AppearanceFamilyDefinition =>
  APPEARANCE_FAMILIES.find((definition) => definition.id === family) ?? APPEARANCE_FAMILIES[0];

export interface TextStylePreset {
  id: TextStylePresetId;
  label: string;
  heading: { scale: number; weight: number; tracking: number };
  area: { scale: number; weight: number; tracking: number };
  body: { scale: number; weight: number; tracking: number; lineHeight: number };
  align: "center" | "left";
}

/** Coordinated, bounded role hierarchies. The UI exposes only these presets
 * and one proportional size control; it never creates arbitrary typography. */
export const TEXT_STYLE_PRESETS: readonly TextStylePreset[] = [
  { id: "technical", label: "Technical", heading: { scale: 1, weight: 650, tracking: 0.06 }, area: { scale: 0.68, weight: 650, tracking: 0.08 }, body: { scale: 0.62, weight: 450, tracking: 0.025, lineHeight: 1.24 }, align: "center" },
  { id: "editorial", label: "Editorial", heading: { scale: 1.12, weight: 600, tracking: -0.025 }, area: { scale: 0.67, weight: 600, tracking: 0.03 }, body: { scale: 0.68, weight: 450, tracking: 0, lineHeight: 1.32 }, align: "center" },
  { id: "minimal", label: "Minimal", heading: { scale: 0.94, weight: 550, tracking: 0 }, area: { scale: 0.62, weight: 500, tracking: 0.04 }, body: { scale: 0.58, weight: 400, tracking: 0, lineHeight: 1.28 }, align: "center" },
  { id: "compact", label: "Compact", heading: { scale: 0.88, weight: 700, tracking: 0.035 }, area: { scale: 0.6, weight: 650, tracking: 0.06 }, body: { scale: 0.55, weight: 450, tracking: 0.015, lineHeight: 1.18 }, align: "center" },
  { id: "presentation", label: "Presentation", heading: { scale: 1.28, weight: 700, tracking: -0.025 }, area: { scale: 0.72, weight: 650, tracking: 0.04 }, body: { scale: 0.7, weight: 450, tracking: 0, lineHeight: 1.3 }, align: "center" },
  { id: "diagram", label: "Diagram", heading: { scale: 0.96, weight: 650, tracking: 0.025 }, area: { scale: 0.64, weight: 600, tracking: 0.06 }, body: { scale: 0.6, weight: 450, tracking: 0.01, lineHeight: 1.22 }, align: "left" },
];

export const textStylePreset = (id: TextStylePresetId): TextStylePreset =>
  TEXT_STYLE_PRESETS.find((preset) => preset.id === id) ?? TEXT_STYLE_PRESETS[0];

export const appearanceKeyForTarget = (target: PresentationTargetId): PresentationDefaultsKey =>
  PRESENTATION_TARGET_CONTRACTS.find((contract) => contract.id === target)!.defaultsKey;

const mergeTarget = (current: unknown, patch: Record<string, unknown>): Record<string, unknown> => {
  const base = current && typeof current === "object" ? current as Record<string, unknown> : {};
  const next = { ...base, ...patch };
  for (const nested of ["paint", "fill", "edge"] as const) {
    if (patch[nested] && typeof patch[nested] === "object") {
      next[nested] = {
        ...(base[nested] && typeof base[nested] === "object" ? base[nested] as Record<string, unknown> : {}),
        ...patch[nested] as Record<string, unknown>,
      };
    }
  }
  return next;
};

export const applyAppearancePatch = (
  current: CellAppearanceOverrides | undefined,
  defaults: ProjectPresentationDefaults,
  target: PresentationTargetId,
  patch: Record<string, unknown>
): CellAppearanceOverrides | undefined => {
  const key = appearanceKeyForTarget(target);
  const next = cloneCellAppearanceOverrides(current) ?? {};
  (next as Record<PresentationDefaultsKey, unknown>)[key] = mergeTarget(next[key], patch);
  return normalizeCellAppearanceOverrides(next, defaults);
};

export const applyTextAppearancePatch = (
  current: CellAppearanceOverrides | undefined,
  defaults: ProjectPresentationDefaults,
  patch: Partial<TextAppearanceOverride>
): CellAppearanceOverrides | undefined => {
  const next = cloneCellAppearanceOverrides(current) ?? {};
  next.text = { ...next.text, ...patch };
  return normalizeCellAppearanceOverrides(next, defaults);
};

export const resetTextAppearance = (
  current: CellAppearanceOverrides | undefined
): CellAppearanceOverrides | undefined => {
  if (!current) return undefined;
  const next = cloneCellAppearanceOverrides(current)!;
  delete next.text;
  return Object.values(next).some((value) => value !== undefined) ? next : undefined;
};

export const resetAllAppearance = (): undefined => undefined;

export const resolveInheritanceState = (
  appearances: readonly (CellAppearanceOverrides | undefined)[],
  channel: PresentationTargetId | "text"
): InheritanceState => {
  if (!appearances.length) return "project-default";
  const key = channel === "text" ? "text" : appearanceKeyForTarget(channel);
  const local = appearances.map((appearance) => appearance?.[key] !== undefined);
  if (local.every(Boolean)) return "local-override";
  if (local.every((value) => !value)) return "project-default";
  return "mixed";
};

export const resolveFamilyInheritanceState = (
  appearances: readonly (CellAppearanceOverrides | undefined)[],
  family: AppearanceFamilyId
): InheritanceState => {
  // Membrane and its Edge are shared organism fields. Per-Cell values are not
  // a live M1 scope and therefore cannot truthfully report Local Override.
  if (family === "membrane") return "project-default";
  const states = appearanceFamilyDefinition(family).targets.map((target) =>
    resolveInheritanceState(appearances, target)
  );
  if (states.every((state) => state === "project-default")) return "project-default";
  if (states.every((state) => state === "local-override")) return "local-override";
  return "mixed";
};

export const inheritanceStateLabel = (state: InheritanceState): string =>
  state === "project-default" ? "Project Default" : state === "local-override" ? "Local Override" : "Mixed";

export const resetAppearanceChannel = (
  current: CellAppearanceOverrides | undefined,
  channel: PresentationTargetId | "text"
): CellAppearanceOverrides | undefined =>
  channel === "text" ? resetTextAppearance(current) : resetCellAppearanceTarget(current, channel);

export const resetAppearanceFamilyChannels = (
  current: CellAppearanceOverrides | undefined,
  family: AppearanceFamilyId
): CellAppearanceOverrides | undefined => {
  if (!current) return undefined;
  const next = cloneCellAppearanceOverrides(current)!;
  for (const target of appearanceFamilyDefinition(family).targets) {
    delete next[appearanceKeyForTarget(target)];
  }
  for (const key of Object.keys(next) as PresentationDefaultsKey[]) {
    if (next[key] === undefined) delete next[key];
  }
  return Object.values(next).some((value) => value !== undefined) ? next : undefined;
};

export const cloneStyle = (appearance: CellAppearanceOverrides | undefined): CellAppearanceOverrides => {
  const copy = cloneCellAppearanceOverrides(appearance) ?? {};
  // Membrane and Membrane Edge are one audited shared organism field. They are
  // Project Defaults, not portable per-Cell style, so style copy cannot create
  // a local override that the shared renderer would truthfully ignore.
  delete copy.membrane;
  delete copy.membraneEdge;
  return copy;
};
