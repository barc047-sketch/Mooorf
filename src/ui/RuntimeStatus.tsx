import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { arrangementRuntime } from "../arrangement/runtime";
import { activity, selectActivityMessage, type ActivityNotification } from "../runtime/activityRuntime";
import { createArrangementActivityBridge } from "../runtime/arrangementActivityBridge";
import { performanceRuntime } from "../runtime/performanceRuntime";
import { useLab } from "../state/store";
import "./runtimeStatus.css";

const NOTIFICATION_VISIBLE_MS = 2_800;

const notificationCopy = (notification: ActivityNotification) => {
  if (notification.message === "Arrangement preview ready") {
    return { title: "ARRANGEMENT READY", detail: "Preview generated" };
  }
  const [title, detail] = notification.message.split(" — ", 2);
  return {
    title: title.toUpperCase(),
    detail: detail ?? (notification.kind === "error" ? "Action could not be completed" : ""),
  };
};

export default function RuntimeStatus() {
  const activitySnapshot = useSyncExternalStore(activity.subscribe, activity.getSnapshot, activity.getSnapshot);
  const performanceSnapshot = useSyncExternalStore(
    performanceRuntime.subscribe,
    performanceRuntime.getSnapshot,
    performanceRuntime.getSnapshot,
  );
  const performanceQuality = useLab((state) => state.settings.performanceQuality);
  const rendererMode = useLab((state) => state.settings.rendererMode);
  const totalSpaces = useLab((state) => state.spaces.length);
  const cameraZoom = useLab((state) => state.camera.zoom);
  const [expanded, setExpanded] = useState(false);
  const activeTask = activitySnapshot.activeTask;
  const activityMessage = selectActivityMessage(activitySnapshot);
  const notification = activitySnapshot.notifications[0];

  useEffect(
    () => createArrangementActivityBridge(arrangementRuntime, activity),
    [],
  );

  useEffect(() => {
    if (!notification) return;
    const timeout = window.setTimeout(
      () => activity.dismissNotification(notification.id),
      NOTIFICATION_VISIBLE_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [notification?.id]);

  useEffect(() => {
    if (!expanded && !notification) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (expanded) setExpanded(false);
      else if (notification) activity.dismissNotification(notification.id);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded, notification?.id]);

  const fps = performanceSnapshot.idle || performanceSnapshot.fps === null
    ? "IDLE"
    : `${Math.max(1, Math.round(performanceSnapshot.fps))} FPS`;
  const renderer = (performanceSnapshot.renderer ?? rendererMode).toUpperCase();
  const totalCells = performanceSnapshot.totalCells || totalSpaces;
  const visibleCells = performanceSnapshot.totalCells > 0
    ? performanceSnapshot.visibleCells
    : totalSpaces;
  const quality = performanceQuality === "automatic" ? "AUTO" : performanceQuality.toUpperCase();
  const zoom = `${Math.round(cameraZoom * 100)}%`;
  const spaceLabel = `${totalSpaces} ${totalSpaces === 1 ? "SPACE" : "SPACES"}`;
  const taskStatus = activeTask
    ? `${activeTask.label.toUpperCase()} · ${activeTask.progress === null ? "WORKING" : `${Math.round(activeTask.progress * 100)}%`}`
    : null;
  const compactStatus = taskStatus ?? `${spaceLabel} · ${zoom} · ${fps}`;
  const frameTime = performanceSnapshot.averageFrameTime === null
    ? "—"
    : `${performanceSnapshot.averageFrameTime.toFixed(1)} ms`;
  const notificationText = notification ? notificationCopy(notification) : null;

  const dismissNotification = () => {
    if (!notification) return;
    notification.action?.run();
    activity.dismissNotification(notification.id);
  };

  return (
    <>
      {activeTask && (
        <div
          className="runtime-edge-line"
          data-kind={activeTask.kind}
          data-indeterminate={activeTask.progress === null}
          aria-hidden="true"
        >
          <span
            className="runtime-edge-line-fill"
            style={{ "--runtime-progress": activeTask.progress ?? 0 } as CSSProperties}
          />
        </div>
      )}

      {notification && notificationText && (
        <button
          type="button"
          className="runtime-notification glass"
          data-kind={notification.kind}
          data-expanded={expanded}
          onClick={dismissNotification}
          aria-live="polite"
        >
          <strong>{notificationText.title}</strong>
          {notificationText.detail && <span>{notificationText.detail}</span>}
        </button>
      )}

      <div className="runtime-status-area">
        <aside
          className="runtime-status-bar glass"
          data-expanded={expanded}
          data-active={Boolean(activeTask)}
          aria-label="Runtime Status Bar"
        >
          <button
            type="button"
            className="runtime-status-toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            title={activityMessage?.source === "task" ? activityMessage.message : "Runtime details"}
          >
            <span className="runtime-status-compact">{compactStatus}</span>
            {expanded && (
              <span className="runtime-status-details">
                <span><small>STATE</small><span className="runtime-status-value">{fps}</span></span>
                <span><small>FRAME</small><span className="runtime-status-value">{frameTime}</span></span>
                <span><small>QUALITY</small><span className="runtime-status-value">{quality}</span></span>
                <span><small>RENDERER</small><span className="runtime-status-value">{renderer}</span></span>
                <span><small>CELLS</small><span className="runtime-status-value">{visibleCells}/{totalCells} VISIBLE</span></span>
                <span><small>ZOOM</small><span className="runtime-status-value">{zoom}</span></span>
              </span>
            )}
          </button>
        </aside>
      </div>
    </>
  );
}
