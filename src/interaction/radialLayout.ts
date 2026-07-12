import type { ContextPoint } from "../types";

export interface RadialViewport {
  width: number;
  height: number;
}

export interface RadialActionNode<T extends string = string> {
  id: T;
  x: number;
  y: number;
  angle: number;
  index: number;
}

export interface RadialActionLayout<T extends string = string> {
  center: ContextPoint;
  radius: number;
  buttonSize: number;
  nodes: RadialActionNode<T>[];
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const layoutRadialActions = <T extends string>(
  ids: readonly T[],
  point: ContextPoint,
  viewport: RadialViewport
): RadialActionLayout<T> => {
  if (ids.length < 6 || ids.length > 8) throw new RangeError("Object radial actions require 6–8 nodes.");
  const buttonSize = 40;
  const baseRadius = clamp(Math.min(viewport.width, viewport.height) * 0.1, 58, 76);
  const nearestEdge = Math.min(point.x, point.y, viewport.width - point.x, viewport.height - point.y);
  const radius = nearestEdge < baseRadius + buttonSize / 2 + 8
    ? clamp(baseRadius * 0.82, 46, 64)
    : baseRadius;
  /* The projected cell centre is semantic and never moves. Actions rotate
     toward the viewport centre, then individual leaves clamp as a last resort. */
  const center = { ...point };
  const towardViewport = Math.atan2(viewport.height / 2 - point.y, viewport.width / 2 - point.x);
  const rotation = towardViewport - Math.PI / 2;
  const step = Math.PI * 2 / ids.length;
  const leafEdge = buttonSize / 2;
  const nodes = ids.map((id, index) => {
    const angle = rotation + step * index;
    return {
      id,
      index,
      angle,
      x: clamp(center.x + Math.cos(angle) * radius, leafEdge, Math.max(leafEdge, viewport.width - leafEdge)),
      y: clamp(center.y + Math.sin(angle) * radius, leafEdge, Math.max(leafEdge, viewport.height - leafEdge)),
    };
  });
  return { center, radius, buttonSize, nodes };
};
