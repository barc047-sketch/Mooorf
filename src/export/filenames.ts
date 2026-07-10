import type { ExportPageSize } from "./types";

const COMBINING_MARKS = /[\u0300-\u036f]/g;

const MAX_SLUG_LENGTH = 80;

/** Filesystem-safe slug — collapses whitespace/unsafe chars, trims dashes,
 * and caps length so a very long project title can never produce an
 * unwieldy or path-limit-breaking filename. */
export const sanitizeFilename = (value: string, fallback = "untitled"): string => {
  const slug = value
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
  return slug || fallback;
};

/** Stable, filename-safe timestamp: YYYYMMDD-HHmmss (local time). */
export const exportTimestamp = (date: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
};

export const buildCanvasFilename = (
  project: string,
  renderer: "organism" | "classic",
  ext: "png" | "svg",
  date?: Date
): string =>
  `${sanitizeFilename(project)}-canvas-${renderer}-${exportTimestamp(date)}.${ext}`;

export const buildPresentationFilename = (
  project: string,
  page: ExportPageSize,
  date?: Date
): string => `${sanitizeFilename(project)}-presentation-${page}-${exportTimestamp(date)}.pdf`;

export const buildDataFilename = (
  project: string,
  ext: "csv" | "json",
  date?: Date
): string =>
  `${sanitizeFilename(project)}-${ext === "csv" ? "spaces" : "project"}-${exportTimestamp(date)}.${ext}`;

export const buildPackFilename = (project: string, date?: Date): string =>
  `${sanitizeFilename(project)}-presentation-pack-${exportTimestamp(date)}.zip`;
