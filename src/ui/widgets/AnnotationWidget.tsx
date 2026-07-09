/* V6K annotation widget — the single home for canvas text/labels.
   Modes, typography scale, visible fields, position, and bounding box. */

import { useLab } from "../../state/store";
import { ANNOTATIONS, LABEL_POSITIONS } from "../controlMeta";
import { ChipRow, ChoiceRow, SliderRow, SwitchRow, WidgetSection } from "./controls";

export default function AnnotationWidget() {
  const annotationMode = useLab((s) => s.settings.annotationMode);
  const detail = useLab((s) => s.settings.annotationDetail);
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
          label="Text shadow"
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
        <SwitchRow
          label="Bounding box"
          on={detail.boundingBox}
          onToggle={() => setAnnotationDetail({ boundingBox: !detail.boundingBox })}
        />
      </WidgetSection>
    </>
  );
}
