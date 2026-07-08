export type Theme = "day" | "night";

export type ViewMode = "canvas" | "table";

export type RendererMode = "organism" | "classic";

export type PaletteMode = "core" | "surreal" | "architecture" | "auto";

export type AnnotationMode = "editorial" | "pill" | "technical" | "hidden";

export type SelectionDisplay = "tight" | "halo" | "influence";

export type Privacy = "public" | "shared" | "private";

export type MorphMode =
  | "cellular-reverse"
  | "plain-black"
  | "plain-white"
  | "graphite"
  | "wine"
  | "auto";

export type AttachMode = "tight" | "soft" | "long" | "extreme";

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
  showFieldDebug: boolean;
  showNucleiDebug: boolean;
}

export type OrgPanelFocus = "annotation" | "style" | "organism" | "display" | null;

export interface SpaceCell {
  id: string;
  name: string;
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
  paletteMode: PaletteMode;
  annotationMode: AnnotationMode;
  organism: OrganismSettings;
  theme: Theme;
}
