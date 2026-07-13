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

export interface BoundaryPresentationDefaults extends SurfacePresentationDefaults {
  style: "solid";
  width: number;
  offset: number;
}

export interface BoundaryAppearanceOverride extends SurfaceAppearanceOverride {
  style?: "solid";
  width?: number;
  offset?: number;
}

export interface MembraneEdgePresentationDefaults extends SurfacePresentationDefaults {
  width: number;
}

export interface MembraneEdgeAppearanceOverride extends SurfaceAppearanceOverride {
  width?: number;
}

export interface CorePresentationDefaults extends SurfacePresentationDefaults {
  shape: "dot";
  /** Ratio of the Cell radius, matching the current embedded-dot shader. */
  size: number;
}

export interface CoreAppearanceOverride extends SurfaceAppearanceOverride {
  shape?: "dot";
  size?: number;
}

export interface VoidPresentationDefaults {
  visible: boolean;
  fill: PresentationPaintDefaults;
  edge: PresentationPaintDefaults;
  edgeWidth: number;
}

export interface VoidAppearanceOverride {
  visible?: boolean;
  fill?: PresentationPaintOverride;
  edge?: PresentationPaintOverride;
  edgeWidth?: number;
}

export interface ProjectPresentationDefaults {
  schemaVersion: 1;
  cell: SurfacePresentationDefaults;
  boundary: BoundaryPresentationDefaults;
  membrane: SurfacePresentationDefaults;
  membraneEdge: MembraneEdgePresentationDefaults;
  core: CorePresentationDefaults;
  void: VoidPresentationDefaults;
}

/** Sparse by construction: an omitted target or field inherits the project
 * default. Reset is the explicit removal operation in validation.ts. */
export interface CellAppearanceOverrides {
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

export interface ResolvedBoundaryAppearance extends ResolvedSurfaceAppearance {
  style: "solid";
  width: number;
  offset: number;
}

export interface ResolvedMembraneEdgeAppearance extends ResolvedSurfaceAppearance {
  width: number;
}

export interface ResolvedCoreAppearance extends ResolvedSurfaceAppearance {
  shape: "dot";
  size: number;
}

export interface ResolvedVoidAppearance {
  visible: boolean;
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
  cell: ResolvedSurfaceAppearance;
  boundary: ResolvedBoundaryAppearance;
  membrane: ResolvedSurfaceAppearance;
  membraneEdge: ResolvedMembraneEdgeAppearance;
  core: ResolvedCoreAppearance;
  void: ResolvedVoidAppearance;
}
