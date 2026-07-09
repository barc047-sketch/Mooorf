/* V6K layout widget — colony arrangement presets. Safe x/y-only operations
   on existing spaces; Void stays a disabled future preset. */

import { useLab } from "../../state/store";
import { LAYOUT_PRESETS, VOID_LAYOUT_PRESET } from "../../canvas/layoutPresets";
import { LAYOUT_CODES } from "../controlMeta";
import { SliderRow, WidgetSection } from "./controls";

export default function LayoutWidget() {
  const layoutPreset = useLab((s) => s.settings.layoutPreset);
  const globalOffset = useLab((s) => s.settings.organism.globalOffset);
  const applyLayoutPreset = useLab((s) => s.applyLayoutPreset);
  const setOrganism = useLab((s) => s.setOrganism);

  return (
    <>
      <WidgetSection title="Presets" hint="x/y only · data safe" defaultOpen>
        <div className="layout-grid">
          {LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="layout-choice"
              aria-pressed={layoutPreset === preset.id}
              data-active={layoutPreset === preset.id}
              onClick={() => applyLayoutPreset(preset.id)}
            >
              <span className="layout-code">{LAYOUT_CODES[preset.id]}</span>
              <span className="layout-copy">
                <span className="layout-name">{preset.label}</span>
                <span className="layout-hint">{preset.hint}</span>
              </span>
            </button>
          ))}
          <button type="button" className="layout-choice" disabled>
            <span className="layout-code">VD</span>
            <span className="layout-copy">
              <span className="layout-name">{VOID_LAYOUT_PRESET.label}</span>
              <span className="layout-hint">{VOID_LAYOUT_PRESET.hint}</span>
            </span>
          </button>
        </div>
      </WidgetSection>

      <WidgetSection title="Spread" hint="visual layout" defaultOpen>
        <SliderRow
          label="Spread (visual)"
          value={globalOffset}
          min={0.4}
          max={1.8}
          step={0.01}
          fmt={(v) => v.toFixed(2)}
          onChange={(v) => setOrganism({ globalOffset: v })}
        />
        <p className="org-attach-hint">
          Scales the rendered layout around the colony center — never edits space x/y.
        </p>
      </WidgetSection>
    </>
  );
}
