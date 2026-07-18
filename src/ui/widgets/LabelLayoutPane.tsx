import { useState } from "react";
import type { SpaceCell } from "../../types";
import type { ProjectPresentationDefaults } from "../../domain/presentation/types";
import {
  AREA_PLACEMENT_REGIONS,
  AREA_UNIT_POSITIONS,
  FLAG_ALIGNMENTS,
  FLAG_DIRECTIONS,
  FLAG_LABEL_BOUNDS,
  LABEL_ROLE_BOUNDS,
  LABEL_WEIGHT_TOKENS,
  RING_LABEL_BOUNDS,
  mergeCellLabelConfig,
  type CellLabelConfig,
  type CellLabelLayoutId,
  type LabelRoleId,
  type LabelRolePatch,
  DEFAULT_CELL_LABEL_LAYOUT,
  DEFAULT_AREA_LABEL_OPTIONS,
  DEFAULT_BODY_LABEL_OPTIONS,
  DEFAULT_RING_LABEL_OPTIONS,
  DEFAULT_FLAG_LABEL_OPTIONS,
  DEFAULT_MINIMAL_NUMBER_SOURCE,
} from "../../domain/labels/layoutContract";
import {
  CELL_LABEL_PRESETS,
  resolveEffectiveRoleStyle,
  type LabelPresetThumbGlyph,
} from "../../domain/labels/presets";
import { resolveEffectiveRoleVisibility } from "../../domain/labels/resolveLayout";
import { CELL_LABEL_SCALE_OPTIONS } from "../../domain/labels/foundation";
import { useLab } from "../../state/store";
import { ChipRow, SliderRow, SwitchRow, WidgetSection } from "./controls";

/* Inspector Content — Cell Label Layout controls. One pane, one state route:
   every edit flows through the existing text-channel preview/commit path
   (per-Cell sparse overrides or Project Defaults), so Undo/Redo, Mixed states
   and persistence stay canonical. */

export interface LabelLayoutPaneProps {
  selected: readonly SpaceCell[];
  defaults: ProjectPresentationDefaults;
  apply: (labels: CellLabelConfig) => void;
  preview: (labels: CellLabelConfig) => void;
  onPreviewEnd: () => void;
}

const common = <T,>(values: readonly T[]): { value: T | undefined; mixed: boolean } => {
  if (!values.length) return { value: undefined, mixed: false };
  const first = JSON.stringify(values[0]);
  return { value: values[0], mixed: values.some((value) => JSON.stringify(value) !== first) };
};

const WEIGHT_LABELS: Record<(typeof LABEL_WEIGHT_TOKENS)[number], string> = {
  light: "Light",
  regular: "Reg",
  medium: "Med",
  semibold: "Semi",
  bold: "Bold",
  black: "Black",
};

function PresetThumb({ glyphs }: { glyphs: readonly LabelPresetThumbGlyph[] }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      {glyphs.map((glyph, index) => {
        const opacity = glyph.emphasis ? 0.92 : 0.42;
        if (glyph.kind === "bar") {
          return <rect key={index} x={glyph.x} y={glyph.y} width={glyph.w} height={glyph.h} rx={Math.min(1.4, (glyph.h ?? 2) / 2)} fill="currentColor" opacity={opacity} />;
        }
        if (glyph.kind === "dot") {
          return <circle key={index} cx={glyph.x} cy={glyph.y} r={glyph.r} fill="currentColor" opacity={opacity} />;
        }
        if (glyph.kind === "ring") {
          return <circle key={index} cx={glyph.x} cy={glyph.y} r={glyph.r} fill="none" stroke="currentColor" strokeWidth={2.2} strokeDasharray="5.5 2.4" opacity={opacity} />;
        }
        return <line key={index} x1={glyph.x} y1={glyph.y} x2={glyph.x + (glyph.w ?? 0)} y2={glyph.y + (glyph.h ?? 0)} stroke="currentColor" strokeWidth={1.2} opacity={opacity} />;
      })}
    </svg>
  );
}

const ROLE_LABELS: Record<LabelRoleId, string> = {
  no: "No.",
  name: "Name",
  areaNumber: "Area number",
  areaUnit: "Area unit",
  body: "Body",
  metadata: "Metadata",
};

export default function LabelLayoutPane({ selected, defaults, apply, preview, onPreviewEnd }: LabelLayoutPaneProps) {
  const annotationDetail = useLab((state) => state.settings.annotationDetail);
  const labelScaleMode = useLab((state) => state.settings.labelScaleMode);
  const setSettings = useLab((state) => state.setSettings);
  const [advancedRole, setAdvancedRole] = useState<LabelRoleId>("name");

  const legacy = {
    showName: annotationDetail.showName,
    showArea: annotationDetail.showArea,
    showMetadata: annotationDetail.showCategory,
  };
  const configs: (CellLabelConfig | undefined)[] = selected.length
    ? selected.map((space) => mergeCellLabelConfig(defaults.text.labels, space.appearance?.text?.labels))
    : [defaults.text.labels];
  const layoutOf = (config: CellLabelConfig | undefined): CellLabelLayoutId =>
    config?.layout ?? DEFAULT_CELL_LABEL_LAYOUT;
  const layout = common(configs.map(layoutOf));
  const activeLayout = layout.mixed ? null : layoutOf(configs[0]);

  const roleCommon = <T,>(role: LabelRoleId, pick: (style: ReturnType<typeof resolveEffectiveRoleStyle>) => T) =>
    common(configs.map((config) => pick(resolveEffectiveRoleStyle(layoutOf(config), role, config))));
  const optionCommon = <T,>(pick: (config: CellLabelConfig | undefined) => T) => common(configs.map(pick));

  const applyRole = (role: LabelRoleId, patch: LabelRolePatch) => apply({ roles: { [role]: patch } });
  const previewRole = (role: LabelRoleId, patch: LabelRolePatch) => preview({ roles: { [role]: patch } });
  const mixedTag = (mixed: boolean) => (mixed ? " · Mixed" : "");

  const roleSlider = (
    role: LabelRoleId,
    label: string,
    field: "size" | "lineHeight" | "letterSpacing" | "opacity" | "maxLines" | "hideBelowZoom",
    min: number,
    max: number,
    step: number,
    fmt?: (v: number) => string
  ) => {
    const state = roleCommon(role, (style) => style[field]);
    return (
      <SliderRow
        label={`${label}${mixedTag(state.mixed)}`}
        value={(state.value as number) ?? min}
        min={min}
        max={max}
        step={step}
        fmt={fmt}
        onChange={(value) => previewRole(role, { [field]: value })}
        onChangeEnd={onPreviewEnd}
      />
    );
  };

  const roleStyleControls = (role: LabelRoleId, options?: { alignJustify?: boolean }) => {
    const weight = roleCommon(role, (style) => style.weight);
    const italic = roleCommon(role, (style) => style.italic);
    const textCase = roleCommon(role, (style) => style.textCase);
    const align = roleCommon(role, (style) => style.align);
    const colourMode = roleCommon(role, (style) => style.colourMode);
    const colour = roleCommon(role, (style) => style.colour);
    const overflow = roleCommon(role, (style) => style.overflow);
    const family = roleCommon(role, (style) => style.fontFamily);
    return (
      <>
        <ChipRow
          options={LABEL_WEIGHT_TOKENS.map((token) => ({ id: token, label: WEIGHT_LABELS[token] }))}
          value={(weight.value ?? "") as (typeof LABEL_WEIGHT_TOKENS)[number]}
          onChange={(value) => applyRole(role, { weight: value })}
          ariaLabel={`${ROLE_LABELS[role]} weight`}
        />
        <div className="m1-inline-row">
          <ChipRow
            options={[{ id: "primary", label: "Sans" }, { id: "mono", label: "Mono" }] as const}
            value={(family.value ?? "") as "primary" | "mono"}
            onChange={(value) => applyRole(role, { fontFamily: value })}
            ariaLabel={`${ROLE_LABELS[role]} font family`}
          />
          <SwitchRow
            label={`Italic${mixedTag(italic.mixed)}`}
            on={italic.value === true}
            onToggle={() => applyRole(role, { italic: !(italic.value === true) })}
          />
        </div>
        {roleSlider(role, "Size", "size", LABEL_ROLE_BOUNDS.size[0], LABEL_ROLE_BOUNDS.size[1], 0.05, (v) => `${Math.round(v * 100)}%`)}
        {roleSlider(role, "Line height", "lineHeight", LABEL_ROLE_BOUNDS.lineHeight[0], LABEL_ROLE_BOUNDS.lineHeight[1], 0.02, (v) => v.toFixed(2))}
        {roleSlider(role, "Letter spacing", "letterSpacing", LABEL_ROLE_BOUNDS.letterSpacing[0], LABEL_ROLE_BOUNDS.letterSpacing[1], 0.005, (v) => `${(v * 100).toFixed(1)}`)}
        <ChipRow
          options={[
            { id: "original", label: "Aa" },
            { id: "uppercase", label: "AA" },
            { id: "lowercase", label: "aa" },
            { id: "title", label: "Title" },
          ] as const}
          value={(textCase.value ?? "") as "original" | "uppercase" | "lowercase" | "title"}
          onChange={(value) => applyRole(role, { textCase: value })}
          ariaLabel={`${ROLE_LABELS[role]} case`}
        />
        <ChipRow
          options={[
            { id: "left", label: "Left" },
            { id: "centre", label: "Centre" },
            { id: "right", label: "Right" },
            ...(options?.alignJustify ? [{ id: "justify" as const, label: "Justify" }] : []),
          ]}
          value={(align.value ?? "") as "left" | "centre" | "right" | "justify"}
          onChange={(value) => applyRole(role, { align: value })}
          ariaLabel={`${ROLE_LABELS[role]} alignment`}
        />
        <ChipRow
          options={[
            { id: "auto", label: "Auto Contrast" },
            { id: "black", label: "Black" },
            { id: "white", label: "White" },
            { id: "custom", label: "Custom" },
          ] as const}
          value={(colourMode.value ?? "") as "auto" | "black" | "white" | "custom"}
          onChange={(value) => applyRole(role, { colourMode: value })}
          ariaLabel={`${ROLE_LABELS[role]} colour mode`}
        />
        {colourMode.value === "custom" && (
          <label className="m1-colour-row">
            <span>Colour{mixedTag(colour.mixed)}</span>
            <input
              type="color"
              value={colour.value ?? "#171715"}
              aria-label={`${ROLE_LABELS[role]} colour`}
              onChange={(event) => applyRole(role, { colourMode: "custom", colour: event.target.value })}
            />
          </label>
        )}
        {roleSlider(role, "Opacity", "opacity", 0, 1, 0.02, (v) => `${Math.round(v * 100)}%`)}
        <div className="m1-inline-row">
          <ChipRow
            options={[{ id: "wrap", label: "Wrap" }, { id: "truncate", label: "Truncate" }] as const}
            value={(overflow.value ?? "") as "wrap" | "truncate"}
            onChange={(value) => applyRole(role, { overflow: value })}
            ariaLabel={`${ROLE_LABELS[role]} overflow`}
          />
        </div>
        {roleSlider(role, "Max lines", "maxLines", LABEL_ROLE_BOUNDS.maxLines[0], LABEL_ROLE_BOUNDS.maxLines[1], 1, (v) => `${Math.round(v)}`)}
        {roleSlider(role, "Hide below zoom", "hideBelowZoom", 0, LABEL_ROLE_BOUNDS.hideBelowZoom[1], 0.05, (v) => (v <= 0 ? "Never" : `${Math.round(v * 100)}%`))}
      </>
    );
  };

  /* Elements — effective visibility truth including preset seed and gates. */
  const elementRoles: LabelRoleId[] = ["no", "name", "areaNumber", "areaUnit", "body", "metadata"];

  const areaShowUnit = optionCommon((config) => config?.area?.showUnit ?? DEFAULT_AREA_LABEL_OPTIONS.showUnit);
  const areaPrecision = optionCommon((config) => config?.area?.precision ?? DEFAULT_AREA_LABEL_OPTIONS.precision);
  const areaUnitPosition = optionCommon((config) => config?.area?.unitPosition ?? DEFAULT_AREA_LABEL_OPTIONS.unitPosition);
  const areaRegion = optionCommon((config) => config?.area?.region ?? DEFAULT_AREA_LABEL_OPTIONS.region);
  const bodyParagraph = optionCommon((config) => config?.body?.paragraphWidth ?? DEFAULT_BODY_LABEL_OPTIONS.paragraphWidth);
  const bodyAutoHide = optionCommon((config) => config?.body?.autoHide ?? DEFAULT_BODY_LABEL_OPTIONS.autoHide);
  const ringRadius = optionCommon((config) => config?.ring?.radiusRatio ?? DEFAULT_RING_LABEL_OPTIONS.radiusRatio);
  const ringAngle = optionCommon((config) => config?.ring?.startAngleDeg ?? DEFAULT_RING_LABEL_OPTIONS.startAngleDeg);
  const ringSpacing = optionCommon((config) => config?.ring?.spacingEm ?? DEFAULT_RING_LABEL_OPTIONS.spacingEm);
  const flagDirection = optionCommon((config) => config?.flag?.direction ?? DEFAULT_FLAG_LABEL_OPTIONS.direction);
  const flagDistance = optionCommon((config) => config?.flag?.distance ?? DEFAULT_FLAG_LABEL_OPTIONS.distance);
  const flagWidth = optionCommon((config) => config?.flag?.width ?? DEFAULT_FLAG_LABEL_OPTIONS.width);
  const flagAlign = optionCommon((config) => config?.flag?.align ?? DEFAULT_FLAG_LABEL_OPTIONS.align);
  const minimalSource = optionCommon((config) => config?.minimalSource ?? DEFAULT_MINIMAL_NUMBER_SOURCE);
  const advancedOffsetX = roleCommon(advancedRole, (style) => style.offsetX);
  const advancedOffsetY = roleCommon(advancedRole, (style) => style.offsetY);
  const advancedRotation = roleCommon(advancedRole, (style) => style.rotation);
  const advancedScaleMode = roleCommon(advancedRole, (style) => style.scaleMode);

  return (
    <section className="m1-section" data-testid="label-layout-pane">
      <div className="m1-section-title"><h3>Label Layout</h3></div>

      <div className="m1-layout-grid" role="radiogroup" aria-label="Cell label layout">
        {CELL_LABEL_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            role="radio"
            aria-checked={activeLayout === preset.id}
            data-active={activeLayout === preset.id}
            title={preset.description}
            onClick={() => apply({ layout: preset.id })}
          >
            <PresetThumb glyphs={preset.thumbnail} />
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
      {layout.mixed && <p className="m1-mixed-note">Label Layout · Mixed</p>}

      <WidgetSection title="Elements" defaultOpen>
        {elementRoles.map((role) => {
          const visible = common(configs.map((config) =>
            resolveEffectiveRoleVisibility(layoutOf(config), role, config, legacy)
          ));
          return (
            <SwitchRow
              key={role}
              label={`${ROLE_LABELS[role]}${mixedTag(visible.mixed)}`}
              on={visible.value === true}
              onToggle={() => applyRole(role, { visible: !(visible.value === true) })}
            />
          );
        })}
      </WidgetSection>

      <WidgetSection title="Name Style">{roleStyleControls("name")}</WidgetSection>

      <WidgetSection title="Area Style">
        <SwitchRow
          label={`Show unit${mixedTag(areaShowUnit.mixed)}`}
          on={areaShowUnit.value === true}
          onToggle={() => apply({ area: { showUnit: !(areaShowUnit.value === true) } })}
        />
        <ChipRow
          options={[{ id: "0", label: "0" }, { id: "1", label: "0.0" }, { id: "2", label: "0.00" }] as const}
          value={String(areaPrecision.value ?? 0) as "0" | "1" | "2"}
          onChange={(value) => apply({ area: { precision: Number(value) } })}
          ariaLabel="Area decimal precision"
        />
        <ChipRow
          options={AREA_UNIT_POSITIONS.map((id) => ({ id, label: id === "after" ? "Unit after" : "Unit below" }))}
          value={(areaUnitPosition.value ?? "") as (typeof AREA_UNIT_POSITIONS)[number]}
          onChange={(value) => apply({ area: { unitPosition: value } })}
          ariaLabel="Area unit position"
        />
        <ChipRow
          options={AREA_PLACEMENT_REGIONS.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))}
          value={(areaRegion.value ?? "") as (typeof AREA_PLACEMENT_REGIONS)[number]}
          onChange={(value) => apply({ area: { region: value } })}
          ariaLabel="Area placement region"
        />
        {roleStyleControls("areaNumber")}
        {roleSlider("areaUnit", "Unit size", "size", LABEL_ROLE_BOUNDS.size[0], LABEL_ROLE_BOUNDS.size[1], 0.05, (v) => `${Math.round(v * 100)}%`)}
      </WidgetSection>

      <WidgetSection title="Body Style">
        <SliderRow
          label={`Paragraph width${mixedTag(bodyParagraph.mixed)}`}
          value={bodyParagraph.value ?? DEFAULT_BODY_LABEL_OPTIONS.paragraphWidth}
          min={0.4}
          max={2}
          step={0.05}
          fmt={(v) => `${Math.round(v * 100)}%`}
          onChange={(value) => preview({ body: { paragraphWidth: value } })}
          onChangeEnd={onPreviewEnd}
        />
        <SwitchRow
          label={`Auto-hide when Cell lacks room${mixedTag(bodyAutoHide.mixed)}`}
          on={bodyAutoHide.value === true}
          onToggle={() => apply({ body: { autoHide: !(bodyAutoHide.value === true) } })}
        />
        {roleStyleControls("body", { alignJustify: true })}
      </WidgetSection>

      <WidgetSection title="No. / Metadata Style">
        <p className="m1-empty-note">Stable Space No.</p>
        {roleStyleControls("no")}
        <p className="m1-empty-note">Category · Privacy metadata</p>
        {roleStyleControls("metadata")}
      </WidgetSection>

      <WidgetSection title="Alignment">
        <ChipRow
          options={[{ id: "left", label: "Left" }, { id: "centre", label: "Centre" }, { id: "right", label: "Right" }] as const}
          value={(roleCommon("name", (style) => style.align).value ?? "") as "left" | "centre" | "right"}
          onChange={(value) => apply({
            roles: {
              no: { align: value },
              name: { align: value },
              areaNumber: { align: value },
              areaUnit: { align: value },
              body: { align: value },
              metadata: { align: value },
            },
          })}
          ariaLabel="Align all label elements"
        />
      </WidgetSection>

      <WidgetSection title="Scale" defaultOpen>
        <ChipRow
          options={CELL_LABEL_SCALE_OPTIONS.map(({ id, label }) => ({ id, label }))}
          value={labelScaleMode}
          onChange={(value) => setSettings({ labelScaleMode: value })}
          ariaLabel="Label scale mode"
        />
        <p className="m1-empty-note">Scale is a project-wide view setting; per-element modes live under Advanced.</p>
      </WidgetSection>

      {activeLayout === "ring" && (
        <WidgetSection title="Ring controls" defaultOpen>
          <SliderRow
            label={`Ring radius${mixedTag(ringRadius.mixed)}`}
            value={ringRadius.value ?? DEFAULT_RING_LABEL_OPTIONS.radiusRatio}
            min={RING_LABEL_BOUNDS.radiusRatio[0]}
            max={RING_LABEL_BOUNDS.radiusRatio[1]}
            step={0.01}
            fmt={(v) => `${Math.round(v * 100)}%`}
            onChange={(value) => preview({ ring: { radiusRatio: value } })}
            onChangeEnd={onPreviewEnd}
          />
          <SliderRow
            label={`Ring angle${mixedTag(ringAngle.mixed)}`}
            value={ringAngle.value ?? 0}
            min={RING_LABEL_BOUNDS.startAngleDeg[0]}
            max={RING_LABEL_BOUNDS.startAngleDeg[1]}
            step={1}
            fmt={(v) => `${Math.round(v)}°`}
            onChange={(value) => preview({ ring: { startAngleDeg: value } })}
            onChangeEnd={onPreviewEnd}
          />
          <SliderRow
            label={`Ring spacing${mixedTag(ringSpacing.mixed)}`}
            value={ringSpacing.value ?? DEFAULT_RING_LABEL_OPTIONS.spacingEm}
            min={RING_LABEL_BOUNDS.spacingEm[0]}
            max={RING_LABEL_BOUNDS.spacingEm[1]}
            step={0.01}
            fmt={(v) => v.toFixed(2)}
            onChange={(value) => preview({ ring: { spacingEm: value } })}
            onChangeEnd={onPreviewEnd}
          />
          <p className="m1-empty-note">Ring text always keeps a readable direction and falls back inside small Cells.</p>
        </WidgetSection>
      )}

      {activeLayout === "flag" && (
        <WidgetSection title="Flag controls" defaultOpen>
          <ChipRow
            options={FLAG_DIRECTIONS.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))}
            value={(flagDirection.value ?? "") as (typeof FLAG_DIRECTIONS)[number]}
            onChange={(value) => apply({ flag: { direction: value } })}
            ariaLabel="Flag direction"
          />
          <SliderRow
            label={`Distance${mixedTag(flagDistance.mixed)}`}
            value={flagDistance.value ?? DEFAULT_FLAG_LABEL_OPTIONS.distance}
            min={FLAG_LABEL_BOUNDS.distance[0]}
            max={FLAG_LABEL_BOUNDS.distance[1]}
            step={1}
            onChange={(value) => preview({ flag: { distance: value } })}
            onChangeEnd={onPreviewEnd}
          />
          <SliderRow
            label={`Panel width${mixedTag(flagWidth.mixed)}`}
            value={flagWidth.value ?? DEFAULT_FLAG_LABEL_OPTIONS.width}
            min={FLAG_LABEL_BOUNDS.width[0]}
            max={FLAG_LABEL_BOUNDS.width[1]}
            step={2}
            onChange={(value) => preview({ flag: { width: value } })}
            onChangeEnd={onPreviewEnd}
          />
          <ChipRow
            options={FLAG_ALIGNMENTS.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))}
            value={(flagAlign.value ?? "") as (typeof FLAG_ALIGNMENTS)[number]}
            onChange={(value) => apply({ flag: { align: value } })}
            ariaLabel="Flag alignment"
          />
          <p className="m1-empty-note">Auto places the Flag away from the organism centre. A Flag is presentation only — never a Relationship.</p>
        </WidgetSection>
      )}

      {activeLayout === "minimal-number" && (
        <WidgetSection title="Number source" defaultOpen>
          <ChipRow
            options={[{ id: "area", label: "Area" }, { id: "no", label: "Space No." }] as const}
            value={(minimalSource.value ?? "") as "area" | "no"}
            onChange={(value) => apply({ minimalSource: value })}
            ariaLabel="Minimal number source"
          />
          <p className="m1-empty-note">Full content stays available in Table and Inspector.</p>
        </WidgetSection>
      )}

      <WidgetSection title="Advanced offsets">
        <ChipRow
          options={elementRoles.map((id) => ({ id, label: ROLE_LABELS[id] }))}
          value={advancedRole}
          onChange={setAdvancedRole}
          ariaLabel="Advanced offsets element"
        />
        <SliderRow
          label={`X offset${mixedTag(advancedOffsetX.mixed)}`}
          value={advancedOffsetX.value ?? 0}
          min={LABEL_ROLE_BOUNDS.offset[0]}
          max={LABEL_ROLE_BOUNDS.offset[1]}
          step={1}
          onChange={(value) => previewRole(advancedRole, { offsetX: value })}
          onChangeEnd={onPreviewEnd}
        />
        <SliderRow
          label={`Y offset${mixedTag(advancedOffsetY.mixed)}`}
          value={advancedOffsetY.value ?? 0}
          min={LABEL_ROLE_BOUNDS.offset[0]}
          max={LABEL_ROLE_BOUNDS.offset[1]}
          step={1}
          onChange={(value) => previewRole(advancedRole, { offsetY: value })}
          onChangeEnd={onPreviewEnd}
        />
        <SliderRow
          label={`Rotation${mixedTag(advancedRotation.mixed)}`}
          value={advancedRotation.value ?? 0}
          min={LABEL_ROLE_BOUNDS.rotation[0]}
          max={LABEL_ROLE_BOUNDS.rotation[1]}
          step={1}
          fmt={(v) => `${Math.round(v)}°`}
          onChange={(value) => previewRole(advancedRole, { rotation: value })}
          onChangeEnd={onPreviewEnd}
        />
        <ChipRow
          options={[
            { id: "inherit", label: "Inherit" },
            { id: "world", label: "Scale with Cell" },
            { id: "adaptive", label: "Auto" },
            { id: "screen", label: "Keep readable" },
          ] as const}
          value={(advancedScaleMode.value ?? "") as "inherit" | "world" | "adaptive" | "screen"}
          onChange={(value) => applyRole(advancedRole, { scaleMode: value })}
          ariaLabel="Element scale mode"
        />
      </WidgetSection>
    </section>
  );
}
