/* V7.2 export widget — one instrument owns every export format. Settings
   here are export-run-local (never persisted to the master graph/store);
   generation itself is fully owned by src/export/exportService.ts. */

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  buildPresentationPack,
  defaultProjectTitle,
  exportCsv,
  exportJson,
  exportPdf,
  exportPng,
  exportSvg,
  type PackProgressStage,
} from "../../export/exportService";
import {
  DEFAULT_PRESENTATION_OPTIONS,
  DEFAULT_VISUAL_OPTIONS,
  type ExportBackground,
  type ExportLabels,
  type ExportOrientation,
  type ExportPadding,
  type ExportPageSize,
  type ExportResolutionScale,
  type ExportSelection,
  type ExportStage,
} from "../../export/types";
import { ChipRow, SwitchRow, WidgetSection } from "./controls";
import { downloadConfig, downloadFullProject } from "../../import/projectTransfer";

type ExportFormatChoice = "png" | "pdf" | "data" | "pack";

const FORMAT_OPTIONS = [
  { id: "png", label: "PNG" },
  { id: "pdf", label: "PDF" },
  { id: "data", label: "DATA" },
  { id: "pack", label: "PACK" },
] as const satisfies readonly { id: ExportFormatChoice; label: string }[];

const RESOLUTION_OPTIONS = [
  { id: "1", label: "1×" },
  { id: "2", label: "2×" },
  { id: "4", label: "4×" },
] as const;

const BACKGROUND_OPTIONS = [
  { id: "theme", label: "Theme" },
  { id: "white", label: "White" },
  { id: "transparent", label: "Transparent" },
] as const satisfies readonly { id: ExportBackground; label: string }[];

const LABELS_OPTIONS = [
  { id: "include", label: "Include" },
  { id: "exclude", label: "Exclude" },
] as const satisfies readonly { id: ExportLabels; label: string }[];

const SELECTION_OPTIONS = [
  { id: "clean", label: "Clean" },
  { id: "include", label: "Include" },
] as const satisfies readonly { id: ExportSelection; label: string }[];

const PADDING_OPTIONS = [
  { id: "tight", label: "Tight" },
  { id: "standard", label: "Standard" },
  { id: "wide", label: "Wide" },
] as const satisfies readonly { id: ExportPadding; label: string }[];

const PAGE_OPTIONS = [
  { id: "a4", label: "A4" },
  { id: "a3", label: "A3" },
] as const satisfies readonly { id: ExportPageSize; label: string }[];

const ORIENTATION_OPTIONS = [
  { id: "landscape", label: "Landscape" },
  { id: "portrait", label: "Portrait" },
] as const satisfies readonly { id: ExportOrientation; label: string }[];

const PRIMARY_LABEL: Record<ExportFormatChoice, string> = {
  png: "Export PNG",
  pdf: "Export PDF",
  data: "Download Data",
  pack: "Build Pack",
};

export default function ExportWidget() {
  const [format, setFormat] = useState<ExportFormatChoice>("png");
  const [visual, setVisual] = useState(DEFAULT_VISUAL_OPTIONS);
  const [presentation, setPresentation] = useState(DEFAULT_PRESENTATION_OPTIONS);
  const [useVectorSvg, setUseVectorSvg] = useState(false);
  const [stage, setStage] = useState<ExportStage>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  /* React state updates are batched/async, so a plain `stage === "preparing"`
   * check can't stop two clicks that land in the same tick before the first
   * re-render commits. This ref is set synchronously and is the real guard;
   * `stage`/`busy` only drive the UI (disabled attribute, spinner). */
  const runningRef = useRef(false);

  const busy = stage === "preparing";
  const project = defaultProjectTitle();

  const runExport = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setStage("preparing");
    setStatusMessage("Preparing…");
    const toastId = "zonuert-export";
    toast.loading("Preparing export…", { id: toastId });
    try {
      if (format === "png" && useVectorSvg) {
        await exportSvg(project);
      } else if (format === "png") {
        await exportPng(project, visual);
      } else if (format === "pdf") {
        await exportPdf(project, visual, presentation);
      } else if (format === "data") {
        await exportCsv(project);
        await exportJson(project);
      } else {
        await buildPresentationPack(project, visual, presentation, (packStage: PackProgressStage) => {
          setStatusMessage(packStage);
          toast.loading(packStage, { id: toastId });
        });
      }
      setStage("complete");
      setStatusMessage("Complete");
      toast.success("Export complete", { id: toastId });
    } catch (err) {
      setStage("error");
      const message = err instanceof Error ? err.message : "Export failed.";
      setStatusMessage(message);
      toast.error(message, { id: toastId });
    } finally {
      runningRef.current = false;
    }
  };

  const showVisual = format !== "data";
  const showPresentation = format === "pdf" || format === "pack";

  return (
    <>
      <WidgetSection title="Export" hint="Current Canvas" defaultOpen>
        <span className="org-subcap">Current view · one Canvas</span>
      </WidgetSection>

      <WidgetSection title="Format" defaultOpen>
        <ChipRow
          options={FORMAT_OPTIONS}
          value={format}
          onChange={(id) => setFormat(id)}
          ariaLabel="Export format"
        />
        {format === "png" && (
          <>
            <SwitchRow
              label="Vector (SVG)"
              on={useVectorSvg}
              onToggle={() => setUseVectorSvg((v) => !v)}
            />
            {useVectorSvg && (
              <p className="wexport-unavailable">Vector export includes Cells and labels; the Membrane remains raster-only.</p>
            )}
          </>
        )}
      </WidgetSection>

      {showVisual && !(format === "png" && useVectorSvg) && (
        <WidgetSection title="Visual" defaultOpen>
          <ChipRow
            options={RESOLUTION_OPTIONS}
            value={String(visual.resolution)}
            onChange={(id) => setVisual((v) => ({ ...v, resolution: Number(id) as ExportResolutionScale }))}
            ariaLabel="Export resolution"
          />
          <ChipRow
            options={BACKGROUND_OPTIONS}
            value={visual.background}
            onChange={(id) => setVisual((v) => ({ ...v, background: id }))}
            ariaLabel="Export background"
          />
          <ChipRow
            options={LABELS_OPTIONS}
            value={visual.labels}
            onChange={(id) => setVisual((v) => ({ ...v, labels: id }))}
            ariaLabel="Export labels"
          />
          <ChipRow
            options={SELECTION_OPTIONS}
            value={visual.selection}
            onChange={(id) => setVisual((v) => ({ ...v, selection: id }))}
            ariaLabel="Export selection state"
          />
          <ChipRow
            options={PADDING_OPTIONS}
            value={visual.padding}
            onChange={(id) => setVisual((v) => ({ ...v, padding: id }))}
            ariaLabel="Export padding"
          />
          <span className="org-subcap">Chrome-free capture · scale never touches canvas</span>
        </WidgetSection>
      )}

      {showPresentation && (
        <WidgetSection title="Presentation" defaultOpen>
          <ChipRow
            options={PAGE_OPTIONS}
            value={presentation.page}
            onChange={(id) => setPresentation((p) => ({ ...p, page: id }))}
            ariaLabel="Page size"
          />
          <ChipRow
            options={ORIENTATION_OPTIONS}
            value={presentation.orientation}
            onChange={(id) => setPresentation((p) => ({ ...p, orientation: id }))}
            ariaLabel="Page orientation"
          />
          <label className="wexport-field">
            <span>Title</span>
            <input
              className="wexport-input"
              type="text"
              value={presentation.title}
              placeholder={project}
              maxLength={120}
              onChange={(e) => setPresentation((p) => ({ ...p, title: e.target.value }))}
            />
          </label>
          <SwitchRow
            label="Programmed area"
            on={presentation.includeAreaMeta}
            onToggle={() => setPresentation((p) => ({ ...p, includeAreaMeta: !p.includeAreaMeta }))}
          />
          <SwitchRow
            label="Space count"
            on={presentation.includeCountMeta}
            onToggle={() => setPresentation((p) => ({ ...p, includeCountMeta: !p.includeCountMeta }))}
          />
          <SwitchRow
            label="Export date"
            on={presentation.includeDateMeta}
            onToggle={() => setPresentation((p) => ({ ...p, includeDateMeta: !p.includeDateMeta }))}
          />
        </WidgetSection>
      )}

      <WidgetSection title="Generate" defaultOpen>
        <button type="button" className="wexport-primary" disabled={busy} onClick={runExport}>
          {busy && <Loader2 size={12} className="wexport-spin" />}
          {format === "png" && useVectorSvg ? "Export SVG" : PRIMARY_LABEL[format]}
        </button>
        {stage !== "idle" && (
          <p className="wexport-status" data-stage={stage}>
            {busy && <Loader2 size={10} className="wexport-spin" />}
            {statusMessage}
          </p>
        )}
        {format === "data" && (
          <div className="wexport-transfer-actions">
            <button type="button" className="wexport-secondary" disabled={busy} onClick={() => void downloadFullProject(project).then(() => toast.success("Project file downloaded")).catch((error) => toast.error(error instanceof Error ? error.message : "Project download failed."))}>Download Project</button>
            <button type="button" className="wexport-secondary" disabled={busy} onClick={() => void downloadConfig(project).then(() => toast.success("Configuration downloaded")).catch((error) => toast.error(error instanceof Error ? error.message : "Configuration download failed."))}>Download Config</button>
          </div>
        )}
      </WidgetSection>
    </>
  );
}
