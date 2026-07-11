#!/usr/bin/env node
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { AUDIT_DIR } from "./audit-utils.mjs";

const assetsDir = new URL("../dist/assets/", import.meta.url);
const assets = readdirSync(assetsDir).map((file) => ({ file: `dist/assets/${file}`, bytes: statSync(new URL(file, assetsDir)).size })).sort((a, b) => b.bytes - a.bytes);
const manifest = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const entryName = manifest.match(/src="\/assets\/(index-[^"]+\.js)"/)?.[1];
const entry = assets.find((asset) => asset.file.endsWith(`/${entryName}`));
if (!entry) throw new Error("Unable to locate the production entry asset");
const budgetBytes = 900_000;
const result = { status: entry.bytes <= budgetBytes ? "pass" : "review", entry, budgetBytes, largest: assets.slice(0, 10) };
mkdirSync(AUDIT_DIR, { recursive: true });
writeFileSync(new URL("perf.json", AUDIT_DIR), `${JSON.stringify(result, null, 2)}\n`);
console.log(`audit:perf OK — entry ${(entry.bytes / 1000).toFixed(1)} kB / ${(budgetBytes / 1000).toFixed(0)} kB budget`);
