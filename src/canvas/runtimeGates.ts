export interface RuntimeGateInputs {
  membraneVisible: boolean;
  membraneEdgeVisible: boolean;
  shadowEnabled: boolean;
  motionEnabled: boolean;
  labelsVisible: boolean;
  gridVisible: boolean;
  interactionActive: boolean;
  snappingEnabled: boolean;
}

export interface RuntimeGates {
  membrane: boolean;
  membraneEdge: boolean;
  shadow: boolean;
  motion: boolean;
  labels: boolean;
  grid: boolean;
  snapping: boolean;
  continuous: boolean;
}

/** Pure projection shared by the current Canvas and the future Quick Bar. */
export const resolveRuntimeGates = (input: RuntimeGateInputs): RuntimeGates => ({
  membrane: input.membraneVisible,
  membraneEdge: input.membraneVisible && input.membraneEdgeVisible,
  shadow: input.shadowEnabled,
  motion: input.motionEnabled,
  labels: input.labelsVisible,
  grid: input.gridVisible,
  snapping: input.snappingEnabled && input.interactionActive,
  continuous: input.motionEnabled,
});

export const runOwnedWork = <T>(enabled: boolean, work: () => T): T | undefined =>
  enabled ? work() : undefined;
