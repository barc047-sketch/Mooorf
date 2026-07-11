#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { AUDIT_DIR, run } from "./audit-utils.mjs";

const raw = run("npx", ["knip", "--production", "--reporter", "json", "--no-exit-code", "--no-progress"]);
const data = JSON.parse(raw);
const issueTypes = ["files", "dependencies", "devDependencies", "optionalPeerDependencies", "unlisted", "binaries", "unresolved", "exports", "types", "duplicates"];
const counts = Object.fromEntries(issueTypes.map((key) => [key, Array.isArray(data[key]) ? data[key].length : Object.keys(data[key] ?? {}).length]));
const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
const result = { status: total ? "review" : "pass", total, counts };
mkdirSync(AUDIT_DIR, { recursive: true });
writeFileSync(new URL("dead.json", AUDIT_DIR), `${JSON.stringify(result, null, 2)}\n`);
console.log(`audit:dead OK — ${total} findings captured for review`);
