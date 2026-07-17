import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { SpaceCell } from "../types";
import { filterTableSpaces } from "./TableView";

const tableSource = readFileSync(new URL("./TableView.tsx", import.meta.url), "utf8");
const appCss = readFileSync(new URL("../App.css", import.meta.url), "utf8");

const spaces: SpaceCell[] = [
  {
    id: "studio-a",
    name: "North Studio",
    area: 80,
    body: "Soft daylight",
    category: "Work",
    privacy: "shared",
    kind: "space",
    color: "",
    x: 10,
    y: 20,
  },
  {
    id: "court-b",
    name: "Courtyard",
    area: 45,
    body: "Open air",
    category: "Outdoor",
    privacy: "public",
    kind: "void",
    color: "",
    x: 30,
    y: 40,
  },
];

test("Table search is local, case-insensitive, and spans the approved fields", () => {
  assert.equal(filterTableSpaces(spaces, ""), spaces, "empty query restores the canonical list");
  assert.deepEqual(filterTableSpaces(spaces, "NORTH").map(({ id }) => id), ["studio-a"]);
  assert.deepEqual(filterTableSpaces(spaces, "daylight").map(({ id }) => id), ["studio-a"]);
  assert.deepEqual(filterTableSpaces(spaces, "outdoor").map(({ id }) => id), ["court-b"]);
  assert.deepEqual(filterTableSpaces(spaces, "PUBLIC").map(({ id }) => id), ["court-b"]);
  assert.deepEqual(filterTableSpaces(spaces, "void").map(({ id }) => id), ["court-b"]);
  assert.deepEqual(filterTableSpaces(spaces, "court-b").map(({ id }) => id), ["court-b"]);
  assert.equal(spaces.length, 2, "search does not mutate canonical spaces");
});

test("Table owns the approved workspace structure and drop target", () => {
  assert.match(tableSource, /data-table-control-zone="true"/);
  assert.match(tableSource, /data-table-card-row="true"/);
  assert.match(tableSource, /data-table-upload-card="true"/);
  assert.match(tableSource, /data-table-download-card="true"/);
  assert.match(tableSource, /data-table-scroll-container="true"/);
  assert.match(tableSource, /onDragEnter=/);
  assert.match(tableSource, /onDragOver=/);
  assert.match(tableSource, /onDrop=/);
  assert.match(tableSource, /event\.stopPropagation\(\)/);
  assert.match(tableSource, /Search spaces…/);
  assert.match(tableSource, /visibleSpaces\.length/);
  assert.match(tableSource, /Download XLSX/);
  assert.match(tableSource, /Download CSV/);
});

test("Table CSS protects the 35/65 vertical and 70/30 card splits", () => {
  assert.match(
    appCss,
    /\.table-workspace-layout\s*\{[\s\S]*?grid-template-rows:\s*minmax\(0,\s*35fr\)\s+minmax\(0,\s*65fr\)/,
  );
  assert.match(
    appCss,
    /\.table-control-cards\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*7fr\)\s+minmax\(260px,\s*3fr\)/,
  );
  assert.match(
    appCss,
    /\.table-zone__scroll\s*\{[\s\S]*?overflow:\s*auto/,
  );
});

test("inline file review owns a compact twelve-row sticky-header preview", () => {
  assert.match(tableSource, /reviewRows\.slice\(0,\s*12\)\.map\(\(row\)\s*=>/);
  assert.match(
    tableSource,
    /<th>row<\/th>[\s\S]*?<th>name<\/th>[\s\S]*?<th>area<\/th>[\s\S]*?<th>category<\/th>[\s\S]*?<th>privacy<\/th>[\s\S]*?<th>kind<\/th>/,
  );
  assert.match(tableSource, /data-level=\{row\.level\}/);
  assert.match(
    tableSource,
    /table-import-review__preview[\s\S]*?table-import-review__actions/,
  );
  assert.match(
    appCss,
    /\.table-import-review__preview\s*\{[\s\S]*?max-height:\s*280px[\s\S]*?overflow-y:\s*auto/,
  );
  assert.match(
    appCss,
    /\.table-import-review__preview thead\s*\{[\s\S]*?position:\s*sticky[\s\S]*?top:\s*0/,
  );
});
