import { icons, type LucideIcon } from "lucide-react";
import type { IconDefinition, IconPlacementSettings } from "./types";
import { resolveLabelContrast } from "../design/labelContrast";
import type { Theme } from "../types";

type IconNode = readonly [string, Readonly<Record<string, string | number>>][];
type RenderableLucide = LucideIcon & {
  render?: (props: Record<string, unknown>, ref: unknown) => { props?: { iconNode?: IconNode } };
};

export const getLucideIcon = (sourceKey: string): LucideIcon | null =>
  ((icons as unknown as Record<string, LucideIcon>)[sourceKey] ?? null);

export const getLucideIconNode = (sourceKey: string): IconNode | null => {
  const component = getLucideIcon(sourceKey) as RenderableLucide | null;
  return component?.render?.({ size: 24 }, null)?.props?.iconNode ?? null;
};

export const resolveSymbolTint = (
  placement: IconPlacementSettings,
  surface: {
    theme: Theme;
    backgroundColor?: string;
    surfaceOpacity?: number;
    canvasColor?: string;
    voidBackground?: boolean;
  },
): string => placement.tintMode === "custom"
  ? placement.tint
  : resolveLabelContrast({
      mode: "auto",
      theme: surface.theme,
      backgroundColor: compositeSurfaceColour(
        surface.backgroundColor,
        surface.surfaceOpacity,
        surface.canvasColor,
      ),
      voidBackground: surface.voidBackground,
    }).color;

const compositeSurfaceColour = (
  foreground: string | undefined,
  opacity: number | undefined,
  background: string | undefined,
): string | undefined => {
  const parse = (value: string | undefined): [number, number, number] | null => {
    if (!value || !/^#[0-9a-f]{6}$/i.test(value)) return null;
    return [1, 3, 5].map((start) => Number.parseInt(value.slice(start, start + 2), 16)) as [number, number, number];
  };
  const foregroundRgb = parse(foreground);
  const backgroundRgb = parse(background);
  if (!foregroundRgb) return backgroundRgb ? background : foreground;
  if (!backgroundRgb || opacity === undefined || opacity >= 1) return foreground;
  const alpha = Math.min(1, Math.max(0, opacity));
  const channel = (index: number) => Math.round(foregroundRgb[index] * alpha + backgroundRgb[index] * (1 - alpha))
    .toString(16)
    .padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
};

const number = (value: string | number | undefined, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const points = (value: string | number | undefined): [number, number][] =>
  String(value ?? "").trim().split(/\s+/).flatMap((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return Number.isFinite(x) && Number.isFinite(y) ? [[x, y] as [number, number]] : [];
  });

const traceNode = (ctx: CanvasRenderingContext2D, tag: string, attrs: Readonly<Record<string, string | number>>): void => {
  ctx.beginPath();
  if (tag === "path" && typeof attrs.d === "string") {
    ctx.stroke(new Path2D(attrs.d));
    return;
  }
  if (tag === "line") {
    ctx.moveTo(number(attrs.x1), number(attrs.y1));
    ctx.lineTo(number(attrs.x2), number(attrs.y2));
  } else if (tag === "circle") {
    ctx.arc(number(attrs.cx), number(attrs.cy), number(attrs.r), 0, Math.PI * 2);
  } else if (tag === "ellipse") {
    ctx.ellipse(number(attrs.cx), number(attrs.cy), number(attrs.rx), number(attrs.ry), 0, 0, Math.PI * 2);
  } else if (tag === "rect") {
    const x = number(attrs.x);
    const y = number(attrs.y);
    const width = number(attrs.width);
    const height = number(attrs.height);
    const radius = Math.max(0, number(attrs.rx));
    if (radius > 0) ctx.roundRect(x, y, width, height, radius);
    else ctx.rect(x, y, width, height);
  } else if (tag === "polyline" || tag === "polygon") {
    const vertices = points(attrs.points);
    vertices.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    if (tag === "polygon") ctx.closePath();
  } else return;
  ctx.stroke();
}

const presetOffset = (placement: IconPlacementSettings, radius: number): [number, number] => {
  if (placement.placement === "above") return [0, -radius * 0.58];
  if (placement.placement === "below") return [0, radius * 0.58];
  if (placement.placement === "top-left") return [-radius * 0.48, -radius * 0.48];
  if (placement.placement === "top-right") return [radius * 0.48, -radius * 0.48];
  return [0, 0];
};

export const drawSymbolPlacement = (
  ctx: CanvasRenderingContext2D,
  definition: IconDefinition,
  placement: IconPlacementSettings,
  anchor: { x: number; y: number; radius: number; zoom: number; tint?: string },
): void => {
  if (anchor.zoom < placement.hideBelowZoom) return;
  const node = getLucideIconNode(definition.sourceKey);
  if (!node) return;
  const [presetX, presetY] = presetOffset(placement, anchor.radius);
  const x = anchor.x + presetX + placement.offsetX * anchor.zoom;
  const y = anchor.y + presetY + placement.offsetY * anchor.zoom;
  const iconScale = placement.scale;
  const tint = anchor.tint ?? placement.tint;
  ctx.save();
  ctx.globalAlpha *= placement.opacity;
  if (placement.backing !== "none") {
    const bx = x + placement.backingOffsetX * anchor.zoom;
    const by = y + placement.backingOffsetY * anchor.zoom;
    const size = placement.backingSize * anchor.zoom;
    ctx.save();
    ctx.globalAlpha *= placement.backingOpacity;
    ctx.fillStyle = "#f7f6f2";
    ctx.strokeStyle = tint;
    ctx.lineWidth = placement.backingOutlineWidth * anchor.zoom;
    ctx.beginPath();
    if (placement.backing === "circle") ctx.arc(bx, by, size / 2, 0, Math.PI * 2);
    else ctx.roundRect(bx - size / 2, by - size / 2, placement.backing === "pill" ? size * 1.35 : size, size, placement.backing === "square" ? 3 : size / 2);
    ctx.fill();
    if (placement.backingOutline && placement.backingOutlineWidth > 0) ctx.stroke();
    ctx.restore();
  }
  ctx.translate(x, y);
  ctx.rotate(placement.rotation * Math.PI / 180);
  ctx.scale(iconScale, iconScale);
  ctx.translate(-12, -12);
  ctx.strokeStyle = tint;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [tag, attrs] of node) traceNode(ctx, tag, attrs);
  ctx.restore();
};

const esc = (value: string | number): string => String(value)
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

export const symbolSvgMarkup = (
  definition: IconDefinition,
  placement: IconPlacementSettings,
  anchor: { x: number; y: number; radius: number; zoom: number; tint?: string },
): string => {
  if (anchor.zoom < placement.hideBelowZoom) return "";
  const node = getLucideIconNode(definition.sourceKey);
  if (!node) return "";
  const [presetX, presetY] = presetOffset(placement, anchor.radius);
  const x = anchor.x + presetX + placement.offsetX * anchor.zoom;
  const y = anchor.y + presetY + placement.offsetY * anchor.zoom;
  const backingSize = placement.backingSize * anchor.zoom;
  const tint = anchor.tint ?? placement.tint;
  const backing = placement.backing === "none" ? "" : placement.backing === "circle"
    ? `<circle cx="${esc(x + placement.backingOffsetX * anchor.zoom)}" cy="${esc(y + placement.backingOffsetY * anchor.zoom)}" r="${esc(backingSize / 2)}" fill="#f7f6f2" fill-opacity="${esc(placement.backingOpacity)}" stroke="${placement.backingOutline ? esc(tint) : "none"}" stroke-width="${esc(placement.backingOutlineWidth * anchor.zoom)}"/>`
    : `<rect x="${esc(x + placement.backingOffsetX * anchor.zoom - backingSize / 2)}" y="${esc(y + placement.backingOffsetY * anchor.zoom - backingSize / 2)}" width="${esc(placement.backing === "pill" ? backingSize * 1.35 : backingSize)}" height="${esc(backingSize)}" rx="${esc(placement.backing === "square" ? 3 : backingSize / 2)}" fill="#f7f6f2" fill-opacity="${esc(placement.backingOpacity)}" stroke="${placement.backingOutline ? esc(tint) : "none"}" stroke-width="${esc(placement.backingOutlineWidth * anchor.zoom)}"/>`;
  const geometry = node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs)
    .filter(([key]) => key !== "key")
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${esc(value)}"`)
    .join(" ")}/>`).join("");
  return `<g opacity="${esc(placement.opacity)}">${backing}<g transform="translate(${esc(x)} ${esc(y)}) rotate(${esc(placement.rotation)}) scale(${esc(placement.scale)}) translate(-12 -12)" fill="none" stroke="${esc(tint)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${geometry}</g></g>`;
};
