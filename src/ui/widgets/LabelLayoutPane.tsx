import { createContext, useContext, useState, type ComponentProps } from "react";
import type { SpaceCell } from "../../types";
import type { ProjectPresentationDefaults } from "../../domain/presentation/types";
import {
  AREA_PLACEMENT_REGIONS,
  AREA_UNIT_POSITIONS,
  FLAG_ALIGNMENTS,
  FLAG_DIRECTIONS,
  FLAG_ENDPOINTS,
  FLAG_LABEL_BOUNDS,
  FLAG_LEADER_KINDS,
  FLAG_LINE_STYLES,
  FLAG_PANEL_BACKGROUNDS,
  FLAG_ZOOM_MODES,
  LABEL_FIT_BOUNDS,
  LABEL_OVERFLOW_POLICIES,
  LABEL_ROLE_BOUNDS,
  LABEL_WEIGHT_TOKENS,
  RING_ARC_BOUNDS,
  RING_ARC_DIRECTIONS,
  RING_ARC_ORIENTATIONS,
  RING_ARC_SOURCES,
  RING_LABEL_BOUNDS,
  RING_LOW_ZOOM_BEHAVIOURS,
  mergeCellLabelConfig,
  type CellLabelConfig,
  type CellLabelLayoutId,
  type LabelFitOptions,
  type LabelRoleId,
  type LabelRolePatch,
  type RingArcOptions,
  DEFAULT_CELL_LABEL_LAYOUT,
  DEFAULT_AREA_LABEL_OPTIONS,
  DEFAULT_BODY_LABEL_OPTIONS,
  DEFAULT_LABEL_FIT_OPTIONS,
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
import { ChipRow, SliderRow as BaseSliderRow, SwitchRow, WidgetSection } from "./controls";

/* Inspector Content — Cell Label Layout controls. One pane, one state route:
   every edit flows through the existing text-channel preview/commit path
   (per-Cell sparse overrides or Project Defaults), so Undo/Redo, Mixed states
   and persistence stay canonical. */

export interface LabelLayoutPaneProps {
  /** Inspector stays compact; Label Studio exposes the full authoring surface. */
  detailed?: boolean;
  selected: readonly SpaceCell[];
  defaults: ProjectPresentationDefaults;
  apply: (labels: CellLabelConfig) => void;
  preview: (labels: CellLabelConfig) => void;
  onPreviewEnd: () => void;
  onPreviewCancel?: () => void;
  /** Global fit uses Project Defaults even while a local Cell label override
   * is selected. Display owns the exact same global settings. */
  applyGlobal?: (labels: CellLabelConfig) => void;
  previewGlobal?: (labels: CellLabelConfig) => void;
  onGlobalPreviewEnd?: () => void;
  onGlobalPreviewCancel?: () => void;
  /** Optional because the compact selected-Cell Inspector does not expose
   * project text scale. Label Studio supplies this exact canonical route. */
  applyGlobalTextSize?: (size: number) => void;
  previewGlobalTextSize?: (size: number) => void;
  onGlobalTextSizePreviewEnd?: () => void;
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

const RING_ARC_KEYS = ["primaryArc", "secondaryArc"] as const;
type RingArcKey = typeof RING_ARC_KEYS[number];

const PreviewCancelContext = createContext<(() => void) | undefined>(undefined);

function SliderRow(props: ComponentProps<typeof BaseSliderRow>) {
  const inheritedCancel = useContext(PreviewCancelContext);
  return <BaseSliderRow {...props} onChangeCancel={props.onChangeCancel ?? inheritedCancel} />;
}

const resolvedRingArc = (config: CellLabelConfig | undefined, key: RingArcKey): RingArcOptions => ({
  ...DEFAULT_RING_LABEL_OPTIONS[key],
  ...config?.ring?.[key],
}) as RingArcOptions;

export default function LabelLayoutPane({
  detailed = false,
  selected,
  defaults,
  apply,
  preview,
  onPreviewEnd,
  onPreviewCancel,
  applyGlobal,
  previewGlobal,
  onGlobalPreviewEnd,
  onGlobalPreviewCancel,
  applyGlobalTextSize,
  previewGlobalTextSize,
  onGlobalTextSizePreviewEnd,
}: LabelLayoutPaneProps) {
  const annotationDetail = useLab((state) => state.settings.annotationDetail);
  const labelScaleMode = useLab((state) => state.settings.labelScaleMode);
  const setSettings = useLab((state) => state.setSettings);
  const openWidget = useLab((state) => state.openWidget);
  const [advancedRole, setAdvancedRole] = useState<LabelRoleId>("name");
  const [flagContentRole, setFlagContentRole] = useState<LabelRoleId>("name");

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
  /* Fit is project-wide by contract, even when the rest of Label Studio is
   * editing a selected Cell's sparse label override. */
  const fitCommon = <T,>(pick: (fit: LabelFitOptions) => T) => ({
    value: pick({ ...DEFAULT_LABEL_FIT_OPTIONS, ...defaults.text.labels.fit } as LabelFitOptions),
    mixed: false,
  });
  const ringArcCommon = <T,>(key: RingArcKey, pick: (arc: RingArcOptions) => T) =>
    optionCommon((config) => pick(resolvedRingArc(config, key)));

  const applyRole = (role: LabelRoleId, patch: LabelRolePatch) => apply({ roles: { [role]: patch } });
  const previewRole = (role: LabelRoleId, patch: LabelRolePatch) => preview({ roles: { [role]: patch } });
  const applyFit = (patch: Partial<LabelFitOptions>) => (applyGlobal ?? apply)({ fit: patch });
  const previewFit = (patch: Partial<LabelFitOptions>) => (previewGlobal ?? preview)({ fit: patch });
  const onFitPreviewEnd = onGlobalPreviewEnd ?? onPreviewEnd;
  const onFitPreviewCancel = onGlobalPreviewCancel ?? onPreviewCancel;
  const applyRingArc = (key: RingArcKey, patch: Partial<RingArcOptions>) => apply({ ring: { [key]: patch } });
  const previewRingArc = (key: RingArcKey, patch: Partial<RingArcOptions>) => preview({ ring: { [key]: patch } });
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
  const ringLowZoomBehaviour = optionCommon((config) => config?.ring?.lowZoomBehavior ?? DEFAULT_RING_LABEL_OPTIONS.lowZoomBehavior);
  const ringHideBelowZoom = optionCommon((config) => config?.ring?.hideBelowZoom ?? DEFAULT_RING_LABEL_OPTIONS.hideBelowZoom);
  const flagDirection = optionCommon((config) => config?.flag?.direction ?? DEFAULT_FLAG_LABEL_OPTIONS.direction);
  const flagDistance = optionCommon((config) => config?.flag?.distance ?? DEFAULT_FLAG_LABEL_OPTIONS.distance);
  const flagWidth = optionCommon((config) => config?.flag?.width ?? DEFAULT_FLAG_LABEL_OPTIONS.width);
  const flagAlign = optionCommon((config) => config?.flag?.align ?? DEFAULT_FLAG_LABEL_OPTIONS.align);
  const flagAnchorAngle = optionCommon((config) => config?.flag?.anchorAngleDeg ?? DEFAULT_FLAG_LABEL_OPTIONS.anchorAngleDeg);
  const flagRadialOffset = optionCommon((config) => config?.flag?.radialOffset ?? DEFAULT_FLAG_LABEL_OPTIONS.radialOffset);
  const flagOffsetX = optionCommon((config) => config?.flag?.offsetX ?? DEFAULT_FLAG_LABEL_OPTIONS.offsetX);
  const flagOffsetY = optionCommon((config) => config?.flag?.offsetY ?? DEFAULT_FLAG_LABEL_OPTIONS.offsetY);
  const flagClamp = optionCommon((config) => config?.flag?.clampToFrame ?? DEFAULT_FLAG_LABEL_OPTIONS.clampToFrame);
  const flagAvoidSource = optionCommon((config) => config?.flag?.avoidSourceCell ?? DEFAULT_FLAG_LABEL_OPTIONS.avoidSourceCell);
  const flagLeader = optionCommon((config) => config?.flag?.leader ?? DEFAULT_FLAG_LABEL_OPTIONS.leader);
  const flagLineThickness = optionCommon((config) => config?.flag?.lineThickness ?? DEFAULT_FLAG_LABEL_OPTIONS.lineThickness);
  const flagLineOpacity = optionCommon((config) => config?.flag?.lineOpacity ?? DEFAULT_FLAG_LABEL_OPTIONS.lineOpacity);
  const flagLineStyle = optionCommon((config) => config?.flag?.lineStyle ?? DEFAULT_FLAG_LABEL_OPTIONS.lineStyle);
  const flagElbowLength = optionCommon((config) => config?.flag?.elbowLength ?? DEFAULT_FLAG_LABEL_OPTIONS.elbowLength);
  const flagCurvature = optionCommon((config) => config?.flag?.curvature ?? DEFAULT_FLAG_LABEL_OPTIONS.curvature);
  const flagEndpoint = optionCommon((config) => config?.flag?.endpoint ?? DEFAULT_FLAG_LABEL_OPTIONS.endpoint);
  const flagAutoWidth = optionCommon((config) => config?.flag?.autoWidth ?? DEFAULT_FLAG_LABEL_OPTIONS.autoWidth);
  const flagMinimumWidth = optionCommon((config) => config?.flag?.minimumWidth ?? DEFAULT_FLAG_LABEL_OPTIONS.minimumWidth);
  const flagMaximumWidth = optionCommon((config) => config?.flag?.maximumWidth ?? DEFAULT_FLAG_LABEL_OPTIONS.maximumWidth);
  const flagPaddingX = optionCommon((config) => config?.flag?.paddingX ?? DEFAULT_FLAG_LABEL_OPTIONS.paddingX);
  const flagPaddingY = optionCommon((config) => config?.flag?.paddingY ?? DEFAULT_FLAG_LABEL_OPTIONS.paddingY);
  const flagContentGap = optionCommon((config) => config?.flag?.contentGap ?? DEFAULT_FLAG_LABEL_OPTIONS.contentGap);
  const flagCornerRadius = optionCommon((config) => config?.flag?.cornerRadius ?? DEFAULT_FLAG_LABEL_OPTIONS.cornerRadius);
  const flagBackground = optionCommon((config) => config?.flag?.background ?? DEFAULT_FLAG_LABEL_OPTIONS.background);
  const flagBackgroundOpacity = optionCommon((config) => config?.flag?.backgroundOpacity ?? DEFAULT_FLAG_LABEL_OPTIONS.backgroundOpacity);
  const flagBorder = optionCommon((config) => config?.flag?.border ?? DEFAULT_FLAG_LABEL_OPTIONS.border);
  const flagBorderThickness = optionCommon((config) => config?.flag?.borderThickness ?? DEFAULT_FLAG_LABEL_OPTIONS.borderThickness);
  const flagBorderOpacity = optionCommon((config) => config?.flag?.borderOpacity ?? DEFAULT_FLAG_LABEL_OPTIONS.borderOpacity);
  const flagSymbol = optionCommon((config) => config?.flag?.symbol ?? DEFAULT_FLAG_LABEL_OPTIONS.symbol);
  const flagContentOrder = optionCommon((config) => config?.flag?.contentOrder ?? DEFAULT_FLAG_LABEL_OPTIONS.contentOrder);
  const flagBodyLineClamp = optionCommon((config) => config?.flag?.bodyLineClamp ?? DEFAULT_FLAG_LABEL_OPTIONS.bodyLineClamp);
  const flagCompact = optionCommon((config) => config?.flag?.compact ?? DEFAULT_FLAG_LABEL_OPTIONS.compact);
  const flagZoomMode = optionCommon((config) => config?.flag?.zoomMode ?? DEFAULT_FLAG_LABEL_OPTIONS.zoomMode);
  const flagMinimumPanelScale = optionCommon((config) => config?.flag?.minimumPanelScale ?? DEFAULT_FLAG_LABEL_OPTIONS.minimumPanelScale);
  const flagMaximumPanelScale = optionCommon((config) => config?.flag?.maximumPanelScale ?? DEFAULT_FLAG_LABEL_OPTIONS.maximumPanelScale);
  const flagHideBelowZoom = optionCommon((config) => config?.flag?.hideBelowZoom ?? DEFAULT_FLAG_LABEL_OPTIONS.hideBelowZoom);
  const flagKeepReadable = optionCommon((config) => config?.flag?.keepReadable ?? DEFAULT_FLAG_LABEL_OPTIONS.keepReadable);
  const minimalSource = optionCommon((config) => config?.minimalSource ?? DEFAULT_MINIMAL_NUMBER_SOURCE);
  const advancedOffsetX = roleCommon(advancedRole, (style) => style.offsetX);
  const advancedOffsetY = roleCommon(advancedRole, (style) => style.offsetY);
  const advancedRotation = roleCommon(advancedRole, (style) => style.rotation);
  const advancedScaleMode = roleCommon(advancedRole, (style) => style.scaleMode);
  const fitInsideCell = fitCommon((fit) => fit.fitInsideCell);
  const fitMaximumOccupancy = fitCommon((fit) => fit.maximumCellOccupancy);
  const fitMinimumReadable = fitCommon((fit) => fit.minimumReadableScreenSize);
  const fitMaximumText = fitCommon((fit) => fit.maximumScreenTextSize);
  const fitBodyThreshold = fitCommon((fit) => fit.lowZoomBodyThreshold);
  const fitMetadataThreshold = fitCommon((fit) => fit.lowZoomMetadataThreshold);
  const fitHideAllThreshold = fitCommon((fit) => fit.hideAllLabelsBelow);
  const fitOverflowPolicy = fitCommon((fit) => fit.overflowPolicy);
  const isRingLayout = activeLayout !== null && ["ring", "dual-ring", "ring-core", "technical-orbit"].includes(activeLayout);
  const flagContent = (role: LabelRoleId) => optionCommon((config) =>
    config?.flag?.content?.[role] ?? DEFAULT_FLAG_LABEL_OPTIONS.content[role] ?? false
  );
  const moveFlagContentRole = (direction: -1 | 1) => {
    const order = [...(flagContentOrder.value ?? DEFAULT_FLAG_LABEL_OPTIONS.contentOrder)];
    const index = order.indexOf(flagContentRole);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return;
    [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
    apply({ flag: { contentOrder: order } });
  };

  return (
    <PreviewCancelContext.Provider value={onPreviewCancel}>
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
      {!detailed && (
        <button type="button" className="m1-primary-btn" onClick={() => openWidget("label-studio")}>
          DETAILED LABEL SETTINGS
        </button>
      )}

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

      {detailed && <WidgetSection title="Name Style">{roleStyleControls("name")}</WidgetSection>}

      {detailed && <WidgetSection title="Area Style">
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
      </WidgetSection>}

      {detailed && <WidgetSection title="Body Style">
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
      </WidgetSection>}

      {detailed && <WidgetSection title="No. / Metadata Style">
        <p className="m1-empty-note">Stable Space No.</p>
        {roleStyleControls("no")}
        <p className="m1-empty-note">Category · Privacy metadata</p>
        {roleStyleControls("metadata")}
      </WidgetSection>}

      {detailed && <WidgetSection title="Alignment">
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
      </WidgetSection>}

      <WidgetSection title="Scale" defaultOpen>
        <ChipRow
          options={CELL_LABEL_SCALE_OPTIONS.map(({ id, label }) => ({ id, label }))}
          value={labelScaleMode}
          onChange={(value) => setSettings({ labelScaleMode: value })}
          ariaLabel="Label scale mode"
        />
        {detailed && previewGlobalTextSize && (
          <SliderRow
            label="Global text scale"
            value={defaults.text.size}
            min={0.65}
            max={1.8}
            step={0.05}
            fmt={(value) => `${Math.round(value * 100)}%`}
            onChange={previewGlobalTextSize}
            onChangeEnd={onGlobalTextSizePreviewEnd}
            onChangeCancel={onGlobalPreviewCancel ?? onPreviewCancel}
          />
        )}
        {detailed && applyGlobalTextSize && (
          <button type="button" className="m1-link-btn" onClick={() => applyGlobalTextSize(1)}>
            Reset global text scale
          </button>
        )}
        <p className="m1-empty-note">Scale is a project-wide view setting; per-element modes live under Advanced.</p>
      </WidgetSection>

      {detailed && (
        <WidgetSection title="Fit inside Cell" hint="project default" defaultOpen>
          <SwitchRow
            label={`Fit labels inside Cell${mixedTag(fitInsideCell.mixed)}`}
            on={fitInsideCell.value !== false}
            onToggle={() => applyFit({ fitInsideCell: fitInsideCell.value === false })}
          />
          <SliderRow
            label={`Maximum Cell occupancy${mixedTag(fitMaximumOccupancy.mixed)}`}
            value={fitMaximumOccupancy.value ?? DEFAULT_LABEL_FIT_OPTIONS.maximumCellOccupancy}
            min={LABEL_FIT_BOUNDS.maximumCellOccupancy[0]}
            max={LABEL_FIT_BOUNDS.maximumCellOccupancy[1]}
            step={0.01}
            fmt={(value) => `${Math.round(value * 100)}%`}
            onChange={(value) => previewFit({ maximumCellOccupancy: value })}
            onChangeEnd={onFitPreviewEnd}
            onChangeCancel={onFitPreviewCancel}
          />
          <SliderRow
            label={`Minimum readable screen size${mixedTag(fitMinimumReadable.mixed)}`}
            value={fitMinimumReadable.value ?? DEFAULT_LABEL_FIT_OPTIONS.minimumReadableScreenSize}
            min={LABEL_FIT_BOUNDS.minimumReadableScreenSize[0]}
            max={LABEL_FIT_BOUNDS.minimumReadableScreenSize[1]}
            step={1}
            fmt={(value) => `${Math.round(value)}px`}
            onChange={(value) => previewFit({ minimumReadableScreenSize: value })}
            onChangeEnd={onFitPreviewEnd}
            onChangeCancel={onFitPreviewCancel}
          />
          <SliderRow
            label={`Maximum screen text size${mixedTag(fitMaximumText.mixed)}`}
            value={fitMaximumText.value ?? DEFAULT_LABEL_FIT_OPTIONS.maximumScreenTextSize}
            min={LABEL_FIT_BOUNDS.maximumScreenTextSize[0]}
            max={LABEL_FIT_BOUNDS.maximumScreenTextSize[1]}
            step={1}
            fmt={(value) => `${Math.round(value)}px`}
            onChange={(value) => previewFit({ maximumScreenTextSize: value })}
            onChangeEnd={onFitPreviewEnd}
            onChangeCancel={onFitPreviewCancel}
          />
          <SliderRow
            label={`Body low-zoom threshold${mixedTag(fitBodyThreshold.mixed)}`}
            value={fitBodyThreshold.value ?? DEFAULT_LABEL_FIT_OPTIONS.lowZoomBodyThreshold}
            min={LABEL_FIT_BOUNDS.lowZoomThreshold[0]}
            max={LABEL_FIT_BOUNDS.lowZoomThreshold[1]}
            step={0.05}
            fmt={(value) => value <= 0 ? "Never" : `${Math.round(value * 100)}%`}
            onChange={(value) => previewFit({ lowZoomBodyThreshold: value })}
            onChangeEnd={onFitPreviewEnd}
            onChangeCancel={onFitPreviewCancel}
          />
          <SliderRow
            label={`Metadata low-zoom threshold${mixedTag(fitMetadataThreshold.mixed)}`}
            value={fitMetadataThreshold.value ?? DEFAULT_LABEL_FIT_OPTIONS.lowZoomMetadataThreshold}
            min={LABEL_FIT_BOUNDS.lowZoomThreshold[0]}
            max={LABEL_FIT_BOUNDS.lowZoomThreshold[1]}
            step={0.05}
            fmt={(value) => value <= 0 ? "Never" : `${Math.round(value * 100)}%`}
            onChange={(value) => previewFit({ lowZoomMetadataThreshold: value })}
            onChangeEnd={onFitPreviewEnd}
            onChangeCancel={onFitPreviewCancel}
          />
          <SliderRow
            label={`Hide all labels below${mixedTag(fitHideAllThreshold.mixed)}`}
            value={fitHideAllThreshold.value ?? DEFAULT_LABEL_FIT_OPTIONS.hideAllLabelsBelow}
            min={LABEL_FIT_BOUNDS.lowZoomThreshold[0]}
            max={LABEL_FIT_BOUNDS.lowZoomThreshold[1]}
            step={0.05}
            fmt={(value) => value <= 0 ? "Never" : `${Math.round(value * 100)}%`}
            onChange={(value) => previewFit({ hideAllLabelsBelow: value })}
            onChangeEnd={onFitPreviewEnd}
            onChangeCancel={onFitPreviewCancel}
          />
          <ChipRow
            options={LABEL_OVERFLOW_POLICIES.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))}
            value={(fitOverflowPolicy.value ?? "") as (typeof LABEL_OVERFLOW_POLICIES)[number]}
            onChange={(value) => applyFit({ overflowPolicy: value })}
            ariaLabel="Label overflow policy"
          />
          <button type="button" className="m1-link-btn" onClick={() => applyFit({ ...DEFAULT_LABEL_FIT_OPTIONS })}>
            Reset fit policy to defaults
          </button>
        </WidgetSection>
      )}

      {isRingLayout && (
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
          <p className="m1-empty-note">Ring identity stays curved at every zoom. Choose Preserve, Simplify or Hide in Label Studio.</p>
        </WidgetSection>
      )}

      {detailed && isRingLayout && (
        <WidgetSection title="Ring arcs" hint="primary + secondary" defaultOpen>
          <ChipRow
            options={RING_LOW_ZOOM_BEHAVIOURS.map((id) => ({
              id,
              label: id === "hide" ? "Hide below threshold" : id.charAt(0).toUpperCase() + id.slice(1),
            }))}
            value={(ringLowZoomBehaviour.value ?? "") as (typeof RING_LOW_ZOOM_BEHAVIOURS)[number]}
            onChange={(value) => apply({ ring: { lowZoomBehavior: value } })}
            ariaLabel="Ring low zoom behavior"
          />
          <SliderRow
            label={`Ring hide below zoom${mixedTag(ringHideBelowZoom.mixed)}`}
            value={ringHideBelowZoom.value ?? DEFAULT_RING_LABEL_OPTIONS.hideBelowZoom}
            min={LABEL_FIT_BOUNDS.lowZoomThreshold[0]}
            max={LABEL_FIT_BOUNDS.lowZoomThreshold[1]}
            step={0.05}
            fmt={(value) => value <= 0 ? "Never" : `${Math.round(value * 100)}%`}
            onChange={(value) => preview({ ring: { hideBelowZoom: value } })}
            onChangeEnd={onPreviewEnd}
          />
          {RING_ARC_KEYS.map((key) => {
            const label = key === "primaryArc" ? "Primary arc" : "Secondary arc";
            const source = ringArcCommon(key, (arc) => arc.source);
            const radius = ringArcCommon(key, (arc) => arc.radiusRatio);
            const angle = ringArcCommon(key, (arc) => arc.startAngleDeg);
            const span = ringArcCommon(key, (arc) => arc.arcSpanDeg);
            const direction = ringArcCommon(key, (arc) => arc.direction);
            const orientation = ringArcCommon(key, (arc) => arc.orientation);
            const fontRole = ringArcCommon(key, (arc) => arc.fontRole);
            const tracking = ringArcCommon(key, (arc) => arc.trackingEm);
            const opacity = ringArcCommon(key, (arc) => arc.opacity);
            const maxChars = ringArcCommon(key, (arc) => arc.maxChars);
            const ellipsis = ringArcCommon(key, (arc) => arc.ellipsis);
            const priority = ringArcCommon(key, (arc) => arc.lowZoomPriority);
            const readableFlip = ringArcCommon(key, (arc) => arc.readableFlip);
            const offsetX = ringArcCommon(key, (arc) => arc.offsetX);
            const offsetY = ringArcCommon(key, (arc) => arc.offsetY);
            return (
              <div key={key} className="m1-subgroup">
                <p className="m1-empty-note">{label}</p>
                <ChipRow
                  options={RING_ARC_SOURCES.map((id) => ({
                    id,
                    label: id === "space-no" ? "No." : id === "space-no-name" ? "No. + Name" : id.charAt(0).toUpperCase() + id.slice(1),
                  }))}
                  value={(source.value ?? "") as (typeof RING_ARC_SOURCES)[number]}
                  onChange={(value) => applyRingArc(key, { source: value })}
                  ariaLabel={`${label} source`}
                />
                <div className="m1-inline-row">
                  <ChipRow
                    options={RING_ARC_DIRECTIONS.map((id) => ({ id, label: id === "clockwise" ? "Clockwise" : "Counter" }))}
                    value={(direction.value ?? "") as (typeof RING_ARC_DIRECTIONS)[number]}
                    onChange={(value) => applyRingArc(key, { direction: value })}
                    ariaLabel={`${label} direction`}
                  />
                  <ChipRow
                    options={RING_ARC_ORIENTATIONS.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))}
                    value={(orientation.value ?? "") as (typeof RING_ARC_ORIENTATIONS)[number]}
                    onChange={(value) => applyRingArc(key, { orientation: value })}
                    ariaLabel={`${label} orientation`}
                  />
                </div>
                <ChipRow
                  options={elementRoles.map((id) => ({ id, label: ROLE_LABELS[id] }))}
                  value={(fontRole.value ?? "") as LabelRoleId}
                  onChange={(value) => applyRingArc(key, { fontRole: value })}
                  ariaLabel={`${label} typography role`}
                />
                <SliderRow
                  label={`${label} radius${mixedTag(radius.mixed)}`}
                  value={radius.value ?? resolvedRingArc(undefined, key).radiusRatio}
                  min={RING_ARC_BOUNDS.radiusRatio[0]}
                  max={RING_ARC_BOUNDS.radiusRatio[1]}
                  step={0.01}
                  fmt={(value) => `${Math.round(value * 100)}%`}
                  onChange={(value) => previewRingArc(key, { radiusRatio: value })}
                  onChangeEnd={onPreviewEnd}
                />
                <SliderRow
                  label={`${label} start angle${mixedTag(angle.mixed)}`}
                  value={angle.value ?? 0}
                  min={RING_ARC_BOUNDS.startAngleDeg[0]}
                  max={RING_ARC_BOUNDS.startAngleDeg[1]}
                  step={1}
                  fmt={(value) => `${Math.round(value)}°`}
                  onChange={(value) => previewRingArc(key, { startAngleDeg: value })}
                  onChangeEnd={onPreviewEnd}
                />
                <SliderRow
                  label={`${label} span${mixedTag(span.mixed)}`}
                  value={span.value ?? resolvedRingArc(undefined, key).arcSpanDeg}
                  min={RING_ARC_BOUNDS.arcSpanDeg[0]}
                  max={RING_ARC_BOUNDS.arcSpanDeg[1]}
                  step={1}
                  fmt={(value) => `${Math.round(value)}°`}
                  onChange={(value) => previewRingArc(key, { arcSpanDeg: value })}
                  onChangeEnd={onPreviewEnd}
                />
                <SliderRow
                  label={`${label} horizontal offset${mixedTag(offsetX.mixed)}`}
                  value={offsetX.value ?? 0}
                  min={RING_ARC_BOUNDS.offset[0]}
                  max={RING_ARC_BOUNDS.offset[1]}
                  step={1}
                  onChange={(value) => previewRingArc(key, { offsetX: value })}
                  onChangeEnd={onPreviewEnd}
                />
                <SliderRow
                  label={`${label} vertical offset${mixedTag(offsetY.mixed)}`}
                  value={offsetY.value ?? 0}
                  min={RING_ARC_BOUNDS.offset[0]}
                  max={RING_ARC_BOUNDS.offset[1]}
                  step={1}
                  onChange={(value) => previewRingArc(key, { offsetY: value })}
                  onChangeEnd={onPreviewEnd}
                />
                <SliderRow
                  label={`${label} tracking${mixedTag(tracking.mixed)}`}
                  value={tracking.value ?? resolvedRingArc(undefined, key).trackingEm}
                  min={RING_ARC_BOUNDS.trackingEm[0]}
                  max={RING_ARC_BOUNDS.trackingEm[1]}
                  step={0.01}
                  onChange={(value) => previewRingArc(key, { trackingEm: value })}
                  onChangeEnd={onPreviewEnd}
                />
                <SliderRow
                  label={`${label} opacity${mixedTag(opacity.mixed)}`}
                  value={opacity.value ?? 1}
                  min={RING_ARC_BOUNDS.opacity[0]}
                  max={RING_ARC_BOUNDS.opacity[1]}
                  step={0.02}
                  fmt={(value) => `${Math.round(value * 100)}%`}
                  onChange={(value) => previewRingArc(key, { opacity: value })}
                  onChangeEnd={onPreviewEnd}
                />
                <SliderRow
                  label={`${label} maximum characters${mixedTag(maxChars.mixed)}`}
                  value={maxChars.value ?? resolvedRingArc(undefined, key).maxChars}
                  min={RING_ARC_BOUNDS.maxChars[0]}
                  max={RING_ARC_BOUNDS.maxChars[1]}
                  step={1}
                  onChange={(value) => previewRingArc(key, { maxChars: Math.round(value) })}
                  onChangeEnd={onPreviewEnd}
                />
                <SliderRow
                  label={`${label} low-zoom priority${mixedTag(priority.mixed)}`}
                  value={priority.value ?? resolvedRingArc(undefined, key).lowZoomPriority}
                  min={RING_ARC_BOUNDS.lowZoomPriority[0]}
                  max={RING_ARC_BOUNDS.lowZoomPriority[1]}
                  step={1}
                  onChange={(value) => previewRingArc(key, { lowZoomPriority: Math.round(value) })}
                  onChangeEnd={onPreviewEnd}
                />
                <SwitchRow
                  label={`Ellipsis${mixedTag(ellipsis.mixed)}`}
                  on={ellipsis.value !== false}
                  onToggle={() => applyRingArc(key, { ellipsis: ellipsis.value === false })}
                />
                <SwitchRow
                  label={`Keep text upright${mixedTag(readableFlip.mixed)}`}
                  on={readableFlip.value !== false}
                  onToggle={() => applyRingArc(key, { readableFlip: readableFlip.value === false })}
                />
              </div>
            );
          })}
          <button type="button" className="m1-link-btn" onClick={() => apply({ ring: { ...DEFAULT_RING_LABEL_OPTIONS } })}>
            Reset Ring defaults
          </button>
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

      {detailed && activeLayout === "flag" && (
        <>
          <WidgetSection title="Flag placement" hint="presentation only" defaultOpen>
            <SliderRow
              label={`Custom anchor angle${mixedTag(flagAnchorAngle.mixed)}`}
              value={flagAnchorAngle.value ?? DEFAULT_FLAG_LABEL_OPTIONS.anchorAngleDeg}
              min={RING_LABEL_BOUNDS.startAngleDeg[0]}
              max={RING_LABEL_BOUNDS.startAngleDeg[1]}
              step={1}
              fmt={(value) => `${Math.round(value)}°`}
              onChange={(value) => preview({ flag: { anchorAngleDeg: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Radial offset${mixedTag(flagRadialOffset.mixed)}`}
              value={flagRadialOffset.value ?? DEFAULT_FLAG_LABEL_OPTIONS.radialOffset}
              min={FLAG_LABEL_BOUNDS.offset[0]}
              max={FLAG_LABEL_BOUNDS.offset[1]}
              step={1}
              onChange={(value) => preview({ flag: { radialOffset: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Horizontal offset${mixedTag(flagOffsetX.mixed)}`}
              value={flagOffsetX.value ?? DEFAULT_FLAG_LABEL_OPTIONS.offsetX}
              min={FLAG_LABEL_BOUNDS.offset[0]}
              max={FLAG_LABEL_BOUNDS.offset[1]}
              step={1}
              onChange={(value) => preview({ flag: { offsetX: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Vertical offset${mixedTag(flagOffsetY.mixed)}`}
              value={flagOffsetY.value ?? DEFAULT_FLAG_LABEL_OPTIONS.offsetY}
              min={FLAG_LABEL_BOUNDS.offset[0]}
              max={FLAG_LABEL_BOUNDS.offset[1]}
              step={1}
              onChange={(value) => preview({ flag: { offsetY: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SwitchRow
              label={`Clamp to frame${mixedTag(flagClamp.mixed)}`}
              on={flagClamp.value !== false}
              onToggle={() => apply({ flag: { clampToFrame: flagClamp.value === false } })}
            />
            <SwitchRow
              label={`Avoid source Cell${mixedTag(flagAvoidSource.mixed)}`}
              on={flagAvoidSource.value !== false}
              onToggle={() => apply({ flag: { avoidSourceCell: flagAvoidSource.value === false } })}
            />
          </WidgetSection>

          <WidgetSection title="Flag leader" defaultOpen>
            <ChipRow
              options={FLAG_LEADER_KINDS.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))}
              value={(flagLeader.value ?? "") as (typeof FLAG_LEADER_KINDS)[number]}
              onChange={(value) => apply({ flag: { leader: value } })}
              ariaLabel="Flag leader kind"
            />
            <ChipRow
              options={FLAG_LINE_STYLES.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))}
              value={(flagLineStyle.value ?? "") as (typeof FLAG_LINE_STYLES)[number]}
              onChange={(value) => apply({ flag: { lineStyle: value } })}
              ariaLabel="Flag leader line style"
            />
            <ChipRow
              options={FLAG_ENDPOINTS.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))}
              value={(flagEndpoint.value ?? "") as (typeof FLAG_ENDPOINTS)[number]}
              onChange={(value) => apply({ flag: { endpoint: value } })}
              ariaLabel="Flag leader endpoint"
            />
            <SliderRow
              label={`Line thickness${mixedTag(flagLineThickness.mixed)}`}
              value={flagLineThickness.value ?? DEFAULT_FLAG_LABEL_OPTIONS.lineThickness}
              min={FLAG_LABEL_BOUNDS.lineThickness[0]}
              max={FLAG_LABEL_BOUNDS.lineThickness[1]}
              step={0.25}
              onChange={(value) => preview({ flag: { lineThickness: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Line opacity${mixedTag(flagLineOpacity.mixed)}`}
              value={flagLineOpacity.value ?? DEFAULT_FLAG_LABEL_OPTIONS.lineOpacity}
              min={FLAG_LABEL_BOUNDS.opacity[0]}
              max={FLAG_LABEL_BOUNDS.opacity[1]}
              step={0.02}
              fmt={(value) => `${Math.round(value * 100)}%`}
              onChange={(value) => preview({ flag: { lineOpacity: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Elbow length${mixedTag(flagElbowLength.mixed)}`}
              value={flagElbowLength.value ?? DEFAULT_FLAG_LABEL_OPTIONS.elbowLength}
              min={FLAG_LABEL_BOUNDS.elbowLength[0]}
              max={FLAG_LABEL_BOUNDS.elbowLength[1]}
              step={1}
              onChange={(value) => preview({ flag: { elbowLength: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Curve amount${mixedTag(flagCurvature.mixed)}`}
              value={flagCurvature.value ?? DEFAULT_FLAG_LABEL_OPTIONS.curvature}
              min={FLAG_LABEL_BOUNDS.curvature[0]}
              max={FLAG_LABEL_BOUNDS.curvature[1]}
              step={0.02}
              fmt={(value) => `${Math.round(value * 100)}%`}
              onChange={(value) => preview({ flag: { curvature: value } })}
              onChangeEnd={onPreviewEnd}
            />
          </WidgetSection>

          <WidgetSection title="Flag panel" defaultOpen>
            <SwitchRow
              label={`Auto width${mixedTag(flagAutoWidth.mixed)}`}
              on={flagAutoWidth.value !== false}
              onToggle={() => apply({ flag: { autoWidth: flagAutoWidth.value === false } })}
            />
            <SliderRow
              label={`Minimum panel width${mixedTag(flagMinimumWidth.mixed)}`}
              value={flagMinimumWidth.value ?? DEFAULT_FLAG_LABEL_OPTIONS.minimumWidth}
              min={FLAG_LABEL_BOUNDS.width[0]}
              max={FLAG_LABEL_BOUNDS.width[1]}
              step={2}
              onChange={(value) => preview({ flag: { minimumWidth: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Maximum panel width${mixedTag(flagMaximumWidth.mixed)}`}
              value={flagMaximumWidth.value ?? DEFAULT_FLAG_LABEL_OPTIONS.maximumWidth}
              min={FLAG_LABEL_BOUNDS.width[0]}
              max={FLAG_LABEL_BOUNDS.width[1]}
              step={2}
              onChange={(value) => preview({ flag: { maximumWidth: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Horizontal padding${mixedTag(flagPaddingX.mixed)}`}
              value={flagPaddingX.value ?? DEFAULT_FLAG_LABEL_OPTIONS.paddingX}
              min={FLAG_LABEL_BOUNDS.padding[0]}
              max={FLAG_LABEL_BOUNDS.padding[1]}
              step={1}
              onChange={(value) => preview({ flag: { paddingX: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Vertical padding${mixedTag(flagPaddingY.mixed)}`}
              value={flagPaddingY.value ?? DEFAULT_FLAG_LABEL_OPTIONS.paddingY}
              min={FLAG_LABEL_BOUNDS.padding[0]}
              max={FLAG_LABEL_BOUNDS.padding[1]}
              step={1}
              onChange={(value) => preview({ flag: { paddingY: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Content gap${mixedTag(flagContentGap.mixed)}`}
              value={flagContentGap.value ?? DEFAULT_FLAG_LABEL_OPTIONS.contentGap}
              min={FLAG_LABEL_BOUNDS.contentGap[0]}
              max={FLAG_LABEL_BOUNDS.contentGap[1]}
              step={0.5}
              onChange={(value) => preview({ flag: { contentGap: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Corner radius${mixedTag(flagCornerRadius.mixed)}`}
              value={flagCornerRadius.value ?? DEFAULT_FLAG_LABEL_OPTIONS.cornerRadius}
              min={FLAG_LABEL_BOUNDS.cornerRadius[0]}
              max={FLAG_LABEL_BOUNDS.cornerRadius[1]}
              step={1}
              onChange={(value) => preview({ flag: { cornerRadius: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <ChipRow
              options={FLAG_PANEL_BACKGROUNDS.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))}
              value={(flagBackground.value ?? "") as (typeof FLAG_PANEL_BACKGROUNDS)[number]}
              onChange={(value) => apply({ flag: { background: value } })}
              ariaLabel="Flag panel background"
            />
            <SliderRow
              label={`Background opacity${mixedTag(flagBackgroundOpacity.mixed)}`}
              value={flagBackgroundOpacity.value ?? DEFAULT_FLAG_LABEL_OPTIONS.backgroundOpacity}
              min={FLAG_LABEL_BOUNDS.opacity[0]}
              max={FLAG_LABEL_BOUNDS.opacity[1]}
              step={0.02}
              fmt={(value) => `${Math.round(value * 100)}%`}
              onChange={(value) => preview({ flag: { backgroundOpacity: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SwitchRow
              label={`Panel border${mixedTag(flagBorder.mixed)}`}
              on={flagBorder.value !== false}
              onToggle={() => apply({ flag: { border: flagBorder.value === false } })}
            />
            <SliderRow
              label={`Border thickness${mixedTag(flagBorderThickness.mixed)}`}
              value={flagBorderThickness.value ?? DEFAULT_FLAG_LABEL_OPTIONS.borderThickness}
              min={FLAG_LABEL_BOUNDS.lineThickness[0]}
              max={FLAG_LABEL_BOUNDS.lineThickness[1]}
              step={0.25}
              onChange={(value) => preview({ flag: { borderThickness: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Border opacity${mixedTag(flagBorderOpacity.mixed)}`}
              value={flagBorderOpacity.value ?? DEFAULT_FLAG_LABEL_OPTIONS.borderOpacity}
              min={FLAG_LABEL_BOUNDS.opacity[0]}
              max={FLAG_LABEL_BOUNDS.opacity[1]}
              step={0.02}
              fmt={(value) => `${Math.round(value * 100)}%`}
              onChange={(value) => preview({ flag: { borderOpacity: value } })}
              onChangeEnd={onPreviewEnd}
            />
          </WidgetSection>

          <WidgetSection title="Flag content" defaultOpen>
            <SwitchRow
              label={`Symbol${mixedTag(flagSymbol.mixed)}`}
              on={flagSymbol.value !== false}
              onToggle={() => apply({ flag: { symbol: flagSymbol.value === false } })}
            />
            {elementRoles.map((role) => {
              const visible = flagContent(role);
              return (
                <SwitchRow
                  key={role}
                  label={`${ROLE_LABELS[role]}${mixedTag(visible.mixed)}`}
                  on={visible.value === true}
                  onToggle={() => apply({ flag: { content: { [role]: !(visible.value === true) } } })}
                />
              );
            })}
            <ChipRow
              options={elementRoles.map((id) => ({ id, label: ROLE_LABELS[id] }))}
              value={flagContentRole}
              onChange={setFlagContentRole}
              ariaLabel="Flag content order role"
            />
            <div className="m1-inline-row">
              <button type="button" className="m1-btn" onClick={() => moveFlagContentRole(-1)}>Move earlier</button>
              <button type="button" className="m1-btn" onClick={() => moveFlagContentRole(1)}>Move later</button>
            </div>
            <p className="m1-empty-note">Order: {(flagContentOrder.value ?? DEFAULT_FLAG_LABEL_OPTIONS.contentOrder).map((role) => ROLE_LABELS[role]).join(" · ")}</p>
            <SliderRow
              label={`Body line clamp${mixedTag(flagBodyLineClamp.mixed)}`}
              value={flagBodyLineClamp.value ?? DEFAULT_FLAG_LABEL_OPTIONS.bodyLineClamp}
              min={LABEL_ROLE_BOUNDS.maxLines[0]}
              max={LABEL_ROLE_BOUNDS.maxLines[1]}
              step={1}
              onChange={(value) => preview({ flag: { bodyLineClamp: Math.round(value) } })}
              onChangeEnd={onPreviewEnd}
            />
            <SwitchRow
              label={`Compact content${mixedTag(flagCompact.mixed)}`}
              on={flagCompact.value === true}
              onToggle={() => apply({ flag: { compact: !(flagCompact.value === true) } })}
            />
          </WidgetSection>

          <WidgetSection title="Flag zoom rules" defaultOpen>
            <ChipRow
              options={FLAG_ZOOM_MODES.map((id) => ({ id, label: id === "world" ? "Scale with Cell" : id === "screen" ? "Keep readable" : "Auto" }))}
              value={(flagZoomMode.value ?? "") as (typeof FLAG_ZOOM_MODES)[number]}
              onChange={(value) => apply({ flag: { zoomMode: value } })}
              ariaLabel="Flag zoom mode"
            />
            <SliderRow
              label={`Minimum panel scale${mixedTag(flagMinimumPanelScale.mixed)}`}
              value={flagMinimumPanelScale.value ?? DEFAULT_FLAG_LABEL_OPTIONS.minimumPanelScale}
              min={FLAG_LABEL_BOUNDS.panelScale[0]}
              max={FLAG_LABEL_BOUNDS.panelScale[1]}
              step={0.05}
              fmt={(value) => `${Math.round(value * 100)}%`}
              onChange={(value) => preview({ flag: { minimumPanelScale: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Maximum panel scale${mixedTag(flagMaximumPanelScale.mixed)}`}
              value={flagMaximumPanelScale.value ?? DEFAULT_FLAG_LABEL_OPTIONS.maximumPanelScale}
              min={FLAG_LABEL_BOUNDS.panelScale[0]}
              max={FLAG_LABEL_BOUNDS.panelScale[1]}
              step={0.05}
              fmt={(value) => `${Math.round(value * 100)}%`}
              onChange={(value) => preview({ flag: { maximumPanelScale: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SliderRow
              label={`Hide Flag below zoom${mixedTag(flagHideBelowZoom.mixed)}`}
              value={flagHideBelowZoom.value ?? DEFAULT_FLAG_LABEL_OPTIONS.hideBelowZoom}
              min={FLAG_LABEL_BOUNDS.hideBelowZoom[0]}
              max={FLAG_LABEL_BOUNDS.hideBelowZoom[1]}
              step={0.05}
              fmt={(value) => value <= 0 ? "Never" : `${Math.round(value * 100)}%`}
              onChange={(value) => preview({ flag: { hideBelowZoom: value } })}
              onChangeEnd={onPreviewEnd}
            />
            <SwitchRow
              label={`Keep Flag readable${mixedTag(flagKeepReadable.mixed)}`}
              on={flagKeepReadable.value !== false}
              onToggle={() => apply({ flag: { keepReadable: flagKeepReadable.value === false } })}
            />
            <button type="button" className="m1-link-btn" onClick={() => apply({ flag: { ...DEFAULT_FLAG_LABEL_OPTIONS } })}>
              Reset Flag defaults
            </button>
          </WidgetSection>
        </>
      )}

      {detailed && activeLayout === "minimal-number" && (
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

      {detailed && <WidgetSection title="Advanced offsets">
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
      </WidgetSection>}
    </section>
    </PreviewCancelContext.Provider>
  );
}
