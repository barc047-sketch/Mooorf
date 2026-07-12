/* V6K advanced widget — the only home for debug and experimental toggles.
   Noisy diagnostics live here so production surfaces stay calm. */

import { useLab } from "../../state/store";
import { MAX_NUCLEI } from "../../experiments/organism-lab/organism-types";
import { SwitchRow, WidgetSection } from "./controls";

export default function AdvancedWidget() {
  const organism = useLab((s) => s.settings.organism);
  const spaceCount = useLab((s) => s.spaces.length);
  const setOrganism = useLab((s) => s.setOrganism);

  return (
    <>
      <WidgetSection title="Canvas" hint="diagnostics" defaultOpen>
        <div className="org-readout">
          <span>Cells</span>
          <span className="org-readout-val">
            {spaceCount} <i>/{MAX_NUCLEI} visible</i>
          </span>
        </div>
      </WidgetSection>

      <WidgetSection title="Debug" hint="field + nuclei" defaultOpen>
        <SwitchRow
          label="Field debug"
          on={organism.showFieldDebug}
          onToggle={() => setOrganism({ showFieldDebug: !organism.showFieldDebug })}
        />
        <SwitchRow
          label="Cell field debug"
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
          Dual-layer organism editing — staged
        </button>
        <button type="button" className="pal-custom" disabled>
          Per-Cell colour texture — staged
        </button>
      </WidgetSection>
    </>
  );
}
