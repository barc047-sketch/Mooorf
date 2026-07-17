import Papa from "papaparse";
import { scatterPoint } from "../lib/geometry";
import { nextSpaceCode, normalizeSpaceCode } from "../labels/spaceCode";
import type { Privacy, SpaceCell, SpaceKind } from "../types";

export type ImportField = "spaceCode" | "id" | "name" | "area" | "body" | "category" | "privacy" | "kind" | "color" | "x" | "y";
export type ColumnMapping = Partial<Record<ImportField, number>>;
export type TableImportMode = "replace" | "merge-id" | "merge-name" | "append";
export const MAX_TABLE_ROWS = 50_000;

export interface ImportedSpaceRow {
  sourceRow: number;
  spaceCode?: string;
  id?: string;
  name: string;
  area: number;
  body: string;
  category: string;
  privacy: Privacy;
  kind: SpaceKind;
  color: string;
  x?: number;
  y?: number;
}

export interface ImportDiagnostic {
  row: number;
  level: "warning" | "error";
  message: string;
}

export interface TablePreview {
  sheetName?: string;
  headers: string[];
  sourceRows: unknown[][];
  headerRow: number;
  mapping: ColumnMapping;
  rows: ImportedSpaceRow[];
  diagnostics: ImportDiagnostic[];
  validCount: number;
  warningCount: number;
  errorCount: number;
}

const ALIASES: Record<ImportField, readonly string[]> = {
  spaceCode: ["spacecode", "space code", "space no", "space no.", "no", "no.", "number", "serial", "code"],
  id: ["id", "space id", "room id"],
  name: ["name", "space", "space name", "room", "room name"],
  area: ["area", "area m2", "area m²", "area sqm", "sqm", "m2", "m²"],
  body: ["body", "description", "notes"],
  category: ["category", "type", "program"],
  privacy: ["privacy", "access"],
  kind: ["kind", "space kind"],
  color: ["color", "colour", "hex"],
  x: ["x", "pos x", "position x"],
  y: ["y", "pos y", "position y"],
};

const normalize = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_/-]+/g, " ")
    .replace(/\s+/g, " ");

const cleanText = (value: unknown, max = 240): string => String(value ?? "").trim().slice(0, max);
const finiteOptional = (value: unknown): number | undefined => {
  if (value === undefined || value === null || String(value).trim() === "") return undefined;
  const number = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(number) ? number : undefined;
};

export const autoMapHeaders = (headers: readonly unknown[]): ColumnMapping => {
  const mapping: ColumnMapping = {};
  const normalized = headers.map(normalize);
  for (const field of Object.keys(ALIASES) as ImportField[]) {
    const index = normalized.findIndex((header) => ALIASES[field].includes(header));
    if (index >= 0) mapping[field] = index;
  }
  return mapping;
};

const findHeaderRow = (rows: readonly unknown[][]): number => {
  const limit = Math.min(rows.length, 20);
  for (let index = 0; index < limit; index += 1) {
    const mapping = autoMapHeaders(rows[index]);
    if (mapping.name !== undefined && mapping.area !== undefined) return index;
  }
  return -1;
};

const parseRows = (
  sourceRows: unknown[][],
  headerRow: number,
  mapping: ColumnMapping,
  sheetName?: string
): TablePreview => {
  const diagnostics: ImportDiagnostic[] = [];
  const rows: ImportedSpaceRow[] = [];
  if (sourceRows.length > MAX_TABLE_ROWS + 20) {
    diagnostics.push({ row: 1, level: "error", message: `Table exceeds the ${MAX_TABLE_ROWS.toLocaleString()} row limit.` });
    return { sheetName, headers: [], sourceRows: [], headerRow: -1, mapping: {}, rows, diagnostics, validCount: 0, warningCount: 0, errorCount: 1 };
  }
  const seenCodes = new Map<string, number>();
  const seenIds = new Map<string, number>();
  const seenNames = new Map<string, number>();
  if (headerRow < 0 || mapping.name === undefined || mapping.area === undefined) {
    diagnostics.push({ row: Math.max(1, headerRow + 1), level: "error", message: "Could not identify required Name and Area columns." });
    return { sheetName, headers: headerRow >= 0 ? sourceRows[headerRow].map(cleanText) : [], sourceRows, headerRow, mapping, rows, diagnostics, validCount: 0, warningCount: 0, errorCount: 1 };
  }
  for (let index = headerRow + 1; index < sourceRows.length; index += 1) {
    const source = sourceRows[index];
    if (source.every((cell) => cleanText(cell) === "")) continue;
    const sourceRow = index + 1;
    const name = cleanText(source[mapping.name]);
    const rawArea = source[mapping.area];
    const area = typeof rawArea === "number" ? rawArea : Number(cleanText(rawArea).replace(/,/g, ""));
    if (!name) {
      diagnostics.push({ row: sourceRow, level: "error", message: "Name is required." });
      continue;
    }
    if (!Number.isFinite(area) || area <= 0) {
      diagnostics.push({ row: sourceRow, level: "error", message: "Area must be a finite positive number." });
      continue;
    }
    const spaceCode = mapping.spaceCode === undefined ? undefined : normalizeSpaceCode(source[mapping.spaceCode]);
    const id = mapping.id === undefined ? "" : cleanText(source[mapping.id], 160);
    const normalizedName = normalize(name);
    if (spaceCode && seenCodes.has(spaceCode)) diagnostics.push({ row: sourceRow, level: "warning", message: `Duplicate Space No. "${spaceCode}" (first seen at row ${seenCodes.get(spaceCode)}).` });
    if (id && seenIds.has(id)) diagnostics.push({ row: sourceRow, level: "warning", message: `Duplicate ID "${id}" (first seen at row ${seenIds.get(id)}).` });
    if (seenNames.has(normalizedName)) diagnostics.push({ row: sourceRow, level: "warning", message: `Duplicate name "${name}" (first seen at row ${seenNames.get(normalizedName)}).` });
    if (spaceCode && !seenCodes.has(spaceCode)) seenCodes.set(spaceCode, sourceRow);
    if (id && !seenIds.has(id)) seenIds.set(id, sourceRow);
    if (!seenNames.has(normalizedName)) seenNames.set(normalizedName, sourceRow);
    const privacyText = mapping.privacy === undefined ? "shared" : normalize(source[mapping.privacy]);
    const privacy: Privacy = privacyText === "public" || privacyText === "private" || privacyText === "shared" ? privacyText : "shared";
    if (privacyText && privacyText !== privacy) diagnostics.push({ row: sourceRow, level: "warning", message: `Unknown privacy "${privacyText}" normalized to shared.` });
    const kindText = mapping.kind === undefined ? "space" : normalize(source[mapping.kind]);
    const kind: SpaceKind = kindText === "void" ? "void" : "space";
    if (kindText && kindText !== "space" && kindText !== "void") diagnostics.push({ row: sourceRow, level: "warning", message: `Unknown kind "${kindText}" normalized to space.` });
    const rawColor = mapping.color === undefined ? "" : cleanText(source[mapping.color], 64);
    const color = rawColor && /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(rawColor) ? rawColor.toLowerCase() : "";
    if (rawColor && !color) diagnostics.push({ row: sourceRow, level: "warning", message: `Invalid color "${rawColor}" ignored.` });
    const x = mapping.x === undefined ? undefined : finiteOptional(source[mapping.x]);
    const y = mapping.y === undefined ? undefined : finiteOptional(source[mapping.y]);
    if (mapping.x !== undefined && cleanText(source[mapping.x]) && x === undefined) diagnostics.push({ row: sourceRow, level: "warning", message: "Invalid X coordinate ignored." });
    if (mapping.y !== undefined && cleanText(source[mapping.y]) && y === undefined) diagnostics.push({ row: sourceRow, level: "warning", message: "Invalid Y coordinate ignored." });
    rows.push({
      sourceRow,
      spaceCode,
      id: id || undefined,
      name,
      area,
      body: mapping.body === undefined ? "" : cleanText(source[mapping.body], 1200),
      category: mapping.category === undefined ? "Uncategorized" : cleanText(source[mapping.category]) || "Uncategorized",
      privacy,
      kind,
      color,
      x,
      y,
    });
  }
  return {
    sheetName,
    headers: sourceRows[headerRow].map(cleanText),
    sourceRows,
    headerRow,
    mapping,
    rows,
    diagnostics,
    validCount: rows.length,
    warningCount: diagnostics.filter((item) => item.level === "warning").length,
    errorCount: diagnostics.filter((item) => item.level === "error").length,
  };
};

export const parseWorksheetTable = (
  sheetName: string,
  sourceRows: unknown[][],
  mappingOverride?: ColumnMapping
): TablePreview => {
  if (sourceRows.length === 0) {
    return { sheetName, headers: [], sourceRows, headerRow: -1, mapping: {}, rows: [], diagnostics: [{ row: 1, level: "error", message: "Worksheet is empty." }], validCount: 0, warningCount: 0, errorCount: 1 };
  }
  const detectedHeader = findHeaderRow(sourceRows);
  const headerRow = detectedHeader >= 0 ? detectedHeader : sourceRows.findIndex((row) => row.some((cell) => cleanText(cell) !== ""));
  const mapping = mappingOverride ?? (headerRow >= 0 ? autoMapHeaders(sourceRows[headerRow]) : {});
  return parseRows(sourceRows, headerRow, mapping, sheetName);
};

export const parseCsvTable = (text: string, mappingOverride?: ColumnMapping): TablePreview => {
  const parsed = Papa.parse<unknown[]>(text, { skipEmptyLines: "greedy" });
  const sourceRows = parsed.data as unknown[][];
  const headerRow = findHeaderRow(sourceRows);
  const mapping = mappingOverride ?? (headerRow >= 0 ? autoMapHeaders(sourceRows[headerRow]) : {});
  const preview = parseRows(sourceRows, headerRow, mapping);
  for (const error of parsed.errors) {
    preview.diagnostics.push({ row: (error.row ?? 0) + 1, level: "error", message: error.message });
  }
  preview.errorCount = preview.diagnostics.filter((item) => item.level === "error").length;
  return preview;
};

const uniqueId = (desired: string, used: Set<string>, fallback: string): string => {
  const base = (desired.trim() || fallback).slice(0, 160);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) candidate = `${base}-${suffix++}`;
  used.add(candidate);
  return candidate;
};

const codeFromUsed = (usedCodes: Set<string>, desired?: string): string => {
  const preferred = normalizeSpaceCode(desired);
  if (preferred) {
    usedCodes.add(preferred);
    return preferred;
  }
  const code = nextSpaceCode([...usedCodes].map((spaceCode) => ({ spaceCode })));
  usedCodes.add(code);
  return code;
};

const newSpace = (
  row: ImportedSpaceRow,
  index: number,
  usedIds: Set<string>,
  usedCodes: Set<string>,
): SpaceCell => {
  const point = scatterPoint(index);
  return {
    id: uniqueId(row.id ?? "", usedIds, `import-${index + 1}`),
    spaceCode: codeFromUsed(usedCodes, row.spaceCode),
    name: row.name,
    area: row.area,
    body: row.body,
    category: row.category,
    privacy: row.privacy,
    kind: row.kind,
    color: row.color,
    x: row.x ?? point.x,
    y: row.y ?? point.y,
    born: Date.now() + index * 12,
  };
};

export const applyTableImport = (
  existing: readonly SpaceCell[],
  imported: readonly ImportedSpaceRow[],
  mode: TableImportMode
): { spaces: SpaceCell[]; added: number; updated: number; ignored: number } => {
  const base = mode === "replace" ? [] : existing.map((space) => ({ ...space }));
  const usedIds = new Set(base.map((space) => space.id));
  const usedCodes = new Set(base.map((space) => normalizeSpaceCode(space.spaceCode)).filter((code): code is string => Boolean(code)));
  let added = 0;
  let updated = 0;
  let ignored = 0;
  for (const row of imported) {
    const matchIndex = mode === "merge-id"
      ? base.findIndex((space) => Boolean(row.id) && space.id === row.id)
      : mode === "merge-name"
        ? base.findIndex((space) => normalize(space.name) === normalize(row.name))
        : -1;
    if (matchIndex >= 0) {
      const current = base[matchIndex];
      const importedCode = normalizeSpaceCode(row.spaceCode);
      if (importedCode) usedCodes.add(importedCode);
      base[matchIndex] = {
        ...current,
        spaceCode: importedCode ?? current.spaceCode,
        name: row.name,
        area: row.area,
        body: row.body,
        category: row.category,
        privacy: row.privacy,
        kind: row.kind,
        color: row.color || current.color,
        x: row.x ?? current.x,
        y: row.y ?? current.y,
      };
      updated += 1;
      continue;
    }
    if ((mode === "merge-id" && !row.id) || (mode === "merge-name" && !row.name)) {
      ignored += 1;
      continue;
    }
    base.push(newSpace(row, base.length, usedIds, usedCodes));
    added += 1;
  }
  return { spaces: base, added, updated, ignored };
};
