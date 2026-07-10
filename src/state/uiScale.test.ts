import {
  UI_SCALE_MAX,
  UI_SCALE_MIN,
  UI_SCALE_PRESETS,
  getUiScalePreset,
  normalizeUiScale,
} from "./uiScale";
import { useLab } from "./store";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
  }
};

equal(UI_SCALE_PRESETS[0]?.value, 0.88, "compact preset");
equal(UI_SCALE_PRESETS[1]?.value, 1, "standard preset");
equal(UI_SCALE_PRESETS[2]?.value, 1.12, "comfortable preset");
equal(normalizeUiScale(undefined), 1, "old snapshots migrate to standard scale");
equal(normalizeUiScale(Number.NaN), 1, "invalid scale migrates safely");
equal(normalizeUiScale(0.5), UI_SCALE_MIN, "small scale clamps to minimum");
equal(normalizeUiScale(2), UI_SCALE_MAX, "large scale clamps to maximum");
equal(normalizeUiScale(0.881), 0.88, "scale normalizes to two decimals");

// Continuous slider values (V7.1C) — custom values pass through unrounded to presets.
equal(normalizeUiScale(0.82), 0.82, "minimum bound is a valid custom scale");
equal(normalizeUiScale(0.97), 0.97, "custom value below standard is preserved");
equal(normalizeUiScale(1.03), 1.03, "custom value above standard is preserved");
equal(normalizeUiScale(1.07), 1.07, "custom value near comfortable is preserved");
equal(normalizeUiScale(1.18), 1.18, "maximum bound is a valid custom scale");
equal(getUiScalePreset(1.03), null, "custom value maps to no preset");
equal(getUiScalePreset(0.88), "compact", "preset value still resolves");

useLab.setState({ savedViews: [] });
for (const custom of [0.82, 0.97, 1.0, 1.07, 1.18]) {
  useLab.getState().setSettings({ uiScale: custom });
  const id = useLab.getState().saveCurrentView(`Scale ${custom}`);
  useLab.getState().setSettings({ uiScale: 1 });
  if (id) useLab.getState().loadSavedView(id);
  equal(useLab.getState().settings.uiScale, custom, `saved view restores custom scale ${custom}`);
}

useLab.setState({ savedViews: [] });
useLab.getState().setSettings({ uiScale: 1.12 });
const savedId = useLab.getState().saveCurrentView("Scale contract");
const saved = useLab.getState().savedViews.find((view) => view.id === savedId);
equal(saved?.uiScale, 1.12, "saved view captures interface scale");
useLab.getState().setSettings({ uiScale: 1 });
if (savedId) useLab.getState().loadSavedView(savedId);
equal(useLab.getState().settings.uiScale, 1.12, "saved view restores interface scale");

console.info("ui scale contracts passed");
