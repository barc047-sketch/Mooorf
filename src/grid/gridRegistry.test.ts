import { GRID_PRESETS, gridRegistry } from "./gridRegistry";
import { migrateLegacyGridSettings, normalizeGridSettings } from "./gridValidation";

const ok = (value: unknown, message: string) => { if (!value) throw new Error(message); };
const equal = (actual: unknown, expected: unknown, message: string) => { if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`); };

equal(GRID_PRESETS.length, 8, "all eight built-in grid presets exist");
equal(new Set(GRID_PRESETS.map((preset) => preset.id)).size, 8, "grid preset ids are unique");
ok(GRID_PRESETS.some((preset) => preset.variant === "black-on-white"), "black on white is supported");
ok(GRID_PRESETS.some((preset) => preset.variant === "white-on-black"), "white on black is supported");
equal(gridRegistry.get("none")?.renders, false, "none preset disables rendering");
const normalized = normalizeGridSettings({ presetId: "technical", opacity: 9, lineWeight: Number.NaN, spacing: -10, majorInterval: 0, foreground: "#ABC", background: "#fff", snap: true, dynamicZoomDensity: true, exportGrid: false });
equal(normalized.opacity, 1, "opacity clamps");
equal(normalized.lineWeight, 1, "non-finite line weight defaults");
equal(normalized.spacing, 4, "spacing clamps");
equal(normalized.foreground, "#aabbcc", "custom colors normalize");
equal(migrateLegacyGridSettings(false).presetId, "none", "legacy hidden grid migrates to none");
equal(migrateLegacyGridSettings(true).presetId, "dotted", "legacy visible grid migrates to dotted");

console.info("grid registry contracts passed");
