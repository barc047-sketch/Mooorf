import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Copy, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import {
  PRESENTATION_TARGET_IDS,
  type PresentationTargetId,
  type TextAppearanceOverride,
  type TextStylePresetId,
} from "../../domain/presentation/types";
import {
  resolveInheritanceState,
  TEXT_STYLE_PRESETS,
} from "../../domain/presentation/editing";
import { cloneProjectPresentationDefaults } from "../../domain/presentation/validation";
import { useLab } from "../../state/store";
import type { SpaceCell, WidgetId } from "../../types";
import { getAreaRange, getNucleusColor } from "../../design/colorMapping";
import { APPEARANCE_TARGET_LABELS } from "./AppearanceSettingsWidgets";
import { ChipRow, SliderRow, SwitchRow } from "./controls";

type TabId = "content" | "appearance";

const DETAIL_WIDGET: Record<PresentationTargetId, WidgetId> = {
  cell: "cell-settings",
  boundary: "boundary-settings",
  membrane: "membrane-settings",
  "membrane-edge": "membrane-edge-settings",
  core: "core-settings",
  void: "void-settings",
};

const common = <T,>(values: readonly T[]): { value: T | undefined; mixed: boolean } => {
  if (!values.length) return { value: undefined, mixed: false };
  const first = JSON.stringify(values[0]);
  return { value: values[0], mixed: values.some((value) => JSON.stringify(value) !== first) };
};

function ContentField({ label, field, spaces }: {
  label: string;
  field: "name" | "area" | "body";
  spaces: readonly SpaceCell[];
}) {
  const commitSpaceContent = useLab((state) => state.commitSpaceContent);
  const values = spaces.map((space) => field === "body" ? space.body ?? "" : space[field]);
  const shared = common(values);
  const canonical = shared.mixed ? "" : String(shared.value ?? "");
  const [draft, setDraft] = useState(canonical);
  useEffect(() => setDraft(canonical), [canonical, field]);

  const commit = () => {
    if (!spaces.length || (shared.mixed && draft === "")) return;
    if (field === "area") {
      const area = Number.parseFloat(draft);
      if (Number.isFinite(area)) commitSpaceContent(spaces.map((space) => space.id), { area: Math.max(1, area) });
    } else {
      commitSpaceContent(spaces.map((space) => space.id), { [field]: draft });
    }
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      setDraft(canonical);
      event.currentTarget.blur();
    } else if (event.key === "Enter" && !(field === "body" && event.shiftKey)) {
      event.preventDefault();
      commit();
      event.currentTarget.blur();
    }
  };
  const props = {
    value: draft,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(event.target.value),
    onBlur: commit,
    onKeyDown: keyDown,
    placeholder: shared.mixed ? "Mixed" : undefined,
    "aria-label": label,
  };
  return (
    <label className="m1-field">
      <span>{label}{shared.mixed && <i>Mixed</i>}</span>
      {field === "body"
        ? <textarea {...props} rows={3} />
        : <input {...props} type={field === "area" ? "number" : "text"} min={field === "area" ? 1 : undefined} />}
    </label>
  );
}

export default function InspectorWidget() {
  const [tab, setTab] = useState<TabId>("content");
  const spaces = useLab((state) => state.appearancePreview ?? state.spaces);
  const selectedIds = useLab((state) => state.selectedIds);
  const primarySelectedId = useLab((state) => state.primarySelectedId);
  const defaults = useLab((state) => state.presentationDefaultsPreview ?? state.settings.presentationDefaults);
  const activeTarget = useLab((state) => state.activeAppearanceTarget);
  const paletteMode = useLab((state) => state.settings.paletteMode);
  const nucleusPaletteId = useLab((state) => state.settings.nucleusPaletteId);
  const colorSource = useLab((state) => state.settings.colorSource);
  const clipboard = useLab((state) => state.styleClipboard);
  const setActiveTarget = useLab((state) => state.setActiveAppearanceTarget);
  const commitText = useLab((state) => state.commitTextAppearancePatch);
  const previewText = useLab((state) => state.previewTextAppearancePatch);
  const commitAppearancePreview = useLab((state) => state.commitAppearancePreview);
  const resetTarget = useLab((state) => state.resetAppearanceTarget);
  const resetAll = useLab((state) => state.resetAllAppearance);
  const copyStyle = useLab((state) => state.copyStyle);
  const pasteStyle = useLab((state) => state.pasteStyle);
  const openWidget = useLab((state) => state.openWidget);
  const commitProjectDefaults = useLab((state) => state.commitProjectPresentationDefaults);
  const previewProjectDefaults = useLab((state) => state.previewProjectPresentationDefaults);
  const commitDefaultsPreview = useLab((state) => state.commitPresentationDefaultsPreview);
  const selected = useMemo(() => spaces.filter((space) => selectedIds.includes(space.id)), [selectedIds, spaces]);
  const contextLabel = selected.length === 0
    ? "Project Defaults"
    : selected.length === 1
      ? selected[0].name
      : `${selected.length} Cells`;
  const textValues = selected.length ? selected.map((space) => ({
    preset: space.appearance?.text?.preset ?? defaults.text.preset,
    size: space.appearance?.text?.size ?? defaults.text.size,
    colourMode: space.appearance?.text?.colourMode ?? defaults.text.colourMode,
    colour: space.appearance?.text?.colour ?? defaults.text.colour,
  })) : [defaults.text];
  const preset = common(textValues.map((value) => value.preset));
  const size = common(textValues.map((value) => value.size));
  const colourMode = common(textValues.map((value) => value.colourMode));
  const colour = common(textValues.map((value) => value.colour));
  const textState = selected.length ? resolveInheritanceState(selected.map((space) => space.appearance), "text") : "project-default";
  const sharedProjectTarget = activeTarget === "membrane" || activeTarget === "membrane-edge";
  const targetState = selected.length && !sharedProjectTarget ? resolveInheritanceState(selected.map((space) => space.appearance), activeTarget) : "project-default";
  const paletteReference = selected[0] ?? spaces.find((space) => space.kind !== "void");
  const projectColour = paletteReference
    ? getNucleusColor(paletteReference, paletteMode, getAreaRange(spaces), nucleusPaletteId, colorSource)
    : null;
  const textSwatches = [...new Set([
    defaults.text.colour,
    projectColour?.fill,
    projectColour?.ring,
    projectColour?.muted,
    "#171715",
    "#f7f6f2",
  ].filter((value): value is string => Boolean(value && /^#[0-9a-f]{6}$/i.test(value))))];

  const applyText = (patch: Partial<TextAppearanceOverride>) => {
    if (selected.length) commitText(selectedIds, patch);
    else {
      const next = cloneProjectPresentationDefaults(defaults);
      next.text = { ...next.text, ...patch };
      commitProjectDefaults(next);
    }
  };
  const previewTextSetting = (patch: Partial<TextAppearanceOverride>) => {
    if (selected.length) previewText(selectedIds, patch);
    else {
      const next = cloneProjectPresentationDefaults(defaults);
      next.text = { ...next.text, ...patch };
      previewProjectDefaults(next);
    }
  };

  return (
    <div className="m1-inspector">
      <div className="m1-context">
        <span className="m1-signal" data-selected={selected.length ? "true" : "false"} />
        <div><small>{selected.length > 1 ? "MULTI SELECTION" : selected.length ? "CELL" : "SCOPE"}</small><strong>{contextLabel}</strong></div>
        <span className="m1-state-badge" data-state={selected.length > 1 ? "mixed" : "project-default"}>{selected.length > 1 ? "Mixed" : selected.length ? "Local" : "Default"}</span>
      </div>
      <div className="m1-tabs" role="tablist" aria-label="Inspector sections">
        {(["content", "appearance"] as const).map((id) => <button key={id} type="button" role="tab" aria-selected={tab === id} data-active={tab === id} onClick={() => setTab(id)}>{id}</button>)}
      </div>

      {tab === "content" ? <div className="m1-pane" role="tabpanel">
        {selected.length ? <section className="m1-section">
          <h3>Architectural content</h3>
          <ContentField label="Space Name" field="name" spaces={selected} />
          <ContentField label="Area · m²" field="area" spaces={selected} />
          <ContentField label="Body / subtext" field="body" spaces={selected} />
        </section> : <p className="m1-empty-note">Select one or more Cells to edit Name, Area and Body. Typography below edits Project Defaults.</p>}

        <section className="m1-section">
          <div className="m1-section-title"><h3>Text system</h3><span className="m1-state-badge" data-state={textState}>{textState.replace("-", " ")}</span></div>
          <ChipRow options={TEXT_STYLE_PRESETS.map(({ id, label }) => ({ id, label }))} value={(preset.value ?? defaults.text.preset) as TextStylePresetId} onChange={(value) => applyText({ preset: value })} ariaLabel="Text Style preset" />
          {preset.mixed && <p className="m1-mixed-note">Text Style · Mixed</p>}
          <SliderRow label={`Text Size${size.mixed ? " · Mixed" : ""}`} value={size.value ?? defaults.text.size} min={0.65} max={1.8} step={0.05} fmt={(value) => `${Math.round(value * 100)}%`} onChange={(value) => previewTextSetting({ size: value })} onChangeEnd={selected.length ? commitAppearancePreview : commitDefaultsPreview} />
          <SwitchRow label={colourMode.mixed ? "Auto Contrast · Mixed" : "Auto Contrast"} on={colourMode.value !== "custom"} onToggle={() => applyText({ colourMode: colourMode.value === "custom" ? "auto" : "custom" })} />
          <label className="m1-colour-row">
            <span>Text Colour{colour.mixed ? " · Mixed" : ""}</span>
            <input type="color" value={colour.value ?? defaults.text.colour} aria-label="Text Colour" disabled={colourMode.value !== "custom"} onChange={(event) => applyText({ colourMode: "custom", colour: event.target.value })} />
          </label>
          <div className="m1-swatch-row" aria-label="Current project palette text colours">
            {textSwatches.map((swatch) => <button key={swatch} type="button" title={swatch} aria-label={`Use text colour ${swatch}`} style={{ background: swatch }} data-active={colour.value === swatch} onClick={() => applyText({ colourMode: "custom", colour: swatch })} />)}
          </div>
          {selected.length > 0 && <button type="button" className="m1-link-btn" onClick={() => resetTarget(selectedIds, "text")}><RotateCcw size={11} /> Return text to Project Default</button>}
        </section>
      </div> : <div className="m1-pane" role="tabpanel">
        <section className="m1-section">
          <div className="m1-section-title"><h3>Appearance target</h3><span className="m1-state-badge" data-state={targetState}>{targetState.replace("-", " ")}</span></div>
          <div className="m1-target-grid" role="radiogroup" aria-label="Appearance target">
            {PRESENTATION_TARGET_IDS.map((target) => <button key={target} type="button" role="radio" aria-checked={activeTarget === target} data-active={activeTarget === target} onClick={() => setActiveTarget(target)}><span className="m1-target-dot" data-target={target} />{APPEARANCE_TARGET_LABELS[target]}</button>)}
          </div>
          <button type="button" className="m1-primary-btn" onClick={() => openWidget(DETAIL_WIDGET[activeTarget])}><SlidersHorizontal size={12} /> Open Detailed Settings</button>
          {sharedProjectTarget && <p className="m1-compat-note">This audited shared field uses Project Defaults for every Cell.</p>}
        </section>
        <section className="m1-section">
          <h3>Style actions</h3>
          <div className="m1-action-grid">
            <button type="button" className="m1-btn" disabled={!primarySelectedId} onClick={() => primarySelectedId && copyStyle(primarySelectedId)}><Copy size={11} /> Copy Style</button>
            <button type="button" className="m1-btn" disabled={!selected.length || !clipboard} onClick={() => pasteStyle(selectedIds)}><Sparkles size={11} /> Paste Style</button>
            <button type="button" className="m1-btn" disabled={!selected.length || sharedProjectTarget} onClick={() => resetTarget(selectedIds, activeTarget)}><RotateCcw size={11} /> {sharedProjectTarget ? "Shared Project Default" : "Reset Target"}</button>
            <button type="button" className="m1-btn" disabled={!selected.length} onClick={() => resetAll(selectedIds)}><RotateCcw size={11} /> Reset All Appearance</button>
          </div>
        </section>
        <p className="m1-empty-note">Selection is interaction state only. It is never copied, persisted or exported.</p>
      </div>}
    </div>
  );
}
