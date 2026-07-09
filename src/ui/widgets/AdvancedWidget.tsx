/* V6K advanced widget — the only home for debug and experimental toggles.
   Noisy diagnostics live here so production surfaces stay calm. */

import { useLab } from "../../state/store";
import { SwitchRow, WidgetSection } from "./controls";

export default function AdvancedWidget() {
  const organism = useLab((s) => s.settings.organism);
  const rendererMode = useLab((s) => s.settings.rendererMode);
  const spaceCount = useLab((s) => s.spaces.length);
  const setOrganism = useLab((s) => s.setOrganism);

  return (
    <>
      <WidgetSection title="Renderer" hint="diagnostics" defaultOpen>
        <div className="org-readout">
          <span>Mode</span>
          <span className="org-readout-val">{rendererMode === "organism" ? "Organism · WebGL2" : "Classic · 2D"}</span>
        </div>
        <div className="org-readout">
          <span>Nuclei</span>
          <span className="org-readout-val">{spaceCount}</span>
        </div>
      </WidgetSection>

      <WidgetSection title="Debug" hint="field + nuclei" defaultOpen>
        <SwitchRow
          label="Field debug"
          on={organism.showFieldDebug}
          onToggle={() => setOrganism({ showFieldDebug: !organism.showFieldDebug })}
        />
        <SwitchRow
          label="Nuclei debug"
          on={organism.showNucleiDebug}
          onToggle={() => setOrganism({ showNucleiDebug: !organism.showNucleiDebug })}
        />
        <button
          type="button"
          className="org-reset"
          onClick={() => setOrganism({ showFieldDebug: false, showNucleiDebug: false })}
        >
          Debug off
        </button>
      </WidgetSection>

      <WidgetSection title="Experimental" hint="staged features">
        <button type="button" className="pal-custom" disabled>
          Negative / void nuclei — staged
        </button>
        <button type="button" className="pal-custom" disabled>
          Multi-category organism blend — staged
        </button>
      </WidgetSection>
    </>
  );
}
