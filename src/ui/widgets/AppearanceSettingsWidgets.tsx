import type { ReactNode } from "react";
import {
  BOUNDARY_ALIGNMENTS,
  BOUNDARY_STYLES,
  type PresentationTargetId,
} from "../../domain/presentation/types";
import {
  appearanceKeyForTarget,
  resolveInheritanceState,
} from "../../domain/presentation/editing";
import { cloneProjectPresentationDefaults, normalizeProjectPresentationDefaults } from "../../domain/presentation/validation";
import { useLab } from "../../state/store";
import { getAreaRange, getNucleusColor } from "../../design/colorMapping";
import { MORPHS } from "../controlMeta";
import { ChipRow, SliderRow, SwitchRow, WidgetSection } from "./controls";

const LABELS: Record<PresentationTargetId, string> = {
  cell: "Cell",
  boundary: "Boundary",
  membrane: "Membrane",
  "membrane-edge": "Membrane Edge",
  core: "Core",
  void: "Void",
};

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
  const opacity = api.value([path, "opacity"], 1);
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
      <SliderRow
        label={`Opacity${opacity.mixed ? " · Mixed" : ""}`}
        value={typeof opacity.value === "number" ? opacity.value : 1}
        min={0}
        max={1}
        step={0.01}
        fmt={(value) => `${Math.round(value * 100)}%`}
        onChange={(value) => api.preview({ [path]: { opacity: value } })}
        onChangeEnd={api.commitPreview}
      />
    </>
  );
}

export function CellSettingsWidget() {
  return <TargetSettings target="cell">{(api) => {
    const visible = api.value(["visible"], true);
    return <WidgetSection title="Cell surface" defaultOpen extra={
      <span className="m1-state-dot" data-on={Boolean(visible.value)} />
    }>
      <SwitchRow label={visible.mixed ? "Visible · Mixed" : "Visible"} on={Boolean(visible.value)} onToggle={() => api.commit({ visible: !visible.value })} />
      <PaintControls api={api} label="Fill colour" />
    </WidgetSection>;
  }}</TargetSettings>;
}

export function BoundarySettingsWidget() {
  return <TargetSettings target="boundary">{(api) => {
    const visible = api.value(["visible"], false);
    const style = api.value(["style"], "solid");
    const width = api.value(["width"], 1.5);
    const offset = api.value(["offset"], 0);
    const alignment = api.value(["alignment"], "centre");
    const technical = style.value !== "solid";
    return <>
      <WidgetSection title="Stroke" defaultOpen>
        <SwitchRow label={visible.mixed ? "Visible · Mixed" : "Visible"} on={Boolean(visible.value)} onToggle={() => api.commit({ visible: !visible.value })} />
        <ChipRow options={BOUNDARY_STYLES.map((id) => ({ id, label: id === "segmented-bars" ? "Bars" : id }))} value={style.value as typeof BOUNDARY_STYLES[number]} onChange={(next) => api.commit({ style: next })} ariaLabel="Boundary style" />
        <SliderRow label={`Width${width.mixed ? " · Mixed" : ""}`} value={Number(width.value)} min={0} max={16} step={0.25} fmt={(v) => `${v}px`} onChange={(value) => api.preview({ width: value })} onChangeEnd={api.commitPreview} />
        <ChipRow options={BOUNDARY_ALIGNMENTS.map((id) => ({ id, label: id }))} value={alignment.value as typeof BOUNDARY_ALIGNMENTS[number]} onChange={(next) => api.commit({ alignment: next })} ariaLabel="Boundary alignment" />
        <SliderRow label="Visual offset" value={Number(offset.value)} min={-24} max={24} step={0.5} fmt={(v) => `${v}px`} onChange={(value) => api.preview({ offset: value })} onChangeEnd={api.commitPreview} />
        {technical && <>
          <SliderRow label="Dash / bar length" value={Number(api.value(["dashLength"], 8).value)} min={0.25} max={64} step={0.25} onChange={(value) => api.preview({ dashLength: value })} onChangeEnd={api.commitPreview} />
          <SliderRow label="Gap length" value={Number(api.value(["gapLength"], 6).value)} min={0.25} max={64} step={0.25} onChange={(value) => api.preview({ gapLength: value })} onChangeEnd={api.commitPreview} />
        </>}
        {style.value === "double" && <SliderRow label="Double-line spacing" value={Number(api.value(["secondaryLineSpacing"], 3).value)} min={0} max={24} step={0.25} onChange={(value) => api.preview({ secondaryLineSpacing: value })} onChangeEnd={api.commitPreview} />}
        <PaintControls api={api} label="Stroke colour" />
      </WidgetSection>
      <p className="m1-compat-note">Classic renders all six styles. Organism uses its audited solid fallback for non-solid requests.</p>
    </>;
  }}</TargetSettings>;
}

export function MembraneSettingsWidget() {
  const settings = useLab((state) => state.membraneRuntimePreview ?? state.settings);
  const commitRuntime = useLab((state) => state.commitMembraneRuntime);
  const previewRuntime = useLab((state) => state.previewMembraneRuntime);
  const commitRuntimePreview = useLab((state) => state.commitMembraneRuntimePreview);
  return <TargetSettings target="membrane">{(api) => {
    const visible = api.value(["visible"], false);
    return <>
      <WidgetSection title="Membrane fill" defaultOpen>
        <SwitchRow label={visible.mixed ? "Visible · Mixed" : "Visible"} on={Boolean(visible.value)} onToggle={() => api.commit({ visible: !visible.value })} />
        <PaintControls api={api} label="Fill colour" />
      </WidgetSection>
      <WidgetSection title="Fusion" hint="existing runtime owner" defaultOpen>
        <span className="org-subcap">field character</span>
        <ChipRow options={MORPHS} value={settings.morphMode} onChange={(morphMode) => commitRuntime({ morphMode })} ariaLabel="Membrane field character" />
        <span className="org-subcap">fusion range</span>
        <ChipRow options={(["tight", "soft", "long", "extreme"] as const).map((id) => ({ id, label: id }))} value={settings.attachMode} onChange={(attachMode) => commitRuntime({ attachMode })} ariaLabel="Membrane fusion range" />
        <SliderRow label="Reach" value={settings.mergeDistance} min={0} max={300} step={1} fmt={(value) => `${value}px`} onChange={(mergeDistance) => previewRuntime({ mergeDistance })} onChangeEnd={commitRuntimePreview} />
      </WidgetSection>
      <p className="m1-compat-note">Shared organism field · edits Project Defaults for every Cell.</p>
    </>;
  }}</TargetSettings>;
}

export function MembraneEdgeSettingsWidget() {
  return <TargetSettings target="membrane-edge">{(api) => {
    const visible = api.value(["visible"], false);
    const width = api.value(["width"], 1);
    return <>
      <WidgetSection title="Independent edge" defaultOpen>
        <SwitchRow label={visible.mixed ? "Visible · Mixed" : "Visible"} on={Boolean(visible.value)} onToggle={() => api.commit({ visible: !visible.value })} />
        <SliderRow label={`Width${width.mixed ? " · Mixed" : ""}`} value={Number(width.value)} min={0} max={16} step={0.25} fmt={(v) => `${v}px`} onChange={(value) => api.preview({ width: value })} onChangeEnd={api.commitPreview} />
        <PaintControls api={api} label="Edge colour" />
      </WidgetSection>
      <p className="m1-compat-note">Shared organism edge · edits Project Defaults for every Cell.</p>
    </>;
  }}</TargetSettings>;
}

export function CoreSettingsWidget() {
  return <TargetSettings target="core">{(api) => {
    const visible = api.value(["visible"], true);
    const size = api.value(["size"], 0.34);
    const colour = api.value(["paint", "colour"], null);
    return <WidgetSection title="Core dot" defaultOpen>
      <SwitchRow label={visible.mixed ? "Visible · Mixed" : "Visible"} on={Boolean(visible.value)} onToggle={() => api.commit({ visible: !visible.value })} />
      <SliderRow label={`Size${size.mixed ? " · Mixed" : ""}`} value={Number(size.value)} min={0.1} max={2} step={0.01} fmt={(v) => `${Math.round(v * 100)}%`} onChange={(value) => api.preview({ size: value })} onChangeEnd={api.commitPreview} />
      <SwitchRow label="Auto Contrast" on={colour.value === null || colour.value === undefined} onToggle={() => api.commit({ paint: { colour: colour.value == null ? "#171715" : undefined } })} />
      <PaintControls api={api} label="Core colour" />
    </WidgetSection>;
  }}</TargetSettings>;
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
        <SliderRow label="Edge width" value={Number(edgeWidth.value)} min={0} max={16} step={0.25} fmt={(v) => `${v}px`} onChange={(value) => api.preview({ edgeWidth: value })} onChangeEnd={api.commitPreview} />
        <PaintControls api={api} path="edge" label="Edge colour" />
      </WidgetSection>
      <p className="m1-compat-note">Appearance only · subtractive area, hit testing and clearance stay unchanged.</p>
    </>;
  }}</TargetSettings>;
}

export { LABELS as APPEARANCE_TARGET_LABELS };
