import { execFileSync } from "node:child_process";

export const AUDIT_DIR = new URL("../.audit/", import.meta.url);

export function isValidBaseSha(value) {
  return typeof value === "string" && /^(?:[A-Za-z0-9][A-Za-z0-9._/-]*|HEAD(?:~\d+|\^\d*)?)$/.test(value);
}

export function classifyFile(file) {
  if (/\.(?:test|spec)\.[^.]+$/.test(file) || file.includes("/__tests__/")) return "tests";
  if (file.startsWith("scripts/") || /(?:^|\/)(?:vite|knip|dependency-cruiser)\.config\./.test(file)) return "tooling";
  if (file.startsWith("docs/")) return "documentation";
  if (file.startsWith("src/canvas/")) return "canvas";
  if (file.startsWith("src/domain/") || file.startsWith("src/store/")) return "state/domain";
  if (file.startsWith("src/import/")) return "import";
  if (file.startsWith("src/export/")) return "export";
  if (file.startsWith("src/ui/")) return "UI/widgets";
  if (file.startsWith("src/styles/")) return "styles";
  return "other";
}

export function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 20 * 1024 * 1024,
    ...options,
  }).trim();
}

export function parseViteAssets(output) {
  const assets = [...output.matchAll(/(?:^|\n)([^\n]+?)\s+(\d+(?:\.\d+)?)\s+(kB|MB)\b/g)].map((match) => ({
    file: match[1].trim(),
    bytes: Math.round(Number(match[2]) * (match[3] === "MB" ? 1_000_000 : 1_000)),
  }));
  if (!assets.length) throw new Error("No asset measurement found in Vite output");
  return assets;
}

function clip(value, limit = 240) {
  const flat = String(value ?? "").replace(/\s+/g, " ").trim();
  return flat.length > limit ? `${flat.slice(0, limit - 1)}…` : flat;
}

export function renderMarkdown(report) {
  const lines = [
    "# Compact Audit Summary",
    "",
    `- SHA: \`${report.sha}\`${report.dirty?.length ? ` (${report.dirty.length} dirty path${report.dirty.length === 1 ? "" : "s"})` : ""}`,
    `- Base: ${report.baseSha ? `\`${report.baseSha}\`` : "working tree"}`,
    `- Generated: ${report.timestamp}`,
    "",
    "## Impact",
    "",
  ];
  const groups = Object.entries(report.groups ?? {});
  lines.push(...(groups.length ? groups.map(([name, files]) => `- ${name}: ${files.length}`) : ["- No changed paths detected"]));
  lines.push("", "## Checks", "");
  lines.push(...(report.checks?.length ? report.checks.map((check) => `- ${check.status === "pass" ? "PASS" : "REVIEW"} — ${check.name}: ${clip(check.detail)}`) : ["- No check artifacts found"]));
  if (report.failures?.length) {
    lines.push("", "## Failures", "");
    for (const failure of report.failures.slice(0, 80)) lines.push(`- \`${clip(failure.command, 80)}\`: ${clip(failure.detail)}`);
  }
  lines.push("", `Next: \`${report.nextCommand}\``, "");
  return lines.slice(0, 120).join("\n");
}
