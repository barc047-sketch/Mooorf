import type { SpaceCell } from "../types";

/** Durable Space No. allocation.  It is intentionally called only at entry
 * boundaries; Canvas transforms must never re-number authored cells. */
export const normalizeSpaceCode = (value: unknown): string => String(value ?? "").trim().slice(0, 32);

export const nextSpaceCode = (spaces: readonly Pick<SpaceCell, "spaceCode">[]): string => {
  const highest = spaces.reduce((max, space) => {
    const value = Number.parseInt(space.spaceCode ?? "", 10);
    return Number.isFinite(value) && String(value) === (space.spaceCode ?? "").replace(/^0+(?=\d)/, "")
      ? Math.max(max, value)
      : max;
  }, 0);
  return String(highest + 1).padStart(2, "0");
};

export const allocateSpaceCode = (spaces: readonly Pick<SpaceCell, "spaceCode">[]): string => nextSpaceCode(spaces);

/** Migrates missing and duplicate values while retaining every first authored code. */
export const ensureSpaceCodes = <T extends Pick<SpaceCell, "spaceCode">>(spaces: readonly T[]): T[] => {
  const used = new Set<string>();
  let cursor = 1;
  const allocate = () => {
    while (used.has(String(cursor).padStart(2, "0"))) cursor += 1;
    const code = String(cursor++).padStart(2, "0");
    used.add(code);
    return code;
  };
  return spaces.map((space) => {
    const code = normalizeSpaceCode(space.spaceCode);
    if (code && !used.has(code)) {
      used.add(code);
      return code === space.spaceCode ? space : { ...space, spaceCode: code };
    }
    return { ...space, spaceCode: allocate() };
  });
};
