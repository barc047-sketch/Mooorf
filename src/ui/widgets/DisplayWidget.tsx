/* V6K display widget — theme, canvas grid, and overlay visibility. */

import { useLab } from "../../state/store";
import {
  getUiScalePreset,
  getWidgetScalePreset,
  normalizeUiScale,
  normalizeWidgetScale,
  UI_SCALE_MAX,
  UI_SCALE_MIN,
  UI_SCALE_PRESETS,
  WIDGET_SCALE_MAX,
  WIDGET_SCALE_MIN,
  WIDGET_SCALE_PRESETS,
} from "../../state/uiScale";
import { ChipRow, SliderRow, SwitchRow, WidgetSection } from "./controls";

export default function DisplayWidget() {
  const theme = useLab((s) => s.theme);
  const toggleTheme = useLab((s) => s.toggleTheme);
  const showGrid = useLab((s) => s.settings.showGrid);
  const uiScale = useLab((s) => s.settings.uiScale);
  const widgetScale = useLab((s) => s.settings.widgetScale);
  const organism = useLab((s) => s.settings.organism);
  const setSettings = useLab((s) => s.setSettings);
  const setWidgetScale = useLab((s) => s.setWidgetScale);
  const setOrganism = useLab((s) => s.setOrganism);

  const activePreset = getUiScalePreset(uiScale);
  const scalePercent = Math.round(uiScale * 100);
  const activeWidgetPreset = getWidgetScalePreset(widgetScale);
  const widgetScalePercent = Math.round(widgetScale * 100);

  return (
    <>
      <WidgetSection title="Theme" hint="day / night" defaultOpen>
        <SwitchRow label="Night mode" on={theme === "night"} onToggle={toggleTheme} />
      </WidgetSection>

      <WidgetSection title="Canvas" hint="ground overlays" defaultOpen>
        <SwitchRow
          label="Technical grid"
          on={showGrid}
          onToggle={() => setSettings({ showGrid: !showGrid })}
        />
        <SwitchRow
          label="Show labels"
          on={organism.showLabels}
          onToggle={() => setOrganism({ showLabels: !organism.showLabels })}
        />
        <SwitchRow
          label="Show nuclei dots"
          on={organism.showNuclei}
          onToggle={() => setOrganism({ showNuclei: !organism.showNuclei })}
        />
      </WidgetSection>

      <WidgetSection
        title="Interface Scale"
        hint={activePreset ? `${scalePercent}%` : `Custom · ${scalePercent}%`}
        defaultOpen
      >
        <ChipRow
          options={UI_SCALE_PRESETS}
          value={activePreset ?? ("" as (typeof UI_SCALE_PRESETS)[number]["id"])}
          onChange={(presetId) => {
            const preset = UI_SCALE_PRESETS.find((option) => option.id === presetId);
            if (preset) setSettings({ uiScale: preset.value });
          }}
          ariaLabel="Interface scale"
        />
        <SliderRow
          label="Interface scale"
          value={uiScale}
          min={UI_SCALE_MIN}
          max={UI_SCALE_MAX}
          step={0.01}
          fmt={(v) => `${Math.round(v * 100)}%`}
          ariaValueText={`${scalePercent} percent`}
          onChange={(v) => setSettings({ uiScale: normalizeUiScale(v) })}
        />
        <span className="org-subcap">Chrome only · canvas geometry stays fixed</span>
      </WidgetSection>

      <WidgetSection
        title="Widget Scale"
        hint={activeWidgetPreset ? `${widgetScalePercent}%` : `Custom · ${widgetScalePercent}%`}
        defaultOpen
      >
        <ChipRow
          options={WIDGET_SCALE_PRESETS}
          value={activeWidgetPreset ?? ("" as (typeof WIDGET_SCALE_PRESETS)[number]["id"])}
          onChange={(presetId) => {
            const preset = WIDGET_SCALE_PRESETS.find((option) => option.id === presetId);
            if (preset) setWidgetScale(preset.value);
          }}
          ariaLabel="Widget scale"
        />
        <SliderRow
          label="Widget scale"
          value={widgetScale}
          min={WIDGET_SCALE_MIN}
          max={WIDGET_SCALE_MAX}
          step={0.01}
          fmt={(v) => `${Math.round(v * 100)}%`}
          ariaValueText={`${widgetScalePercent} percent`}
          onChange={(v) => setWidgetScale(normalizeWidgetScale(v))}
        />
        <span className="org-subcap">Widget windows + contents only · rail/dock/canvas stay fixed</span>
      </WidgetSection>
    </>
  );
}
