/**
 * MOOORF Visual Arsenal — Approved Custom Vector UI Glyphs
 * Standardized 24x24 Viewbox with 2.0px Stroke Standard
 */

import React from "react";

interface CustomGlyphProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

const createSvg = (children: React.ReactNode[], props: CustomGlyphProps) => {
  const { size = 20, strokeWidth = 2.0, color = "currentColor", ...rest } = props;
  return React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: color,
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...rest,
    },
    ...children,
  );
};

export const GlyphMembrane: React.FC<CustomGlyphProps> = (props) =>
  createSvg(
    [
      React.createElement("path", {
        key: "path",
        d: "M12 2 C 6 2, 2 6, 2 12 C 2 18, 8 22, 14 22 C 20 22, 22 16, 22 12 C 22 6, 18 2, 12 2 Z",
        strokeDasharray: "3 2",
      }),
      React.createElement("circle", {
        key: "circle",
        cx: 12,
        cy: 12,
        r: 2.5,
        fill: props.color ?? "currentColor",
        stroke: "none",
      }),
    ],
    props,
  );

export const GlyphCellNucleus: React.FC<CustomGlyphProps> = (props) =>
  createSvg(
    [
      React.createElement("circle", {
        key: "outer",
        cx: 12,
        cy: 12,
        r: 8,
        fill: "rgba(255,255,255,0.08)",
      }),
      React.createElement("circle", {
        key: "inner",
        cx: 12,
        cy: 12,
        r: 2.5,
        fill: props.color ?? "currentColor",
        stroke: "none",
      }),
    ],
    props,
  );

export const GlyphMorphBridge: React.FC<CustomGlyphProps> = (props) =>
  createSvg(
    [
      React.createElement("path", { key: "bridge", d: "M 4 12 C 8 4, 16 20, 20 12" }),
      React.createElement("circle", { key: "c1", cx: 4, cy: 12, r: 2, fill: props.color ?? "currentColor", stroke: "none" }),
      React.createElement("circle", { key: "c2", cx: 20, cy: 12, r: 2, fill: props.color ?? "currentColor", stroke: "none" }),
    ],
    props,
  );

export const GlyphScaleCanvas: React.FC<CustomGlyphProps> = (props) =>
  createSvg(
    [
      React.createElement("rect", { key: "rect", x: 4, y: 4, width: 16, height: 16, rx: 3, strokeDasharray: "2 2" }),
      React.createElement("path", { key: "cross", d: "M4 12 h 16 M12 4 v 16" }),
    ],
    props,
  );

export const GlyphScaleScreen: React.FC<CustomGlyphProps> = (props) =>
  createSvg(
    [
      React.createElement("rect", { key: "screen", x: 3, y: 4, width: 18, height: 12, rx: 2 }),
      React.createElement("line", { key: "stand", x1: 12, y1: 16, x2: 12, y2: 20 }),
      React.createElement("line", { key: "base", x1: 8, y1: 20, x2: 16, y2: 20 }),
    ],
    props,
  );

export const GlyphLineCapJoin: React.FC<CustomGlyphProps> = (props) =>
  createSvg(
    [
      React.createElement("path", { key: "angle", d: "M 4 18 L 12 6 L 20 18" }),
      React.createElement("circle", { key: "joint", cx: 12, cy: 6, r: 2, fill: props.color ?? "currentColor", stroke: "none" }),
    ],
    props,
  );

export const CUSTOM_GLYPH_MAP: Record<string, React.FC<CustomGlyphProps>> = {
  "glyph:membrane": GlyphMembrane,
  "glyph:cell-nucleus": GlyphCellNucleus,
  "glyph:morph-bridge": GlyphMorphBridge,
  "glyph:scale-canvas": GlyphScaleCanvas,
  "glyph:scale-screen": GlyphScaleScreen,
  "glyph:line-cap-join": GlyphLineCapJoin,
};
