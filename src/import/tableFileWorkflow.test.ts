import { strict as assert } from "node:assert";
import test from "node:test";
import * as XLSX from "xlsx";
import { useLab } from "../state/store";
import { calculateVirtualRowWindow } from "../views/TableView";
import { applySpaceSchedule } from "./projectTransfer";
import {
  TABLE_TEMPLATE_FILENAME,
  buildTableTemplateCsv,
  buildTableTemplateWorkbook,
  canImportTablePreview,
  clearTableFileInput,
  parseTableFile,
} from "./tableFileWorkflow";
import { applyTableImport, parseCsvTable } from "./tableImport";

const fileLike = (
  name: string,
  contents: string | ArrayBuffer,
): File => ({
  name,
  size: typeof contents === "string" ? new TextEncoder().encode(contents).byteLength : contents.byteLength,
  text: async () => typeof contents === "string" ? contents : new TextDecoder().decode(contents),
  arrayBuffer: async () => typeof contents === "string"
    ? new TextEncoder().encode(contents).buffer
    : contents,
}) as File;

const workbookBuffer = (workbook: XLSX.WorkBook): ArrayBuffer => {
  const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer | Uint8Array;
  if (data instanceof ArrayBuffer) return data;
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
};

test("template workbook contains the SPACES schema, examples, and README guidance", () => {
  const workbook = buildTableTemplateWorkbook(XLSX);
  assert.equal(TABLE_TEMPLATE_FILENAME, "mooorf-space-schedule-template.xlsx");
  assert.deepEqual(workbook.SheetNames, ["SPACES", "README"]);

  const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets.SPACES, {
    header: 1,
    raw: true,
    defval: "",
  }) as unknown[][];
  assert.deepEqual(rows[0], ["id", "no", "name", "area", "body", "category", "privacy", "kind", "color", "x", "y"]);
  assert.equal(rows.length, 4, "template includes exactly three example rows");
  assert.deepEqual(rows.slice(1).map((row) => row[1]), ["01", "02", "03"], "template examples provide stable Space Nos");

  const readme = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets.README, {
    header: 1,
    raw: true,
    defval: "",
  }) as unknown[][];
  const guidance = readme.flat().join(" ");
  assert.match(guidance, /Name and Area are required/i);
  assert.match(guidance, /positive number in m²/i);
  assert.match(guidance, /public, shared, private/i);
  assert.match(guidance, /space or void/i);
  assert.match(guidance, /Duplicate No\. values are reassigned/i);
  assert.match(guidance, /Do not rename the SPACES sheet unnecessarily/i);
});

test("CSV template reuses the schedule schema and preserves stable Space Nos", () => {
  const csv = buildTableTemplateCsv();
  const preview = parseCsvTable(csv);
  assert.equal(csv.split("\r\n")[0], "id,no,name,area,body,category,privacy,kind,color,x,y");
  assert.deepEqual(preview.rows.map((row) => row.spaceCode), ["01", "02", "03"]);
  assert.equal(preview.errorCount, 0, "CSV template is immediately importable");
});

test("CSV and XLSX uploads reuse the table parsers and select one worksheet", async () => {
  const csv = await parseTableFile(fileLike("schedule.csv", "name,area,body\nStudio,80,North light"));
  assert.equal(csv.sheetName, "CSV");
  assert.equal(csv.preview.rows[0].body, "North light");

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["name", "area"], ["Wrong", 1]]), "FIRST");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["name", "area"], ["Preferred", 2]]), "SPACES");
  const preferred = await parseTableFile(fileLike("preferred.xlsx", workbookBuffer(workbook)));
  assert.equal(preferred.sheetName, "SPACES");
  assert.equal(preferred.preview.rows[0].name, "Preferred");

  const fallbackWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(fallbackWorkbook, XLSX.utils.aoa_to_sheet([]), "EMPTY");
  XLSX.utils.book_append_sheet(fallbackWorkbook, XLSX.utils.aoa_to_sheet([["name", "area"], ["Fallback", 3]]), "SCHEDULE");
  const fallback = await parseTableFile(fileLike("fallback.xls", workbookBuffer(fallbackWorkbook)));
  assert.equal(fallback.sheetName, "SCHEDULE");
  assert.equal(fallback.preview.rows[0].name, "Fallback");
});

test("upload validation blocks errors, permits warnings, and resets repeated selection", async () => {
  await assert.rejects(
    parseTableFile(fileLike("schedule.txt", "name,area\nRoom,10")),
    /unsupported file type/i,
  );
  await assert.rejects(
    parseTableFile(fileLike("empty.csv", "")),
    /empty/i,
  );

  const errors = parseCsvTable("name,area\nBroken,-1");
  const warnings = parseCsvTable("name,area,privacy\nRoom,10,unknown");
  assert.equal(canImportTablePreview(errors), false);
  assert.equal(canImportTablePreview(warnings), true);

  const input = { value: "/fake/schedule.csv" };
  clearTableFileInput(input);
  assert.equal(input.value, "");
});

test("atomic schedule apply clears stale selection and previews but preserves workspace settings", () => {
  const before = useLab.getState();
  const originalSpace = {
    id: "old",
    name: "Old",
    area: 20,
    category: "Work",
    privacy: "shared" as const,
    color: "",
    x: 1,
    y: 2,
  };
  useLab.setState({
    spaces: [originalSpace],
    selectedId: "old",
    primarySelectedId: "old",
    selectedIds: ["old"],
    appearancePreview: [originalSpace],
    appearancePreviewIds: ["old"],
    appearancePreviewTarget: "cell",
    presentationDefaultsPreview: before.settings.presentationDefaults,
    arrangementPreview: [{ id: "old", x: 5, y: 6 }],
    arrangementPreviewPatternId: "organic",
  });
  const stable = useLab.getState();
  const replacement = applyTableImport(
    stable.spaces,
    parseCsvTable("name,area\nNew,40").rows,
    "replace",
  ).spaces;

  applySpaceSchedule(replacement);
  const after = useLab.getState();
  assert.equal(after.spaces.length, 1);
  assert.equal(after.spaces[0].name, "New");
  assert.deepEqual(after.selectedIds, []);
  assert.equal(after.primarySelectedId, null);
  assert.equal(after.appearancePreview, null);
  assert.equal(after.presentationDefaultsPreview, null);
  assert.equal(after.arrangementPreview, null);
  assert.equal(after.theme, stable.theme);
  assert.deepEqual(after.camera, stable.camera);
  assert.equal(after.settings, stable.settings);
  assert.deepEqual(after.openWidgets, stable.openWidgets);
});

test("500 imported rows remain compatible with the bounded Table window", async () => {
  const csv = [
    "name,area",
    ...Array.from({ length: 500 }, (_, index) => `Space ${index + 1},${index + 10}`),
  ].join("\n");
  const parsed = await parseTableFile(fileLike("five-hundred.csv", csv));
  assert.equal(parsed.preview.validCount, 500);
  const applied = applyTableImport([], parsed.preview.rows, "replace");
  assert.equal(applied.spaces.length, 500);

  const window = calculateVirtualRowWindow({
    rowCount: applied.spaces.length,
    scrollTop: 250 * 55,
    viewportHeight: 720,
    rowHeight: 55,
    overscan: 8,
  });
  assert.ok(window.mountedRowCount <= 60);
});
