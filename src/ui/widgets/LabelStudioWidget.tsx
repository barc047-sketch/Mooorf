/* Label Studio deliberately reuses the Inspector's canonical label pane and
 * text-channel actions. It adds no configuration state of its own. */

import { useEffect, useMemo } from "react";
import { cloneProjectPresentationDefaults } from "../../domain/presentation/validation";
import { mergeCellLabelConfig, type CellLabelConfig } from "../../domain/labels/layoutContract";
import { inheritanceStateLabel, type InheritanceState } from "../../domain/presentation/editing";
import { useLab } from "../../state/store";
import LabelLayoutPane from "./LabelLayoutPane";

export default function LabelStudioWidget() {
  const spaces = useLab((state) => state.appearancePreview ?? state.spaces);
  const selectedIds = useLab((state) => state.selectedIds);
  const defaults = useLab((state) => state.presentationDefaultsPreview ?? state.settings.presentationDefaults);
  const commitText = useLab((state) => state.commitTextAppearancePatch);
  const previewText = useLab((state) => state.previewTextAppearancePatch);
  const commitAppearancePreview = useLab((state) => state.commitAppearancePreview);
  const cancelAppearancePreview = useLab((state) => state.cancelAppearancePreview);
  const resetTextLabels = useLab((state) => state.resetTextLabelAppearance);
  const commitProjectDefaults = useLab((state) => state.commitProjectPresentationDefaults);
  const previewProjectDefaults = useLab((state) => state.previewProjectPresentationDefaults);
  const commitDefaultsPreview = useLab((state) => state.commitPresentationDefaultsPreview);
  const cancelDefaultsPreview = useLab((state) => state.cancelPresentationDefaultsPreview);
  const selected = useMemo(
    () => spaces.filter((space) => selectedIds.includes(space.id)),
    [selectedIds, spaces]
  );

  const mergedDefaults = (labels: CellLabelConfig = {}, textSize?: number) => {
    const next = cloneProjectPresentationDefaults(defaults);
    next.text = {
      ...next.text,
      ...(textSize === undefined ? {} : { size: textSize }),
      labels: mergeCellLabelConfig(next.text.labels, labels) ?? {},
    };
    return next;
  };
  const applyLabels = (labels: CellLabelConfig) => {
    if (selected.length) commitText(selectedIds, { labels });
    else commitProjectDefaults(mergedDefaults(labels));
  };
  const previewLabels = (labels: CellLabelConfig) => {
    if (selected.length) previewText(selectedIds, { labels });
    else previewProjectDefaults(mergedDefaults(labels));
  };
  const localScope = selected.length > 0;
  const inheritanceState: InheritanceState = !localScope
    ? "project-default"
    : selected.every((space) => space.appearance?.text?.labels !== undefined)
      ? "local-override"
      : selected.every((space) => space.appearance?.text?.labels === undefined)
        ? "project-default"
        : "mixed";
  const contextLabel = selected.length === 0
    ? "Cell label system"
    : selected.length === 1
      ? selected[0].name
      : `${selected.length} Cells`;

  /* A widget close is not a commit. Sliders deliberately preview through the
   * shared transient owners, so clear either possible Label Studio preview on
   * unmount instead of leaving a ghost local/default projection behind. */
  useEffect(() => () => {
    cancelAppearancePreview();
    cancelDefaultsPreview();
  }, [cancelAppearancePreview, cancelDefaultsPreview]);

  return (
    <div className="m1-inspector" data-testid="label-studio-widget">
      <div className="m1-context">
        <span className="m1-signal" data-selected={localScope ? "true" : "false"} />
        <div><small>{inheritanceState === "mixed" ? "MIXED LABEL SETTINGS" : inheritanceState === "local-override" ? "LOCAL LABEL OVERRIDE" : "PROJECT DEFAULTS"}</small><strong>{contextLabel}</strong></div>
        <span className="m1-state-badge" data-state={inheritanceState}>{inheritanceStateLabel(inheritanceState)}</span>
      </div>
      <p className="m1-empty-note">
        {localScope
          ? "Layout, Ring and Flag edits apply to the selected Cell set. Global text scale and universal fit remain Project Default settings."
          : "Changes here define the reusable default for every Cell."}
      </p>
      <LabelLayoutPane
        detailed
        selected={selected}
        defaults={defaults}
        apply={applyLabels}
        preview={previewLabels}
        onPreviewEnd={localScope ? commitAppearancePreview : commitDefaultsPreview}
        onPreviewCancel={localScope ? cancelAppearancePreview : cancelDefaultsPreview}
        applyGlobal={(labels) => commitProjectDefaults(mergedDefaults(labels))}
        previewGlobal={(labels) => previewProjectDefaults(mergedDefaults(labels))}
        onGlobalPreviewEnd={commitDefaultsPreview}
        onGlobalPreviewCancel={cancelDefaultsPreview}
        applyGlobalTextSize={(size) => commitProjectDefaults(mergedDefaults({}, size))}
        previewGlobalTextSize={(size) => previewProjectDefaults(mergedDefaults({}, size))}
        onGlobalTextSizePreviewEnd={commitDefaultsPreview}
      />
      {localScope && (
        <section className="m1-section">
          <div className="m1-section-title"><h3>Reset / Project Default</h3><span className="m1-state-badge" data-state={inheritanceState}>{inheritanceStateLabel(inheritanceState)}</span></div>
          <p className="m1-empty-note">Return only the selected Cells’ local label settings to their shared Project Default; unrelated local typography remains intact.</p>
          <button
            type="button"
            className="m1-link-btn"
            disabled={inheritanceState === "project-default"}
            onClick={() => resetTextLabels(selectedIds)}
          >
            Return selected labels to Project Default
          </button>
        </section>
      )}
    </div>
  );
}
