import { getNucleusColor } from "../../design/colorMapping";
import { DEFAULT_RESOURCE_SETTINGS } from "../../resources/resourcePersistence";
import type { SpaceCell } from "../../types";
import {
  PRESENTATION_TARGET_CONTRACTS,
  PRESENTATION_TARGET_IDS,
  type CellAppearanceOverrides,
} from "./types";
import { createProjectPresentationDefaults } from "./defaults";
import {
  normalizeCellAppearanceOverrides,
  normalizeProjectPresentationDefaults,
  resetCellAppearanceTarget,
} from "./validation";
import { resolveCellAppearance } from "./resolveAppearance";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};

const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

const sample: SpaceCell = {
  id: "cell-a",
  name: "Studio",
  area: 80,
  category: "Work",
  privacy: "shared",
  color: "",
  x: 10,
  y: 20,
};

const legacy = {
  blobOn: false,
  organism: { showNuclei: true },
  resources: DEFAULT_RESOURCE_SETTINGS,
};

const context = {
  paletteMode: "core" as const,
  colorSource: "category" as const,
  nucleusPaletteId: "editorial-aurora",
  organismPaletteId: "mode",
  morphMode: "cellular-reverse" as const,
  theme: "day" as const,
  spaces: [sample],
};

const defaults = createProjectPresentationDefaults(legacy);

equal(PRESENTATION_TARGET_IDS.length, 6, "six canonical appearance targets");
equal(new Set(PRESENTATION_TARGET_IDS).size, PRESENTATION_TARGET_IDS.length, "appearance target IDs are unique");
equal(PRESENTATION_TARGET_CONTRACTS.length, PRESENTATION_TARGET_IDS.length, "every target has compatibility metadata");
ok(PRESENTATION_TARGET_CONTRACTS.every((target) => target.materialTargets.length > 0), "every target maps to material ownership");
ok(!PRESENTATION_TARGET_IDS.includes("selection" as never), "selection is not persisted appearance");

equal(defaults.schemaVersion, 3, "presentation defaults schema version");
for (const target of PRESENTATION_TARGET_CONTRACTS) ok(defaults[target.defaultsKey], `${target.id} defaults are complete`);
equal(defaults.cell.visible, true, "Cell is visible by default");
equal(defaults.boundary.visible, false, "Boundary preserves the current off baseline");
equal(defaults.boundary.style, "solid", "Boundary keeps the solid visual baseline");
equal(defaults.boundary.alignment, "centre", "Boundary defaults to centre alignment");
equal(defaults.boundary.dashLength, 8, "Boundary dash/bar length has a deterministic default");
equal(defaults.boundary.gapLength, 6, "Boundary gap length has a deterministic default");
equal(defaults.boundary.secondaryLineSpacing, 3, "double Boundary spacing has a deterministic default");
equal(defaults.membrane.visible, false, "new-project Morph baseline remains off");
equal(defaults.membrane.colourMode, "cell-gradient", "legacy/current Cell Gradient remains the Membrane default");
equal(defaults.membraneEdge.visible, false, "Membrane Edge is independently owned and inactive");
equal(defaults.core.visible, true, "Core preserves the current nucleus-dot baseline");
equal(defaults.core.shape, "dot", "Core only supports the dot baseline");
equal(defaults.core.size, 0.34, "Core size matches the current shader ratio");
equal(defaults.void.visible, true, "Void display remains visible");
equal(defaults.void.fill.opacity, 0.035, "Void fill preserves the quiet production baseline");
equal(defaults.void.edge.opacity, 1, "Void outer edge preserves the production baseline");

const legacyResolved = resolveCellAppearance(sample, defaults, context);
const legacyColour = getNucleusColor(
  sample,
  context.paletteMode,
  undefined,
  context.nucleusPaletteId,
  context.colorSource
);
equal(legacyResolved.cell.paint.colour, legacyColour.fill, "legacy Cell fill remains canonical");
equal(legacyResolved.boundary.paint.colour, legacyColour.ring, "legacy Boundary colour remains canonical");
equal(legacyResolved.core.paint.colour, legacyColour.fill, "legacy Core colour remains canonical");
equal(legacyResolved.boundary.visible, false, "Boundary resolves the project default");
equal(legacyResolved.core.visible, true, "Core resolves the project default");

const sparse: CellAppearanceOverrides = {
  boundary: {
    visible: true,
    style: "dash-dot",
    width: 3,
    alignment: "outer",
    dashLength: 11,
    gapLength: 4,
    secondaryLineSpacing: 5,
  },
  membrane: { visible: false },
  membraneEdge: { visible: true, width: 2 },
};
const sparseResolved = resolveCellAppearance({ ...sample, appearance: sparse }, defaults, context);
equal(sparseResolved.boundary.visible, true, "sparse Boundary override resolves");
equal(sparseResolved.boundary.style, "dash-dot", "Boundary style resolves independently");
equal(sparseResolved.boundary.width, 3, "sparse Boundary width resolves");
equal(sparseResolved.boundary.alignment, "outer", "Boundary alignment resolves independently");
equal(sparseResolved.boundary.dashLength, 11, "Boundary dash/bar length resolves independently");
equal(sparseResolved.boundary.gapLength, 4, "Boundary gap length resolves independently");
equal(sparseResolved.boundary.secondaryLineSpacing, 5, "double Boundary spacing resolves independently");
equal(sparseResolved.membrane.visible, false, "Membrane remains independently controlled");
equal(sparseResolved.membraneEdge.visible, true, "Membrane Edge resolves independently");
equal(sparseResolved.cell.visible, defaults.cell.visible, "unmodified targets inherit project defaults");

const reset = resetCellAppearanceTarget(sparse, "boundary");
ok(reset && !("boundary" in reset), "target reset removes the override");
equal(reset?.membraneEdge?.visible, true, "target reset preserves other overrides");

const normalizedEmpty = normalizeCellAppearanceOverrides(
  { boundary: { visible: defaults.boundary.visible, width: defaults.boundary.width } },
  defaults
);
equal(normalizedEmpty, undefined, "values equal to project defaults do not persist");

const invalidResolved = resolveCellAppearance({
  ...sample,
  appearance: {
    cell: { paint: { opacity: Number.NaN } },
    boundary: {
      visible: true,
      style: "segmented-bars",
      width: 999,
      offset: -999,
      alignment: "inner",
      dashLength: 999,
      gapLength: -8,
      secondaryLineSpacing: 999,
    },
    core: { size: -4 },
  },
}, defaults, context);
equal(invalidResolved.cell.paint.opacity, defaults.cell.paint.opacity, "invalid opacity falls back");
equal(invalidResolved.boundary.width, 64, "Boundary width clamps deterministically");
equal(invalidResolved.boundary.offset, -64, "Boundary offset clamps deterministically");
equal(invalidResolved.boundary.style, "segmented-bars", "valid technical Boundary styles survive normalization");
equal(invalidResolved.boundary.alignment, "inner", "valid Boundary alignment survives normalization");
equal(invalidResolved.boundary.dashLength, 256, "Boundary dash/bar length clamps deterministically");
equal(invalidResolved.boundary.gapLength, 0.25, "Boundary gap length clamps deterministically");
equal(invalidResolved.boundary.secondaryLineSpacing, 128, "double Boundary spacing clamps deterministically");
equal(invalidResolved.core.size, 0.1, "Core size clamps deterministically");

for (const style of ["solid", "dashed", "dotted", "dash-dot", "double", "segmented-bars"] as const) {
  const resolved = resolveCellAppearance({
    ...sample,
    appearance: { boundary: { visible: true, style } },
  }, defaults, context);
  equal(resolved.boundary.style, style, `Boundary style ${style} is supported by the domain`);
}

const migratedV1 = normalizeProjectPresentationDefaults({
  ...defaults,
  schemaVersion: 1,
  boundary: {
    visible: true,
    style: "solid",
    width: 2,
    offset: 1,
    paint: defaults.boundary.paint,
  },
}, legacy);
equal(migratedV1.schemaVersion, 3, "presentation schema v1 migrates to the current version");
equal(migratedV1.boundary.alignment, "centre", "schema v1 Boundary gains alignment");
equal(migratedV1.boundary.dashLength, 8, "schema v1 Boundary gains dash/bar length");

const unknownId = "local:recoverable-material";
const unknownNormalized = normalizeCellAppearanceOverrides({
  cell: {
    paint: {
      materialId: unknownId,
      definition: { id: "must-not-persist" },
    } as unknown as NonNullable<CellAppearanceOverrides["cell"]>["paint"],
  },
}, defaults);
equal(unknownNormalized?.cell?.paint?.materialId, unknownId, "unknown material ID remains recoverable");
ok(!JSON.stringify(unknownNormalized).includes("must-not-persist"), "registry objects never persist inside Cells");
const unknownResolved = resolveCellAppearance({ ...sample, appearance: unknownNormalized }, defaults, context);
equal(unknownResolved.cell.paint.requestedMaterialId, unknownId, "resolved paint reports the recoverable request");
equal(unknownResolved.cell.paint.status, "unknown-fallback", "unknown material uses a truthful fallback");
ok(unknownResolved.cell.paint.materialId !== unknownId, "unknown material never becomes an active definition");

const incompatibleResolved = resolveCellAppearance({
  ...sample,
  appearance: { cell: { paint: { materialId: "system:void" } } },
}, defaults, context);
equal(incompatibleResolved.cell.paint.status, "incompatible-fallback", "known incompatible material falls back truthfully");
equal(incompatibleResolved.cell.paint.materialId, defaults.cell.paint.materialId, "incompatible material falls back to the project default");

const automaticContext = { ...context, nucleusPaletteId: "auto" };
const automaticDefaults = createProjectPresentationDefaults({
  ...legacy,
  resources: {
    ...DEFAULT_RESOURCE_SETTINGS,
    materialBindings: {
      ...DEFAULT_RESOURCE_SETTINGS.materialBindings,
      spaceFill: { ...DEFAULT_RESOURCE_SETTINGS.materialBindings.spaceFill, materialId: "palette:auto" },
    },
  },
});
const automaticResolved = resolveCellAppearance(sample, automaticDefaults, automaticContext);
const automaticLegacyColour = getNucleusColor(sample, "core", undefined, "auto", "category");
equal(automaticResolved.cell.paint.status, "resolved", "legacy automatic palette remains a known adapter reference");
equal(automaticResolved.cell.paint.materialId, "palette:auto", "legacy automatic palette ID remains active");
equal(automaticResolved.cell.paint.colour, automaticLegacyColour.fill, "automatic palette keeps source-main colour parity");

const voidCell: SpaceCell = { ...sample, id: "void-a", kind: "void", category: "Void" };
const voidResolved = resolveCellAppearance(voidCell, defaults, { ...context, spaces: [voidCell] });
const voidColour = getNucleusColor(
  voidCell,
  context.paletteMode,
  undefined,
  context.nucleusPaletteId,
  context.colorSource
);
equal(voidResolved.void.fill.colour, voidColour.fill, "Void fill preserves current production colour");
equal(voidResolved.void.edge.colour, voidColour.ring, "Void edge preserves current production colour");
equal(voidResolved.void.semantics.subtractive, true, "Void remains subtractive");
equal(voidResolved.void.semantics.areaContribution, 0, "Void never adds programmed area");
equal(voidResolved.void.semantics.appearanceAffectsGeometry, false, "Void appearance cannot alter geometry");
equal(voidResolved.void.semantics.appearanceAffectsHitTesting, false, "Void appearance cannot alter hit testing");
equal(voidResolved.void.semantics.appearanceAffectsClearance, false, "Void appearance cannot alter clearance");

const migrated = normalizeProjectPresentationDefaults(undefined, {
  ...legacy,
  blobOn: true,
  organism: { showNuclei: false },
});
equal(migrated.membrane.visible, true, "legacy Morph state migrates to Membrane visibility");
equal(migrated.core.visible, false, "legacy nucleus visibility migrates to Core visibility");

console.info("presentation layer contracts passed");
