/* Display owns view-level camera controls and projects the shared label
 * defaults into a compact operational surface. It never owns a second label
 * configuration: Label Studio and this widget both write Text.labels. */

import { useLab } from "../../state/store";
import {
  getUiScalePreset,
  getWidgetScalePreset,
  normalizeUiScale,
  normalizeWidgetScale,
  UI_SCALE_MAX,
  UI_SCALE_MIN,
  UI_SCALE_PRESETS,
  WIDGET_SCALE_MAX,
  WIDGET_SCALE_MIN,
  WIDGET_SCALE_PRESETS,
} from "../../state/uiScale";
import { Z_MAX, Z_MIN } from "../../lib/camera";
import { cloneProjectPresentationDefaults } from "../../domain/presentation/validation";
import {
  DEFAULT_LABEL_FIT_OPTIONS,
  LABEL_FIT_BOUNDS,
  LABEL_OVERFLOW_POLICIES,
  mergeCellLabelConfig,
  type CellLabelConfig,
  type LabelFitOptions,
} from "../../domain/labels/layoutContract";
import { CELL_LABEL_SCALE_OPTIONS } from "../../domain/labels/foundation";
import { ChipRow, SliderRow, SwitchRow, WidgetSection } from "./controls";
import { DEFAULT_CELL_SHADOW, normalizeCellShadow } from "../../canvas/cellShadow";
import { DEFAULT_ORGANISM_SETTINGS } from "../../canvas/organismProductionSettings";

const CELL_SHADOW_MODES = [
  { id: "off", label: "Off" },
  { id: "soft", label: "Soft" },
  { id: "defined", label: "Defined" },
] as const;

const PERFORMANCE_MODES = [
  { id: "automatic", label: "Auto" },
  { id: "high", label: "High" },
  { id: "balanced", label: "Balanced" },
  { id: "fast", label: "Fast" },
] as const;

const LOW_ZOOM_DETAIL_OPTIONS = [
  { id: "full", label: "Full" },
  { id: "balanced", label: "Balanced" },
  { id: "simplified", label: "Simplified" },
] as const;

const CAMERA_SHAKE_MODES = [
  { id: "off", label: "Off" },
  { id: "soft", label: "Soft" },
  { id: "responsive", label: "Responsive" },
  { id: "custom", label: "Custom" },
] as const;

export default function DisplayWidget() {
  const theme = useLab((s) => s.theme);
  const toggleTheme = useLab((s) => s.toggleTheme);
  const camera = useLab((s) => s.camera);
  const selectedIds = useLab((s) => s.selectedIds);
  const showGrid = useLab((s) => s.settings.showGrid);
  const labelScaleMode = useLab((s) => s.settings.labelScaleMode);
  const uiScale = useLab((s) => s.settings.uiScale);
  const widgetScale = useLab((s) => s.settings.widgetScale);
  const organism = useLab((s) => s.settings.organism);
  const cellShadow = useLab((s) => s.settings.cellShadow);
  const performanceQuality = useLab((s) => s.settings.performanceQuality);
  const defaults = useLab((s) => s.presentationDefaultsPreview ?? s.settings.presentationDefaults);
  const setSettings = useLab((s) => s.setSettings);
  const setWidgetScale = useLab((s) => s.setWidgetScale);
  const setOrganism = useLab((s) => s.setOrganism);
  const setCamera = useLab((s) => s.setCamera);
  const zoomBy = useLab((s) => s.zoomBy);
  const fitView = useLab((s) => s.fitView);
  const fitSelection = useLab((s) => s.fitSelection);
  const resetView = useLab((s) => s.resetView);
  const commitProjectDefaults = useLab((s) => s.commitProjectPresentationDefaults);
  const previewProjectDefaults = useLab((s) => s.previewProjectPresentationDefaults);
  const commitDefaultsPreview = useLab((s) => s.commitPresentationDefaultsPreview);
  const cancelDefaultsPreview = useLab((s) => s.cancelPresentationDefaultsPreview);

  const activePreset = getUiScalePreset(uiScale);
  const scalePercent = Math.round(uiScale * 100);
  const activeWidgetPreset = getWidgetScalePreset(widgetScale);
  const widgetScalePercent = Math.round(widgetScale * 100);
  const cameraPercent = Math.round(camera.zoom * 100);
  const fit: LabelFitOptions = { ...DEFAULT_LABEL_FIT_OPTIONS, ...defaults.text.labels.fit };

  const nextLabelDefaults = (labels: CellLabelConfig = {}, textPatch: { size?: number } = {}) => {
    const next = cloneProjectPresentationDefaults(defaults);
    next.text = {
      ...next.text,
      ...textPatch,
      labels: mergeCellLabelConfig(next.text.labels, labels) ?? {},
    };
    return next;
  };
  const commitLabels = (labels: CellLabelConfig = {}, textPatch: { size?: number } = {}) =>
    commitProjectDefaults(nextLabelDefaults(labels, textPatch));
  const previewLabels = (labels: CellLabelConfig = {}, textPatch: { size?: number } = {}) =>
    previewProjectDefaults(nextLabelDefaults(labels, textPatch));
  const applyFit = (patch: Partial<LabelFitOptions>) => commitLabels({ fit: patch });
  const previewFit = (patch: Partial<LabelFitOptions>) => previewLabels({ fit: patch });

  return (
    <>
      <WidgetSection title="Camera" hint={`${cameraPercent}%`} defaultOpen>
        <SliderRow
          label="Camera zoom"
          value={camera.zoom}
          min={Z_MIN}
          max={Z_MAX}
          step={0.01}
          fmt={(value) => `${Math.round(value * 100)}%`}
          ariaValueText={`${cameraPercent} percent`}
          onChange={(zoom) => setCamera({ ...camera, zoom })}
        />
        <div className="m1-action-grid">
          <button type="button" className="m1-btn" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.15)}>− Zoom</button>
          <button type="button" className="m1-btn" aria-label="Zoom in" onClick={() => zoomBy(1.15)}>+ Zoom</button>
          <button type="button" className="m1-btn" onClick={fitView}>Fit project</button>
          <button type="button" className="m1-btn" disabled={selectedIds.length === 0} onClick={fitSelection}>Fit selection</button>
          <button type="button" className="m1-btn" onClick={resetView}>Reset</button>
        </div>
        <span className="org-subcap">View navigation is transient and does not enter Undo history.</span>
      </WidgetSection>

      <WidgetSection title="Camera Shake" hint={organism.cameraShakeMode === "off" ? "off" : "visual only"} defaultOpen>
        <ChipRow
          options={CAMERA_SHAKE_MODES}
          value={organism.cameraShakeMode}
          onChange={(cameraShakeMode) => setOrganism({ cameraShakeMode })}
          ariaLabel="Camera shake mode"
        />
        {organism.cameraShakeMode === "custom" && (
          <>
            <SliderRow
              label="Shake intensity"
              value={organism.cameraShakeIntensity}
              min={0}
              max={5}
              step={0.05}
              onChange={(cameraShakeIntensity) => setOrganism({ cameraShakeIntensity })}
            />
            <SliderRow
              label="Shake frequency"
              value={organism.cameraShakeFrequency}
              min={2}
              max={24}
              step={0.5}
              fmt={(value) => `${value.toFixed(1)} Hz`}
              onChange={(cameraShakeFrequency) => setOrganism({ cameraShakeFrequency })}
            />
            <SliderRow
              label="Shake damping"
              value={organism.cameraShakeDamping}
              min={3}
              max={30}
              step={0.5}
              onChange={(cameraShakeDamping) => setOrganism({ cameraShakeDamping })}
            />
            <SliderRow
              label="Drag influence"
              value={organism.cameraShakeDragInfluence}
              min={0}
              max={1.5}
              step={0.05}
              fmt={(value) => `${Math.round(value * 100)}%`}
              onChange={(cameraShakeDragInfluence) => setOrganism({ cameraShakeDragInfluence })}
            />
            <SliderRow
              label="Deselect settle duration"
              value={organism.cameraShakeSettleDuration}
              min={0.08}
              max={1.2}
              step={0.01}
              fmt={(value) => `${value.toFixed(2)}s`}
              onChange={(cameraShakeSettleDuration) => setOrganism({ cameraShakeSettleDuration })}
            />
          </>
        )}
        <button
          type="button"
          className="m1-link-btn"
          onClick={() => setOrganism({
            cameraShakeMode: DEFAULT_ORGANISM_SETTINGS.cameraShakeMode,
            cameraShakeIntensity: DEFAULT_ORGANISM_SETTINGS.cameraShakeIntensity,
            cameraShakeFrequency: DEFAULT_ORGANISM_SETTINGS.cameraShakeFrequency,
            cameraShakeDamping: DEFAULT_ORGANISM_SETTINGS.cameraShakeDamping,
            cameraShakeDragInfluence: DEFAULT_ORGANISM_SETTINGS.cameraShakeDragInfluence,
            cameraShakeSettleDuration: DEFAULT_ORGANISM_SETTINGS.cameraShakeSettleDuration,
          })}
        >
          Reset camera shake
        </button>
        <span className="org-subcap">Visual feedback only; reduced-motion preference disables it and exports remain still.</span>
      </WidgetSection>

      <WidgetSection title="Label Zoom &amp; Fit" hint="project defaults" defaultOpen>
        <ChipRow
          options={CELL_LABEL_SCALE_OPTIONS.map(({ id, label }) => ({ id, label }))}
          value={labelScaleMode}
          onChange={(value) => setSettings({ labelScaleMode: value })}
          ariaLabel="Label scale mode"
        />
        <SliderRow
          label="Global text scale"
          value={defaults.text.size}
          min={0.65}
          max={1.8}
          step={0.05}
          fmt={(value) => `${Math.round(value * 100)}%`}
          onChange={(value) => previewLabels({}, { size: value })}
          onChangeEnd={commitDefaultsPreview}
          onChangeCancel={cancelDefaultsPreview}
        />
        <SwitchRow
          label="Fit labels inside Cell"
          on={fit.fitInsideCell}
          onToggle={() => applyFit({ fitInsideCell: !fit.fitInsideCell })}
        />
        <SliderRow
          label="Maximum Cell occupancy"
          value={fit.maximumCellOccupancy}
          min={LABEL_FIT_BOUNDS.maximumCellOccupancy[0]}
          max={LABEL_FIT_BOUNDS.maximumCellOccupancy[1]}
          step={0.01}
          fmt={(value) => `${Math.round(value * 100)}%`}
          onChange={(value) => previewFit({ maximumCellOccupancy: value })}
          onChangeEnd={commitDefaultsPreview}
          onChangeCancel={cancelDefaultsPreview}
        />
        <SliderRow
          label="Minimum readable screen size"
          value={fit.minimumReadableScreenSize}
          min={LABEL_FIT_BOUNDS.minimumReadableScreenSize[0]}
          max={LABEL_FIT_BOUNDS.minimumReadableScreenSize[1]}
          step={1}
          fmt={(value) => `${Math.round(value)}px`}
          onChange={(value) => previewFit({ minimumReadableScreenSize: value })}
          onChangeEnd={commitDefaultsPreview}
          onChangeCancel={cancelDefaultsPreview}
        />
        <SliderRow
          label="Maximum screen text size"
          value={fit.maximumScreenTextSize}
          min={LABEL_FIT_BOUNDS.maximumScreenTextSize[0]}
          max={LABEL_FIT_BOUNDS.maximumScreenTextSize[1]}
          step={1}
          fmt={(value) => `${Math.round(value)}px`}
          onChange={(value) => previewFit({ maximumScreenTextSize: value })}
          onChangeEnd={commitDefaultsPreview}
          onChangeCancel={cancelDefaultsPreview}
        />
        <SliderRow
          label="Body low-zoom threshold"
          value={fit.lowZoomBodyThreshold}
          min={LABEL_FIT_BOUNDS.lowZoomThreshold[0]}
          max={LABEL_FIT_BOUNDS.lowZoomThreshold[1]}
          step={0.05}
          fmt={(value) => value <= 0 ? "Never" : `${Math.round(value * 100)}%`}
          onChange={(value) => previewFit({ lowZoomBodyThreshold: value })}
          onChangeEnd={commitDefaultsPreview}
          onChangeCancel={cancelDefaultsPreview}
        />
        <SliderRow
          label="Metadata low-zoom threshold"
          value={fit.lowZoomMetadataThreshold}
          min={LABEL_FIT_BOUNDS.lowZoomThreshold[0]}
          max={LABEL_FIT_BOUNDS.lowZoomThreshold[1]}
          step={0.05}
          fmt={(value) => value <= 0 ? "Never" : `${Math.round(value * 100)}%`}
          onChange={(value) => previewFit({ lowZoomMetadataThreshold: value })}
          onChangeEnd={commitDefaultsPreview}
          onChangeCancel={cancelDefaultsPreview}
        />
        <SliderRow
          label="Hide all labels below"
          value={fit.hideAllLabelsBelow}
          min={LABEL_FIT_BOUNDS.lowZoomThreshold[0]}
          max={LABEL_FIT_BOUNDS.lowZoomThreshold[1]}
          step={0.05}
          fmt={(value) => value <= 0 ? "Never" : `${Math.round(value * 100)}%`}
          onChange={(value) => previewFit({ hideAllLabelsBelow: value })}
          onChangeEnd={commitDefaultsPreview}
          onChangeCancel={cancelDefaultsPreview}
        />
        <ChipRow
          options={LABEL_OVERFLOW_POLICIES.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))}
          value={fit.overflowPolicy}
          onChange={(value) => applyFit({ overflowPolicy: value })}
          ariaLabel="Label overflow policy"
        />
        <button type="button" className="m1-link-btn" onClick={() => commitLabels({ fit: { ...DEFAULT_LABEL_FIT_OPTIONS } })}>
          Reset label fit defaults
        </button>
      </WidgetSection>

      <WidgetSection title="MEMBRANE AT ZOOM" hint="projection only" defaultOpen>
        <SwitchRow
          label="Preserve morphology"
          on={organism.preserveMorphology}
          onToggle={() => setOrganism({ preserveMorphology: !organism.preserveMorphology })}
        />
        <span className="org-subcap">Camera zoom changes projection only; it never changes authored membrane geometry.</span>
        <ChipRow
          options={LOW_ZOOM_DETAIL_OPTIONS}
          value={organism.lowZoomDetail}
          onChange={(lowZoomDetail) => setOrganism({ lowZoomDetail })}
          ariaLabel="Low zoom membrane detail"
        />
        <SliderRow
          label="Minimum morphology detail"
          value={organism.minimumMorphologyDetail}
          min={0.2}
          max={1}
          step={0.01}
          fmt={(value) => `${Math.round(value * 100)}%`}
          onChange={(minimumMorphologyDetail) => setOrganism({ minimumMorphologyDetail })}
        />
        <SliderRow
          label="Edge stability"
          value={organism.edgeStability}
          min={0}
          max={1}
          step={0.01}
          fmt={(value) => `${Math.round(value * 100)}%`}
          onChange={(edgeStability) => setOrganism({ edgeStability })}
        />
        <button
          type="button"
          className="m1-link-btn"
          onClick={() => setOrganism({
            preserveMorphology: DEFAULT_ORGANISM_SETTINGS.preserveMorphology,
            lowZoomDetail: DEFAULT_ORGANISM_SETTINGS.lowZoomDetail,
            minimumMorphologyDetail: DEFAULT_ORGANISM_SETTINGS.minimumMorphologyDetail,
            edgeStability: DEFAULT_ORGANISM_SETTINGS.edgeStability,
          })}
        >
          Reset membrane zoom diagnostics
        </button>
      </WidgetSection>

      <WidgetSection title="Theme" hint="day / night" defaultOpen>
        <SwitchRow label="Night mode" on={theme === "night"} onToggle={toggleTheme} />
      </WidgetSection>

      <WidgetSection title="Canvas" hint="ground overlays" defaultOpen>
        <SwitchRow
          label="Technical grid"
          on={showGrid}
          onToggle={() => setSettings({ showGrid: !showGrid })}
        />
        <SwitchRow
          label="Show labels"
          on={organism.showLabels}
          onToggle={() => setOrganism({ showLabels: !organism.showLabels })}
        />
      </WidgetSection>

      <WidgetSection title="Cell Shadow" hint="Canvas only · UI stays flat" defaultOpen>
        <ChipRow
          options={CELL_SHADOW_MODES}
          value={cellShadow.enabled ? cellShadow.mode : "off"}
          onChange={(mode) => setSettings({
            cellShadow: mode === "off"
              ? { ...cellShadow, enabled: false }
              : normalizeCellShadow({
                  ...DEFAULT_CELL_SHADOW,
                  enabled: true,
                  mode,
                  opacity: mode === "defined" ? 0.24 : 0.16,
                  softness: mode === "defined" ? 9 : 22,
                  offsetY: mode === "defined" ? 6 : 9,
                }),
          })}
          ariaLabel="Cell Shadow mode"
        />
        <span className="org-subcap">Visual only · geometry and hit testing stay fixed</span>
      </WidgetSection>

      <WidgetSection title="Performance" hint="visual quality only" defaultOpen>
        <ChipRow
          options={PERFORMANCE_MODES}
          value={performanceQuality}
          onChange={(mode) => setSettings({ performanceQuality: mode })}
          ariaLabel="Performance quality"
        />
        <span className="org-subcap">Fast simplifies shadows and idle motion · project data never changes</span>
      </WidgetSection>

      <WidgetSection
        title="Interface Scale"
        hint={activePreset ? `${scalePercent}%` : `Custom · ${scalePercent}%`}
        defaultOpen
      >
        <ChipRow
          options={UI_SCALE_PRESETS}
          value={activePreset ?? ("" as (typeof UI_SCALE_PRESETS)[number]["id"])}
          onChange={(presetId) => {
            const preset = UI_SCALE_PRESETS.find((option) => option.id === presetId);
            if (preset) setSettings({ uiScale: preset.value });
          }}
          ariaLabel="Interface scale"
        />
        <SliderRow
          label="Interface scale"
          value={uiScale}
          min={UI_SCALE_MIN}
          max={UI_SCALE_MAX}
          step={0.01}
          fmt={(v) => `${Math.round(v * 100)}%`}
          ariaValueText={`${scalePercent} percent`}
          onChange={(v) => setSettings({ uiScale: normalizeUiScale(v) })}
        />
        <span className="org-subcap">Chrome only · canvas geometry stays fixed</span>
      </WidgetSection>

      <WidgetSection
        title="Widget Scale"
        hint={activeWidgetPreset ? `${widgetScalePercent}%` : `Custom · ${widgetScalePercent}%`}
        defaultOpen
      >
        <ChipRow
          options={WIDGET_SCALE_PRESETS}
          value={activeWidgetPreset ?? ("" as (typeof WIDGET_SCALE_PRESETS)[number]["id"])}
          onChange={(presetId) => {
            const preset = WIDGET_SCALE_PRESETS.find((option) => option.id === presetId);
            if (preset) setWidgetScale(preset.value);
          }}
          ariaLabel="Widget scale"
        />
        <SliderRow
          label="Widget scale"
          value={widgetScale}
          min={WIDGET_SCALE_MIN}
          max={WIDGET_SCALE_MAX}
          step={0.01}
          fmt={(v) => `${Math.round(v * 100)}%`}
          ariaValueText={`${widgetScalePercent} percent`}
          onChange={(v) => setWidgetScale(normalizeWidgetScale(v))}
        />
        <span className="org-subcap">Widget windows + contents only · rail/dock/canvas stay fixed</span>
      </WidgetSection>
    </>
  );
}
