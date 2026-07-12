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
  const radius = clamp(Math.min(viewport.width, viewport.height) * 0.1, 58, 76);
  const edge = radius + buttonSize / 2 + 8;
  const center = {
    x: clamp(point.x, edge, Math.max(edge, viewport.width - edge)),
    y: clamp(point.y, edge, Math.max(edge, viewport.height - edge)),
  };
  const horizontalPressure = point.x < edge ? 0.16 : point.x > viewport.width - edge ? -0.16 : 0;
  const verticalPressure = point.y < edge ? 0.12 : point.y > viewport.height - edge ? -0.12 : 0;
  const rotation = -Math.PI / 2 + horizontalPressure + verticalPressure;
  const step = Math.PI * 2 / ids.length;
  const nodes = ids.map((id, index) => {
    const angle = rotation + step * index;
    return {
      id,
      index,
      angle,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });
  return { center, radius, buttonSize, nodes };
};
