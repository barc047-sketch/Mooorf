import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { RefreshCw, Search } from "lucide-react";
import { ARRANGEMENT_PATTERNS, getArrangementPattern } from "../../arrangement/registry";
import { regenerateArrangementSeed } from "../../arrangement/engine";
import { arrangementRuntime } from "../../arrangement/runtime";
import { DEFAULT_ARRANGEMENT_PARAMETERS, type ArrangementCategory, type ArrangementParameters } from "../../arrangement/types";
import type { ArrangementPatternId } from "../../types";
import { useLab } from "../../state/store";
import { ChipRow, SliderRow, SwitchRow, WidgetSection } from "./controls";

type CategoryFilter = "all" | ArrangementCategory;
const CATEGORY_OPTIONS: readonly { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" }, { id: "basic", label: "Basic" }, { id: "geometric", label: "Geometric" },
  { id: "generative", label: "Generative" }, { id: "packing", label: "Packing" }, { id: "organic", label: "Organic" },
];
const SCOPE_OPTIONS = [
  { id: "auto", label: "Auto" }, { id: "selected", label: "Selected" }, { id: "all-visible", label: "All Visible" },
] as const;

const Miniature = ({ points }: { points: readonly { x: number; y: number }[] }) => (
  <svg className="arrange-miniature" viewBox="0 0 100 100" aria-hidden="true">
    {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={index === 0 ? 4 : 3} />)}
  </svg>
);

export default function LayoutWidget() {
  const savedLegacyPattern = useLab((state) => state.settings.layoutPreset);
  const selectedCount = useLab((state) => state.selectedIds.length);
  const entityCount = useLab((state) => state.spaces.length);
  const previewActive = useLab((state) => Boolean(state.arrangementPreview));
  const previewArrangement = useLab((state) => state.previewArrangement);
  const applyArrangementPreview = useLab((state) => state.applyArrangementPreview);
  const cancelArrangementPreview = useLab((state) => state.cancelArrangementPreview);
  const calculationStatus = useSyncExternalStore(arrangementRuntime.subscribe, arrangementRuntime.getStatus, arrangementRuntime.getStatus);
  const [patternId, setPatternId] = useState<ArrangementPatternId>(savedLegacyPattern);
  const [parameters, setParameters] = useState<ArrangementParameters>(DEFAULT_ARRANGEMENT_PARAMETERS);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const selectedPattern = getArrangementPattern(patternId) ?? ARRANGEMENT_PATTERNS[0];
  const isLive = previewActive || calculationStatus.phase === "calculating";

  useEffect(() => () => cancelArrangementPreview(), [cancelArrangementPreview]);

  const visiblePatterns = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ARRANGEMENT_PATTERNS.filter((pattern) =>
      (category === "all" || pattern.category === category)
      && (!needle || `${pattern.label} ${pattern.hint}`.toLowerCase().includes(needle))
    );
  }, [category, query]);

  const recalculate = (nextPattern: ArrangementPatternId, nextParameters: ArrangementParameters) => {
    if (isLive) void previewArrangement(nextPattern, nextParameters);
  };
  const choosePattern = (nextPattern: ArrangementPatternId) => {
    setPatternId(nextPattern);
    recalculate(nextPattern, parameters);
  };
  const updateParameters = (patch: Partial<ArrangementParameters>) => {
    const next = { ...parameters, ...patch };
    setParameters(next);
    recalculate(patternId, next);
  };
  const supports = (control: (typeof selectedPattern.controls)[number]) => selectedPattern.controls.includes(control);
  const scopeSummary = parameters.scope === "selected"
    ? `${selectedCount} selected`
    : parameters.scope === "all-visible"
      ? `${entityCount} visible`
      : selectedCount > 0 ? `${selectedCount} selected` : `${entityCount} visible`;

  return (
    <div className="arrange-panel">
      <div className="arrange-scope">
        <ChipRow options={SCOPE_OPTIONS} value={parameters.scope} onChange={(scope) => updateParameters({ scope })} ariaLabel="Arrangement scope" />
        <span className="arrange-scope-count">{scopeSummary}</span>
      </div>
      <SwitchRow label="Include Voids" on={parameters.includeVoids} onToggle={() => updateParameters({ includeVoids: !parameters.includeVoids })} />

      <div className="arrange-category-tabs" role="tablist" aria-label="Pattern category">
        {CATEGORY_OPTIONS.map((option) => (
          <button key={option.id} type="button" role="tab" aria-selected={category === option.id} data-active={category === option.id} onClick={() => setCategory(option.id)}>
            {option.label}
          </button>
        ))}
      </div>

      <label className="arrange-search">
        <Search size={12} aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a pattern" aria-label="Search patterns" />
      </label>

      <div className="arrange-pattern-grid" role="radiogroup" aria-label="Arrangement pattern">
        {visiblePatterns.map((pattern) => (
          <button key={pattern.id} type="button" className="arrange-pattern" role="radio" aria-checked={pattern.id === patternId} data-active={pattern.id === patternId} onClick={() => choosePattern(pattern.id)}>
            <Miniature points={pattern.miniature} />
            <span>{pattern.label}</span>
          </button>
        ))}
        {visiblePatterns.length === 0 && <p className="arrange-empty">No matching patterns</p>}
      </div>

      <div className="arrange-selected-copy">
        <span className="arrange-signal" aria-hidden="true" />
        <div><strong>{selectedPattern.label}</strong><p>{selectedPattern.hint}</p></div>
      </div>

      <WidgetSection title="Controls" hint="preview-safe" defaultOpen>
        {supports("spacing") && <SliderRow label="Spacing" value={parameters.spacing} min={0} max={120} step={1} fmt={(value) => `${value}px`} onChange={(spacing) => updateParameters({ spacing })} />}
        {supports("collision-margin") && <SliderRow label="Collision Margin" value={parameters.collisionMargin} min={0} max={64} step={1} fmt={(value) => `${value}px`} onChange={(collisionMargin) => updateParameters({ collisionMargin })} />}
        {supports("rotation") && <SliderRow label="Rotation" value={parameters.rotation} min={-180} max={180} step={1} fmt={(value) => `${value}°`} onChange={(rotation) => updateParameters({ rotation })} />}
        {supports("direction") && <ChipRow options={[{ id: "clockwise", label: "Clockwise" }, { id: "counter-clockwise", label: "Counter-clockwise" }]} value={parameters.direction} onChange={(direction) => updateParameters({ direction })} ariaLabel="Arrangement direction" />}
        {supports("preserve-centre") && <SwitchRow label="Preserve Centre" on={parameters.preserveCentre} onToggle={() => updateParameters({ preserveCentre: !parameters.preserveCentre })} />}
        {supports("area-aware") && <SwitchRow label="Area-aware Spacing" on={parameters.areaAwareSpacing} onToggle={() => updateParameters({ areaAwareSpacing: !parameters.areaAwareSpacing })} />}
        {supports("aspect-ratio") && <SliderRow label="Aspect Ratio" value={parameters.aspectRatio} min={1} max={3} step={0.05} fmt={(value) => value.toFixed(2)} onChange={(aspectRatio) => updateParameters({ aspectRatio })} />}
        {supports("spiral-growth") && <SliderRow label="Spiral Growth" value={parameters.spiralGrowth} min={0.25} max={3} step={0.05} fmt={(value) => value.toFixed(2)} onChange={(spiralGrowth) => updateParameters({ spiralGrowth })} />}
        {supports("ring-count") && <SliderRow label="Ring Count" value={parameters.ringCount} min={1} max={12} step={1} onChange={(ringCount) => updateParameters({ ringCount })} />}
        {supports("cross-arm-ratio") && <SliderRow label="Cross Arm Ratio" value={parameters.crossArmRatio} min={0.25} max={3} step={0.05} fmt={(value) => value.toFixed(2)} onChange={(crossArmRatio) => updateParameters({ crossArmRatio })} />}
        {supports("count") && (
          <div className="arrange-inline-control">
            <span>Count</span>
            <button type="button" data-active={parameters.count === null} onClick={() => updateParameters({ count: null })}>Auto</button>
            <input type="number" min={1} max={Math.max(1, entityCount)} value={parameters.count ?? ""} placeholder="Exact" aria-label="Exact row or column count" onChange={(event) => updateParameters({ count: event.target.value ? Math.max(1, Number(event.target.value)) : null })} />
          </div>
        )}
        {supports("seed") && (
          <div className="arrange-inline-control arrange-seed">
            <span>Seed</span>
            <input type="number" value={parameters.seed} aria-label="Random seed" onChange={(event) => updateParameters({ seed: Number(event.target.value) || 1 })} />
            <button type="button" className="arrange-regenerate" onClick={() => updateParameters({ seed: regenerateArrangementSeed(parameters.seed) })} title="Regenerate">
              <RefreshCw size={12} aria-hidden="true" /> Regenerate
            </button>
          </div>
        )}
      </WidgetSection>

      <div className="arrange-status" role="status" data-phase={calculationStatus.phase}>
        {calculationStatus.phase === "calculating" ? `Calculating ${calculationStatus.entityCount} Cells…` : calculationStatus.error ?? (previewActive ? "Preview ready · canonical positions unchanged" : "Ready to preview")}
      </div>
      <div className="arrange-actions">
        <button type="button" className="arrange-preview" onClick={() => void previewArrangement(patternId, parameters)}>Preview</button>
        <button type="button" className="arrange-apply" disabled={!previewActive} onClick={applyArrangementPreview}>Apply</button>
        <button type="button" className="arrange-cancel" disabled={!previewActive && calculationStatus.phase !== "calculating"} onClick={cancelArrangementPreview}>Cancel</button>
      </div>
    </div>
  );
}
