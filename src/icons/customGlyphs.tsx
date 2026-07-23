/**
 * MOOORF Visual Arsenal — Approved Custom Vector UI Glyphs
 * Standardized 24x24 Viewbox with 2.0px Stroke Standard
 */

import React from "react";

interface CustomGlyphProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

export const GlyphMembrane: React.FC<CustomGlyphProps> = ({
  size = 20,
  strokeWidth = 2.0,
  color = "currentColor",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      d="M12 2 C 6 2, 2 6, 2 12 C 2 18, 8 22, 14 22 C 20 22, 22 16, 22 12 C 22 6, 18 2, 12 2 Z"
      strokeDasharray="3 2"
    />
    <circle cx="12" cy="12" r="2.5" fill={color} stroke="none" />
  </svg>
);

export const GlyphCellNucleus: React.FC<CustomGlyphProps> = ({
  size = 20,
  strokeWidth = 2.0,
  color = "currentColor",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="8" fill="rgba(255,255,255,0.08)" />
    <circle cx="12" cy="12" r="2.5" fill={color} stroke="none" />
  </svg>
);

export const GlyphMorphBridge: React.FC<CustomGlyphProps> = ({
  size = 20,
  strokeWidth = 2.0,
  color = "currentColor",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M 4 12 C 8 4, 16 20, 20 12" />
    <circle cx="4" cy="12" r="2" fill={color} stroke="none" />
    <circle cx="20" cy="12" r="2" fill={color} stroke="none" />
  </svg>
);

export const GlyphScaleCanvas: React.FC<CustomGlyphProps> = ({
  size = 20,
  strokeWidth = 2.0,
  color = "currentColor",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="4" y="4" width="16" height="16" rx="3" strokeDasharray="2 2" />
    <path d="M4 12 h 16 M12 4 v 16" />
  </svg>
);

export const GlyphScaleScreen: React.FC<CustomGlyphProps> = ({
  size = 20,
  strokeWidth = 2.0,
  color = "currentColor",
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <line x1="12" y1="16" x2="12" y2="20" />
    <line x1="8" y1="20" x2="16" y2="20" />
  </svg>
);

export const CUSTOM_GLYPH_MAP: Record<string, React.FC<CustomGlyphProps>> = {
  "glyph:membrane": GlyphMembrane,
  "glyph:cell-nucleus": GlyphCellNucleus,
  "glyph:morph-bridge": GlyphMorphBridge,
  "glyph:scale-canvas": GlyphScaleCanvas,
  "glyph:scale-screen": GlyphScaleScreen,
};
