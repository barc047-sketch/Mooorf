import type { ArrangementPatternId, SpaceKind } from "../types";
import type { SpacePosition } from "../interaction/groupDrag";

export type ArrangementCategory = "basic" | "geometric" | "generative" | "packing" | "organic";
export type ArrangementScope = "auto" | "selected" | "all-visible";
export type ArrangementDirection = "clockwise" | "counter-clockwise";
export type ArrangementCalculationPhase = "idle" | "calculating" | "ready" | "error";
export type ArrangementControlId =
  | "spacing"
  | "collision-margin"
  | "rotation"
  | "direction"
  | "preserve-centre"
  | "area-aware"
  | "seed"
  | "count"
  | "aspect-ratio"
  | "spiral-growth"
  | "ring-count"
  | "cross-arm-ratio";

export interface ArrangementParameters {
  spacing: number;
  collisionMargin: number;
  rotation: number;
  direction: ArrangementDirection;
  preserveCentre: boolean;
  areaAwareSpacing: boolean;
  includeVoids: boolean;
  scope: ArrangementScope;
  seed: number;
  /** null means Auto for Grid/Rows/Columns. */
  count: number | null;
  aspectRatio: number;
  spiralGrowth: number;
  ringCount: number;
  crossArmRatio: number;
}

export const DEFAULT_ARRANGEMENT_PARAMETERS: ArrangementParameters = {
  spacing: 24,
  collisionMargin: 8,
  rotation: 0,
  direction: "clockwise",
  preserveCentre: true,
  areaAwareSpacing: true,
  includeVoids: true,
  scope: "auto",
  seed: 1729,
  count: null,
  aspectRatio: 1.6,
  spiralGrowth: 1,
  ringCount: 3,
  crossArmRatio: 1,
};

export interface ArrangementEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  kind: SpaceKind;
  /** Optional future/current projections; absent flags remain eligible. */
  visible?: boolean;
  hidden?: boolean;
  locked?: boolean;
}

export interface ArrangementRequest {
  patternId: ArrangementPatternId;
  entities: ArrangementEntity[];
  parameters: ArrangementParameters;
}

export interface ArrangementWorkerRequest extends ArrangementRequest {
  requestId: number;
}

export interface ArrangementWorkerResponse {
  requestId: number;
  positions?: SpacePosition[];
  error?: string;
}

export interface ArrangementCalculationStatus {
  phase: ArrangementCalculationPhase;
  requestId: number;
  patternId: ArrangementPatternId | null;
  entityCount: number;
  error: string | null;
}

export interface ArrangementPatternDefinition {
  id: ArrangementPatternId;
  label: string;
  hint: string;
  category: ArrangementCategory;
  miniature: readonly { x: number; y: number }[];
  controls: readonly ArrangementControlId[];
  deterministic: boolean;
  workerCompatible: boolean;
  calculator: "engine";
}

export interface LatestRequestGate {
  begin: () => number;
  isCurrent: (requestId: number) => boolean;
  cancel: () => void;
  current: () => number;
}

export const createLatestRequestGate = (): LatestRequestGate => {
  let revision = 0;
  let active = 0;
  return {
    begin: () => {
      active = ++revision;
      return active;
    },
    isCurrent: (requestId) => active !== 0 && active === requestId,
    cancel: () => {
      active = 0;
      revision += 1;
    },
    current: () => active,
  };
};
