import Papa from "papaparse";
import type { SpaceCell } from "../types";

/** Column order is fixed and explicit — never derived from object key order. */
const CSV_FIELDS = ["id", "name", "area", "category", "privacy", "kind", "color", "x", "y"] as const;

const toRow = (space: SpaceCell): (string | number)[] => [
  space.id,
  space.name,
  Number.isFinite(space.area) ? space.area : 0,
  space.category,
  space.privacy,
  space.kind === "void" ? "void" : "space",
  space.color,
  Number.isFinite(space.x) ? space.x : 0,
  Number.isFinite(space.y) ? space.y : 0,
];

/** Deterministic CSV serialization of the master graph's spaces — one row
 * per space (voids included, never invented columns). Pure/no DOM deps. */
export const spacesToCsv = (spaces: readonly SpaceCell[]): string =>
  Papa.unparse({
    fields: [...CSV_FIELDS],
    data: spaces.map(toRow),
  });
