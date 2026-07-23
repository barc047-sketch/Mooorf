/**
 * MOOORF Visual Arsenal — Domain Types & Registry Schemas
 * Wave VA0 Registry Foundations
 */

export type UIIconFamily =
  | "navigation"
  | "connections"
  | "labels"
  | "display"
  | "view"
  | "zoom"
  | "editing"
  | "export"
  | "settings"
  | "chrome"
  | "alignment"
  | "typography"
  | "markup"
  | "materials"
  | "table"
  | "geometry";

export type UIClassification = "A" | "B" | "C" | "D" | "E";

export interface UIIconDefinition {
  readonly id: string;
  readonly semanticName: string;
  readonly family: UIIconFamily;
  readonly iconName: string;
  readonly package: "lucide-react" | "custom-glyph";
  readonly recommendedSize: number;
  readonly strokeWidth: number;
  readonly classification: UIClassification;
  readonly tooltip: string;
  readonly ariaLabel: string;
  readonly fallback?: string;
  readonly customGlyphId?: string;
}

export type SymbolCategory =
  | "landscape"
  | "wind"
  | "flow"
  | "solar"
  | "water"
  | "terrain"
  | "mobility"
  | "urban"
  | "environmental"
  | "drafting"
  | "utilities"
  | "people";

export type SymbolSourceType = "generator" | "static-svg";
export type VisualModeId = "technical" | "editorial" | "soft-analysis";
export type PerformanceTier = "P0" | "P1" | "P2" | "P3";

export interface SiteSymbolDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: SymbolCategory;
  readonly tags: readonly string[];
  readonly sourceType: SymbolSourceType;
  readonly generatorId?: string;
  readonly staticAssetId?: string;
  readonly presetParameters?: Record<string, unknown>;
  readonly defaultVisualMode: VisualModeId;
  readonly defaultScale: number;
  readonly anchor: { readonly x: number; readonly y: number };
  readonly rotatable: boolean;
  readonly flippable: boolean;
  readonly colorMode: "monochrome" | "semantic-theme" | "custom-tint";
  readonly performanceTier: PerformanceTier;
  readonly quickPaletteEligible: boolean;
  readonly exportSupport: { readonly png: boolean; readonly pdf: boolean; readonly svg: boolean };
}

export interface GeneratorParameterSpec {
  readonly name: string;
  readonly type: "string" | "number" | "boolean" | "enum";
  readonly defaultValue: unknown;
  readonly validRange?: readonly [number, number];
  readonly options?: readonly string[];
}

export interface AnalysisGeneratorDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: SymbolCategory;
  readonly parameterSpecs: readonly GeneratorParameterSpec[];
  readonly defaultVisualMode: VisualModeId;
  readonly performanceTier: PerformanceTier;
}

export type StrokeCap = "butt" | "square" | "round";
export type StrokeJoin = "miter" | "bevel" | "round";
export type ConnectionBaseFamily = "continuous" | "dash" | "parallel" | "procedural";

export interface VisualPresetDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly baseFamily: ConnectionBaseFamily;
  readonly dashUnits?: readonly number[];
  readonly patternScale: number;
  readonly amplitude?: number;
  readonly cap: StrokeCap;
  readonly join: StrokeJoin;
  readonly defaultWidth: number;
  readonly defaultOpacity: number;
  readonly markerDefaults: { readonly start: string; readonly end: string };
  readonly performanceTier: PerformanceTier;
  readonly legendPreview: string;
  readonly exportSupport: { readonly png: boolean; readonly pdf: boolean; readonly svg: boolean };
  readonly launchStatus: "EXISTING" | "NEW_PRESET_APPROVED" | "NEW_PRIMITIVE_APPROVED" | "EXPERIMENTAL_DEFERRED";
}

export type MarkupKind = "symbol" | "flow" | "area" | "drafting" | "annotation";

export interface BaseMarkupItem {
  readonly id: string;
  readonly kind: MarkupKind;
  readonly registryId: string;
  readonly label: string;
  readonly floorId?: string;
  readonly transform: {
    readonly x: number;
    readonly y: number;
    readonly scaleX: number;
    readonly scaleY: number;
    readonly rotation: number;
  };
  readonly presentation: {
    readonly visualMode: VisualModeId;
    readonly colorMode: "monochrome" | "semantic-theme" | "custom-tint";
    readonly customColor?: string;
    readonly strokeWidthPx?: number;
    readonly opacity: number;
    readonly fillOpacity?: number;
  };
  readonly flags: {
    readonly visible: boolean;
    readonly locked: boolean;
    readonly exportable: boolean;
  };
}

export interface MarkupSymbol extends BaseMarkupItem {
  readonly kind: "symbol";
  readonly parameters?: {
    readonly canopyShape?: string;
    readonly density?: number;
    readonly scale?: number;
  };
}

export interface MarkupFlow extends BaseMarkupItem {
  readonly kind: "flow";
  readonly parameters?: {
    readonly speedClass?: string;
    readonly streamCount?: number;
  };
}

export interface MarkupArea extends BaseMarkupItem {
  readonly kind: "area";
  readonly parameters?: {
    readonly hatchAngle?: number;
  };
}

export interface MarkupDrafting extends BaseMarkupItem {
  readonly kind: "drafting";
  readonly parameters?: {
    readonly style?: string;
    readonly metricScale?: string;
  };
}

export interface MarkupAnnotation extends BaseMarkupItem {
  readonly kind: "annotation";
  readonly parameters?: {
    readonly calloutText?: string;
  };
}

export type MarkupItem =
  | MarkupSymbol
  | MarkupFlow
  | MarkupArea
  | MarkupDrafting
  | MarkupAnnotation;
