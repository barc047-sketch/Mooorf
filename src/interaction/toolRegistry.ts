import {
  BoxSelect,
  CircleDashed,
  Frame,
  GitBranch,
  Hand,
  Minus,
  Pilcrow,
  Plus,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { ToolId } from "../types";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  icon: LucideIcon;
  shortcut: string;
  group: "navigate" | "space" | "connect" | "annotate" | "structure";
  availability: () => boolean;
  cursor: string;
  description: string;
  status: "active" | "future";
}

const tool = (
  definition: Omit<ToolDefinition, "availability"> & { status: ToolDefinition["status"] }
): ToolDefinition => ({
  ...definition,
  availability: () => definition.status === "active",
});

export const TOOL_REGISTRY: readonly ToolDefinition[] = [
  tool({ id: "select", name: "Select", icon: BoxSelect, shortcut: "V", group: "navigate", cursor: "default", description: "Select and move canvas objects.", status: "active" }),
  tool({ id: "space", name: "Space", icon: Plus, shortcut: "S", group: "space", cursor: "crosshair", description: "Create a programmed space.", status: "active" }),
  tool({ id: "void", name: "Void", icon: CircleDashed, shortcut: "O", group: "space", cursor: "crosshair", description: "Create a subtractive void nucleus.", status: "active" }),
  tool({ id: "line", name: "Line", icon: Minus, shortcut: "L", group: "connect", cursor: "crosshair", description: "Draw a spatial guide line.", status: "future" }),
  tool({ id: "relationship", name: "Relationship", icon: GitBranch, shortcut: "R", group: "connect", cursor: "crosshair", description: "Connect related spaces.", status: "future" }),
  tool({ id: "text", name: "Text", icon: Type, shortcut: "T", group: "annotate", cursor: "text", description: "Place a text annotation.", status: "future" }),
  tool({ id: "paragraph", name: "Paragraph", icon: Pilcrow, shortcut: "P", group: "annotate", cursor: "text", description: "Place a paragraph annotation.", status: "future" }),
  tool({ id: "frame", name: "Frame", icon: Frame, shortcut: "F", group: "structure", cursor: "crosshair", description: "Create a spatial frame.", status: "future" }),
  tool({ id: "pan", name: "Pan", icon: Hand, shortcut: "H", group: "navigate", cursor: "grab", description: "Move the canvas viewport.", status: "active" }),
] as const;

export const getToolDefinition = (id: ToolId) => TOOL_REGISTRY.find((toolDefinition) => toolDefinition.id === id)!;
