#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { AUDIT_DIR, run } from "./audit-utils.mjs";

const raw = run("npx", ["depcruise", "src", "--config", "dependency-cruiser.config.cjs", "--include-only", "^src", "--output-type", "json", "--progress", "none"]);
const data = JSON.parse(raw);
const violations = data.summary?.violations ?? [];
const result = { status: violations.length ? "review" : "pass", modules: data.modules?.length ?? 0, violations };
mkdirSync(AUDIT_DIR, { recursive: true });
writeFileSync(new URL("deps.json", AUDIT_DIR), `${JSON.stringify(result, null, 2)}\n`);
console.log(`audit:deps OK — ${result.modules} modules, ${violations.length} violations`);
