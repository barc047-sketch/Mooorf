/* V6K Morph and Motion widget — all membrane render behavior in one movable home:
   style, attachment/reach, field, nuclei, offsets, motion master, and pockets. */

import { useLab } from "../../state/store";
import { MAX_NUCLEI } from "../../experiments/organism-lab/organism-types";
import {
  DEFAULT_ORGANISM_SETTINGS,
  MOTION_DEFAULTS,
  ORG_CONTROL_SECTIONS,
  type NumericOrgKey,
} from "../../canvas/organismProductionSettings";
import {
  ATTACH_HINTS,
  ATTACHES,
  MORPH_DESCRIPTIONS,
  MORPHS,
} from "../controlMeta";
import { ChipRow, ChoiceRow, MiniSwitch, SliderRow, SwitchRow, WidgetSection } from "./controls";

const LOW_ZOOM_DETAIL_OPTIONS = [
  { id: "full", label: "Full" },
  { id: "balanced", label: "Balanced" },
  { id: "simplified", label: "Simplified" },
] as const;

export default function OrganismWidget() {
  const organism = useLab((s) => s.settings.organism);
  const morphMode = useLab((s) => s.settings.morphMode);
  const attachMode = useLab((s) => s.settings.attachMode);
  const mergeDistance = useLab((s) => s.settings.mergeDistance);
  const spaceCount = useLab((s) => s.spaces.length);
  const setSettings = useLab((s) => s.setSettings);
  const setOrganism = useLab((s) => s.setOrganism);

  const setNum = (key: NumericOrgKey, v: number) => setOrganism({ [key]: v });
  const sections = Object.fromEntries(ORG_CONTROL_SECTIONS.map((s) => [s.id, s]));

  /* One canonical master. Numeric motion authorship remains untouched while
     OFF and resumes exactly as authored when switched back ON. */
  const motionOn = organism.motionEnabled;
  const toggleMotion = () => setOrganism({ motionEnabled: !organism.motionEnabled });

  return (
    <>
      <WidgetSection title="Morph Style" hint="Membrane appearance" defaultOpen>
        {MORPHS.map((m) => (
          <ChoiceRow
            key={m.id}
            active={morphMode === m.id}
            name={m.label}
            desc={MORPH_DESCRIPTIONS[m.id]}
            swatch={<span className="pop-swatch" data-mode={m.id} />}
            onClick={() => setSettings({ morphMode: m.id })}
          />
        ))}
      </WidgetSection>

      <WidgetSection title="Attachment" hint="merge character" defaultOpen>
        <ChipRow
          options={ATTACHES}
          value={attachMode}
          onChange={(attachMode) => setSettings({ attachMode })}
          ariaLabel="Attachment mode"
        />
        <p className="org-attach-hint">{ATTACH_HINTS[attachMode]}</p>
        <SliderRow
          label="Reach / Density"
          value={mergeDistance}
          min={0}
          max={300}
          step={1}
          fmt={(v) => `${Math.round(v / 3)}%`}
          onChange={(v) => setSettings({ mergeDistance: v })}
        />
        {sections.offset.sliders.map((def) => (
          <SliderRow
            key={def.key}
            label={def.label}
            value={organism[def.key]}
            min={def.min}
            max={def.max}
            step={def.step}
            fmt={def.fmt}
            onChange={(v) => setNum(def.key, v)}
          />
        ))}
      </WidgetSection>

      <WidgetSection title="Membrane" hint="body + smoothing">
        <SwitchRow
          label="Preserve morphology"
          on={organism.preserveMorphology}
          onToggle={() => setOrganism({ preserveMorphology: !organism.preserveMorphology })}
        />
        <p className="org-attach-hint">
          Camera zoom changes projection only; it never changes the authored membrane field.
        </p>
        <ChipRow
          options={LOW_ZOOM_DETAIL_OPTIONS}
          value={organism.lowZoomDetail}
          onChange={(lowZoomDetail) => setOrganism({ lowZoomDetail })}
          ariaLabel="Low zoom membrane detail"
        />
        <SliderRow
          label="Minimum Detail"
          value={organism.minimumMorphologyDetail}
          min={0.2}
          max={1}
          step={0.01}
          fmt={(value) => `${Math.round(value * 100)}%`}
          onChange={(minimumMorphologyDetail) => setOrganism({ minimumMorphologyDetail })}
        />
        <SliderRow
          label="Edge Stability"
          value={organism.edgeStability}
          min={0}
          max={1}
          step={0.01}
          fmt={(value) => `${Math.round(value * 100)}%`}
          onChange={(edgeStability) => setOrganism({ edgeStability })}
        />
        {sections.organism.sliders.map((def) => (
          <SliderRow
            key={def.key}
            label={def.label}
            value={organism[def.key]}
            min={def.min}
            max={def.max}
            step={def.step}
            fmt={def.fmt}
            onChange={(v) => setNum(def.key, v)}
          />
        ))}
      </WidgetSection>

      <WidgetSection title="Cells" hint="per-space bodies">
        <div className="org-readout">
          <span>Count</span>
          <span className="org-readout-val">
            {spaceCount} <i>/{MAX_NUCLEI} from spaces</i>
          </span>
        </div>
        {sections.nuclei.sliders.map((def) => (
          <SliderRow
            key={def.key}
            label={def.label}
            value={organism[def.key]}
            min={def.min}
            max={def.max}
            step={def.step}
            fmt={def.fmt}
            onChange={(v) => setNum(def.key, v)}
          />
        ))}
      </WidgetSection>

      <WidgetSection
        title="Motion"
        hint="idle life"
        extra={<MiniSwitch on={motionOn} label="Idle motion" onToggle={toggleMotion} />}
      >
        {sections.motion.sliders.map((def) => (
          <SliderRow
            key={def.key}
            label={def.label}
            value={organism[def.key]}
            min={def.min}
            max={def.max}
            step={def.step}
            fmt={def.fmt}
            onChange={(v) => setNum(def.key, v)}
          />
        ))}
      </WidgetSection>

      <WidgetSection title="Pockets" hint="cellular voids">
        {sections.pockets.sliders.map((def) => (
          <SliderRow
            key={def.key}
            label={def.label}
            value={organism[def.key]}
            min={def.min}
            max={def.max}
            step={def.step}
            fmt={def.fmt}
            onChange={(v) => setNum(def.key, v)}
          />
        ))}
      </WidgetSection>

      <div className="org-foot org-foot--widget">
        <button
          type="button"
          className="org-reset"
          onClick={() => setOrganism({ ...DEFAULT_ORGANISM_SETTINGS })}
        >
          Reset Morph
        </button>
        <button type="button" className="org-reset" onClick={() => setOrganism({ ...MOTION_DEFAULTS })}>
          Reset motion
        </button>
      </div>
    </>
  );
}
