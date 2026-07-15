import type { ReactNode } from "react";
import {
  BOUNDARY_ALIGNMENTS,
  BOUNDARY_STYLES,
  type MembraneColourMode,
  type MembraneSolidMaterialId,
  type PresentationTargetId,
} from "../../domain/presentation/types";
import {
  appearanceKeyForTarget,
  resolveInheritanceState,
} from "../../domain/presentation/editing";
import { cloneProjectPresentationDefaults, normalizeProjectPresentationDefaults } from "../../domain/presentation/validation";
import { useLab } from "../../state/store";
import { DEFAULT_CELL_SHADOW } from "../../canvas/cellShadow";
import { DEFAULT_ORGANISM_SETTINGS } from "../../canvas/organismProductionSettings";
import type { CellShadowMode, OrganismSettings } from "../../types";
import { getAreaRange, getNucleusColor } from "../../design/colorMapping";
import { MORPHS } from "../controlMeta";
import { listMembraneSolidMaterials } from "../../materials/materialRegistry";
import { ChipRow, SliderRow, SwitchRow, WidgetSection } from "./controls";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? value as Record<string, unknown> : {};

const merge = (base: unknown, patch: Record<string, unknown>): Record<string, unknown> => {
  const next = { ...asRecord(base), ...patch };
  for (const key of ["paint", "fill", "edge"] as const) {
    if (patch[key] && typeof patch[key] === "object") {
      next[key] = { ...asRecord(asRecord(base)[key]), ...asRecord(patch[key]) };
    }
  }
  return next;
};

const readPath = (value: unknown, path: readonly string[]): unknown =>
  path.reduce<unknown>((current, key) => asRecord(current)[key], value);

const mixedValue = <T,>(values: readonly T[], fallback: T): { value: T; mixed: boolean } => {
  if (!values.length) return { value: fallback, mixed: false };
  const resolved = values.map((value) => value === undefined ? fallback : value);
  const first = JSON.stringify(resolved[0]);
  return { value: resolved[0], mixed: resolved.some((value) => JSON.stringify(value) !== first) };
};

function TargetSettings({ target, children }: { target: PresentationTargetId; children: (api: {
  value: (path: readonly string[], fallback: unknown) => { value: unknown; mixed: boolean };
  commit: (patch: Record<string, unknown>) => void;
  preview: (patch: Record<string, unknown>) => void;
  commitPreview: () => void;
  inherited: string;
  selectedCount: number;
}) => ReactNode }) {
  const sharedProjectTarget = target === "membrane" || target === "membrane-edge";
  const spaces = useLab((state) => state.appearancePreview ?? state.spaces);
  const canonicalSpaces = useLab((state) => state.spaces);
  const selectedIds = useLab((state) => state.selectedIds);
  const settings = useLab((state) => state.settings);
  const defaults = useLab((state) => state.presentationDefaultsPreview ?? state.settings.presentationDefaults);
  const commitAppearancePatch = useLab((state) => state.commitAppearancePatch);
  const previewAppearancePatch = useLab((state) => state.previewAppearancePatch);
  const commitAppearancePreview = useLab((state) => state.commitAppearancePreview);
  const commitProjectDefaults = useLab((state) => state.commitProjectPresentationDefaults);
  const previewProjectDefaults = useLab((state) => state.previewProjectPresentationDefaults);
  const commitDefaultsPreview = useLab((state) => state.commitPresentationDefaultsPreview);
  const resetAppearanceTarget = useLab((state) => state.resetAppearanceTarget);
  const key = appearanceKeyForTarget(target);
  const effectiveSelectedIds = sharedProjectTarget ? [] : selectedIds;
  const selected = effectiveSelectedIds.length ? spaces.filter((space) => effectiveSelectedIds.includes(space.id)) : [];
  const canonicalSelected = effectiveSelectedIds.length ? canonicalSpaces.filter((space) => effectiveSelectedIds.includes(space.id)) : [];
  const resolvedTargets = selected.length
    ? selected.map((space) => merge(defaults[key], asRecord(space.appearance?.[key])))
    : [asRecord(defaults[key])];
  const inheritance = effectiveSelectedIds.length
    ? resolveInheritanceState(canonicalSelected.map((space) => space.appearance), target)
    : "project-default";

  const defaultPatch = (patch: Record<string, unknown>, preview: boolean) => {
    const next = cloneProjectPresentationDefaults(defaults);
    (next as unknown as Record<string, unknown>)[key] = merge(next[key], patch);
    const normalized = normalizeProjectPresentationDefaults(next, settings);
    if (preview) previewProjectDefaults(normalized);
    else commitProjectDefaults(normalized);
  };
  const commit = (patch: Record<string, unknown>) => effectiveSelectedIds.length
    ? commitAppearancePatch(effectiveSelectedIds, target, patch)
    : defaultPatch(patch, false);
  const preview = (patch: Record<string, unknown>) => effectiveSelectedIds.length
    ? previewAppearancePatch(effectiveSelectedIds, target, patch)
    : defaultPatch(patch, true);

  return (
    <div className="m1-settings" data-target={target}>
      <div className="m1-scope-row">
        <span>{sharedProjectTarget ? "Project Defaults · shared field" : effectiveSelectedIds.length ? `${effectiveSelectedIds.length} selected` : "Project Defaults"}</span>
        <span className="m1-state-badge" data-state={inheritance}>{inheritance.replace("-", " ")}</span>
      </div>
      {children({
        value: (path, fallback) => mixedValue(resolvedTargets.map((item) => readPath(item, path)), fallback),
        commit,
        preview,
        commitPreview: effectiveSelectedIds.length ? commitAppearancePreview : commitDefaultsPreview,
        inherited: inheritance,
        selectedCount: effectiveSelectedIds.length,
      })}
      <div className="m1-action-row">
        <button type="button" className="m1-btn" onClick={() => effectiveSelectedIds.length
          ? resetAppearanceTarget(effectiveSelectedIds, target)
          : commitProjectDefaults(normalizeProjectPresentationDefaults({
              ...defaults,
              [key]: cloneProjectPresentationDefaults(useLab.getInitialState().settings.presentationDefaults)[key],
            }, settings))}
        >Return to Default</button>
      </div>
    </div>
  );
}

function OpacityControl({ api, path = "paint" }: {
  api: Parameters<Parameters<typeof TargetSettings>[0]["children"]>[0];
  path?: "paint" | "fill" | "edge";
}) {
  const opacity = api.value([path, "opacity"], 1);
  return <SliderRow
    label={`Opacity${opacity.mixed ? " · Mixed" : ""}`}
    value={typeof opacity.value === "number" ? opacity.value : 1}
    min={0}
    max={1}
    step={0.01}
    fmt={(value) => `${Math.round(value * 100)}%`}
    onChange={(value) => api.preview({ [path]: { opacity: value } })}
    onChangeEnd={api.commitPreview}
  />;
}

function PaintControls({ api, path = "paint", label = "Colour" }: {
  api: Parameters<Parameters<typeof TargetSettings>[0]["children"]>[0];
  path?: "paint" | "fill" | "edge";
  label?: string;
}) {
  const spaces = useLab((state) => state.spaces);
  const selectedIds = useLab((state) => state.selectedIds);
  const paletteMode = useLab((state) => state.settings.paletteMode);
  const nucleusPaletteId = useLab((state) => state.settings.nucleusPaletteId);
  const colorSource = useLab((state) => state.settings.colorSource);
  const colour = api.value([path, "colour"], null);
  const displayColour = typeof colour.value === "string" ? colour.value : "#6f7f75";
  const reference = spaces.find((space) => selectedIds.includes(space.id)) ?? spaces.find((space) => space.kind !== "void");
  const mapped = reference ? getNucleusColor(reference, paletteMode, getAreaRange(spaces), nucleusPaletteId, colorSource) : null;
  const swatches = [...new Set([mapped?.fill, mapped?.ring, mapped?.muted, "#171715", "#f7f6f2"].filter((value): value is string => Boolean(value)))];
  return (
    <>
      <label className="m1-colour-row">
        <span>{label}{colour.mixed ? " · Mixed" : ""}</span>
        <input
          type="color"
          value={displayColour}
          aria-label={label}
          onChange={(event) => api.commit({ [path]: { colour: event.target.value } })}
        />
      </label>
      <div className="m1-swatch-row" aria-label={`${label} project palette choices`}>
        {swatches.map((swatch) => <button key={swatch} type="button" title={swatch} aria-label={`Use ${swatch}`} style={{ background: swatch }} data-active={colour.value === swatch} onClick={() => api.commit({ [path]: { colour: swatch } })} />)}
      </div>
      <OpacityControl api={api} path={path} />
    </>
  );
}

type TargetApi = Parameters<Parameters<typeof TargetSettings>[0]["children"]>[0];

/** One current six-style control owner shared by Boundary and Void Edge. */
function StrokeStyleControls({ api, label }: { api: TargetApi; label: string }) {
  const style = api.value(["style"], "solid");
  const technical = style.value !== "solid";
  return <>
    <ChipRow
      options={BOUNDARY_STYLES.map((id) => ({ id, label: id === "segmented-bars" ? "Bars" : id }))}
      value={style.value as typeof BOUNDARY_STYLES[number]}
      onChange={(next) => api.commit({ style: next })}
      ariaLabel={`${label} style`}
    />
    {technical && <>
      <SliderRow label="Dash / bar length" value={Number(api.value(["dashLength"], 8).value)} min={0.25} max={64} step={0.25} onChange={(value) => api.preview({ dashLength: value })} onChangeEnd={api.commitPreview} />
      <SliderRow label="Gap length" value={Number(api.value(["gapLength"], 6).value)} min={0.25} max={64} step={0.25} onChange={(value) => api.preview({ gapLength: value })} onChangeEnd={api.commitPreview} />
    </>}
    {style.value === "double" && <SliderRow label="Double-line spacing" value={Number(api.value(["secondaryLineSpacing"], 3).value)} min={0} max={24} step={0.25} onChange={(value) => api.preview({ secondaryLineSpacing: value })} onChangeEnd={api.commitPreview} />}
  </>;
}

function CellSurfaceTarget() {
  return <TargetSettings target="cell">{(api) => {
    const visible = api.value(["visible"], true);
    return <WidgetSection title="Cell Surface" defaultOpen extra={
      <span className="m1-state-dot" data-on={Boolean(visible.value)} />
    }>
      <SwitchRow label={visible.mixed ? "Visible · Mixed" : "Visible"} on={Boolean(visible.value)} onToggle={() => api.commit({ visible: !visible.value })} />
      <PaintControls api={api} label="Fill colour" />
    </WidgetSection>;
  }}</TargetSettings>;
}

function CellShadowControls() {
  const canonical = useLab((state) => state.settings.cellShadow);
  const preview = useLab((state) => state.visualSettingsPreview?.cellShadow);
  const shadow = preview ?? canonical;
  const commit = useLab((state) => state.commitVisualSettings);
  const previewVisual = useLab((state) => state.previewVisualSettings);
  const commitPreview = useLab((state) => state.commitVisualSettingsPreview);
  const setMode = (mode: CellShadowMode) => commit({ cellShadow: mode === "off"
    ? { enabled: false, mode: "off" }
    : mode === "soft"
      ? { enabled: true, mode, softness: 24, offsetY: 9 }
      : { enabled: true, mode, softness: 8, offsetY: 5 }
  });
  const slider = (label: string, key: "strength" | "opacity" | "softness" | "offsetX" | "offsetY" | "spread", min: number, max: number, step: number) => <SliderRow
    label={label}
    value={shadow[key]}
    min={min}
    max={max}
    step={step}
    fmt={key === "strength" || key === "opacity" ? (value) => `${Math.round(value * 100)}%` : undefined}
    onChange={(value) => previewVisual({ cellShadow: { [key]: value } })}
    onChangeEnd={commitPreview}
  />;
  return <>
    <WidgetSection title="Cell Shadow" hint="presentation only" defaultOpen>
      <ChipRow options={(["off", "soft", "defined"] as const).map((id) => ({ id, label: id }))} value={shadow.mode} onChange={setMode} ariaLabel="Cell Shadow mode" />
      {slider("Shadow Strength", "strength", 0, 1, 0.01)}
    </WidgetSection>
    <WidgetSection title="Shadow Advanced">
      {slider("Opacity", "opacity", 0, 1, 0.01)}
      {slider("Softness", "softness", 0, 64, 1)}
      {slider("Offset X", "offsetX", -64, 64, 1)}
      {slider("Offset Y", "offsetY", -64, 64, 1)}
      {slider("Spread", "spread", -32, 32, 1)}
      <SwitchRow label="Auto colour" on={shadow.colorMode === "auto"} onToggle={() => commit({ cellShadow: { colorMode: shadow.colorMode === "auto" ? "custom" : "auto" } })} />
      <label className="m1-colour-row"><span>Custom shadow colour</span><input type="color" value={shadow.color} disabled={shadow.colorMode !== "custom"} aria-label="Custom shadow colour" onChange={(event) => commit({ cellShadow: { colorMode: "custom", color: event.target.value } })} /></label>
      <SwitchRow label="Include in export" on={shadow.includeInExport} onToggle={() => commit({ cellShadow: { includeInExport: !shadow.includeInExport } })} />
      <button type="button" className="m1-btn" onClick={() => commit({ cellShadow: DEFAULT_CELL_SHADOW })}>Reset Shadow</button>
    </WidgetSection>
  </>;
}

function OrganismAdvancedControls() {
  const canonical = useLab((state) => state.settings.organism);
  const preview = useLab((state) => state.visualSettingsPreview?.organism);
  const organism = preview ?? canonical;
  const commit = useLab((state) => state.commitVisualSettings);
  const previewVisual = useLab((state) => state.previewVisualSettings);
  const commitPreview = useLab((state) => state.commitVisualSettingsPreview);
  const slider = (label: string, key: keyof Pick<OrganismSettings, "edgeSoftness" | "surfaceTension" | "isoLevel" | "mass" | "connectionBias" | "nucleusStrength" | "radiusMin" | "radiusMax" | "sizeVariation" | "offsetX" | "offsetY" | "timeScale" | "response" | "drift" | "breathing" | "wobble" | "phaseVariation">, min: number, max: number, step: number) => <SliderRow
    label={label}
    value={organism[key]}
    min={min}
    max={max}
    step={step}
    onChange={(value) => previewVisual({ organism: { [key]: value } })}
    onChangeEnd={commitPreview}
  />;
  return <>
    <WidgetSection title="Field Advanced" hint="renderer-owned">
      {slider("Field Edge Softness", "edgeSoftness", 0.004, 0.3, 0.002)}
      {slider("Surface Tension", "surfaceTension", 0.6, 1.6, 0.01)}
      {slider("Iso Level", "isoLevel", 0.5, 2, 0.01)}
      {slider("Mass / influence", "mass", 0.5, 2.2, 0.01)}
      {slider("Connection bias", "connectionBias", 0, 1, 0.01)}
      {slider("Distribution strength", "nucleusStrength", 0.4, 1.8, 0.01)}
      {slider("Radius minimum", "radiusMin", 0.008, 0.15, 0.002)}
      {slider("Radius maximum", "radiusMax", 0.15, 0.7, 0.005)}
      {slider("Size variation", "sizeVariation", 0, 1, 0.01)}
      {slider("Presentation offset X", "offsetX", -0.6, 0.6, 0.01)}
      {slider("Presentation offset Y", "offsetY", -0.6, 0.6, 0.01)}
      <button type="button" className="m1-btn" onClick={() => commit({ organism: DEFAULT_ORGANISM_SETTINGS })}>Reset Field & Motion</button>
    </WidgetSection>
    <WidgetSection title="Motion" hint="canonical runtime gate">
      <SwitchRow label="Motion" on={organism.motionEnabled} onToggle={() => commit({ organism: { motionEnabled: !organism.motionEnabled } })} />
      <SwitchRow label="Idle motion" on={organism.idleMotion} onToggle={() => commit({ organism: { idleMotion: !organism.idleMotion } })} />
      {slider("Speed / time scale", "timeScale", 0, 2.5, 0.01)}
      {slider("Response", "response", 1, 18, 0.1)}
      {slider("Drift", "drift", 0, 1, 0.01)}
      {slider("Breathing", "breathing", 0, 1, 0.01)}
      {slider("Wobble", "wobble", 0, 1, 0.01)}
      {slider("Phase variation", "phaseVariation", 0, 1, 0.01)}
    </WidgetSection>
  </>;
}

function BoundaryTarget() {
  return <TargetSettings target="boundary">{(api) => {
    const visible = api.value(["visible"], false);
    const width = api.value(["width"], 1.5);
    const offset = api.value(["offset"], 0);
    const alignment = api.value(["alignment"], "centre");
    return <>
      <WidgetSection title="Boundary" defaultOpen>
        <SwitchRow label={visible.mixed ? "Visible · Mixed" : "Visible"} on={Boolean(visible.value)} onToggle={() => api.commit({ visible: !visible.value })} />
        <StrokeStyleControls api={api} label="Boundary" />
        <SliderRow label={`Width${width.mixed ? " · Mixed" : ""}`} value={Number(width.value)} min={0} max={16} step={0.25} fmt={(v) => `${v}px`} onChange={(value) => api.preview({ width: value })} onChangeEnd={api.commitPreview} />
        <ChipRow options={BOUNDARY_ALIGNMENTS.map((id) => ({ id, label: id }))} value={alignment.value as typeof BOUNDARY_ALIGNMENTS[number]} onChange={(next) => api.commit({ alignment: next })} ariaLabel="Boundary alignment" />
        <SliderRow label="Visual offset" value={Number(offset.value)} min={-24} max={24} step={0.5} fmt={(v) => `${v}px`} onChange={(value) => api.preview({ offset: value })} onChangeEnd={api.commitPreview} />
        <PaintControls api={api} label="Stroke colour" />
      </WidgetSection>
    </>;
  }}</TargetSettings>;
}

function MembraneFieldTarget() {
  const settings = useLab((state) => state.membraneRuntimePreview ?? state.settings);
  const commitRuntime = useLab((state) => state.commitMembraneRuntime);
  const previewRuntime = useLab((state) => state.previewMembraneRuntime);
  const commitRuntimePreview = useLab((state) => state.commitMembraneRuntimePreview);
  return <TargetSettings target="membrane">{(api) => {
    const visible = api.value(["visible"], false);
    const colourMode = api.value(["colourMode"], "cell-gradient");
    const solidMaterialId = api.value(["solidMaterialId"], "system:black");
    const customColour = api.value(["paint", "colour"], null);
    const solidOptions = [
      ...listMembraneSolidMaterials().map((material) => ({
        id: material.id as Exclude<MembraneSolidMaterialId, "custom">,
        label: material.name,
      })),
      { id: "custom" as const, label: "Custom" },
    ];
    return <>
      <WidgetSection title="Membrane Field" defaultOpen>
        <SwitchRow label={visible.mixed ? "Visible · Mixed" : "Visible"} on={Boolean(visible.value)} onToggle={() => api.commit({ visible: !visible.value })} />
        <span className="org-subcap">colour source</span>
        <ChipRow
          options={[
            { id: "cell-gradient", label: "Cell Gradient" },
            { id: "solid", label: "Solid" },
          ] as const}
          value={colourMode.value as MembraneColourMode}
          onChange={(next) => api.commit({ colourMode: next })}
          ariaLabel="Membrane colour source"
        />
        {colourMode.value === "cell-gradient" ? (
          <PaintControls api={api} label="Gradient base colour" />
        ) : (
          <>
            <span className="org-subcap">solid colour</span>
            <ChipRow
              options={solidOptions}
              value={solidMaterialId.value as MembraneSolidMaterialId}
              onChange={(next) => api.commit({
                colourMode: "solid",
                solidMaterialId: next,
                ...(next === "custom" && typeof customColour.value !== "string"
                  ? { paint: { colour: "#6f7f75" } }
                  : {}),
              })}
              ariaLabel="Solid Membrane colour"
            />
            {solidMaterialId.value === "custom"
              ? <PaintControls api={api} label="Custom colour" />
              : <OpacityControl api={api} />}
          </>
        )}
      </WidgetSection>
      <WidgetSection title="Fusion" hint="existing runtime owner" defaultOpen>
        <span className="org-subcap">field character</span>
        <ChipRow options={MORPHS} value={settings.morphMode} onChange={(morphMode) => commitRuntime({ morphMode })} ariaLabel="Membrane field character" />
        <span className="org-subcap">fusion range</span>
        <ChipRow options={(["tight", "soft", "long", "extreme"] as const).map((id) => ({ id, label: id }))} value={settings.attachMode} onChange={(attachMode) => commitRuntime({ attachMode })} ariaLabel="Membrane fusion range" />
        <SliderRow label="Reach" value={settings.mergeDistance} min={0} max={300} step={1} fmt={(value) => `${value}px`} onChange={(mergeDistance) => previewRuntime({ mergeDistance })} onChangeEnd={commitRuntimePreview} />
      </WidgetSection>
      <OrganismAdvancedControls />
      <p className="m1-compat-note">Shared organism field · edits Project Defaults for every Cell.</p>
    </>;
  }}</TargetSettings>;
}

function MembraneEdgeTarget() {
  return <TargetSettings target="membrane-edge">{(api) => {
    const visible = api.value(["visible"], false);
    const width = api.value(["width"], 1);
    const softness = api.value(["softness"], 0.08);
    return <>
      <WidgetSection title="Membrane Edge" defaultOpen>
        <SwitchRow label={visible.mixed ? "Visible · Mixed" : "Visible"} on={Boolean(visible.value)} onToggle={() => api.commit({ visible: !visible.value })} />
        <SliderRow label={`Width${width.mixed ? " · Mixed" : ""}`} value={Number(width.value)} min={0} max={16} step={0.25} fmt={(v) => `${v}px`} onChange={(value) => api.preview({ width: value })} onChangeEnd={api.commitPreview} />
        <SliderRow label={`Edge Softness${softness.mixed ? " · Mixed" : ""}`} value={Number(softness.value)} min={0} max={1} step={0.01} fmt={(v) => `${Math.round(v * 100)}%`} onChange={(value) => api.preview({ softness: value })} onChangeEnd={api.commitPreview} />
        <PaintControls api={api} label="Edge colour" />
      </WidgetSection>
      <p className="m1-compat-note">Shared organism edge · edits Project Defaults for every Cell.</p>
    </>;
  }}</TargetSettings>;
}

function CoreTarget() {
  return <TargetSettings target="core">{(api) => {
    const visible = api.value(["visible"], true);
    const size = api.value(["size"], 0.34);
    const colour = api.value(["paint", "colour"], null);
    return <WidgetSection title="Core / nucleus" defaultOpen>
      <p className="m1-compat-note">Core / nucleus is the optional centre marker. It is separate from selection, Boundary, the Membrane field and debug geometry.</p>
      <SwitchRow label={visible.mixed ? "Visible · Mixed" : "Visible"} on={Boolean(visible.value)} onToggle={() => api.commit({ visible: !visible.value })} />
      <SliderRow label={`Size${size.mixed ? " · Mixed" : ""}`} value={Number(size.value)} min={0.1} max={2} step={0.01} fmt={(v) => `${Math.round(v * 100)}%`} onChange={(value) => api.preview({ size: value })} onChangeEnd={api.commitPreview} />
      <SliderRow label="Offset X" value={Number(api.value(["offsetX"], 0).value)} min={-64} max={64} step={1} fmt={(v) => `${v}px`} onChange={(value) => api.preview({ offsetX: value })} onChangeEnd={api.commitPreview} />
      <SliderRow label="Offset Y" value={Number(api.value(["offsetY"], 0).value)} min={-64} max={64} step={1} fmt={(v) => `${v}px`} onChange={(value) => api.preview({ offsetY: value })} onChangeEnd={api.commitPreview} />
      <SwitchRow label="Auto Contrast" on={colour.value === null || colour.value === undefined} onToggle={() => api.commit({ paint: { colour: colour.value == null ? "#171715" : undefined } })} />
      <PaintControls api={api} label="Core colour" />
    </WidgetSection>;
  }}</TargetSettings>;
}

export function CellSettingsWidget() {
  return <div className="m1-family-settings" data-family="cell">
    <p className="m1-compat-note">Surface, Boundary and Core/nucleus retain separate canonical targets.</p>
    <CellSurfaceTarget />
    <CellShadowControls />
    <BoundaryTarget />
    <CoreTarget />
  </div>;
}

export function MembraneSettingsWidget() {
  return <div className="m1-family-settings" data-family="membrane">
    <p className="m1-compat-note">Field and Edge retain separate shared canonical targets.</p>
    <MembraneFieldTarget />
    <MembraneEdgeTarget />
  </div>;
}

export function VoidSettingsWidget() {
  return <TargetSettings target="void">{(api) => {
    const visible = api.value(["visible"], true);
    const edgeWidth = api.value(["edgeWidth"], 1.5);
    const fillVisible = api.value(["fillVisible"], true);
    const edgeVisible = api.value(["edgeVisible"], true);
    return <>
      <WidgetSection title="Void fill" defaultOpen>
        <SwitchRow label="Fill visible" on={Boolean(visible.value) && Boolean(fillVisible.value)} onToggle={() => api.commit({ visible: true, fillVisible: !fillVisible.value })} />
        <PaintControls api={api} path="fill" label="Fill colour" />
      </WidgetSection>
      <WidgetSection title="Void edge" defaultOpen>
        <SwitchRow label="Edge visible" on={Boolean(visible.value) && Boolean(edgeVisible.value)} onToggle={() => api.commit({ visible: true, edgeVisible: !edgeVisible.value })} />
        <StrokeStyleControls api={api} label="Void edge" />
        <SliderRow label="Edge width" value={Number(edgeWidth.value)} min={0} max={16} step={0.25} fmt={(v) => `${v}px`} onChange={(value) => api.preview({ edgeWidth: value })} onChangeEnd={api.commitPreview} />
        <PaintControls api={api} path="edge" label="Edge colour" />
      </WidgetSection>
      <p className="m1-compat-note">Appearance only · subtractive area, hit testing and clearance stay unchanged.</p>
    </>;
  }}</TargetSettings>;
}
