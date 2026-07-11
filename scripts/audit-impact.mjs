#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { AUDIT_DIR, classifyFile, isValidBaseSha, run } from "./audit-utils.mjs";

const baseSha = process.argv[2] ?? "origin/main";
if (!isValidBaseSha(baseSha)) throw new Error(`Unsafe base revision: ${baseSha}`);
const committed = run("git", ["diff", "--name-only", `${baseSha}...HEAD`]);
const working = run("git", ["status", "--short"]).split("\n").filter(Boolean).map((line) => line.slice(3));
const files = [...new Set([...committed.split("\n"), ...working].filter(Boolean))].sort();
const groups = {};
for (const file of files) (groups[classifyFile(file)] ??= []).push(file);
const result = { baseSha, files, groups };
mkdirSync(AUDIT_DIR, { recursive: true });
writeFileSync(new URL("impact.json", AUDIT_DIR), `${JSON.stringify(result, null, 2)}\n`);
console.log(`audit:impact OK — ${files.length} changed paths across ${Object.keys(groups).length} groups`);
