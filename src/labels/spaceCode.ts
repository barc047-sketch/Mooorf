import type { SpaceCell } from "../types";

const MAX_SPACE_CODE_LENGTH = 32;

export const normalizeSpaceCode = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/\s*([/._-])\s*/g, "$1")
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9._/-]/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_SPACE_CODE_LENGTH);
  return normalized || undefined;
};

export const formatSpaceCode = (value: number): string =>
  String(Math.max(1, Math.floor(value))).padStart(2, "0");

export const nextSpaceCode = (
  spaces: readonly Pick<SpaceCell, "spaceCode">[],
  desired?: unknown,
): string => {
  const used = new Set(
    spaces
      .map((space) => normalizeSpaceCode(space.spaceCode))
      .filter((code): code is string => Boolean(code)),
  );
  const preferred = normalizeSpaceCode(desired);
  if (preferred && !used.has(preferred)) return preferred;

  let sequence = 1;
  while (used.has(formatSpaceCode(sequence))) sequence += 1;
  return formatSpaceCode(sequence);
};

export interface SpaceCodeDiagnostic {
  code: string;
  firstIndex: number;
  duplicateIndex: number;
}

export const findDuplicateSpaceCodes = (
  spaces: readonly Pick<SpaceCell, "spaceCode">[],
): SpaceCodeDiagnostic[] => {
  const firstByCode = new Map<string, number>();
  const diagnostics: SpaceCodeDiagnostic[] = [];
  spaces.forEach((space, index) => {
    const code = normalizeSpaceCode(space.spaceCode);
    if (!code) return;
    const firstIndex = firstByCode.get(code);
    if (firstIndex === undefined) firstByCode.set(code, index);
    else diagnostics.push({ code, firstIndex, duplicateIndex: index });
  });
  return diagnostics;
};

/** Fills only missing values. Authored duplicate codes remain visible for diagnostics. */
export const ensureMissingSpaceCodes = <T extends SpaceCell>(
  spaces: readonly T[],
): { spaces: T[]; changed: boolean } => {
  const result: T[] = [];
  let changed = false;
  for (const space of spaces) {
    const normalized = normalizeSpaceCode(space.spaceCode);
    if (normalized) {
      const next = normalized === space.spaceCode ? space : { ...space, spaceCode: normalized };
      result.push(next as T);
      changed ||= next !== space;
      continue;
    }
    const spaceCode = nextSpaceCode(result);
    result.push({ ...space, spaceCode } as T);
    changed = true;
  }
  return { spaces: changed ? result : [...spaces], changed };
};
