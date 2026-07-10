import type { RendererMode } from "../types";
import { MANIFEST_SCHEMA_VERSION, type ExportVisualOptions } from "./types";

export interface PresentationManifest {
  manifestVersion: number;
  project: string;
  createdAt: string;
  files: string[];
  renderer: RendererMode;
  dimensions: { width: number; height: number };
  visual: ExportVisualOptions;
  summary: { spaceCount: number; voidCount: number; programmedAreaM2: number };
}

export interface ManifestInput {
  project: string;
  files: string[];
  renderer: RendererMode;
  dimensions: { width: number; height: number };
  visual: ExportVisualOptions;
  summary: { spaceCount: number; voidCount: number; programmedAreaM2: number };
}

/** Manifest lists only files that were actually produced — callers must
 * filter out empty/failed artifacts before calling this. */
export const buildManifest = (input: ManifestInput, now: Date = new Date()): PresentationManifest => ({
  manifestVersion: MANIFEST_SCHEMA_VERSION,
  project: input.project.trim(),
  createdAt: now.toISOString(),
  files: [...input.files],
  renderer: input.renderer,
  dimensions: { ...input.dimensions },
  visual: { ...input.visual },
  summary: { ...input.summary },
});
