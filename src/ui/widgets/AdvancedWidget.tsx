/* PF1C performance controls. */

import { useSyncExternalStore } from "react";
import { performanceGovernor } from "../../runtime/performanceGovernor";
import type { PreviewFilter, PreviewMode } from "../../runtime/performanceProfiles";
import { useLab } from "../../state/store";
import { MAX_NUCLEI } from "../../experiments/organism-lab/organism-types";
import { ChipRow, SwitchRow, WidgetSection } from "./controls";

const PREVIEW_OPTIONS: ReadonlyArray<{ id: PreviewMode; label: string }> = [
  { id: "automatic", label: "AUTO" },
  { id: "sharp", label: "SHARP" },
  { id: "balanced", label: "BALANCED" },
  { id: "fast", label: "FAST" },
  { id: "ultra-fast", label: "ULTRA" },
];
const FILTER_OPTIONS: ReadonlyArray<{ id: PreviewFilter; label: string }> = [
  { id: "smooth", label: "SMOOTH" },
  { id: "pixel", label: "PIXEL" },
];

export default function AdvancedWidget() {
  const performance = useSyncExternalStore(
    performanceGovernor.subscribe,
    performanceGovernor.getSnapshot,
    performanceGovernor.getSnapshot,
  );
  const organism = useLab((s) => s.settings.organism);
  const spaceCount = useLab((s) => s.spaces.length);
  const setOrganism = useLab((s) => s.setOrganism);

  return (
    <>
      <WidgetSection title="PREVIEW" defaultOpen>
        <ChipRow
          options={PREVIEW_OPTIONS}
          value={performance.previewMode}
          onChange={performanceGovernor.setPreviewMode}
          ariaLabel="Preview"
        />
      </WidgetSection>

      <WidgetSection title="BOOST" defaultOpen>
        <SwitchRow
          label="Boost"
          on={performance.interactionBoost}
          onToggle={() => performanceGovernor.setInteractionBoost(!performance.interactionBoost)}
        />
      </WidgetSection>

      <WidgetSection title="FILTER" defaultOpen>
        <ChipRow
          options={FILTER_OPTIONS}
          value={performance.previewFilter}
          onChange={performanceGovernor.setPreviewFilter}
          ariaLabel="Filter"
        />
      </WidgetSection>

      <WidgetSection title="STATUS" defaultOpen>
        <div className="org-readout"><span>QUALITY</span><span className="org-readout-val">{performance.effectiveQuality.toUpperCase()}</span></div>
        <div className="org-readout"><span>PREVIEW</span><span className="org-readout-val">{Math.round(performance.effectiveRenderScale * 100)}%</span></div>
      </WidgetSection>

      <WidgetSection title="CANVAS" defaultOpen>
        <div className="org-readout">
          <span>CELLS</span>
          <span className="org-readout-val">
            {spaceCount} <i>/{MAX_NUCLEI} visible</i>
          </span>
        </div>
      </WidgetSection>

      <WidgetSection title="DEBUG">
        <SwitchRow
          label="Field"
          on={organism.showFieldDebug}
          onToggle={() => setOrganism({ showFieldDebug: !organism.showFieldDebug })}
        />
        <SwitchRow
          label="Nuclei"
          on={organism.showNucleiDebug}
          onToggle={() => setOrganism({ showNucleiDebug: !organism.showNucleiDebug })}
        />
        <button
          type="button"
          className="org-reset"
          onClick={() => setOrganism({ showFieldDebug: false, showNucleiDebug: false })}
        >
          Reset
        </button>
      </WidgetSection>
    </>
  );
}
