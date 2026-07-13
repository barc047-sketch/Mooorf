import type {
  GridCameraBehavior,
  GridParameterId,
  GridPresetDefinition,
  GridPresetId,
  GridPreviewKind,
  GridSettings,
  GridSnapMode,
  GridVariant,
} from "./types";

const THEMES = Object.freeze(["day", "night"] as const);
const GRID_TARGET = Object.freeze(["grid"] as const);
const BASIC_PARAMETERS = Object.freeze([
  "foreground", "background", "opacity", "lineWeight", "spacing", "snap", "dynamicZoomDensity", "exportGrid",
] as const satisfies readonly GridParameterId[]);
const MAJOR_PARAMETERS = Object.freeze([
  "foreground", "background", "opacity", "lineWeight", "spacing", "majorInterval", "snap", "dynamicZoomDensity", "exportGrid",
] as const satisfies readonly GridParameterId[]);

const settings = (presetId: GridPresetId, foreground: string, background: string, overrides: Partial<GridSettings> = {}): GridSettings => Object.freeze({
  presetId,
  foreground,
  background,
  opacity: 0.34,
  lineWeight: 1,
  spacing: 24,
  majorInterval: 5,
  snap: false,
  dynamicZoomDensity: true,
  exportGrid: false,
  ...overrides,
});

interface PresetMetadata {
  status: GridPresetDefinition["status"];
  previewKind: GridPreviewKind;
  parameters: readonly GridParameterId[];
  snapMode: GridSnapMode;
  snapCompatible: boolean;
  cameraBehavior: GridCameraBehavior;
  rendererSupport: GridPresetDefinition["rendererSupport"];
  exportMode?: GridPresetDefinition["exportBehavior"]["mode"];
}

const preset = (
  id: GridPresetId,
  name: string,
  description: string,
  variant: GridVariant,
  defaults: GridSettings,
  tags: readonly string[],
  metadata: PresetMetadata,
): GridPresetDefinition => Object.freeze({
  id,
  name,
  description,
  variant,
  defaults,
  tags: Object.freeze([...tags]),
  status: metadata.status,
  preview: Object.freeze({ kind: metadata.previewKind, label: `${name} grid preview` }),
  supportedParameters: metadata.parameters,
  snapping: Object.freeze({ compatible: metadata.snapCompatible, mode: metadata.snapMode, implemented: false }),
  cameraBehavior: metadata.cameraBehavior,
  themeCompatibility: THEMES,
  compatibleMaterialTargets: GRID_TARGET,
  exportBehavior: Object.freeze({ mode: metadata.exportMode ?? "optional-raster", implemented: false }),
  rendererSupport: Object.freeze({ ...metadata.rendererSupport }),
  renders: metadata.rendererSupport.classic || metadata.rendererSupport.organism,
});

const futureOrthogonal = (previewKind: GridPreviewKind, parameters: readonly GridParameterId[] = BASIC_PARAMETERS): PresetMetadata => ({
  status: "future",
  previewKind,
  parameters,
  snapMode: "orthogonal",
  snapCompatible: true,
  cameraBehavior: "camera-synced",
  rendererSupport: { classic: false, organism: false },
});

export const GRID_PRESETS: readonly GridPresetDefinition[] = Object.freeze([
  preset(
    "dotted",
    "Dotted",
    "Current camera-synchronised Organism dot field.",
    "black-on-white",
    settings("dotted", "#171719", "#f5f6ee"),
    ["dots", "default", "point", "grid"],
    {
      status: "active",
      previewKind: "dots",
      parameters: BASIC_PARAMETERS,
      snapMode: "orthogonal",
      snapCompatible: true,
      cameraBehavior: "camera-synced",
      rendererSupport: { classic: false, organism: true },
    },
  ),
  preset(
    "fine-line",
    "Fine Line",
    "Future single-weight orthogonal square grid metadata.",
    "white-on-black",
    settings("fine-line", "#f5f6ee", "#070707", { opacity: 0.2, spacing: 20 }),
    ["line", "square", "orthogonal", "dark"],
    futureOrthogonal("square"),
  ),
  preset(
    "technical",
    "Technical",
    "Future high-precision technical drafting grid metadata.",
    "custom",
    settings("technical", "#6b7075", "#f5f6ee", { majorInterval: 10 }),
    ["cad", "drafting", "technical", "square"],
    futureOrthogonal("technical", MAJOR_PARAMETERS),
  ),
  preset(
    "architectural",
    "Architectural",
    "Future architectural module grid metadata.",
    "black-on-white",
    settings("architectural", "#242426", "#ffffff", { spacing: 30, majorInterval: 4 }),
    ["architecture", "module", "square", "orthogonal"],
    futureOrthogonal("architectural", MAJOR_PARAMETERS),
  ),
  preset(
    "major-minor",
    "Major / Minor",
    "Future technical subdivisions with a stronger major cadence.",
    "custom",
    settings("major-minor", "#4c5054", "#f5f6ee", { spacing: 16, majorInterval: 5 }),
    ["major", "minor", "technical", "square", "subdivision"],
    futureOrthogonal("major-minor", MAJOR_PARAMETERS),
  ),
  preset(
    "isometric",
    "Isometric",
    "Future isometric drafting guide metadata.",
    "white-on-black",
    settings("isometric", "#f2f2ec", "#070707", { spacing: 28 }),
    ["iso", "axonometric", "triangular", "30 degree"],
    {
      status: "future",
      previewKind: "isometric",
      parameters: BASIC_PARAMETERS,
      snapMode: "isometric",
      snapCompatible: true,
      cameraBehavior: "camera-synced",
      rendererSupport: { classic: false, organism: false },
    },
  ),
  preset(
    "radial",
    "Radial",
    "Future polar and radial guide metadata.",
    "custom",
    settings("radial", "#777a79", "#f5f6ee", { spacing: 32, majorInterval: 6 }),
    ["polar", "radial", "concentric", "angle"],
    {
      status: "future",
      previewKind: "radial",
      parameters: MAJOR_PARAMETERS,
      snapMode: "radial",
      snapCompatible: true,
      cameraBehavior: "center-locked",
      rendererSupport: { classic: false, organism: false },
    },
  ),
  preset(
    "none",
    "None",
    "Grid rendering disabled.",
    "custom",
    settings("none", "#000000", "#ffffff", { opacity: 0, snap: false, dynamicZoomDensity: false, exportGrid: false }),
    ["off", "disabled"],
    {
      status: "active",
      previewKind: "off",
      parameters: Object.freeze([]),
      snapMode: "none",
      snapCompatible: false,
      cameraBehavior: "none",
      rendererSupport: { classic: false, organism: false },
      exportMode: "excluded",
    },
  ),
]);

const byId = new Map(GRID_PRESETS.map((item) => [item.id, item]));
export const gridRegistry = Object.freeze({
  get: (id: string): GridPresetDefinition | null => byId.get(id as GridPresetId) ?? null,
  list: (): readonly GridPresetDefinition[] => GRID_PRESETS,
  listByVariant: (variant: GridVariant): readonly GridPresetDefinition[] => GRID_PRESETS.filter((item) => item.variant === variant),
  search: (query: string): readonly GridPresetDefinition[] => {
    const needle = query.trim().toLowerCase();
    return needle
      ? GRID_PRESETS.filter((item) => `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(needle))
      : GRID_PRESETS;
  },
});
