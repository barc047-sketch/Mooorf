/**
 * MOOORF Visual Arsenal — Locked Domain Registries
 * Wave VA0 Registry Foundations
 */

import type {
  UIIconDefinition,
  SiteSymbolDefinition,
  AnalysisGeneratorDefinition,
  VisualPresetDefinition,
} from "./types";

// ============================================================================
// 1. UI ICON REGISTRY
// ============================================================================

const APPROVED_UI_ICONS: readonly UIIconDefinition[] = Object.freeze([
  { id: "ui:act:select", semanticName: "Select Tool", family: "navigation", iconName: "MousePointer", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Select Tool (V)", ariaLabel: "Select Tool" },
  { id: "ui:act:pan", semanticName: "Pan Canvas", family: "navigation", iconName: "Hand", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Pan Canvas (Space)", ariaLabel: "Pan Canvas" },
  { id: "ui:act:connect", semanticName: "Connect Cells", family: "connections", iconName: "Waypoints", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Connect Cells (C)", ariaLabel: "Connect Cells Tool" },
  { id: "ui:act:label-studio", semanticName: "Label Studio", family: "labels", iconName: "MessageSquareText", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Label Studio", ariaLabel: "Open Label Studio" },
  { id: "ui:act:rel-manager", semanticName: "Relationship Manager", family: "connections", iconName: "FolderTree", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Relationship Manager", ariaLabel: "Open Relationship Manager" },
  { id: "ui:act:organism-set", semanticName: "Membrane Settings", family: "display", iconName: "Shield", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Organism Display", ariaLabel: "Organism Display Settings" },
  { id: "ui:act:table-view", semanticName: "Table Workspace", family: "view", iconName: "Table", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Switch to Table View", ariaLabel: "Table Workspace View" },
  { id: "ui:act:canvas-view", semanticName: "Canvas Workspace", family: "view", iconName: "Maximize2", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Switch to Canvas View", ariaLabel: "Canvas Workspace View" },
  { id: "ui:act:zoom-in", semanticName: "Zoom In", family: "zoom", iconName: "ZoomIn", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Zoom In (+)", ariaLabel: "Zoom In Canvas" },
  { id: "ui:act:zoom-out", semanticName: "Zoom Out", family: "zoom", iconName: "ZoomOut", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Zoom Out (-)", ariaLabel: "Zoom Out Canvas" },
  { id: "ui:act:zoom-fit", semanticName: "Fit Bounds", family: "zoom", iconName: "Minimize2", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Fit All (Shift+1)", ariaLabel: "Fit Camera to Bounds" },
  { id: "ui:act:grid-toggle", semanticName: "Grid Toggle", family: "display", iconName: "Grid", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Toggle Grid (G)", ariaLabel: "Toggle Grid Overlay" },
  { id: "ui:act:snap-toggle", semanticName: "Snapping", family: "display", iconName: "Magnet", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Toggle Snapping (S)", ariaLabel: "Toggle Magnet Snapping" },
  { id: "ui:act:undo", semanticName: "Undo", family: "editing", iconName: "Undo2", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Undo (Cmd+Z)", ariaLabel: "Undo Last Action" },
  { id: "ui:act:redo", semanticName: "Redo", family: "editing", iconName: "Redo2", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Redo (Cmd+Shift+Z)", ariaLabel: "Redo Last Action" },
  { id: "ui:act:delete", semanticName: "Delete Record", family: "editing", iconName: "Trash2", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "E", tooltip: "Delete Selected", ariaLabel: "Delete Selected Record" },
  { id: "ui:act:duplicate", semanticName: "Duplicate", family: "editing", iconName: "Copy", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Duplicate (Cmd+D)", ariaLabel: "Duplicate Record" },
  { id: "ui:act:locate", semanticName: "Center Camera", family: "navigation", iconName: "Locate", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Center on Canvas", ariaLabel: "Locate Element" },
  { id: "ui:act:export", semanticName: "Export Studio", family: "export", iconName: "Download", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Export (Cmd+E)", ariaLabel: "Open Export Studio" },
  { id: "ui:act:search", semanticName: "Search Filter", family: "view", iconName: "Search", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Search Filter", ariaLabel: "Search Workspace" },
  { id: "ui:act:settings", semanticName: "View Settings", family: "settings", iconName: "Sliders", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "View Settings", ariaLabel: "Open View Settings" },
  { id: "ui:act:close", semanticName: "Close Window", family: "chrome", iconName: "X", package: "lucide-react", recommendedSize: 18, strokeWidth: 2.0, classification: "A", tooltip: "Close Window", ariaLabel: "Close Window" },
  { id: "ui:act:minimize", semanticName: "Minimize Panel", family: "chrome", iconName: "Minus", package: "lucide-react", recommendedSize: 18, strokeWidth: 2.0, classification: "A", tooltip: "Minimize", ariaLabel: "Minimize Panel" },
  { id: "ui:act:help", semanticName: "Shortcuts", family: "chrome", iconName: "HelpCircle", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Shortcuts (?)", ariaLabel: "Open Shortcuts Modal" },

  // Alignment Matrix
  { id: "ui:align:left", semanticName: "Align Left", family: "alignment", iconName: "AlignLeft", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Align Left", ariaLabel: "Align Left" },
  { id: "ui:align:center", semanticName: "Align Center Horiz", family: "alignment", iconName: "AlignCenter", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Align Center", ariaLabel: "Align Center Horizontal" },
  { id: "ui:align:right", semanticName: "Align Right", family: "alignment", iconName: "AlignRight", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Align Right", ariaLabel: "Align Right" },
  { id: "ui:align:top", semanticName: "Align Top", family: "alignment", iconName: "AlignStartVertical", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Align Top", ariaLabel: "Align Top" },
  { id: "ui:align:middle", semanticName: "Align Center Vert", family: "alignment", iconName: "AlignCenterVertical", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Align Middle", ariaLabel: "Align Middle Vertical" },
  { id: "ui:align:bottom", semanticName: "Align Bottom", family: "alignment", iconName: "AlignEndVertical", package: "lucide-react", recommendedSize: 20, strokeWidth: 2.0, classification: "A", tooltip: "Align Bottom", ariaLabel: "Align Bottom" },

  // Approved Custom Glyphs
  { id: "ui:glyph:membrane", semanticName: "Membrane Field", family: "display", iconName: "membrane", package: "custom-glyph", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Organism Membrane Field", ariaLabel: "Organism Membrane Field", customGlyphId: "glyph:membrane" },
  { id: "ui:glyph:cell-nucleus", semanticName: "Cell Core", family: "geometry", iconName: "cell-nucleus", package: "custom-glyph", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Cell Core Centroid", ariaLabel: "Cell Core Centroid", customGlyphId: "glyph:cell-nucleus" },
  { id: "ui:glyph:morph-bridge", semanticName: "Morph Bridge", family: "connections", iconName: "morph-bridge", package: "custom-glyph", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Morph Bridge Vector", ariaLabel: "Morph Bridge Vector", customGlyphId: "glyph:morph-bridge" },
  { id: "ui:glyph:scale-canvas", semanticName: "Scale with Canvas", family: "view", iconName: "scale-canvas", package: "custom-glyph", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Scale with Canvas Zoom", ariaLabel: "Scale with Canvas Zoom", customGlyphId: "glyph:scale-canvas" },
  { id: "ui:glyph:scale-screen", semanticName: "Fixed on Screen", family: "view", iconName: "scale-screen", package: "custom-glyph", recommendedSize: 20, strokeWidth: 2.0, classification: "B", tooltip: "Fixed Screen Size", ariaLabel: "Fixed Screen Size", customGlyphId: "glyph:scale-screen" },
]);

const UI_ICON_MAP = new Map<string, UIIconDefinition>(
  APPROVED_UI_ICONS.map((icon) => [icon.id, icon]),
);

export const UIIconRegistry = {
  getAll: (): readonly UIIconDefinition[] => APPROVED_UI_ICONS,
  getById: (id: string): UIIconDefinition | undefined => UI_ICON_MAP.get(id),
  hasId: (id: string): boolean => UI_ICON_MAP.has(id),
};

// ============================================================================
// 2. SITE SYMBOL REGISTRY
// ============================================================================

const LAUNCH_SITE_SYMBOLS: readonly SiteSymbolDefinition[] = Object.freeze([
  { id: "tree:oak-mature", name: "Mature Oak Tree", category: "landscape", tags: ["tree", "deciduous", "canopy", "shade"], sourceType: "generator", generatorId: "TreePlan", presetParameters: { canopyShape: "circle", canopyComplexity: 0.8, density: 0.85 }, defaultVisualMode: "editorial", defaultScale: 1.0, anchor: { x: 0.5, y: 0.5 }, rotatable: true, flippable: false, colorMode: "semantic-theme", performanceTier: "P1", quickPaletteEligible: true, exportSupport: { png: true, pdf: true, svg: true } },
  { id: "tree:elm-canopy", name: "Broad Canopy Elm", category: "landscape", tags: ["tree", "elm", "broadleaf"], sourceType: "generator", generatorId: "TreePlan", presetParameters: { canopyShape: "irregular", canopyComplexity: 0.6 }, defaultVisualMode: "editorial", defaultScale: 1.1, anchor: { x: 0.5, y: 0.5 }, rotatable: true, flippable: true, colorMode: "semantic-theme", performanceTier: "P1", quickPaletteEligible: true, exportSupport: { png: true, pdf: true, svg: true } },
  { id: "tree:pine-conifer", name: "Native Pine Conifer", category: "landscape", tags: ["tree", "conifer", "evergreen"], sourceType: "generator", generatorId: "TreePlan", presetParameters: { canopyShape: "conifer-ring" }, defaultVisualMode: "technical", defaultScale: 0.9, anchor: { x: 0.5, y: 0.5 }, rotatable: false, flippable: false, colorMode: "semantic-theme", performanceTier: "P1", quickPaletteEligible: true, exportSupport: { png: true, pdf: true, svg: true } },
  { id: "veg:boxwood-hedge", name: "Clipped Boxwood Hedge", category: "landscape", tags: ["hedge", "formal", "shrub"], sourceType: "generator", generatorId: "Hedge", presetParameters: { informal: false }, defaultVisualMode: "technical", defaultScale: 1.0, anchor: { x: 0.0, y: 0.5 }, rotatable: true, flippable: false, colorMode: "semantic-theme", performanceTier: "P1", quickPaletteEligible: true, exportSupport: { png: true, pdf: true, svg: true } },
  { id: "wind:sw-breeze", name: "Prevailing SW Wind", category: "wind", tags: ["wind", "breeze", "streamline"], sourceType: "generator", generatorId: "WindFlow", presetParameters: { speedClass: "breeze" }, defaultVisualMode: "soft-analysis", defaultScale: 1.0, anchor: { x: 0.0, y: 0.5 }, rotatable: true, flippable: false, colorMode: "semantic-theme", performanceTier: "P1", quickPaletteEligible: true, exportSupport: { png: true, pdf: true, svg: true } },
  { id: "wind:rose-8point", name: "8-Sector Wind Rose", category: "wind", tags: ["wind", "rose", "climate"], sourceType: "generator", generatorId: "WindRose", presetParameters: { directions: 8 }, defaultVisualMode: "editorial", defaultScale: 1.0, anchor: { x: 0.5, y: 0.5 }, rotatable: false, flippable: false, colorMode: "semantic-theme", performanceTier: "P0", quickPaletteEligible: true, exportSupport: { png: true, pdf: true, svg: true } },
  { id: "flow:primary-access", name: "Primary Access Vector", category: "mobility", tags: ["flow", "access", "traffic"], sourceType: "generator", generatorId: "FlowPath", presetParameters: { marker: "filled-arrow" }, defaultVisualMode: "technical", defaultScale: 1.0, anchor: { x: 0.0, y: 0.5 }, rotatable: true, flippable: false, colorMode: "semantic-theme", performanceTier: "P1", quickPaletteEligible: true, exportSupport: { png: true, pdf: true, svg: true } },
  { id: "sun:summer-solstice", name: "Summer Solstice Sun Arc", category: "solar", tags: ["sun", "solar", "solstice"], sourceType: "generator", generatorId: "SunPath", presetParameters: { season: "summer-solstice" }, defaultVisualMode: "soft-analysis", defaultScale: 1.0, anchor: { x: 0.5, y: 0.5 }, rotatable: true, flippable: false, colorMode: "semantic-theme", performanceTier: "P0", quickPaletteEligible: true, exportSupport: { png: true, pdf: true, svg: true } },
  { id: "draft:north-technical", name: "ISO Technical North Arrow", category: "drafting", tags: ["north", "compass", "drafting"], sourceType: "generator", generatorId: "NorthArrow", presetParameters: { style: "technical" }, defaultVisualMode: "technical", defaultScale: 1.0, anchor: { x: 0.5, y: 0.5 }, rotatable: true, flippable: false, colorMode: "monochrome", performanceTier: "P0", quickPaletteEligible: true, exportSupport: { png: true, pdf: true, svg: true } },
  { id: "draft:scale-1-500", name: "Metric 1:500 Scale Bar", category: "drafting", tags: ["scale", "metric", "bar"], sourceType: "generator", generatorId: "ScaleBar", presetParameters: { metricScale: "1:500" }, defaultVisualMode: "technical", defaultScale: 1.0, anchor: { x: 0.0, y: 0.5 }, rotatable: false, flippable: false, colorMode: "monochrome", performanceTier: "P0", quickPaletteEligible: true, exportSupport: { png: true, pdf: true, svg: true } },
]);

const SITE_SYMBOL_MAP = new Map<string, SiteSymbolDefinition>(
  LAUNCH_SITE_SYMBOLS.map((sym) => [sym.id, sym]),
);

export const SiteSymbolRegistry = {
  getAll: (): readonly SiteSymbolDefinition[] => LAUNCH_SITE_SYMBOLS,
  getById: (id: string): SiteSymbolDefinition | undefined => SITE_SYMBOL_MAP.get(id),
  hasId: (id: string): boolean => SITE_SYMBOL_MAP.has(id),
};

// ============================================================================
// 3. ANALYSIS GENERATOR REGISTRY
// ============================================================================

const LAUNCH_GENERATORS: readonly AnalysisGeneratorDefinition[] = Object.freeze([
  { id: "TreePlan", name: "Tree Plan Generator", category: "landscape", parameterSpecs: [{ name: "canopyShape", type: "string", defaultValue: "irregular" }], defaultVisualMode: "editorial", performanceTier: "P1" },
  { id: "Hedge", name: "Hedge Generator", category: "landscape", parameterSpecs: [{ name: "informal", type: "boolean", defaultValue: false }], defaultVisualMode: "technical", performanceTier: "P1" },
  { id: "WindFlow", name: "Wind Flow Generator", category: "wind", parameterSpecs: [{ name: "speedClass", type: "string", defaultValue: "moderate" }], defaultVisualMode: "soft-analysis", performanceTier: "P1" },
  { id: "WindRose", name: "Wind Rose Generator", category: "wind", parameterSpecs: [{ name: "directions", type: "number", defaultValue: 8 }], defaultVisualMode: "editorial", performanceTier: "P0" },
  { id: "FlowPath", name: "Flow Path Generator", category: "flow", parameterSpecs: [{ name: "marker", type: "string", defaultValue: "filled-arrow" }], defaultVisualMode: "technical", performanceTier: "P1" },
  { id: "SunPath", name: "Sun Path Generator", category: "solar", parameterSpecs: [{ name: "season", type: "string", defaultValue: "summer-solstice" }], defaultVisualMode: "soft-analysis", performanceTier: "P0" },
  { id: "SolarCone", name: "Solar Shadow Envelope", category: "solar", parameterSpecs: [{ name: "azimuth", type: "number", defaultValue: 180 }], defaultVisualMode: "soft-analysis", performanceTier: "P1" },
  { id: "ViewCone", name: "Sightline View Cone", category: "environmental", parameterSpecs: [{ name: "angle", type: "number", defaultValue: 90 }], defaultVisualMode: "technical", performanceTier: "P1" },
  { id: "NoiseCone", name: "Acoustic Noise Dispersion", category: "environmental", parameterSpecs: [{ name: "decibels", type: "number", defaultValue: 80 }], defaultVisualMode: "soft-analysis", performanceTier: "P1" },
  { id: "DrainageFlow", name: "Water Drainage Stream", category: "water", parameterSpecs: [{ name: "velocity", type: "string", defaultValue: "high" }], defaultVisualMode: "soft-analysis", performanceTier: "P1" },
  { id: "Contour", name: "Topography Contour Line", category: "terrain", parameterSpecs: [{ name: "elevation", type: "number", defaultValue: 10 }], defaultVisualMode: "technical", performanceTier: "P1" },
  { id: "Slope", name: "Slope Gradient Indicator", category: "terrain", parameterSpecs: [{ name: "gradient", type: "number", defaultValue: 0.08 }], defaultVisualMode: "technical", performanceTier: "P1" },
  { id: "NorthArrow", name: "North Arrow Compass", category: "drafting", parameterSpecs: [{ name: "style", type: "string", defaultValue: "technical" }], defaultVisualMode: "technical", performanceTier: "P0" },
  { id: "ScaleBar", name: "Metric Scale Bar", category: "drafting", parameterSpecs: [{ name: "metricScale", type: "string", defaultValue: "1:500" }], defaultVisualMode: "technical", performanceTier: "P0" },
]);

const GENERATOR_MAP = new Map<string, AnalysisGeneratorDefinition>(
  LAUNCH_GENERATORS.map((gen) => [gen.id, gen]),
);

export const AnalysisGeneratorRegistry = {
  getAll: (): readonly AnalysisGeneratorDefinition[] => LAUNCH_GENERATORS,
  getById: (id: string): AnalysisGeneratorDefinition | undefined => GENERATOR_MAP.get(id),
  hasId: (id: string): boolean => GENERATOR_MAP.has(id),
};

// ============================================================================
// 4. VISUAL PRESET REGISTRY
// ============================================================================

const LAUNCH_VISUAL_PRESETS: readonly VisualPresetDefinition[] = Object.freeze([
  { id: "solid-primary", name: "Solid Primary", category: "technical", baseFamily: "continuous", patternScale: 1.0, cap: "butt", join: "miter", defaultWidth: 2.0, defaultOpacity: 0.95, markerDefaults: { start: "none", end: "none" }, performanceTier: "P0", legendPreview: "Solid Line", exportSupport: { png: true, pdf: true, svg: true }, launchStatus: "EXISTING" },
  { id: "dashed-secondary", name: "Dashed Secondary", category: "technical", baseFamily: "dash", dashUnits: [8, 6], patternScale: 1.0, cap: "butt", join: "miter", defaultWidth: 1.5, defaultOpacity: 0.8, markerDefaults: { start: "none", end: "none" }, performanceTier: "P0", legendPreview: "Dashed Line", exportSupport: { png: true, pdf: true, svg: true }, launchStatus: "EXISTING" },
  { id: "dotted-sightline", name: "Dotted Sightline", category: "analytical", baseFamily: "dash", dashUnits: [1, 5], patternScale: 1.0, cap: "round", join: "round", defaultWidth: 1.0, defaultOpacity: 0.5, markerDefaults: { start: "none", end: "none" }, performanceTier: "P0", legendPreview: "Dotted Line", exportSupport: { png: true, pdf: true, svg: true }, launchStatus: "EXISTING" },
  { id: "double-barrier", name: "Fire Barrier Double", category: "architectural", baseFamily: "parallel", patternScale: 1.0, amplitude: 4.0, cap: "butt", join: "miter", defaultWidth: 1.2, defaultOpacity: 0.9, markerDefaults: { start: "bar", end: "bar" }, performanceTier: "P1", legendPreview: "Parallel Double Line", exportSupport: { png: true, pdf: true, svg: true }, launchStatus: "EXISTING" },
  { id: "zigzag-hvac", name: "HVAC Supply Air", category: "infrastructure", baseFamily: "procedural", patternScale: 1.0, amplitude: 6.0, cap: "round", join: "round", defaultWidth: 1.5, defaultOpacity: 0.85, markerDefaults: { start: "none", end: "open-arrow" }, performanceTier: "P1", legendPreview: "Zigzag Wave", exportSupport: { png: true, pdf: true, svg: true }, launchStatus: "EXISTING" },
  { id: "wave-circulation", name: "Pedestrian Circulation Wave", category: "flow", baseFamily: "procedural", patternScale: 1.0, amplitude: 5.0, cap: "round", join: "round", defaultWidth: 2.5, defaultOpacity: 0.8, markerDefaults: { start: "none", end: "filled-arrow" }, performanceTier: "P1", legendPreview: "Sine Wave Path", exportSupport: { png: true, pdf: true, svg: true }, launchStatus: "EXISTING" },
  { id: "scallop-canopy", name: "Tree Canopy Scallop", category: "landscape", baseFamily: "procedural", patternScale: 1.0, amplitude: 5.0, cap: "round", join: "round", defaultWidth: 1.5, defaultOpacity: 0.75, markerDefaults: { start: "none", end: "none" }, performanceTier: "P1", legendPreview: "Scalloped Line", exportSupport: { png: true, pdf: true, svg: true }, launchStatus: "EXISTING" },
  { id: "vertical-hash", name: "Property Boundary Hash", category: "cadastral", baseFamily: "procedural", patternScale: 1.0, amplitude: 5.0, cap: "butt", join: "miter", defaultWidth: 1.2, defaultOpacity: 0.8, markerDefaults: { start: "none", end: "none" }, performanceTier: "P1", legendPreview: "Perpendicular Tick Line", exportSupport: { png: true, pdf: true, svg: true }, launchStatus: "EXISTING" },
  { id: "lightning-feeder", name: "High Voltage Feeder", category: "infrastructure", baseFamily: "procedural", patternScale: 1.0, amplitude: 7.0, cap: "butt", join: "miter", defaultWidth: 1.8, defaultOpacity: 0.95, markerDefaults: { start: "none", end: "stealth" }, performanceTier: "P1", legendPreview: "Lightning Motif", exportSupport: { png: true, pdf: true, svg: true }, launchStatus: "EXISTING" },
  { id: "repeated-marker-flow", name: "Directional Flow Inline", category: "flow", baseFamily: "procedural", patternScale: 1.0, amplitude: 0.0, cap: "round", join: "round", defaultWidth: 2.0, defaultOpacity: 0.9, markerDefaults: { start: "none", end: "filled-arrow" }, performanceTier: "P1", legendPreview: "Inline Repeated Arrows", exportSupport: { png: true, pdf: true, svg: true }, launchStatus: "NEW_PRIMITIVE_APPROVED" },
]);

const PRESET_MAP = new Map<string, VisualPresetDefinition>(
  LAUNCH_VISUAL_PRESETS.map((preset) => [preset.id, preset]),
);

export const VisualPresetRegistry = {
  getAll: (): readonly VisualPresetDefinition[] => LAUNCH_VISUAL_PRESETS,
  getById: (id: string): VisualPresetDefinition | undefined => PRESET_MAP.get(id),
  hasId: (id: string): boolean => PRESET_MAP.has(id),
};
