import type { GridPresetDefinition, GridPresetId, GridSettings, GridVariant } from "./types";

const settings = (presetId: GridPresetId, foreground: string, background: string, overrides: Partial<GridSettings> = {}): GridSettings => ({
  presetId, foreground, background, opacity: 0.34, lineWeight: 1, spacing: 24, majorInterval: 5,
  snap: false, dynamicZoomDensity: true, exportGrid: false, ...overrides,
});
const preset = (id: GridPresetId, name: string, description: string, variant: GridVariant, defaults: GridSettings, tags: string[], renders = true): GridPresetDefinition => ({ id, name, description, variant, defaults, tags, renders });

export const GRID_PRESETS: readonly GridPresetDefinition[] = [
  preset("dotted", "Dotted", "Camera-synchronised technical dot field.", "black-on-white", settings("dotted", "#171719", "#f5f6ee"), ["dots", "default"]),
  preset("fine-line", "Fine Line", "Quiet single-weight orthogonal grid.", "white-on-black", settings("fine-line", "#f5f6ee", "#070707", { opacity: 0.2, spacing: 20 }), ["line", "dark"]),
  preset("technical", "Technical", "High-precision technical drafting grid.", "custom", settings("technical", "#6b7075", "#f5f6ee", { majorInterval: 10 }), ["cad", "drafting"]),
  preset("architectural", "Architectural", "Architectural module grid.", "black-on-white", settings("architectural", "#242426", "#ffffff", { spacing: 30, majorInterval: 4 }), ["architecture", "module"]),
  preset("major-minor", "Major / Minor", "Minor subdivisions with stronger major cadence.", "custom", settings("major-minor", "#4c5054", "#f5f6ee", { spacing: 16, majorInterval: 5 }), ["major", "minor"]),
  preset("isometric", "Isometric", "Future isometric drafting guide metadata.", "white-on-black", settings("isometric", "#f2f2ec", "#070707", { spacing: 28 }), ["iso", "axonometric"]),
  preset("radial", "Radial", "Future polar and radial guide metadata.", "custom", settings("radial", "#777a79", "#f5f6ee", { spacing: 32, majorInterval: 6 }), ["polar", "radial"]),
  preset("none", "None", "Grid rendering disabled.", "custom", settings("none", "#000000", "#ffffff", { opacity: 0, snap: false, exportGrid: false }), ["off"], false),
];

const byId = new Map(GRID_PRESETS.map((item) => [item.id, item]));
export const gridRegistry = Object.freeze({
  get: (id: string) => byId.get(id as GridPresetId) ?? null,
  list: () => GRID_PRESETS,
  listByVariant: (variant: GridVariant) => GRID_PRESETS.filter((item) => item.variant === variant),
  search: (query: string) => { const needle = query.trim().toLowerCase(); return needle ? GRID_PRESETS.filter((item) => `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(needle)) : GRID_PRESETS; },
});
