/// <reference lib="webworker" />

import { calculateArrangement } from "./engine";
import type { ArrangementWorkerRequest, ArrangementWorkerResponse } from "./types";

const workerScope: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<ArrangementWorkerRequest>) => {
  const request = event.data;
  let response: ArrangementWorkerResponse;
  try {
    response = { requestId: request.requestId, positions: calculateArrangement(request) };
  } catch (error) {
    response = { requestId: request.requestId, error: error instanceof Error ? error.message : "Arrangement calculation failed" };
  }
  workerScope.postMessage(response);
};

export {};
