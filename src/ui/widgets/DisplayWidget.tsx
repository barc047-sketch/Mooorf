/* V6K display widget — theme, canvas grid, and overlay visibility. */

import { useLab } from "../../state/store";
import { SwitchRow, WidgetSection } from "./controls";

export default function DisplayWidget() {
  const theme = useLab((s) => s.theme);
  const toggleTheme = useLab((s) => s.toggleTheme);
  const showGrid = useLab((s) => s.settings.showGrid);
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

      <WidgetSection title="Density" hint="ui scale">
        <button type="button" className="pal-custom" disabled>
          Interface density — coming later
        </button>
      </WidgetSection>
    </>
  );
}
