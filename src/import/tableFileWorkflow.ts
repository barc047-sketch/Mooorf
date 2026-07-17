import type * as Xlsx from "xlsx";
import { parseCsvTable, parseWorksheetTable, type TablePreview } from "./tableImport";

export const TABLE_TEMPLATE_FILENAME = "mooorf-space-schedule-template.xlsx";
export const TABLE_FILE_ACCEPT = ".csv,.xlsx,.xls";

type XlsxModule = typeof Xlsx;
type TableFile = Pick<File, "name" | "size" | "text" | "arrayBuffer">;

export interface ParsedTableFile {
  filename: string;
  sheetName: string;
  preview: TablePreview;
}

const TEMPLATE_HEADERS = [
  "id",
  "name",
  "area",
  "body",
  "category",
  "privacy",
  "kind",
  "color",
  "x",
  "y",
];

const TEMPLATE_ROWS = [
  ["studio-a", "Studio", 80, "Open creative workspace", "Work", "shared", "space", "#c8a56a", 120, 140],
  ["meeting-b", "Meeting Room", 28, "Eight-person meeting room", "Public", "public", "space", "#8aa8b8", 280, 180],
  ["courtyard-c", "Courtyard", 45, "Open-air shared space", "Outdoor", "shared", "void", "#9cad88", "", ""],
];

const README_ROWS = [
  ["MOOORF Space Schedule Template"],
  [""],
  ["Name and Area are required."],
  ["Area must be a positive number in m²."],
  ["Privacy: public, shared, private."],
  ["Kind: space or void."],
  ["ID, body, color, x and y are optional."],
  ["Do not rename the SPACES sheet unnecessarily."],
];

export const buildTableTemplateWorkbook = (XLSX: XlsxModule): Xlsx.WorkBook => {
  const workbook = XLSX.utils.book_new();
  const spacesSheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_ROWS]);
  spacesSheet["!cols"] = [
    { wch: 16 },
    { wch: 24 },
    { wch: 12 },
    { wch: 34 },
    { wch: 18 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
  ];
  const readmeSheet = XLSX.utils.aoa_to_sheet(README_ROWS);
  readmeSheet["!cols"] = [{ wch: 62 }];
  XLSX.utils.book_append_sheet(workbook, spacesSheet, "SPACES");
  XLSX.utils.book_append_sheet(workbook, readmeSheet, "README");
  return workbook;
};

export const downloadTableTemplate = async (): Promise<void> => {
  const [XLSX, { saveAs }] = await Promise.all([
    import("xlsx"),
    import("file-saver"),
  ]);
  const workbook = buildTableTemplateWorkbook(XLSX);
  const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  saveAs(
    new Blob(
      [data],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    ),
    TABLE_TEMPLATE_FILENAME,
  );
};

const extensionOf = (filename: string): string => {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
};

const hasWorksheetContent = (sheet: Xlsx.WorkSheet | undefined): boolean =>
  Boolean(sheet?.["!ref"]);

const selectWorksheet = (workbook: Xlsx.WorkBook): string => {
  const preferred = workbook.SheetNames.find(
    (name) => name.trim().toUpperCase() === "SPACES" && hasWorksheetContent(workbook.Sheets[name]),
  );
  if (preferred) return preferred;
  const fallback = workbook.SheetNames.find((name) => hasWorksheetContent(workbook.Sheets[name]));
  if (!fallback) throw new Error("Workbook has no non-empty worksheets.");
  return fallback;
};

export const parseTableFile = async (file: TableFile): Promise<ParsedTableFile> => {
  const extension = extensionOf(file.name);
  if (![".csv", ".xlsx", ".xls"].includes(extension)) {
    throw new Error("Unsupported file type. Upload a CSV, XLSX, or XLS file.");
  }
  if (file.size <= 0) throw new Error("The selected file is empty.");

  if (extension === ".csv") {
    const text = await file.text();
    if (!text.trim()) throw new Error("The selected file is empty.");
    const preview = { ...parseCsvTable(text), sheetName: "CSV" };
    return { filename: file.name, sheetName: "CSV", preview };
  }

  const buffer = await file.arrayBuffer();
  if (buffer.byteLength === 0) throw new Error("The selected file is empty.");
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellFormula: false,
    cellHTML: false,
    dense: true,
  });
  const sheetName = selectWorksheet(workbook);
  const sourceRows = XLSX.utils.sheet_to_json<unknown[]>(
    workbook.Sheets[sheetName],
    { header: 1, raw: true, defval: "" },
  ) as unknown[][];
  const preview = parseWorksheetTable(sheetName, sourceRows);
  return { filename: file.name, sheetName, preview };
};

export const canImportTablePreview = (preview: TablePreview): boolean =>
  preview.validCount > 0 && preview.errorCount === 0;

export const clearTableFileInput = (input: Pick<HTMLInputElement, "value">): void => {
  input.value = "";
};
