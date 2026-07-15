import type { ArrangementPatternId } from "../types";
import type { SpacePosition } from "../interaction/groupDrag";
import { calculateArrangement } from "./engine";
import {
  createLatestRequestGate,
  type ArrangementCalculationStatus,
  type ArrangementRequest,
  type ArrangementWorkerResponse,
} from "./types";

export const ARRANGEMENT_WORKER_THRESHOLD = 80;
const WORKER_TIME_BUDGET_MS = 1500;

export const shouldUseArrangementWorker = (patternId: ArrangementPatternId, entityCount: number): boolean =>
  entityCount > ARRANGEMENT_WORKER_THRESHOLD || patternId === "compact-pack" || patternId === "relaxed-pack";

type StatusListener = () => void;

class ArrangementRuntime {
  private readonly gate = createLatestRequestGate();
  private readonly listeners = new Set<StatusListener>();
  private worker: Worker | null = null;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private status: ArrangementCalculationStatus = {
    phase: "idle",
    requestId: 0,
    patternId: null,
    entityCount: 0,
    error: null,
  };

  subscribe = (listener: StatusListener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getStatus = (): ArrangementCalculationStatus => this.status;

  private publish(status: ArrangementCalculationStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener());
  }

  private stopWorker() {
    this.worker?.terminate();
    this.worker = null;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = null;
  }

  cancel = () => {
    this.gate.cancel();
    this.stopWorker();
    this.publish({ phase: "idle", requestId: 0, patternId: null, entityCount: 0, error: null });
  }

  calculate = async (request: ArrangementRequest): Promise<SpacePosition[] | null> => {
    this.stopWorker();
    const requestId = this.gate.begin();
    this.publish({
      phase: "calculating",
      requestId,
      patternId: request.patternId,
      entityCount: request.entities.length,
      error: null,
    });

    if (!shouldUseArrangementWorker(request.patternId, request.entities.length) || typeof Worker === "undefined") {
      try {
        const positions = calculateArrangement(request);
        if (!this.gate.isCurrent(requestId)) return null;
        this.publish({ phase: "ready", requestId, patternId: request.patternId, entityCount: request.entities.length, error: null });
        return positions;
      } catch (error) {
        if (!this.gate.isCurrent(requestId)) return null;
        this.publish({ phase: "error", requestId, patternId: request.patternId, entityCount: request.entities.length, error: error instanceof Error ? error.message : "Arrangement failed" });
        return null;
      }
    }

    return new Promise<SpacePosition[] | null>((resolve) => {
      const worker = new Worker(new URL("./arrangementWorker.ts", import.meta.url), { type: "module" });
      this.worker = worker;
      let settled = false;
      const settle = (value: SpacePosition[] | null) => {
        if (settled) return;
        settled = true;
        this.stopWorker();
        resolve(value);
      };
      const fallback = (message: string) => {
        if (!this.gate.isCurrent(requestId)) return settle(null);
        try {
          const positions = calculateArrangement(request);
          if (!this.gate.isCurrent(requestId)) return settle(null);
          this.publish({ phase: "ready", requestId, patternId: request.patternId, entityCount: request.entities.length, error: message });
          settle(positions);
        } catch (error) {
          this.publish({ phase: "error", requestId, patternId: request.patternId, entityCount: request.entities.length, error: error instanceof Error ? error.message : message });
          settle(null);
        }
      };
      worker.onmessage = (event: MessageEvent<ArrangementWorkerResponse>) => {
        const response = event.data;
        if (!this.gate.isCurrent(response.requestId) || response.requestId !== requestId) return settle(null);
        if (response.error || !response.positions) return fallback(response.error ?? "Arrangement worker returned no positions");
        this.publish({ phase: "ready", requestId, patternId: request.patternId, entityCount: request.entities.length, error: null });
        settle(response.positions);
      };
      worker.onerror = () => fallback("Arrangement worker failed; calculated locally");
      this.timeout = setTimeout(() => fallback("Arrangement worker exceeded its bounded time budget; calculated locally"), WORKER_TIME_BUDGET_MS);
      worker.postMessage({ ...request, requestId });
    });
  }
}

export const arrangementRuntime = new ArrangementRuntime();
