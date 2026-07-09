#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const run = (cmd, args) => {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    return `unavailable (${error.status ?? "error"})`;
  }
};

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const scripts = Object.keys(pkg.scripts ?? {});
const dirty = run("git", ["status", "--short"]);

console.log("ZONUERT repo health");
console.log(`branch: ${run("git", ["branch", "--show-current"])}`);
console.log(`latest: ${run("git", ["log", "--oneline", "-1"])}`);
console.log("dirty files:");
console.log(dirty || "  clean");
console.log(`package scripts: ${scripts.length ? scripts.join(", ") : "none"}`);
console.log("known warning: Vite main chunk warning is accepted until a performance/code-split phase.");
console.log("do not stage: .claude/launch.json unless explicitly requested.");
