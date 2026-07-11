#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { AUDIT_DIR, renderMarkdown, run } from "./audit-utils.mjs";

const read = (name) => {
  const url = new URL(`${name}.json`, AUDIT_DIR);
  return existsSync(url) ? JSON.parse(readFileSync(url, "utf8")) : null;
};
const impact = read("impact") ?? { baseSha: null, files: [], groups: {} };
const deps = read("deps");
const dead = read("dead");
const perf = read("perf");
const checks = [
  deps && { name: "dependency graph", status: deps.status, detail: `${deps.modules} modules; ${deps.violations.length} violations` },
  dead && { name: "dead code", status: dead.status, detail: `${dead.total} findings captured` },
  perf && { name: "production entry budget", status: perf.status, detail: `${(perf.entry.bytes / 1000).toFixed(1)} kB / ${(perf.budgetBytes / 1000).toFixed(0)} kB` },
].filter(Boolean);
const report = {
  timestamp: new Date().toISOString(),
  sha: run("git", ["rev-parse", "--short", "HEAD"]),
  baseSha: impact.baseSha,
  dirty: impact.files,
  groups: impact.groups,
  checks,
  failures: checks.filter((check) => check.status !== "pass").map((check) => ({ command: check.name, detail: check.detail })),
  nextCommand: "Antigravity audit the pushed tooling branch",
};
mkdirSync(AUDIT_DIR, { recursive: true });
writeFileSync(new URL("summary.json", AUDIT_DIR), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(new URL("summary.md", AUDIT_DIR), renderMarkdown(report));
console.log(`audit:summary OK — ${checks.length} checks, ${report.failures.length} review items, .audit/summary.md`);
