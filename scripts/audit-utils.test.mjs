import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyFile,
  isValidBaseSha,
  parseViteAssets,
  renderMarkdown,
} from "./audit-utils.mjs";

test("accepts only safe git revision tokens", () => {
  assert.equal(isValidBaseSha("e8fd487"), true);
  assert.equal(isValidBaseSha("origin/main"), true);
  assert.equal(isValidBaseSha("HEAD~2"), true);
  assert.equal(isValidBaseSha("main; rm -rf /"), false);
  assert.equal(isValidBaseSha(""), false);
});

test("groups changed files by canonical subsystem", () => {
  assert.equal(classifyFile("src/canvas/CanvasView.tsx"), "canvas");
  assert.equal(classifyFile("src/domain/stats/selectors.ts"), "state/domain");
  assert.equal(classifyFile("src/import/tableImport.ts"), "import");
  assert.equal(classifyFile("src/export/csv.ts"), "export");
  assert.equal(classifyFile("src/ui/widgets/ExportWidget.tsx"), "UI/widgets");
  assert.equal(classifyFile("src/styles/tokens.css"), "styles");
  assert.equal(classifyFile("src/ui/readiness.test.ts"), "tests");
  assert.equal(classifyFile("scripts/repo-health.mjs"), "tooling");
  assert.equal(classifyFile("docs/HANDOFF.md"), "documentation");
});

test("parses Vite asset sizes and rejects missing measurements", () => {
  const assets = parseViteAssets("dist/assets/index-abc.js  845.09 kB | gzip: 277.19 kB\n");
  assert.equal(assets[0].bytes, 845090);
  assert.throws(() => parseViteAssets("no assets here"), /measurement/i);
});

test("compact Markdown never exceeds 120 lines", () => {
  const report = { timestamp: "2026-07-11T00:00:00.000Z", sha: "abc", baseSha: null, dirty: [], groups: {}, checks: [], failures: Array.from({ length: 200 }, (_, i) => ({ command: "x", detail: `failure ${i}` })), nextCommand: "npm run build" };
  assert.ok(renderMarkdown(report).split("\n").length <= 120);
});
