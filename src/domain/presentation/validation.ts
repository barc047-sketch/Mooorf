import { createProjectPresentationDefaults, PRESENTATION_SCHEMA_VERSION, type LegacyPresentationSettings } from "./defaults";
import {
  BOUNDARY_ALIGNMENTS,
  BOUNDARY_STYLES,
  MEMBRANE_COLOUR_MODES,
  PRESENTATION_TARGET_CONTRACTS,
  TEXT_STYLE_PRESET_IDS,
  type BoundaryAlignment,
  type BoundaryStyle,
  type CellAppearanceOverrides,
  type MembraneColourMode,
  type MembraneSolidMaterialId,
  type PresentationDefaultsKey,
  type PresentationPaintDefaults,
  type PresentationPaintOverride,
  type PresentationTargetId,
  type ProjectPresentationDefaults,
  type TextColourMode,
  type TextStylePresetId,
} from "./types";
import { MEMBRANE_SOLID_MATERIAL_IDS } from "../../materials/materialRegistry";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const canonicalHex = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const colour = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(colour)) return colour;
  if (/^#[0-9a-f]{3}$/.test(colour)) {
    return `#${colour[1]}${colour[1]}${colour[2]}${colour[2]}${colour[3]}${colour[3]}`;
  }
  return null;
};

const materialId = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const id = value.trim().slice(0, 160);
  return id || fallback;
};

const finiteOr = (value: unknown, fallback: number, minimum: number, maximum: number): number =>
  typeof value === "number" && Number.isFinite(value) ? clamp(value, minimum, maximum) : fallback;

const boundaryStyle = (value: unknown, fallback: BoundaryStyle): BoundaryStyle =>
  BOUNDARY_STYLES.includes(value as BoundaryStyle) ? value as BoundaryStyle : fallback;

const boundaryAlignment = (value: unknown, fallback: BoundaryAlignment): BoundaryAlignment =>
  BOUNDARY_ALIGNMENTS.includes(value as BoundaryAlignment) ? value as BoundaryAlignment : fallback;

const textPreset = (value: unknown, fallback: TextStylePresetId): TextStylePresetId =>
  TEXT_STYLE_PRESET_IDS.includes(value as TextStylePresetId) ? value as TextStylePresetId : fallback;

const textColourMode = (value: unknown, fallback: TextColourMode): TextColourMode =>
  value === "auto" || value === "custom" ? value : fallback;

const membraneColourMode = (value: unknown, fallback: MembraneColourMode): MembraneColourMode =>
  MEMBRANE_COLOUR_MODES.includes(value as MembraneColourMode) ? value as MembraneColourMode : fallback;

const membraneSolidMaterialId = (
  value: unknown,
  fallback: MembraneSolidMaterialId
): MembraneSolidMaterialId =>
  value === "custom" || MEMBRANE_SOLID_MATERIAL_IDS.includes(value as Exclude<MembraneSolidMaterialId, "custom">)
    ? value as MembraneSolidMaterialId
    : fallback;

const normalizePaintDefaults = (value: unknown, fallback: PresentationPaintDefaults): PresentationPaintDefaults => {
  const record = isRecord(value) ? value : {};
  const colour = record.colour === null ? null : canonicalHex(record.colour) ?? fallback.colour;
  return {
    materialId: materialId(record.materialId, fallback.materialId),
    colour,
    opacity: finiteOr(record.opacity, fallback.opacity, 0, 1),
  };
};

export const normalizeProjectPresentationDefaults = (
  value: unknown,
  legacy: LegacyPresentationSettings = {}
): ProjectPresentationDefaults => {
  const fallback = createProjectPresentationDefaults(legacy);
  if (!isRecord(value)) return fallback;
  if (typeof value.schemaVersion === "number" && value.schemaVersion > PRESENTATION_SCHEMA_VERSION) {
    throw new Error("Future presentation schema versions are not supported.");
  }
  const cell = isRecord(value.cell) ? value.cell : {};
  const text = isRecord(value.text) ? value.text : {};
  const boundary = isRecord(value.boundary) ? value.boundary : {};
  const membrane = isRecord(value.membrane) ? value.membrane : {};
  const membraneEdge = isRecord(value.membraneEdge) ? value.membraneEdge : {};
  const core = isRecord(value.core) ? value.core : {};
  const voidDefaults = isRecord(value.void) ? value.void : {};
  return {
    schemaVersion: PRESENTATION_SCHEMA_VERSION,
    text: {
      preset: textPreset(text.preset, fallback.text.preset),
      size: finiteOr(text.size, fallback.text.size, 0.65, 1.8),
      colourMode: textColourMode(text.colourMode, fallback.text.colourMode),
      colour: canonicalHex(text.colour) ?? fallback.text.colour,
    },
    cell: {
      visible: typeof cell.visible === "boolean" ? cell.visible : fallback.cell.visible,
      paint: normalizePaintDefaults(cell.paint, fallback.cell.paint),
    },
    boundary: {
      visible: typeof boundary.visible === "boolean" ? boundary.visible : fallback.boundary.visible,
      style: boundaryStyle(boundary.style, fallback.boundary.style),
      width: finiteOr(boundary.width, fallback.boundary.width, 0, 64),
      offset: finiteOr(boundary.offset, fallback.boundary.offset, -64, 64),
      alignment: boundaryAlignment(boundary.alignment, fallback.boundary.alignment),
      dashLength: finiteOr(boundary.dashLength, fallback.boundary.dashLength, 0.25, 256),
      gapLength: finiteOr(boundary.gapLength, fallback.boundary.gapLength, 0.25, 256),
      secondaryLineSpacing: finiteOr(
        boundary.secondaryLineSpacing,
        fallback.boundary.secondaryLineSpacing,
        0,
        128
      ),
      paint: normalizePaintDefaults(boundary.paint, fallback.boundary.paint),
    },
    membrane: {
      visible: typeof membrane.visible === "boolean" ? membrane.visible : fallback.membrane.visible,
      colourMode: membraneColourMode(membrane.colourMode, fallback.membrane.colourMode),
      solidMaterialId: membraneSolidMaterialId(membrane.solidMaterialId, fallback.membrane.solidMaterialId),
      paint: normalizePaintDefaults(membrane.paint, fallback.membrane.paint),
    },
    membraneEdge: {
      visible: typeof membraneEdge.visible === "boolean" ? membraneEdge.visible : fallback.membraneEdge.visible,
      width: finiteOr(membraneEdge.width, fallback.membraneEdge.width, 0, 64),
      softness: finiteOr(membraneEdge.softness, fallback.membraneEdge.softness, 0, 1),
      paint: normalizePaintDefaults(membraneEdge.paint, fallback.membraneEdge.paint),
    },
    core: {
      visible: typeof core.visible === "boolean" ? core.visible : fallback.core.visible,
      shape: "dot",
      size: finiteOr(core.size, fallback.core.size, 0.1, 2),
      offsetX: finiteOr(core.offsetX, fallback.core.offsetX, -64, 64),
      offsetY: finiteOr(core.offsetY, fallback.core.offsetY, -64, 64),
      paint: normalizePaintDefaults(core.paint, fallback.core.paint),
    },
    void: {
      visible: typeof voidDefaults.visible === "boolean" ? voidDefaults.visible : fallback.void.visible,
      fillVisible: typeof voidDefaults.fillVisible === "boolean" ? voidDefaults.fillVisible : fallback.void.fillVisible,
      edgeVisible: typeof voidDefaults.edgeVisible === "boolean" ? voidDefaults.edgeVisible : fallback.void.edgeVisible,
      fill: normalizePaintDefaults(voidDefaults.fill, fallback.void.fill),
      edge: normalizePaintDefaults(voidDefaults.edge, fallback.void.edge),
      edgeWidth: finiteOr(voidDefaults.edgeWidth, fallback.void.edgeWidth, 0, 64),
    },
  };
};

const normalizePaintOverride = (
  value: unknown,
  defaults: PresentationPaintDefaults
): PresentationPaintOverride | undefined => {
  if (!isRecord(value)) return undefined;
  const next: PresentationPaintOverride = {};
  if (typeof value.materialId === "string") {
    const id = materialId(value.materialId, defaults.materialId);
    if (id !== defaults.materialId) next.materialId = id;
  }
  const colour = canonicalHex(value.colour);
  if (colour && colour !== defaults.colour) next.colour = colour;
  if (typeof value.opacity === "number" && Number.isFinite(value.opacity)) {
    const opacity = clamp(value.opacity, 0, 1);
    if (opacity !== defaults.opacity) next.opacity = opacity;
  }
  return Object.keys(next).length ? next : undefined;
};

const changedBoolean = (value: unknown, fallback: boolean): boolean | undefined =>
  typeof value === "boolean" && value !== fallback ? value : undefined;

const changedNumber = (
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number
): number | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const normalized = clamp(value, minimum, maximum);
  return normalized !== fallback ? normalized : undefined;
};

const compact = <T extends Record<string, unknown>>(value: T): T | undefined => {
  const entries = Object.entries(value).filter(([, item]) => item !== undefined);
  return entries.length ? Object.fromEntries(entries) as T : undefined;
};

/** Extracts only supported scalar/reference fields. Unknown nested objects,
 * including material definitions, are intentionally discarded. */
export const normalizeCellAppearanceOverrides = (
  value: unknown,
  defaults: ProjectPresentationDefaults
): CellAppearanceOverrides | undefined => {
  if (!isRecord(value)) return undefined;
  const cell = isRecord(value.cell) ? compact({
    visible: changedBoolean(value.cell.visible, defaults.cell.visible),
    paint: normalizePaintOverride(value.cell.paint, defaults.cell.paint),
  }) : undefined;
  const text = isRecord(value.text) ? compact({
    preset: TEXT_STYLE_PRESET_IDS.includes(value.text.preset as TextStylePresetId) && value.text.preset !== defaults.text.preset
      ? value.text.preset as TextStylePresetId
      : undefined,
    size: changedNumber(value.text.size, defaults.text.size, 0.65, 1.8),
    colourMode: (value.text.colourMode === "auto" || value.text.colourMode === "custom") && value.text.colourMode !== defaults.text.colourMode
      ? value.text.colourMode as TextColourMode
      : undefined,
    colour: (() => {
      const colour = canonicalHex(value.text.colour);
      return colour && colour !== defaults.text.colour ? colour : undefined;
    })(),
  }) : undefined;
  const boundary = isRecord(value.boundary) ? compact({
    visible: changedBoolean(value.boundary.visible, defaults.boundary.visible),
    style: BOUNDARY_STYLES.includes(value.boundary.style as BoundaryStyle) && value.boundary.style !== defaults.boundary.style
      ? value.boundary.style as BoundaryStyle
      : undefined,
    width: changedNumber(value.boundary.width, defaults.boundary.width, 0, 64),
    offset: changedNumber(value.boundary.offset, defaults.boundary.offset, -64, 64),
    alignment: BOUNDARY_ALIGNMENTS.includes(value.boundary.alignment as BoundaryAlignment) && value.boundary.alignment !== defaults.boundary.alignment
      ? value.boundary.alignment as BoundaryAlignment
      : undefined,
    dashLength: changedNumber(value.boundary.dashLength, defaults.boundary.dashLength, 0.25, 256),
    gapLength: changedNumber(value.boundary.gapLength, defaults.boundary.gapLength, 0.25, 256),
    secondaryLineSpacing: changedNumber(
      value.boundary.secondaryLineSpacing,
      defaults.boundary.secondaryLineSpacing,
      0,
      128
    ),
    paint: normalizePaintOverride(value.boundary.paint, defaults.boundary.paint),
  }) : undefined;
  const membrane = isRecord(value.membrane) ? compact({
    visible: changedBoolean(value.membrane.visible, defaults.membrane.visible),
    paint: normalizePaintOverride(value.membrane.paint, defaults.membrane.paint),
  }) : undefined;
  const membraneEdge = isRecord(value.membraneEdge) ? compact({
    visible: changedBoolean(value.membraneEdge.visible, defaults.membraneEdge.visible),
    width: changedNumber(value.membraneEdge.width, defaults.membraneEdge.width, 0, 64),
    softness: changedNumber(value.membraneEdge.softness, defaults.membraneEdge.softness, 0, 1),
    paint: normalizePaintOverride(value.membraneEdge.paint, defaults.membraneEdge.paint),
  }) : undefined;
  const core = isRecord(value.core) ? compact({
    visible: changedBoolean(value.core.visible, defaults.core.visible),
    shape: value.core.shape === "dot" && value.core.shape !== defaults.core.shape ? "dot" as const : undefined,
    size: changedNumber(value.core.size, defaults.core.size, 0.1, 2),
    offsetX: changedNumber(value.core.offsetX, defaults.core.offsetX, -64, 64),
    offsetY: changedNumber(value.core.offsetY, defaults.core.offsetY, -64, 64),
    paint: normalizePaintOverride(value.core.paint, defaults.core.paint),
  }) : undefined;
  const voidTarget = isRecord(value.void) ? compact({
    visible: changedBoolean(value.void.visible, defaults.void.visible),
    fillVisible: changedBoolean(value.void.fillVisible, defaults.void.fillVisible),
    edgeVisible: changedBoolean(value.void.edgeVisible, defaults.void.edgeVisible),
    fill: normalizePaintOverride(value.void.fill, defaults.void.fill),
    edge: normalizePaintOverride(value.void.edge, defaults.void.edge),
    edgeWidth: changedNumber(value.void.edgeWidth, defaults.void.edgeWidth, 0, 64),
  }) : undefined;
  return compact({ text, cell, boundary, membrane, membraneEdge, core, void: voidTarget });
};

const keyForTarget = (target: PresentationTargetId): PresentationDefaultsKey =>
  PRESENTATION_TARGET_CONTRACTS.find((contract) => contract.id === target)!.defaultsKey;

/** Canonical explicit reset command: remove one sparse target so it inherits
 * the project default again. */
export const resetCellAppearanceTarget = (
  value: CellAppearanceOverrides | undefined,
  target: PresentationTargetId
): CellAppearanceOverrides | undefined => {
  if (!value) return undefined;
  const next: CellAppearanceOverrides = {
    ...value,
    text: value.text ? { ...value.text } : undefined,
    cell: value.cell ? { ...value.cell, paint: value.cell.paint ? { ...value.cell.paint } : undefined } : undefined,
    boundary: value.boundary ? { ...value.boundary, paint: value.boundary.paint ? { ...value.boundary.paint } : undefined } : undefined,
    membrane: value.membrane ? { ...value.membrane, paint: value.membrane.paint ? { ...value.membrane.paint } : undefined } : undefined,
    membraneEdge: value.membraneEdge ? { ...value.membraneEdge, paint: value.membraneEdge.paint ? { ...value.membraneEdge.paint } : undefined } : undefined,
    core: value.core ? { ...value.core, paint: value.core.paint ? { ...value.core.paint } : undefined } : undefined,
    void: value.void ? {
      ...value.void,
      fill: value.void.fill ? { ...value.void.fill } : undefined,
      edge: value.void.edge ? { ...value.void.edge } : undefined,
    } : undefined,
  };
  delete (next as Record<PresentationDefaultsKey, unknown>)[keyForTarget(target)];
  return Object.values(next).some((item) => item !== undefined) ? next : undefined;
};

export const cloneCellAppearanceOverrides = (
  value: CellAppearanceOverrides | undefined
): CellAppearanceOverrides | undefined => {
  if (!value) return undefined;
  return {
    text: value.text ? { ...value.text } : undefined,
    cell: value.cell ? { ...value.cell, paint: value.cell.paint ? { ...value.cell.paint } : undefined } : undefined,
    boundary: value.boundary ? { ...value.boundary, paint: value.boundary.paint ? { ...value.boundary.paint } : undefined } : undefined,
    membrane: value.membrane ? { ...value.membrane, paint: value.membrane.paint ? { ...value.membrane.paint } : undefined } : undefined,
    membraneEdge: value.membraneEdge ? { ...value.membraneEdge, paint: value.membraneEdge.paint ? { ...value.membraneEdge.paint } : undefined } : undefined,
    core: value.core ? { ...value.core, paint: value.core.paint ? { ...value.core.paint } : undefined } : undefined,
    void: value.void ? {
      ...value.void,
      fill: value.void.fill ? { ...value.void.fill } : undefined,
      edge: value.void.edge ? { ...value.void.edge } : undefined,
    } : undefined,
  };
};

export const cloneProjectPresentationDefaults = (
  value: ProjectPresentationDefaults
): ProjectPresentationDefaults => normalizeProjectPresentationDefaults(value);
