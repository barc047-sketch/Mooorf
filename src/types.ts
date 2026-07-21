import type { ResourceSettings } from "./resources/types";
import type { CellAppearanceOverrides, ProjectPresentationDefaults } from "./domain/presentation/types";
import type { Connection } from "./domain/graph/types";

export type Theme = "day" | "night";

export type ViewMode = "canvas" | "table";

export type RendererMode = "organism" | "classic";

export type { StartupMilestone as CanvasReadiness } from "./ui/readiness";

export type PaletteMode = "core" | "surreal" | "architecture" | "auto";

export type ColorSource = "category" | "privacy";

export type LabelScaleMode = "screen" | "adaptive" | "world";

export type LabelColourMode = "auto" | "black" | "white" | "custom";

export type PerformanceQuality = "automatic" | "high" | "balanced" | "fast";

export type CellShadowMode = "off" | "soft" | "defined";

export interface CellShadowSettings {
  enabled: boolean;
  mode: CellShadowMode;
  /** Compact canonical intensity control. Advanced values remain independently editable. */
  strength: number;
  opacity: number;
  softness: number;
  offsetX: number;
  offsetY: number;
  spread: number;
  colorMode: "auto" | "custom";
  color: string;
  includeInExport: boolean;
}

export type ToolId =
  | "select"
  | "space"
  | "void"
  | "line"
  | "relationship"
  | "text"
  | "paragraph"
  | "frame"
  | "pan";

export type ContextSurface =
  | "blank-menu"
  | "object-radial"
  | "inline-editor"
  | "material-shelf"
  | "sub-rail"
  | null;

export interface ContextPoint {
  x: number;
  y: number;
}

export type LayoutPresetId =
  | "organic"
  | "random"
  | "core"
  | "colony"
  | "division"
  | "tendril"
  | "orbit"
  | "asymmetry";

/** Arrangement V2 extends the saved-project-safe legacy IDs without changing
 * the persisted LayoutPresetId contract used by existing projects. */
export type ArrangementPatternId =
  | LayoutPresetId
  | "horizontal-line"
  | "vertical-line"
  | "diagonal-line"
  | "grid"
  | "rows"
  | "columns"
  | "circle"
  | "oval"
  | "square-perimeter"
  | "rectangle-perimeter"
  | "cross"
  | "radial-spokes"
  | "concentric-rings"
  | "golden-angle"
  | "golden-spiral"
  | "archimedean-spiral"
  | "seeded-random"
  | "compact-pack"
  | "relaxed-pack";

export type AnnotationMode = "editorial" | "pill" | "technical" | "hidden";

export type LabelPosition = "auto" | "center" | "above" | "below";

/* V6K — fine annotation controls. All label-layer only; never product data. */
export interface AnnotationDetail {
  textScale: number; // 0.75–1.6, multiplies label typography
  textShadow: boolean;
  showName: boolean;
  showArea: boolean;
  showCategory: boolean; // technical mode only
  position: LabelPosition;
  boundingBox: boolean; // hairline box even in boxless modes
}

/* V6K — floating widget system. Order in the open list = stacking order.
   V7/V7.1 adds the Project Pulse gateway and independent instruments. */
export type WidgetId =
  | "inspector"
  | "cell-settings"
  | "membrane-settings"
  | "void-settings"
  | "annotation"
  | "organism"
  | "layout"
  | "palette"
  | "saved"
  | "display"
  | "label-studio"
  | "advanced"
  | "stats"
  | "category-mix"
  | "privacy-balance"
  | "area-leaders"
  | "data-health"
  | "import"
  | "export";

export type Privacy = "public" | "shared" | "private";

export type SpaceKind = "space" | "void";

export type MorphMode =
  | "cellular-reverse"
  | "plain-black"
  | "plain-white"
  | "graphite"
  | "wine"
  | "auto";

export type AttachMode = "tight" | "soft" | "long" | "extreme";

export type OrganismLayerRole =
  | "outer-membrane"
  | "nucleus-body"
  | "inner-core"
  | "void";

/** Detail policy for the low-resolution membrane target. This may simplify
 * shading work, but it must never change the authored field geometry. */
export type OrganismLowZoomDetail = "full" | "balanced" | "simplified";

/** Visual feedback only. Camera coordinates, history and exports never use
 * this preference or its temporary displacement. */
export type CameraShakeMode = "off" | "soft" | "responsive" | "custom";

/* Production organism control surface (V6H.1). Persisted in the store so the
   advanced panel survives canvas/table switches. Defaults live in
   src/canvas/organismProductionSettings.ts and reproduce the pre-V6H.1 look. */
export interface OrganismSettings {
  // organism field
  mass: number;
  isoLevel: number;
  surfaceTension: number;
  edgeSoftness: number;
  connectionBias: number;

  // nuclei (count is data-owned: spaces.length — never a slider)
  nucleusStrength: number;
  radiusMin: number;
  radiusMax: number;
  sizeVariation: number;

  // attachment / offset (visual layout transform, never writes space x/y)
  globalOffset: number;
  offsetX: number;
  offsetY: number;
  radialOffset: number;
  angularOffset: number;

  // motion
  motionEnabled: boolean;
  idleMotion: boolean;
  timeScale: number;
  response: number;
  drift: number;
  breathing: number;
  wobble: number;
  phaseVariation: number;

  // pockets
  pocketThreshold: number;
  pocketSoftness: number;

  // display / debug
  showLabels: boolean;
  showNuclei: boolean;
  /** Keeps authored membrane geometry independent of camera zoom. */
  preserveMorphology: boolean;
  /** Low-resolution shading policy; never a camera-to-geometry transform. */
  lowZoomDetail: OrganismLowZoomDetail;
  /** Lower bound for non-geometric membrane detail at reduced target scales. */
  minimumMorphologyDetail: number;
  /** 0..1 artistic edge-AA stability preference. */
  edgeStability: number;
  /** @deprecated Persisted only to migrate older projects. Camera zoom never mutates field geometry. */
  cameraAwareMorph: boolean;
  // visual camera feedback (runtime-only displacement, authored preference)
  cameraShakeMode: CameraShakeMode;
  cameraShakeIntensity: number;
  cameraShakeFrequency: number;
  cameraShakeDamping: number;
  cameraShakeDragInfluence: number;
  cameraShakeSettleDuration: number;
  showFieldDebug: boolean;
  showNucleiDebug: boolean;
}

/** @deprecated V6K — the single control surface became per-widget state (WidgetId). */
export type OrgPanelFocus = "annotation" | "style" | "organism" | "display" | null;

export interface SpaceCell {
  id: string;
  /** Stable user-authored Space No.; independent from row order and geometry. */
  spaceCode?: string;
  name: string;
  /** M1 architectural subtext. It is content only and never drives geometry. */
  body?: string;
  kind?: SpaceKind; // omitted/undefined means a normal additive space nucleus
  area: number; // m²
  category: string;
  privacy: Privacy;
  color: string;
  x: number;
  y: number;
  born?: number; // Date.now() at creation — drives spawn stagger in renderer
  /** C0.4.1 — presentation-only sparse overrides; architectural data stays above. */
  appearance?: CellAppearanceOverrides;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface SavedCanvasSnapshot {
  id: string;
  name: string;
  createdAt: number;
  spaces: SpaceCell[];
  /** Optional on legacy Saved Views; normalized to [] when absent. */
  connections?: Connection[];
  camera: Camera;
  rendererMode: RendererMode;
  morphMode: MorphMode;
  attachMode: AttachMode;
  mergeDistance: number;
  blobOn: boolean;
  paletteMode: PaletteMode;
  colorSource?: ColorSource;
  layoutPreset: LayoutPresetId;
  annotationMode: AnnotationMode;
  organism: OrganismSettings;
  theme: Theme;
  /* V7.1B — optional so older local snapshots migrate to Standard (1.0). */
  uiScale?: number;
  /* V7.1D — independent widget-window scale; optional so older snapshots migrate to Standard (1.0). */
  widgetScale?: number;
  /* V6K additions — optional so pre-V6K snapshots keep loading */
  annotationDetail?: AnnotationDetail;
  showGrid?: boolean;
  nucleusPaletteId?: string;
  organismPaletteId?: string;
  /** V8.2B — IDs/overrides only; static registry definitions are never persisted. */
  resources?: ResourceSettings;
  labelScaleMode?: LabelScaleMode;
  labelColourMode?: LabelColourMode;
  labelCustomColour?: string;
  cellShadow?: CellShadowSettings;
  performanceQuality?: PerformanceQuality;
  /** C0.4.1 — optional so pre-layer saved views migrate from legacy settings. */
  presentationDefaults?: ProjectPresentationDefaults;
}
