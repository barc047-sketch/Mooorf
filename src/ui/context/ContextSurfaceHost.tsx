import { Fragment, useEffect, type CSSProperties } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import InlineCellEditor from "../../canvas/InlineCellEditor";
import ObjectRadialMenu from "../../canvas/SelectedCellCommandMenu";
import { useFileIntake } from "../../import/FileIntakeProvider";
import { useLab } from "../../state/store";
import {
  getContextActions,
  type ContextActionDefinition,
  type ContextTargetKind,
} from "../../interaction/contextActionRegistry";
import { executeContextCommand } from "../../interaction/contextCommands";
import {
  isEnabledRadialActionActivation,
  resolveEscapeAction,
  shouldCloseContextFromPointer,
  shouldCloseRadialFromEnter,
  shouldCloseRadialFromSelection,
} from "../../interaction/selection";
import "./contextSurfaces.css";

const editableTarget = (target: EventTarget | null): boolean => {
  const element = target instanceof HTMLElement ? target : null;
  return Boolean(element && (
    /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) || element.isContentEditable
  ));
};

const MENU_BREAKS = new Set([1, 5, 7]);

export default function ContextSurfaceHost() {
  const contextSurface = useLab((state) => state.contextSurface);
  const contextPoint = useLab((state) => state.contextPoint);
  const contextTargetId = useLab((state) => state.contextTargetId);
  const selectedIds = useLab((state) => state.selectedIds);
  const spaces = useLab((state) => state.spaces);
  const closeContextSurface = useLab((state) => state.closeContextSurface);
  const intake = useFileIntake();
  const target = contextTargetId
    ? spaces.find((space) => space.id === contextTargetId) ?? null
    : null;
  const targetKind: ContextTargetKind = target
    ? target.kind === "void" ? "void" : "space"
    : "blank";

  useEffect(() => {
    if (!contextSurface) return;
    const onPointer = (event: PointerEvent) => {
      const surface = useLab.getState().contextSurface;
      if (shouldCloseContextFromPointer(surface, event.composedPath())) {
        // Capture observes the pointer without cancelling it, so the Canvas
        // still receives this same event for selection, drag, or clearing.
        closeContextSurface();
      }
    };
    document.addEventListener("pointerdown", onPointer, true);
    return () => document.removeEventListener("pointerdown", onPointer, true);
  }, [contextSurface, closeContextSurface]);

  useEffect(() => {
    if ((contextSurface === "object-radial" || contextSurface === "inline-editor") && !target) {
      closeContextSurface();
    }
  }, [contextSurface, target, closeContextSurface]);

  useEffect(() => {
    if (shouldCloseRadialFromSelection(contextSurface, contextTargetId, selectedIds)) {
      closeContextSurface();
    }
  }, [contextSurface, contextTargetId, selectedIds, closeContextSurface]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = useLab.getState();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !editableTarget(event.target)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.shiftKey) state.redoSpaceTransform();
        else state.undoSpaceTransform();
        return;
      }
      if (event.key === "Escape") {
        const action = resolveEscapeAction(state.contextSurface, state.selectedIds);
        if (action === "close-context") {
          event.preventDefault();
          event.stopImmediatePropagation();
          state.closeContextSurface();
          return;
        }
        const element = event.target instanceof Element ? event.target : null;
        if (action === "clear-selection" && !editableTarget(event.target) && !element?.closest(".wframe")) {
          event.preventDefault();
          event.stopImmediatePropagation();
          state.clearSelection();
        }
        return;
      }
      if (event.key === "Enter") {
        const element = event.target instanceof Element ? event.target : null;
        const focusedEnabledAction = Boolean(element?.closest("button.object-radial-action:not(:disabled)"));
        if (isEnabledRadialActionActivation(state.contextSurface, event.key, focusedEnabledAction)) {
          return;
        }
        if (shouldCloseRadialFromEnter(state.contextSurface, focusedEnabledAction)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          state.closeContextSurface();
        }
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
        if (editableTarget(event.target) || state.contextSurface) return;
        event.preventDefault();
        state.selectAllVisible();
        return;
      }
      if (event.code === "Space" && !event.repeat && !editableTarget(event.target)) {
        const element = event.target instanceof Element ? event.target : null;
        const focusedEnabledAction = Boolean(element?.closest("button.object-radial-action:not(:disabled)"));
        if (isEnabledRadialActionActivation(state.contextSurface, event.key, focusedEnabledAction)) {
          return;
        }
        event.preventDefault();
        state.setTemporaryTool("pan");
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") useLab.getState().clearTemporaryTool();
    };
    const onBlur = () => useLab.getState().clearTemporaryTool();
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  if (!contextSurface || !contextPoint) return null;

  const runAction = (action: ContextActionDefinition) => {
    const current = useLab.getState();
    const currentPoint = current.contextPoint ?? contextPoint;
    const currentTargetId = current.contextTargetId;
    const currentTarget = currentTargetId
      ? current.spaces.find((space) => space.id === currentTargetId) ?? null
      : null;
    const currentKind: ContextTargetKind = currentTarget
      ? currentTarget.kind === "void" ? "void" : "space"
      : "blank";
    if (!action.availability({ targetKind: currentKind, targetId: currentTargetId })) return;
    executeContextCommand(action.command, {
      point: currentPoint,
      targetId: currentTargetId,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      effects: {
        browseFiles: intake.browse,
        openInlineEditor: (id, point) => useLab.getState().openContextSurface(
          "inline-editor",
          { x: point.x + 14, y: point.y + 18 },
          id
        ),
      },
    });
    if (useLab.getState().contextSurface !== "inline-editor") {
      useLab.getState().closeContextSurface();
    }
  };

  if (contextSurface === "inline-editor" && target) {
    return (
      <div className="context-inline-editor" data-context-surface="inline-editor">
        <InlineCellEditor
          key={target.id}
          space={target}
          position={contextPoint}
          onClose={closeContextSurface}
        />
      </div>
    );
  }

  if (contextSurface === "object-radial" && target && contextTargetId) {
    return (
      <ObjectRadialMenu
        actions={getContextActions(targetKind)}
        point={contextPoint}
        targetId={contextTargetId}
        targetKind={targetKind as "space" | "void"}
        onAction={runAction}
      />
    );
  }

  if (contextSurface !== "blank-menu") return null;
  const actions = getContextActions("blank");
  return (
    <DropdownMenu
      key={`${contextPoint.x}:${contextPoint.y}`}
      open
      onOpenChange={(open) => { if (!open) closeContextSurface(); }}
    >
      <DropdownMenuTrigger
        type="button"
        className="context-menu-anchor"
        aria-label="Canvas context menu"
        tabIndex={-1}
        style={{ left: contextPoint.x, top: contextPoint.y } as CSSProperties}
      />
      <DropdownMenuContent
        className="context-dropdown"
        positionerClassName="context-dropdown-positioner"
        data-context-surface="blank-menu"
        onContextMenu={(event) => event.preventDefault()}
        align="start"
        side="bottom"
        sideOffset={2}
      >
        {actions.map((action, index) => {
          const available = action.availability({ targetKind: "blank", targetId: null });
          const Icon = action.icon;
          return (
            <Fragment key={action.id}>
              <DropdownMenuItem
                className="context-dropdown-item"
                data-future={action.future ? "true" : undefined}
                disabled={!available}
                onClick={() => runAction(action)}
              >
                <Icon size={14} strokeWidth={1.55} aria-hidden="true" />
                <span>{action.label}</span>
                {action.future ? (
                  <span className="context-item-future">Future</span>
                ) : action.shortcut ? (
                  <span className="context-item-shortcut">{action.shortcut}</span>
                ) : null}
              </DropdownMenuItem>
              {MENU_BREAKS.has(index) && <DropdownMenuSeparator className="context-dropdown-separator" />}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
