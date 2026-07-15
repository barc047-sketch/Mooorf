import { createElement, useMemo, useState } from "react";
import { Search, Star, Trash2 } from "lucide-react";
import { iconRegistry } from "../../icons/iconRegistry";
import { getLucideIcon } from "../../icons/iconDrawing";
import { normalizeIconPlacement } from "../../icons/iconValidation";
import type { IconCategory, IconPlacementPreset, IconPlacementSettings } from "../../icons/types";
import { useLab } from "../../state/store";
import { ChipRow, SliderRow, SwitchRow, WidgetSection } from "./controls";

type LibraryFilter = "all" | "recent" | "favourites" | IconCategory;

const placementFor = (iconId: string, targetSpaceId: string): IconPlacementSettings => normalizeIconPlacement({
  iconId,
  targetSpaceId,
  placement: "centre",
  scale: 1,
  opacity: 1,
  tintMode: "auto",
  tint: "#171719",
  backing: "none",
  backingSize: 32,
  backingOpacity: 1,
  backingOutline: false,
  backingOutlineWidth: 1,
  hideBelowZoom: 0.35,
});

export default function SymbolInspectorPane() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const selectedId = useLab((state) => state.primarySelectedId);
  const resources = useLab((state) => state.settings.resources);
  const commitPlacement = useLab((state) => state.commitSymbolPlacement);
  const commitSymbolPreview = useLab((state) => state.commitSymbolPreview);
  const previewPlacement = useLab((state) => state.previewSymbolPlacement);
  const cancelPreview = useLab((state) => state.cancelSymbolPreview);
  const toggleFavourite = useLab((state) => state.toggleIconFavourite);
  const current = selectedId ? resources.iconPlacements.find((placement) => placement.targetSpaceId === selectedId) ?? null : null;
  const canonical = current;
  const categories = useMemo(() => [...new Set(iconRegistry.list().map((item) => item.category))], []);
  const visible = useMemo(() => {
    const searched = iconRegistry.search(query);
    if (filter === "recent") return resources.iconRecents.flatMap((id) => searched.find((item) => item.id === id) ?? []);
    if (filter === "favourites") return resources.iconFavourites.flatMap((id) => searched.find((item) => item.id === id) ?? []);
    if (filter !== "all") return searched.filter((item) => item.category === filter);
    return searched;
  }, [filter, query, resources.iconFavourites, resources.iconRecents]);

  const previewIcon = (iconId: string) => {
    if (!selectedId) return;
    previewPlacement(selectedId, normalizeIconPlacement({ ...(canonical ?? placementFor(iconId, selectedId)), iconId, targetSpaceId: selectedId }));
  };
  const applyIcon = (iconId: string) => {
    if (!selectedId) return;
    commitPlacement(selectedId, normalizeIconPlacement({ ...(canonical ?? placementFor(iconId, selectedId)), iconId, targetSpaceId: selectedId }));
  };
  const commitPatch = (patch: Partial<IconPlacementSettings>) => {
    if (!selectedId || !current) return;
    commitPlacement(selectedId, normalizeIconPlacement({ ...current, ...patch, targetSpaceId: selectedId }));
  };
  const previewPatch = (patch: Partial<IconPlacementSettings>) => {
    if (!selectedId || !current) return;
    previewPlacement(selectedId, normalizeIconPlacement({ ...current, ...patch, targetSpaceId: selectedId }));
  };
  const commitPreview = () => {
    if (!selectedId || !current) return;
    commitSymbolPreview();
  };
  const placementSlider = (label: string, key: "offsetX" | "offsetY" | "scale" | "rotation" | "backingSize" | "backingOffsetX" | "backingOffsetY" | "backingOpacity" | "backingOutlineWidth" | "hideBelowZoom", min: number, max: number, step: number, percent = false) => current ? <SliderRow
    label={label}
    value={current[key]}
    min={min}
    max={max}
    step={step}
    fmt={percent ? (value) => `${Math.round(value * 100)}%` : undefined}
    onChange={(value) => previewPatch({ [key]: value })}
    onChangeEnd={commitPreview}
  /> : null;

  return <div className="m1-pane m2-symbol-pane" role="tabpanel">
    {!selectedId && <p className="m1-empty-note">Select a Cell or Void to apply, replace, preview or remove its primary symbol.</p>}
    <section className="m1-section">
      <div className="m2-symbol-search"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symbols" aria-label="Search symbols" /></div>
      <div className="m2-symbol-filters" role="radiogroup" aria-label="Symbol categories">
        {(["all", "recent", "favourites", ...categories] as LibraryFilter[]).map((id) => <button key={id} type="button" role="radio" aria-checked={filter === id} data-active={filter === id} onClick={() => setFilter(id)}>{id}</button>)}
      </div>
      <div className="m2-symbol-grid" role="list" aria-label="Drawable symbol library">
        {visible.map((definition) => {
          const Icon = getLucideIcon(definition.sourceKey);
          const favourite = resources.iconFavourites.includes(definition.id);
          return <div key={definition.id} className="m2-symbol-card" role="listitem" data-active={current?.iconId === definition.id}>
            <button
              type="button"
              className="m2-symbol-apply"
              aria-label={`Apply ${definition.accessibleLabel}`}
              title={definition.tooltip}
              disabled={!selectedId}
              onMouseEnter={() => previewIcon(definition.id)}
              onMouseLeave={cancelPreview}
              onFocus={() => previewIcon(definition.id)}
              onBlur={cancelPreview}
              onClick={() => applyIcon(definition.id)}
            >{Icon && createElement(Icon, { size: 18, "aria-hidden": true })}<span>{definition.name}</span></button>
            <button type="button" className="m2-symbol-star" aria-label={`${favourite ? "Remove" : "Add"} ${definition.name} ${favourite ? "from" : "to"} favourites`} aria-pressed={favourite} onClick={() => toggleFavourite(definition.id)}><Star size={11} fill={favourite ? "currentColor" : "none"} /></button>
          </div>;
        })}
      </div>
      {!visible.length && <p className="m1-empty-note">No audited symbols match this filter.</p>}
    </section>

    {current && <section className="m1-section">
      <div className="m1-section-title"><h3>Placement & backing</h3><button type="button" className="m1-link-btn" onClick={() => selectedId && commitPlacement(selectedId, null)}><Trash2 size={11} /> Remove</button></div>
      <ChipRow options={(["centre", "above", "below", "top-left", "top-right"] as IconPlacementPreset[]).map((id) => ({ id, label: id }))} value={current.placement} onChange={(placement) => commitPatch({ placement })} ariaLabel="Symbol placement preset" />
      {placementSlider("Offset X", "offsetX", -128, 128, 1)}
      {placementSlider("Offset Y", "offsetY", -128, 128, 1)}
      {placementSlider("Scale", "scale", 0.1, 4, 0.05, true)}
      {placementSlider("Rotation", "rotation", 0, 359, 1)}
      <ChipRow options={[{ id: "auto", label: "Auto Contrast" }, { id: "custom", label: "Custom" }]} value={current.tintMode} onChange={(tintMode) => commitPatch({ tintMode })} ariaLabel="Symbol tint mode" />
      {current.tintMode === "custom" && <label className="m1-colour-row"><span>Symbol tint</span><input type="color" value={current.tint} aria-label="Symbol tint" onChange={(event) => commitPatch({ tint: event.target.value })} /></label>}
      <span className="org-subcap">backing type</span>
      <ChipRow options={(["none", "circle", "square", "pill"] as const).map((id) => ({ id, label: id }))} value={current.backing} onChange={(backing) => commitPatch({ backing })} ariaLabel="Symbol backing type" />
      {current.backing !== "none" && <>
        {placementSlider("Backing size", "backingSize", 8, 160, 1)}
        {placementSlider("Backing offset X", "backingOffsetX", -128, 128, 1)}
        {placementSlider("Backing offset Y", "backingOffsetY", -128, 128, 1)}
        {placementSlider("Backing opacity", "backingOpacity", 0, 1, 0.01, true)}
        <SwitchRow label="Backing outline" on={current.backingOutline} onToggle={() => commitPatch({ backingOutline: !current.backingOutline })} />
        {current.backingOutline && placementSlider("Outline width", "backingOutlineWidth", 0, 16, 0.25)}
      </>}
      <WidgetSection title="Advanced visibility">
        {placementSlider("Hide below zoom", "hideBelowZoom", 0, 2, 0.05)}
      </WidgetSection>
    </section>}
  </div>;
}
