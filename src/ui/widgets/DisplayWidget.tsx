/* V6K display widget — theme, canvas grid, and overlay visibility. */

import { useLab } from "../../state/store";
import { getUiScalePreset, UI_SCALE_PRESETS } from "../../state/uiScale";
import { ChipRow, SwitchRow, WidgetSection } from "./controls";

export default function DisplayWidget() {
  const theme = useLab((s) => s.theme);
  const toggleTheme = useLab((s) => s.toggleTheme);
  const showGrid = useLab((s) => s.settings.showGrid);
  const uiScale = useLab((s) => s.settings.uiScale);
  const organism = useLab((s) => s.settings.organism);
  const setSettings = useLab((s) => s.setSettings);
  const setOrganism = useLab((s) => s.setOrganism);

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

      <WidgetSection title="Interface Scale" hint={`${Math.round(uiScale * 100)}%`} defaultOpen>
        <ChipRow
          options={UI_SCALE_PRESETS}
          value={getUiScalePreset(uiScale) ?? "standard"}
          onChange={(presetId) => {
            const preset = UI_SCALE_PRESETS.find((option) => option.id === presetId);
            if (preset) setSettings({ uiScale: preset.value });
          }}
          ariaLabel="Interface scale"
        />
        <span className="org-subcap">Chrome only · canvas geometry stays fixed</span>
      </WidgetSection>
    </>
  );
}
