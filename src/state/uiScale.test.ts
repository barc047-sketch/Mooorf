import {
  UI_SCALE_MAX,
  UI_SCALE_MIN,
  UI_SCALE_PRESETS,
  WIDGET_SCALE_MAX,
  WIDGET_SCALE_MIN,
  WIDGET_SCALE_PRESETS,
  getUiScalePreset,
  getWidgetScalePreset,
  normalizeUiScale,
  normalizeWidgetScale,
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

// V7.1D — Widget Scale is a second independent canonical value sharing the
// same normalization contract (identical bounds/presets, distinct storage).
equal(WIDGET_SCALE_MIN, UI_SCALE_MIN, "widget scale shares interface scale bounds");
equal(WIDGET_SCALE_MAX, UI_SCALE_MAX, "widget scale shares interface scale bounds");
equal(WIDGET_SCALE_PRESETS[0]?.value, 0.88, "widget compact preset");
equal(WIDGET_SCALE_PRESETS[1]?.value, 1, "widget standard preset");
equal(WIDGET_SCALE_PRESETS[2]?.value, 1.12, "widget comfortable preset");
equal(normalizeWidgetScale(undefined), 1, "old snapshots migrate widget scale to standard");
equal(normalizeWidgetScale(Number.NaN), 1, "invalid widget scale migrates safely");
equal(normalizeWidgetScale(0.5), WIDGET_SCALE_MIN, "small widget scale clamps to minimum");
equal(normalizeWidgetScale(2), WIDGET_SCALE_MAX, "large widget scale clamps to maximum");
equal(normalizeWidgetScale(0.94), 0.94, "custom widget scale is preserved unrounded to presets");
equal(getWidgetScalePreset(0.96), null, "custom widget scale maps to no preset");
equal(getWidgetScalePreset(1.12), "comfortable", "widget preset value still resolves");

// Independence: setting one canonical scale must never mutate the other.
useLab.getState().setSettings({ uiScale: 1 });
useLab.getState().setWidgetScale(1);
useLab.getState().setSettings({ uiScale: 1.12 });
equal(useLab.getState().settings.uiScale, 1.12, "interface scale applies");
equal(useLab.getState().settings.widgetScale, 1, "interface scale change does not touch widget scale");
useLab.getState().setWidgetScale(0.88);
equal(useLab.getState().settings.widgetScale, 0.88, "widget scale applies");
equal(useLab.getState().settings.uiScale, 1.12, "widget scale change does not touch interface scale");

useLab.setState({ savedViews: [] });
for (const custom of [0.82, 0.94, 1.0, 1.06, 1.18]) {
  useLab.getState().setSettings({ uiScale: 1 });
  useLab.getState().setWidgetScale(custom);
  const id = useLab.getState().saveCurrentView(`Widget scale ${custom}`);
  useLab.getState().setWidgetScale(1);
  if (id) useLab.getState().loadSavedView(id);
  equal(
    useLab.getState().settings.widgetScale,
    custom,
    `saved view restores custom widget scale ${custom}`
  );
}

// Legacy snapshots with no widgetScale (and Interface Scale set independently)
// migrate widgetScale to 1.0 without disturbing the saved uiScale.
useLab.setState({ savedViews: [] });
useLab.getState().setSettings({ uiScale: 1.07 });
useLab.getState().setWidgetScale(0.9);
const independenceId = useLab.getState().saveCurrentView("Independence contract");
useLab.setState((s) => ({
  savedViews: s.savedViews.map((view) =>
    view.id === independenceId ? { ...view, widgetScale: undefined } : view
  ),
}));
useLab.getState().setSettings({ uiScale: 1 });
useLab.getState().setWidgetScale(1);
if (independenceId) useLab.getState().loadSavedView(independenceId);
equal(useLab.getState().settings.uiScale, 1.07, "legacy snapshot still restores interface scale");
equal(useLab.getState().settings.widgetScale, 1, "missing widgetScale migrates to standard");

console.info("ui scale contracts passed");
