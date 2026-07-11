/* V6K organism widget — all organism render behavior in one movable home:
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

export default function OrganismWidget() {
  const organism = useLab((s) => s.settings.organism);
  const morphMode = useLab((s) => s.settings.morphMode);
  const attachMode = useLab((s) => s.settings.attachMode);
  const mergeDistance = useLab((s) => s.settings.mergeDistance);
  const rendererMode = useLab((s) => s.settings.rendererMode);
  const spaceCount = useLab((s) => s.spaces.length);
  const setSettings = useLab((s) => s.setSettings);
  const setOrganism = useLab((s) => s.setOrganism);

  const setNum = (key: NumericOrgKey, v: number) => setOrganism({ [key]: v });
  const sections = Object.fromEntries(ORG_CONTROL_SECTIONS.map((s) => [s.id, s]));

  /* motion master — off zeroes idle-life amounts (sliders keep working),
     on applies a gentle preset without touching response/phase */
  const motionOn =
    organism.timeScale > 0 &&
    (organism.drift > 0.001 || organism.breathing > 0.001 || organism.wobble > 0.001);
  const toggleMotion = () =>
    motionOn
      ? setOrganism({ drift: 0, breathing: 0, wobble: 0 })
      : setOrganism({
          drift: 0.28,
          breathing: 0.3,
          wobble: 0.12,
          timeScale: Math.max(organism.timeScale, 1),
        });

  return (
    <>
      {rendererMode === "classic" && (
        <p className="org-note">Classic fallback active — these settings drive the ORG renderer.</p>
      )}

      <WidgetSection title="Style" hint="render behavior" defaultOpen>
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

      <WidgetSection title="Field" hint="body + smoothing">
        <SwitchRow
          label="Camera-aware morph"
          on={organism.cameraAwareMorph}
          onToggle={() => setOrganism({ cameraAwareMorph: !organism.cameraAwareMorph })}
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

      <WidgetSection title="Nuclei" hint="per-space bodies">
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
          Reset organism
        </button>
        <button type="button" className="org-reset" onClick={() => setOrganism({ ...MOTION_DEFAULTS })}>
          Reset motion
        </button>
      </div>
    </>
  );
}
