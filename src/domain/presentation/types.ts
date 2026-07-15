import type { MaterialTarget } from "../../materials/types";

export const PRESENTATION_TARGET_IDS = [
  "cell",
  "boundary",
  "membrane",
  "membrane-edge",
  "core",
  "void",
] as const;

export type PresentationTargetId = typeof PRESENTATION_TARGET_IDS[number];
export type PresentationDefaultsKey = "cell" | "boundary" | "membrane" | "membraneEdge" | "core" | "void";

export interface PresentationTargetContract {
  id: PresentationTargetId;
  defaultsKey: PresentationDefaultsKey;
  materialTargets: readonly MaterialTarget[];
}

/** Canonical persistence-to-material ownership. Selection is deliberately not
 * a target: it remains temporary interaction UI rather than Cell appearance. */
export const PRESENTATION_TARGET_CONTRACTS: readonly PresentationTargetContract[] = [
  { id: "cell", defaultsKey: "cell", materialTargets: ["space-fill"] },
  { id: "boundary", defaultsKey: "boundary", materialTargets: ["space-boundary"] },
  { id: "membrane", defaultsKey: "membrane", materialTargets: ["organism"] },
  { id: "membrane-edge", defaultsKey: "membraneEdge", materialTargets: ["organism-edge"] },
  { id: "core", defaultsKey: "core", materialTargets: ["core-dot"] },
  { id: "void", defaultsKey: "void", materialTargets: ["void-fill", "void-edge"] },
];

export interface PresentationPaintDefaults {
  materialId: string;
  /** null delegates colour to the canonical legacy palette/material resolver. */
  colour: string | null;
  opacity: number;
}

export interface PresentationPaintOverride {
  materialId?: string;
  colour?: string;
  opacity?: number;
}

export interface SurfacePresentationDefaults {
  visible: boolean;
  paint: PresentationPaintDefaults;
}

export interface SurfaceAppearanceOverride {
  visible?: boolean;
  paint?: PresentationPaintOverride;
}

export const MEMBRANE_COLOUR_MODES = ["cell-gradient", "solid"] as const;
export type MembraneColourMode = typeof MEMBRANE_COLOUR_MODES[number];

export type MembraneSolidMaterialId =
  | "system:black"
  | "system:ink"
  | "system:mooorf-red"
  | "system:charcoal"
  | "custom";

export interface MembranePresentationDefaults extends SurfacePresentationDefaults {
  /** Cell Gradient is the legacy/current spatial Cell-colour path. */
  colourMode: MembraneColourMode;
  /** Registry material reference, or `custom` to consume paint.colour. */
  solidMaterialId: MembraneSolidMaterialId;
}

export const BOUNDARY_STYLES = [
  "solid",
  "dashed",
  "dotted",
  "dash-dot",
  "double",
  "segmented-bars",
] as const;

export type BoundaryStyle = typeof BOUNDARY_STYLES[number];

export const BOUNDARY_ALIGNMENTS = ["inner", "centre", "outer"] as const;

export type BoundaryAlignment = typeof BOUNDARY_ALIGNMENTS[number];

export const TEXT_STYLE_PRESET_IDS = [
  "technical",
  "editorial",
  "minimal",
  "compact",
  "presentation",
  "diagram",
] as const;

export type TextStylePresetId = typeof TEXT_STYLE_PRESET_IDS[number];
export type TextColourMode = "auto" | "custom";

export interface TextPresentationDefaults {
  preset: TextStylePresetId;
  /** Coordinated scale for Heading, Area and Body. */
  size: number;
  colourMode: TextColourMode;
  colour: string;
}

export interface TextAppearanceOverride {
  preset?: TextStylePresetId;
  size?: number;
  colourMode?: TextColourMode;
  colour?: string;
}

export interface BoundaryPresentationDefaults extends SurfacePresentationDefaults {
  style: BoundaryStyle;
  width: number;
  offset: number;
  alignment: BoundaryAlignment;
  dashLength: number;
  gapLength: number;
  secondaryLineSpacing: number;
}

export interface BoundaryAppearanceOverride extends SurfaceAppearanceOverride {
  style?: BoundaryStyle;
  width?: number;
  offset?: number;
  alignment?: BoundaryAlignment;
  dashLength?: number;
  gapLength?: number;
  secondaryLineSpacing?: number;
}

export interface MembraneEdgePresentationDefaults extends SurfacePresentationDefaults {
  width: number;
  /** Independent edge-band feather; never aliases Organism field edgeSoftness. */
  softness: number;
}

export interface MembraneEdgeAppearanceOverride extends SurfaceAppearanceOverride {
  width?: number;
  softness?: number;
}

export interface CorePresentationDefaults extends SurfacePresentationDefaults {
  shape: "dot";
  /** Ratio of the Cell radius, matching the current embedded-dot shader. */
  size: number;
  /** Presentation-only offsets; architectural Cell centres remain unchanged. */
  offsetX: number;
  offsetY: number;
}

export interface CoreAppearanceOverride extends SurfaceAppearanceOverride {
  shape?: "dot";
  size?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface VoidPresentationDefaults {
  visible: boolean;
  fillVisible: boolean;
  edgeVisible: boolean;
  fill: PresentationPaintDefaults;
  edge: PresentationPaintDefaults;
  edgeWidth: number;
}

export interface VoidAppearanceOverride {
  visible?: boolean;
  fillVisible?: boolean;
  edgeVisible?: boolean;
  fill?: PresentationPaintOverride;
  edge?: PresentationPaintOverride;
  edgeWidth?: number;
}

export interface ProjectPresentationDefaults {
  schemaVersion: 4;
  text: TextPresentationDefaults;
  cell: SurfacePresentationDefaults;
  boundary: BoundaryPresentationDefaults;
  membrane: MembranePresentationDefaults;
  membraneEdge: MembraneEdgePresentationDefaults;
  core: CorePresentationDefaults;
  void: VoidPresentationDefaults;
}

/** Sparse by construction: an omitted target or field inherits the project
 * default. Reset is the explicit removal operation in validation.ts. */
export interface CellAppearanceOverrides {
  text?: TextAppearanceOverride;
  cell?: SurfaceAppearanceOverride;
  boundary?: BoundaryAppearanceOverride;
  membrane?: SurfaceAppearanceOverride;
  membraneEdge?: MembraneEdgeAppearanceOverride;
  core?: CoreAppearanceOverride;
  void?: VoidAppearanceOverride;
}

export type MaterialResolutionStatus = "resolved" | "unknown-fallback" | "incompatible-fallback";

export interface ResolvedPresentationPaint {
  requestedMaterialId: string;
  materialId: string;
  status: MaterialResolutionStatus;
  colour: string;
  opacity: number;
}

export interface ResolvedSurfaceAppearance {
  visible: boolean;
  paint: ResolvedPresentationPaint;
}

export interface ResolvedMembraneAppearance extends ResolvedSurfaceAppearance {
  colourMode: MembraneColourMode;
  solidMaterialId: MembraneSolidMaterialId;
}

export interface ResolvedBoundaryAppearance extends ResolvedSurfaceAppearance {
  style: BoundaryStyle;
  width: number;
  offset: number;
  alignment: BoundaryAlignment;
  dashLength: number;
  gapLength: number;
  secondaryLineSpacing: number;
}

export interface ResolvedMembraneEdgeAppearance extends ResolvedSurfaceAppearance {
  width: number;
  softness: number;
}

export interface ResolvedCoreAppearance extends ResolvedSurfaceAppearance {
  shape: "dot";
  size: number;
  offsetX: number;
  offsetY: number;
}

export interface ResolvedVoidAppearance {
  visible: boolean;
  fillVisible: boolean;
  edgeVisible: boolean;
  fill: ResolvedPresentationPaint;
  edge: ResolvedPresentationPaint;
  edgeWidth: number;
  semantics: {
    subtractive: true;
    areaContribution: 0;
    appearanceAffectsGeometry: false;
    appearanceAffectsHitTesting: false;
    appearanceAffectsClearance: false;
  };
}

export interface ResolvedCellAppearance {
  text: TextPresentationDefaults;
  cell: ResolvedSurfaceAppearance;
  boundary: ResolvedBoundaryAppearance;
  membrane: ResolvedMembraneAppearance;
  membraneEdge: ResolvedMembraneEdgeAppearance;
  core: ResolvedCoreAppearance;
  void: ResolvedVoidAppearance;
}
