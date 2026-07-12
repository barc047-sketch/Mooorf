/* V6K annotation widget — the single home for canvas text/labels.
   Modes, typography scale, visible fields, position, and bounding box. */

import { useLab } from "../../state/store";
import { ANNOTATIONS, LABEL_POSITIONS } from "../controlMeta";
import { ChipRow, ChoiceRow, SliderRow, SwitchRow, WidgetSection } from "./controls";

const LABEL_SCALE_MODES = [
  { id: "screen", label: "Screen" },
  { id: "adaptive", label: "Adaptive" },
  { id: "world", label: "World" },
] as const;

const LABEL_COLOUR_MODES = [
  { id: "auto", label: "Auto" },
  { id: "black", label: "Black" },
  { id: "white", label: "White" },
  { id: "custom", label: "Custom" },
] as const;

export default function AnnotationWidget() {
  const annotationMode = useLab((s) => s.settings.annotationMode);
  const detail = useLab((s) => s.settings.annotationDetail);
  const labelScaleMode = useLab((s) => s.settings.labelScaleMode);
  const labelColourMode = useLab((s) => s.settings.labelColourMode);
  const labelCustomColour = useLab((s) => s.settings.labelCustomColour);
  const setSettings = useLab((s) => s.setSettings);
  const setAnnotationDetail = useLab((s) => s.setAnnotationDetail);

  return (
    <>
      <WidgetSection title="Label Mode" hint="how spaces read" defaultOpen>
        {ANNOTATIONS.map((mode) => (
          <ChoiceRow
            key={mode.id}
            active={annotationMode === mode.id}
            name={mode.label}
            desc={mode.desc}
            onClick={() => setSettings({ annotationMode: mode.id })}
          />
        ))}
      </WidgetSection>

      <WidgetSection title="Typography" hint="scale + fields" defaultOpen>
        <span className="org-subcap">scale behavior</span>
        <ChipRow
          options={LABEL_SCALE_MODES}
          value={labelScaleMode}
          onChange={(mode) => setSettings({ labelScaleMode: mode })}
          ariaLabel="Label scale mode"
        />
        <span className="org-subcap">text colour</span>
        <ChipRow
          options={LABEL_COLOUR_MODES}
          value={labelColourMode}
          onChange={(mode) => setSettings({ labelColourMode: mode })}
          ariaLabel="Label colour mode"
        />
        {labelColourMode === "custom" && (
          <input
            className="wexport-input"
            type="color"
            aria-label="Custom label colour"
            value={labelCustomColour}
            onChange={(event) => setSettings({ labelCustomColour: event.target.value })}
          />
        )}
        <SliderRow
          label="Text Scale"
          value={detail.textScale}
          min={0.75}
          max={1.6}
          step={0.05}
          fmt={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => setAnnotationDetail({ textScale: v })}
        />
        <SwitchRow
          label="One-pixel contrast keyline"
          on={detail.textShadow}
          onToggle={() => setAnnotationDetail({ textShadow: !detail.textShadow })}
        />
        <SwitchRow
          label="Show name"
          on={detail.showName}
          onToggle={() => setAnnotationDetail({ showName: !detail.showName })}
        />
        <SwitchRow
          label="Show area"
          on={detail.showArea}
          onToggle={() => setAnnotationDetail({ showArea: !detail.showArea })}
        />
        <SwitchRow
          label="Show category (technical)"
          on={detail.showCategory}
          onToggle={() => setAnnotationDetail({ showCategory: !detail.showCategory })}
        />
      </WidgetSection>

      <WidgetSection title="Placement" hint="position + box">
        <span className="org-subcap">label position</span>
        <ChipRow
          options={LABEL_POSITIONS}
          value={detail.position}
          onChange={(position) => setAnnotationDetail({ position })}
          ariaLabel="Label position"
        />
        {annotationMode === "pill" && (
          <SwitchRow
            label="Pill outline"
            on={detail.boundingBox}
            onToggle={() => setAnnotationDetail({ boundingBox: !detail.boundingBox })}
          />
        )}
      </WidgetSection>
    </>
  );
}
