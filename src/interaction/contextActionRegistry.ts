import {
  BoxSelect,
  Clipboard,
  Copy,
  Eye,
  GitBranch,
  Group,
  Lock,
  Minus,
  MoreHorizontal,
  Palette,
  Pencil,
  Pilcrow,
  Plus,
  ScanLine,
  Trash2,
  Type,
  Upload,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ContextSurface, SpaceKind } from "../types";

export type ContextTargetKind = "blank" | SpaceKind;
export type ContextCommand =
  | "add-space"
  | "add-void"
  | "add-line"
  | "add-relationship"
  | "add-text"
  | "add-paragraph"
  | "paste"
  | "import-file"
  | "view"
  | "tools"
  | "edit"
  | "materials"
  | "boundary"
  | "duplicate"
  | "lock"
  | "delete"
  | "group"
  | "more";

export interface ContextActionAvailability {
  targetKind: ContextTargetKind;
  targetId: string | null;
}

export interface ContextActionDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  availability: (context: ContextActionAvailability) => boolean;
  danger: boolean;
  command: ContextCommand;
  supportedTargetKinds: readonly ContextTargetKind[];
  future: boolean;
}

const defineAction = ({ future = false, danger = false, ...definition }:
  Omit<ContextActionDefinition, "availability" | "future" | "danger"> & { future?: boolean; danger?: boolean }
): ContextActionDefinition => ({
  ...definition,
  future,
  danger,
  availability: ({ targetKind, targetId }) =>
    !future && definition.supportedTargetKinds.includes(targetKind) && (targetKind === "blank" || Boolean(targetId)),
});

export const CONTEXT_ACTIONS: readonly ContextActionDefinition[] = [
  defineAction({ id: "add-space", label: "Add Space", icon: Plus, shortcut: "S", command: "add-space", supportedTargetKinds: ["blank"] }),
  defineAction({ id: "add-void", label: "Add Void", icon: ScanLine, shortcut: "V", command: "add-void", supportedTargetKinds: ["blank"] }),
  defineAction({ id: "add-line", label: "Add Line", icon: Minus, command: "add-line", supportedTargetKinds: ["blank"], future: true }),
  defineAction({ id: "add-relationship", label: "Add Relationship", icon: GitBranch, command: "add-relationship", supportedTargetKinds: ["blank"], future: true }),
  defineAction({ id: "add-text", label: "Add Text", icon: Type, command: "add-text", supportedTargetKinds: ["blank"], future: true }),
  defineAction({ id: "add-paragraph", label: "Add Paragraph", icon: Pilcrow, command: "add-paragraph", supportedTargetKinds: ["blank"], future: true }),
  defineAction({ id: "paste", label: "Paste", icon: Clipboard, command: "paste", supportedTargetKinds: ["blank"], future: true }),
  defineAction({ id: "import-file", label: "Import File", icon: Upload, shortcut: "I", command: "import-file", supportedTargetKinds: ["blank"] }),
  defineAction({ id: "view", label: "View", icon: Eye, shortcut: "Shift+D", command: "view", supportedTargetKinds: ["blank"] }),
  defineAction({ id: "tools", label: "Tools", icon: Wrench, command: "tools", supportedTargetKinds: ["blank"], future: true }),
  defineAction({ id: "edit", label: "Edit", icon: Pencil, shortcut: "E", command: "edit", supportedTargetKinds: ["space", "void"] }),
  defineAction({ id: "materials", label: "Materials", icon: Palette, shortcut: "M", command: "materials", supportedTargetKinds: ["space", "void"] }),
  defineAction({ id: "boundary", label: "Boundary", icon: BoxSelect, command: "boundary", supportedTargetKinds: ["space", "void"], future: true }),
  defineAction({ id: "duplicate", label: "Duplicate", icon: Copy, shortcut: "Cmd+D", command: "duplicate", supportedTargetKinds: ["space", "void"] }),
  defineAction({ id: "lock", label: "Lock", icon: Lock, command: "lock", supportedTargetKinds: ["space", "void"], future: true }),
  defineAction({ id: "delete", label: "Delete", icon: Trash2, shortcut: "Backspace", command: "delete", supportedTargetKinds: ["space", "void"], danger: true }),
  defineAction({ id: "group", label: "Group", icon: Group, command: "group", supportedTargetKinds: ["space", "void"], future: true }),
  defineAction({ id: "more", label: "More", icon: MoreHorizontal, command: "more", supportedTargetKinds: ["space", "void"], future: true }),
] as const;

export const getContextActions = (targetKind: ContextTargetKind): ContextActionDefinition[] =>
  CONTEXT_ACTIONS.filter((action) => action.supportedTargetKinds.includes(targetKind));

export const resolveContextSurface = (targetId: string | null): Exclude<ContextSurface, null> =>
  targetId ? "object-radial" : "blank-menu";

export const shouldOpenContextFromGesture = (button: number, dragged: boolean): boolean =>
  button === 2 && !dragged;
