import { parseConfigEnvelope, parseProjectEnvelope, previewConfigChanges, type MooorfConfigEnvelope, type MooorfProjectEnvelope } from "./projectFiles";
import { parseCsvTable, parseWorksheetTable, type TablePreview } from "./tableImport";
import { useLab } from "../state/store";

export type IntakeStatus = "queued" | "reading" | "parsing" | "validating" | "review" | "applying" | "complete" | "failed";

export interface SpreadsheetSheet {
  name: string;
  rows: unknown[][];
  preview: TablePreview;
}

export type FileReview =
  | { kind: "project"; project: MooorfProjectEnvelope; summary: string }
  | { kind: "config"; config: MooorfConfigEnvelope; summary: string }
  | { kind: "table"; format: "csv" | "xls" | "xlsx"; sheets: SpreadsheetSheet[]; selectedSheet: number; preview: TablePreview; summary: string };

export interface IntakeProgress {
  status: IntakeStatus;
  progress?: number;
}

const JSON_MAX = 10 * 1024 * 1024;
const TABLE_MAX = 25 * 1024 * 1024;

const extensionOf = (name: string) => name.toLowerCase();
const begins = (bytes: Uint8Array, signature: readonly number[]) => signature.every((value, index) => bytes[index] === value);

const readBuffer = (file: File, onProgress: (progress: IntakeProgress) => void): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) onProgress({ status: "reading", progress: Math.round((event.loaded / event.total) * 55) });
      else onProgress({ status: "reading" });
    };
    reader.onerror = () => reject(new Error("The local file could not be read."));
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  });

const decode = (buffer: ArrayBuffer) => new TextDecoder("utf-8", { fatal: false }).decode(buffer);

export const readIntakeFile = async (
  file: File,
  onProgress: (progress: IntakeProgress) => void
): Promise<FileReview> => {
  const name = extensionOf(file.name);
  const mime = file.type.toLowerCase();
  if (mime === "application/pdf" || mime.startsWith("image/") || mime.includes("executable") || mime.includes("x-msdownload")) {
    throw new Error("This presentation or executable MIME type is not importable.");
  }
  const tableLike = name.endsWith(".csv") || name.endsWith(".xls") || name.endsWith(".xlsx");
  const jsonLike = name.endsWith(".mooorf") || name.endsWith(".json");
  if (!tableLike && !jsonLike) {
    if (name.endsWith(".pdf") || name.endsWith(".png") || name.endsWith(".svg") || name.endsWith(".zip")) {
      throw new Error("Presentation exports cannot be imported. Use a .mooorf project, configuration JSON, CSV, XLS, or XLSX file.");
    }
    throw new Error("Unsupported file type. Accepted: .mooorf, .json, .csv, .xls, .xlsx.");
  }
  const max = tableLike ? TABLE_MAX : JSON_MAX;
  if (file.size > max) throw new Error(`File is too large. ${tableLike ? "Tables" : "Project/config files"} are limited to ${max / 1024 / 1024} MB.`);
  onProgress({ status: "reading", progress: 0 });
  const buffer = await readBuffer(file, onProgress);
  const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 16));
  if (begins(bytes, [0x25, 0x50, 0x44, 0x46])) throw new Error("PDF presentation exports are not importable.");

  if (jsonLike) {
    const text = decode(buffer).replace(/^\uFEFF/, "").trim();
    if (!text.startsWith("{") && !text.startsWith("[")) throw new Error("The file content is not JSON.");
    onProgress({ status: "parsing", progress: 62 });
    let discriminator = "";
    try {
      const root = JSON.parse(text) as { kind?: unknown };
      discriminator = typeof root?.kind === "string" ? root.kind : "";
    } catch {
      throw new Error("Malformed JSON file.");
    }
    onProgress({ status: "validating", progress: 78 });
    if (discriminator === "mooorf-config" || name.endsWith(".mooorf-config.json")) {
      const config = parseConfigEnvelope(text);
      const preview = previewConfigChanges(config, useLab.getState().spaces);
      return { kind: "config", config, summary: `${preview.settingsChanged.length} workspace groups · ${preview.matchingLayoutIds} matching layouts · ${preview.unmatchedLayoutIds} unmatched` };
    }
    const project = parseProjectEnvelope(text);
    return { kind: "project", project, summary: `${project.snapshot.spaces.length} spaces · ${project.savedViews.length} saved views · replaces current project` };
  }

  if (name.endsWith(".csv")) {
    onProgress({ status: "parsing", progress: 62 });
    const preview = parseCsvTable(decode(buffer));
    onProgress({ status: "validating", progress: 78 });
    return { kind: "table", format: "csv", sheets: [{ name: "CSV", rows: preview.sourceRows, preview }], selectedSheet: 0, preview, summary: `${preview.validCount} valid · ${preview.warningCount} warnings · ${preview.errorCount} errors` };
  }

  const xlsxSignature = begins(bytes, [0x50, 0x4b, 0x03, 0x04]);
  const xlsSignature = begins(bytes, [0xd0, 0xcf, 0x11, 0xe0]);
  if (name.endsWith(".xlsx") && !xlsxSignature) throw new Error("The .xlsx file signature is invalid.");
  if (name.endsWith(".xls") && !xlsSignature) throw new Error("The .xls file signature is invalid.");
  onProgress({ status: "parsing" });
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, { type: "array", cellFormula: false, cellHTML: false, dense: true });
  const sheets = workbook.SheetNames.slice(0, 50).map((sheetName) => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, raw: true, defval: "" }) as unknown[][];
    return { name: sheetName, rows, preview: parseWorksheetTable(sheetName, rows) };
  });
  onProgress({ status: "validating", progress: 78 });
  if (sheets.length === 0) throw new Error("The workbook has no worksheets.");
  const selectedSheet = Math.max(0, sheets.findIndex((sheet) => sheet.preview.validCount > 0));
  const preview = sheets[selectedSheet].preview;
  return { kind: "table", format: name.endsWith(".xls") ? "xls" : "xlsx", sheets, selectedSheet, preview, summary: `${sheets.length} sheets · ${preview.validCount} valid · ${preview.warningCount} warnings · ${preview.errorCount} errors` };
};
