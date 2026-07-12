import { useLab } from "../state/store";
import type { ContextPoint } from "../types";
import type { ContextCommand } from "./contextActionRegistry";
import type { RadialViewport } from "./radialLayout";

export interface ContextCommandEffects {
  browseFiles: () => void;
  openInlineEditor: (id: string, point: ContextPoint) => void;
}

export interface ContextCommandInvocation {
  point: ContextPoint;
  targetId: string | null;
  viewport: RadialViewport;
  effects: ContextCommandEffects;
}

export const contextPointToWorld = (
  point: ContextPoint,
  viewport: RadialViewport,
  camera: { x: number; y: number; zoom: number }
): ContextPoint => ({
  x: (point.x - viewport.width / 2) / camera.zoom + camera.x,
  y: (point.y - viewport.height / 2) / camera.zoom + camera.y,
});

export const executeContextCommand = (
  command: ContextCommand,
  { point, targetId, viewport, effects }: ContextCommandInvocation
): void => {
  const state = useLab.getState();
  switch (command) {
    case "add-space": {
      const world = contextPointToWorld(point, viewport, state.camera);
      state.addSpace({ x: world.x, y: world.y });
      return;
    }
    case "add-void": {
      const world = contextPointToWorld(point, viewport, state.camera);
      state.addSpace({ kind: "void", x: world.x, y: world.y });
      return;
    }
    case "import-file":
      effects.browseFiles();
      return;
    case "view":
      state.openWidget("display");
      return;
    case "edit":
      if (targetId) effects.openInlineEditor(targetId, point);
      return;
    case "materials":
      if (targetId) state.addToSelection(targetId);
      state.openWidget("palette");
      return;
    case "duplicate":
      if (targetId) state.duplicateSpace(targetId);
      return;
    case "delete": {
      if (!targetId) return;
      const ids = state.selectedIds.includes(targetId) ? [...state.selectedIds] : [targetId];
      ids.forEach((id) => useLab.getState().removeSpace(id));
      return;
    }
    case "add-line":
    case "add-relationship":
    case "add-text":
    case "add-paragraph":
    case "paste":
    case "tools":
    case "boundary":
    case "lock":
    case "group":
    case "more":
      return;
  }
};
