import { strict as assert } from "node:assert";
import test from "node:test";
import { applyTableImport, parseCsvTable } from "../import/tableImport";

const CSV = `No.,Name,Area,Body,Category,Privacy,Kind\nG-01,Studio,80,Open workspace,Work,shared,space\nG-01,Meeting,28,Meeting room,Public,public,space\n,Courtyard,45,Open air,Outdoor,shared,void`;

test("schedule import maps Space No and reports authored duplicates", () => {
  const preview = parseCsvTable(CSV);
  assert.equal(preview.mapping.spaceCode, 0);
  assert.deepEqual(preview.rows.map((row) => row.spaceCode), ["G-01", "G-01", undefined]);
  assert.equal(
    preview.diagnostics.some((item) => item.message.includes('Duplicate Space No. "G-01"')),
    true,
  );
});

test("append preserves supplied Space Nos and generates only missing values", () => {
  const preview = parseCsvTable(CSV);
  const result = applyTableImport([], preview.rows, "append");
  assert.deepEqual(result.spaces.map((space) => space.spaceCode), ["G-01", "G-01", "01"]);
});
