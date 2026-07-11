import { Fragment, useEffect, useState } from "react";
import { FileJson, FileSpreadsheet, RotateCcw, Trash2, Upload } from "lucide-react";
import { useFileIntake } from "../../import/FileIntakeProvider";
import type { ImportField, TableImportMode } from "../../import/tableImport";
import { ChipRow, WidgetSection } from "./controls";

const MODES = [
  { id: "replace", label: "Replace" },
  { id: "merge-id", label: "Merge ID" },
  { id: "merge-name", label: "Merge Name" },
  { id: "append", label: "Append" },
] as const satisfies readonly { id: TableImportMode; label: string }[];

const FIELDS: readonly { id: ImportField; label: string }[] = [
  { id: "name", label: "Name" }, { id: "area", label: "Area" }, { id: "id", label: "ID" },
  { id: "category", label: "Category" }, { id: "privacy", label: "Privacy" }, { id: "kind", label: "Kind" },
  { id: "color", label: "Color" }, { id: "x", label: "X" }, { id: "y", label: "Y" },
];

const statusLabel: Record<string, string> = {
  queued: "Queued", reading: "Reading", parsing: "Parsing", validating: "Validating",
  review: "Awaiting review", applying: "Applying", complete: "Complete", failed: "Failed",
};

const sizeLabel = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default function FileIntakeWidget() {
  const intake = useFileIntake();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<TableImportMode>("append");
  useEffect(() => {
    if (!selectedId && intake.items[0]) setSelectedId(intake.items[0].id);
    if (selectedId && !intake.items.some((item) => item.id === selectedId)) setSelectedId(intake.items[0]?.id ?? null);
  }, [intake.items, selectedId]);
  const item = intake.items.find((candidate) => candidate.id === selectedId) ?? intake.items[0];
  const table = item?.review?.kind === "table" ? item.review : null;
  const rows = table?.preview.rows.slice(0, 12) ?? [];

  return (
    <>
      <WidgetSection title="Files" hint={`${intake.items.length}/5`} defaultOpen>
        <button type="button" className="file-browse" onClick={intake.browse}><Upload size={12} /> Browse files</button>
        {intake.items.length === 0 && <p className="file-empty">Drop a project, config, CSV, XLS, or XLSX anywhere over the canvas.</p>}
        <div className="file-queue">
          {intake.items.map((entry) => (
            <button key={entry.id} type="button" className="file-queue-row" data-active={entry.id === item?.id} onClick={() => setSelectedId(entry.id)}>
              {entry.review?.kind === "table" ? <FileSpreadsheet size={13} /> : <FileJson size={13} />}
              <span><strong>{entry.file.name}</strong><small>{sizeLabel(entry.file.size)} · {statusLabel[entry.status]}</small></span>
              {entry.status === "failed" ? <RotateCcw size={12} onClick={(event) => { event.stopPropagation(); intake.retry(entry.id); }} /> : <Trash2 size={12} onClick={(event) => { event.stopPropagation(); intake.remove(entry.id); }} />}
              {(entry.progress !== undefined || entry.status === "parsing") && (
                <i className="file-progress" data-indeterminate={entry.progress === undefined ? "true" : undefined} role="progressbar" aria-label={`${entry.file.name} ${statusLabel[entry.status]}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={entry.progress}>
                  <span style={entry.progress === undefined ? undefined : { width: `${entry.progress}%` }} />
                </i>
              )}
            </button>
          ))}
        </div>
      </WidgetSection>

      {item?.error && <WidgetSection title="Error"><p className="file-error">{item.error}</p></WidgetSection>}

      {item?.review && (
        <WidgetSection title="Preview" hint={item.review.kind.toUpperCase()} defaultOpen>
          <p className="file-summary">{item.review.summary}</p>
          {table && table.sheets.length > 1 && (
            <label className="file-field"><span>Worksheet</span><select value={table.selectedSheet} onChange={(event) => intake.selectSheet(item.id, Number(event.target.value))}>{table.sheets.map((sheet, index) => <option key={sheet.name} value={index}>{sheet.name}</option>)}</select></label>
          )}
          {table && (
            <div className="file-mapping">
              {FIELDS.map((field) => (
                <label key={field.id} className="file-field"><span>{field.label}{field.id === "name" || field.id === "area" ? " *" : ""}</span><select value={table.preview.mapping[field.id] ?? ""} onChange={(event) => intake.remap(item.id, { ...table.preview.mapping, [field.id]: event.target.value === "" ? undefined : Number(event.target.value) })}><option value="">Not mapped</option>{table.preview.headers.map((header, index) => <option key={`${header}-${index}`} value={index}>{header || `Column ${index + 1}`}</option>)}</select></label>
              ))}
            </div>
          )}
          {table && rows.length > 0 && <div className="file-preview-table"><div>Name</div><div>Area</div>{rows.map((row) => <Fragment key={row.sourceRow}><span>{row.name}</span><span>{row.area} m²</span></Fragment>)}</div>}
          {table && table.preview.diagnostics.length > 0 && <div className="file-diagnostics">{table.preview.diagnostics.slice(0, 8).map((diagnostic, index) => <p key={`${diagnostic.row}-${index}`} data-level={diagnostic.level}>Row {diagnostic.row}: {diagnostic.message}</p>)}</div>}
        </WidgetSection>
      )}

      {table && <WidgetSection title="Mode" defaultOpen><ChipRow options={MODES} value={mode} onChange={setMode} ariaLabel="Table import mode" /></WidgetSection>}

      {item?.review && item.status !== "complete" && (
        <WidgetSection title="Action" defaultOpen>
          <button type="button" className="file-apply" disabled={Boolean(intake.applyingId) || (table?.preview.validCount ?? 1) === 0} onClick={() => intake.apply(item.id, mode)}>
            {item.review.kind === "project" ? "Open Project" : item.review.kind === "config" ? "Apply Config" : "Apply Import"}
          </button>
          {item.review.kind === "project" && <p className="file-warning">Replaces the current project after confirmation. An automatic recovery snapshot enables Undo.</p>}
        </WidgetSection>
      )}
    </>
  );
}
