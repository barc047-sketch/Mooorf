// Tiny bridge between the V4.5B master graph (SpaceNode) and the existing
// canvas store (SpaceCell). The current store/UI is untouched in V4.5B —
// these adapters are the documented V5 migration path (see
// docs/CENTRAL_GRAPH_SCHEMA.md).

import type { Privacy, SpaceCell } from "../../types";
import { areaToRadius } from "../../lib/geometry";
import type { PrivacyCode, SpaceNode } from "./types";

/** Reuse the canvas's sqrt area→radius scale — one visual scale everywhere. */
export const radiusFromArea = areaToRadius;

/** "Entrance Lobby" → "EL"; single words truncate to 3 chars ("Café" → "CAF"). */
export const shortLabelFromName = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

const PRIVACY_TO_LEGACY: Record<PrivacyCode, Privacy> = {
  P0: "public",
  P1: "public",
  P2: "shared",
  P3: "private",
  P4: "private",
  P5: "private",
};

const LEGACY_TO_PRIVACY: Record<Privacy, PrivacyCode> = {
  public: "P0",
  shared: "P2",
  private: "P3",
};

/** Graph → current canvas cell (lossy: floor/Connections stay in the graph). */
export const spaceNodeToCanvasCell = (space: SpaceNode): SpaceCell => ({
  id: space.id,
  name: space.name,
  area: space.area,
  category: space.category,
  privacy: PRIVACY_TO_LEGACY[space.privacy] ?? "public",
  color: space.color ?? "#c9b8a3",
  x: space.x,
  y: space.y,
});

/** Current canvas cell → graph node. Caller supplies graph-only fields
 *  (at minimum floor_id + a CategoryCode) via `defaults`. */
export const canvasCellToSpaceNode = (
  cell: SpaceCell,
  defaults: Pick<SpaceNode, "floor_id" | "category"> & Partial<SpaceNode>
): SpaceNode => ({
  id: cell.id,
  name: cell.name,
  short_label: shortLabelFromName(cell.name),
  area: cell.area,
  unit: "sqm",
  privacy: LEGACY_TO_PRIVACY[cell.privacy] ?? "P0",
  shape: "circle",
  color: cell.color,
  x: cell.x,
  y: cell.y,
  radius: radiusFromArea(cell.area),
  visible: true,
  locked: false,
  ...defaults,
});
