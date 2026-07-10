export type Theme = "day" | "night";

export type ViewMode = "canvas" | "table";

export type RendererMode = "organism" | "classic";

export type PaletteMode = "core" | "surreal" | "architecture" | "auto";

export type LayoutPresetId =
  | "organic"
  | "random"
  | "core"
  | "colony"
  | "division"
  | "tendril"
  | "orbit"
  | "asymmetry";

export type AnnotationMode = "editorial" | "pill" | "technical" | "hidden";

export type SelectionDisplay = "tight" | "halo" | "influence";

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
  | "annotation"
  | "organism"
  | "layout"
  | "palette"
  | "saved"
  | "display"
  | "advanced"
  | "stats"
  | "category-mix"
  | "privacy-balance"
  | "area-leaders"
  | "data-health";

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
  | "void"
  | "influence-ring";

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
  cameraAwareMorph: boolean;
  showFieldDebug: boolean;
  showNucleiDebug: boolean;
}

/** @deprecated V6K — the single control surface became per-widget state (WidgetId). */
export type OrgPanelFocus = "annotation" | "style" | "organism" | "display" | null;

export interface SpaceCell {
  id: string;
  name: string;
  kind?: SpaceKind; // omitted/undefined means a normal additive space nucleus
  area: number; // m²
  category: string;
  privacy: Privacy;
  color: string;
  x: number;
  y: number;
  born?: number; // Date.now() at creation — drives spawn stagger in renderer
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
  camera: Camera;
  rendererMode: RendererMode;
  morphMode: MorphMode;
  attachMode: AttachMode;
  mergeDistance: number;
  blobOn: boolean;
  paletteMode: PaletteMode;
  layoutPreset: LayoutPresetId;
  annotationMode: AnnotationMode;
  selectionDisplay: SelectionDisplay;
  organism: OrganismSettings;
  theme: Theme;
  /* V6K additions — optional so pre-V6K snapshots keep loading */
  annotationDetail?: AnnotationDetail;
  showGrid?: boolean;
  nucleusPaletteId?: string;
  organismPaletteId?: string;
}
