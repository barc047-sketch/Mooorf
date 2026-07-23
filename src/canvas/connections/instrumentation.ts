export interface ConnectionProjectionMetrics {
  authoredCount: number;
  eligibleCount: number;
  visibleCount: number;
  anchorResolutions: number;
  pathResolutions: number;
  cacheHits: number;
  cacheMisses: number;
  endpointInvalidations: number;
  hitIndexEntries: number;
  labelLayouts: number;
  annotationCandidates: number;
  annotationFull: number;
  annotationTitleOnly: number;
  annotationCollisionRejected: number;
  annotationCollisionChecks: number;
}

export interface ConnectionDrawWork {
  commandCount: number;
  strokeCalls: number;
  fillCalls: number;
  markerCalls: number;
  /** First command measured at the actual draw boundary in final CSS pixels. */
  finalRender?: {
    connectionId: string;
    visualScaleMode: "screen" | "canvas";
    cameraZoom: number;
    outputScale: number;
    authoredWidth: number;
    visibleWidth: number;
    visiblePatternAmplitude: number;
    visiblePatternWavelength: number;
    visibleMarkerSize: number;
  };
}

export interface ConnectionInstrumentationSnapshot extends ConnectionProjectionMetrics {
  annotationDrawn: number;
  annotationDrawCalls: number;
  batchPasses: number;
  drawCalls: number;
  drawnCommands: number;
  baseDrawCalls: number;
  overlayDrawCalls: number;
  overlayDrawnCommands: number;
  overlayClears: number;
  hitTests: number;
  portProjections: number;
  selectionOverlayDraws: number;
  sleeping: boolean;
}

const emptySnapshot = (authoredCount = 0): ConnectionInstrumentationSnapshot => ({
  authoredCount,
  eligibleCount: 0,
  visibleCount: 0,
  anchorResolutions: 0,
  pathResolutions: 0,
  cacheHits: 0,
  cacheMisses: 0,
  endpointInvalidations: 0,
  hitIndexEntries: 0,
  labelLayouts: 0,
  annotationCandidates: 0,
  annotationFull: 0,
  annotationTitleOnly: 0,
  annotationCollisionRejected: 0,
  annotationCollisionChecks: 0,
  annotationDrawn: 0,
  annotationDrawCalls: 0,
  batchPasses: 0,
  drawCalls: 0,
  drawnCommands: 0,
  baseDrawCalls: 0,
  overlayDrawCalls: 0,
  overlayDrawnCommands: 0,
  overlayClears: 0,
  hitTests: 0,
  portProjections: 0,
  selectionOverlayDraws: 0,
  sleeping: true,
});

export interface ConnectionInstrumentation {
  beginFrame(authoredCount: number): void;
  recordProjection(metrics: ConnectionProjectionMetrics): void;
  recordDrawBatch(work: ConnectionDrawWork, surface: "base" | "overlay"): void;
  recordAnnotationDraw(work: {
    annotationDrawn: number;
    fillCalls: number;
    strokeCalls: number;
    textCalls: number;
  }): void;
  recordOverlayPrimitives(drawCalls: number, selectionOverlayDraws?: number): void;
  recordOverlayClear(): void;
  recordHitTest(): void;
  recordPortProjection(portCount: number): void;
  setSleeping(sleeping: boolean): void;
  settleOff(authoredCount: number): void;
  settleAnnotations(): void;
  snapshot(): ConnectionInstrumentationSnapshot;
}

export const createConnectionInstrumentation = (): ConnectionInstrumentation => {
  let current = emptySnapshot();
  return {
    beginFrame(authoredCount) {
      current = { ...emptySnapshot(authoredCount), sleeping: false };
    },
    recordProjection(metrics) {
      current = { ...current, ...metrics };
    },
    recordDrawBatch(work, surface) {
      const drawCalls = Math.max(0, work.strokeCalls) + Math.max(0, work.fillCalls);
      const commandCount = Math.max(0, work.commandCount);
      current = {
        ...current,
        batchPasses: current.batchPasses + 1,
        drawCalls: current.drawCalls + drawCalls,
        drawnCommands: current.drawnCommands + commandCount,
        baseDrawCalls: current.baseDrawCalls + (surface === "base" ? drawCalls : 0),
        overlayDrawCalls: current.overlayDrawCalls + (surface === "overlay" ? drawCalls : 0),
        overlayDrawnCommands: current.overlayDrawnCommands + (surface === "overlay" ? commandCount : 0),
      };
    },
    recordAnnotationDraw(work) {
      const drawCalls = Math.max(0, work.fillCalls)
        + Math.max(0, work.strokeCalls)
        + Math.max(0, work.textCalls);
      current = {
        ...current,
        batchPasses: current.batchPasses + (work.annotationDrawn > 0 ? 1 : 0),
        drawCalls: current.drawCalls + drawCalls,
        baseDrawCalls: current.baseDrawCalls + drawCalls,
        annotationDrawn: current.annotationDrawn + Math.max(0, work.annotationDrawn),
        annotationDrawCalls: current.annotationDrawCalls + drawCalls,
      };
    },
    recordOverlayPrimitives(drawCalls, selectionOverlayDraws = 0) {
      const primitives = Math.max(0, drawCalls);
      current = {
        ...current,
        drawCalls: current.drawCalls + primitives,
        overlayDrawCalls: current.overlayDrawCalls + primitives,
        selectionOverlayDraws: current.selectionOverlayDraws + Math.max(0, selectionOverlayDraws),
      };
    },
    recordOverlayClear() {
      current = {
        ...current,
        drawCalls: current.drawCalls + 1,
        overlayDrawCalls: current.overlayDrawCalls + 1,
        overlayClears: current.overlayClears + 1,
      };
    },
    recordHitTest() {
      current = { ...current, hitTests: current.hitTests + 1 };
    },
    recordPortProjection(portCount) {
      current = { ...current, portProjections: current.portProjections + Math.max(0, portCount) };
    },
    setSleeping(sleeping) {
      current = { ...current, sleeping };
    },
    settleOff(authoredCount) {
      current = emptySnapshot(authoredCount);
    },
    settleAnnotations() {
      current = {
        ...current,
        labelLayouts: 0,
        annotationCandidates: 0,
        annotationFull: 0,
        annotationTitleOnly: 0,
        annotationCollisionRejected: 0,
        annotationCollisionChecks: 0,
        annotationDrawn: 0,
        annotationDrawCalls: 0,
      };
    },
    snapshot() {
      return { ...current };
    },
  };
};
