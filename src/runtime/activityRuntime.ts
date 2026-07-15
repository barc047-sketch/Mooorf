export type ActivityKind = "load" | "compute" | "export" | "download" | "warning" | "error";
export type ActivityPhase = "queued" | "active" | "complete" | "failed" | "cancelled";

export interface ActivityAction {
  label: string;
  run: () => void;
}

export interface ActivityTask {
  id: string;
  label: string;
  kind: ActivityKind;
  phase: ActivityPhase;
  priority: number;
  progress: number | null;
  cancellable: boolean;
  startedAt: number;
  action?: ActivityAction;
  onCancel?: () => void;
}

export interface ActivityStartInput {
  id: string;
  label: string;
  kind: ActivityKind;
  priority: number;
  progress?: number | null;
  cancellable: boolean;
  action?: ActivityAction;
  onCancel?: () => void;
}

export interface ActivityNotification {
  id: string;
  message: string;
  kind: ActivityKind;
  createdAt: number;
  action?: ActivityAction;
}

export interface ActivityNotificationInput {
  id?: string;
  message: string;
  kind?: ActivityKind;
  action?: ActivityAction;
}

export interface ActivitySnapshot {
  tasks: readonly ActivityTask[];
  activeTask: ActivityTask | null;
  notifications: readonly ActivityNotification[];
}

export interface ActivityService {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ActivitySnapshot;
  start: (input: ActivityStartInput) => ActivityTask;
  update: (id: string, patch: Partial<Omit<ActivityTask, "id" | "startedAt">>) => void;
  complete: (id: string, message?: string) => void;
  fail: (id: string, message: string) => void;
  cancel: (id: string, message?: string) => void;
  remove: (id: string) => void;
  notify: (event: ActivityNotificationInput | string) => void;
  dismissNotification: (id: string) => void;
}

export interface ActivityServiceOptions {
  now?: () => number;
  maxNotifications?: number;
}

export interface ActivityMessage {
  id: string;
  kind: ActivityKind;
  message: string;
  source: "task" | "notification";
}

const clampProgress = (progress: number | null | undefined): number | null => {
  if (progress === null || progress === undefined || !Number.isFinite(progress)) return null;
  return Math.min(1, Math.max(0, progress));
};

const activeTaskFrom = (tasks: readonly ActivityTask[]): ActivityTask | null => {
  let selected: ActivityTask | null = null;
  for (const task of tasks) {
    if (task.phase !== "active") continue;
    if (
      !selected
      || task.priority > selected.priority
      || (task.priority === selected.priority && task.startedAt < selected.startedAt)
      || (task.priority === selected.priority && task.startedAt === selected.startedAt && task.id < selected.id)
    ) selected = task;
  }
  return selected;
};

export const createActivityService = ({
  now = () => Date.now(),
  maxNotifications = 4,
}: ActivityServiceOptions = {}): ActivityService => {
  const tasks = new Map<string, ActivityTask>();
  const notifications: ActivityNotification[] = [];
  const listeners = new Set<() => void>();
  let notificationSequence = 0;
  let snapshot: ActivitySnapshot = { tasks: [], activeTask: null, notifications: [] };

  const publish = () => {
    const taskList = [...tasks.values()];
    snapshot = {
      tasks: taskList,
      activeTask: activeTaskFrom(taskList),
      notifications: [...notifications],
    };
    listeners.forEach((listener) => listener());
  };

  const notify = (event: ActivityNotificationInput | string) => {
    const input: ActivityNotificationInput = typeof event === "string" ? { message: event } : event;
    const kind = input.kind ?? "load";
    if (notifications.some((notification) => notification.kind === kind && notification.message === input.message)) return;
    notificationSequence += 1;
    notifications.push({
      id: input.id ?? `activity-notification:${notificationSequence}`,
      message: input.message,
      kind,
      createdAt: now(),
      action: input.action,
    });
    while (notifications.length > Math.max(1, maxNotifications)) notifications.shift();
    publish();
  };

  const transitionAndRemove = (id: string, phase: ActivityPhase, message?: string, kind?: ActivityKind) => {
    const current = tasks.get(id);
    if (!current) return;
    tasks.set(id, { ...current, phase });
    publish();
    if (message) notify({ id: `${id}:${phase}`, message, kind: kind ?? current.kind, action: current.action });
    tasks.delete(id);
    publish();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    start(input) {
      const current = tasks.get(input.id);
      const next: ActivityTask = {
        ...current,
        ...input,
        phase: "active",
        progress: clampProgress(input.progress),
        startedAt: current?.startedAt ?? now(),
      };
      tasks.set(input.id, next);
      publish();
      return next;
    },
    update(id, patch) {
      const current = tasks.get(id);
      if (!current) return;
      tasks.set(id, {
        ...current,
        ...patch,
        progress: patch.progress === undefined ? current.progress : clampProgress(patch.progress),
      });
      publish();
    },
    complete(id, message) {
      transitionAndRemove(id, "complete", message);
    },
    fail(id, message) {
      transitionAndRemove(id, "failed", message, "error");
    },
    cancel(id, message) {
      const current = tasks.get(id);
      if (!current || !current.cancellable) return;
      const onCancel = current.onCancel;
      transitionAndRemove(id, "cancelled", message);
      try {
        onCancel?.();
      } catch (error) {
        notify({
          message: error instanceof Error ? error.message : "Cancellation failed",
          kind: "error",
        });
      }
    },
    remove(id) {
      if (!tasks.delete(id)) return;
      publish();
    },
    notify,
    dismissNotification(id) {
      const index = notifications.findIndex((notification) => notification.id === id);
      if (index < 0) return;
      notifications.splice(index, 1);
      publish();
    },
  };
};

export const selectActivityMessage = (snapshot: ActivitySnapshot): ActivityMessage | null => {
  if (snapshot.activeTask) {
    const percentage = snapshot.activeTask.progress === null
      ? ""
      : ` · ${Math.round(snapshot.activeTask.progress * 100)}%`;
    return {
      id: snapshot.activeTask.id,
      kind: snapshot.activeTask.kind,
      message: `${snapshot.activeTask.label}${percentage}`,
      source: "task",
    };
  }
  const notification = snapshot.notifications[0];
  return notification ? {
    id: notification.id,
    kind: notification.kind,
    message: notification.message,
    source: "notification",
  } : null;
};

export const activity = createActivityService();
