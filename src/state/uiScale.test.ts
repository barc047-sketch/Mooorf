import {
  UI_SCALE_MAX,
  UI_SCALE_MIN,
  UI_SCALE_PRESETS,
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

useLab.setState({ savedViews: [] });
useLab.getState().setSettings({ uiScale: 1.12 });
const savedId = useLab.getState().saveCurrentView("Scale contract");
const saved = useLab.getState().savedViews.find((view) => view.id === savedId);
equal(saved?.uiScale, 1.12, "saved view captures interface scale");
useLab.getState().setSettings({ uiScale: 1 });
if (savedId) useLab.getState().loadSavedView(savedId);
equal(useLab.getState().settings.uiScale, 1.12, "saved view restores interface scale");

console.info("ui scale contracts passed");
