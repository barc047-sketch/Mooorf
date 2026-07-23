/**
 * MOOORF Visual Arsenal — Explicit Tree-Shakeable UI Icon Component Map
 * Wave VA1 Component Mapping Contract
 */

import React from "react";
import {
  MousePointer,
  Hand,
  Waypoints,
  MessageSquareText,
  FolderTree,
  Shield,
  Table,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Minimize2,
  Grid,
  Magnet,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Locate,
  Download,
  Search,
  Sliders,
  X,
  Minus,
  HelpCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Image,
  FileText,
  Database,
  Package,
} from "lucide-react";

import {
  GlyphMembrane,
  GlyphCellNucleus,
  GlyphMorphBridge,
  GlyphScaleCanvas,
  GlyphScaleScreen,
  GlyphLineCapJoin,
} from "./customGlyphs.ts";

export interface IconComponentProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

export const UI_ICON_COMPONENTS: Record<string, React.ComponentType<IconComponentProps>> = Object.freeze({
  "ui:act:select": MousePointer,
  "ui:act:pan": Hand,
  "ui:act:connect": Waypoints,
  "ui:act:label-studio": MessageSquareText,
  "ui:act:rel-manager": FolderTree,
  "ui:act:organism-set": Shield,
  "ui:act:table-view": Table,
  "ui:act:canvas-view": Maximize2,
  "ui:act:zoom-in": ZoomIn,
  "ui:act:zoom-out": ZoomOut,
  "ui:act:zoom-fit": Minimize2,
  "ui:act:grid-toggle": Grid,
  "ui:act:snap-toggle": Magnet,
  "ui:act:undo": Undo2,
  "ui:act:redo": Redo2,
  "ui:act:delete": Trash2,
  "ui:act:duplicate": Copy,
  "ui:act:locate": Locate,
  "ui:act:export": Download,
  "ui:act:search": Search,
  "ui:act:settings": Sliders,
  "ui:act:close": X,
  "ui:act:minimize": Minus,
  "ui:act:help": HelpCircle,

  // Alignment matrix
  "ui:align:left": AlignLeft,
  "ui:align:center": AlignCenter,
  "ui:align:right": AlignRight,
  "ui:align:top": AlignStartVertical,
  "ui:align:middle": AlignCenterVertical,
  "ui:align:bottom": AlignEndVertical,

  // Export formats
  "ui:export:png": Image,
  "ui:export:pdf": FileText,
  "ui:export:data": Database,
  "ui:export:pack": Package,

  // Custom Glyphs
  "ui:glyph:membrane": GlyphMembrane,
  "ui:glyph:cell-nucleus": GlyphCellNucleus,
  "ui:glyph:morph-bridge": GlyphMorphBridge,
  "ui:glyph:scale-canvas": GlyphScaleCanvas,
  "ui:glyph:scale-screen": GlyphScaleScreen,
  "ui:glyph:line-cap-join": GlyphLineCapJoin,
});

export const getUIIconComponent = (id: string): React.ComponentType<IconComponentProps> | undefined =>
  UI_ICON_COMPONENTS[id];
