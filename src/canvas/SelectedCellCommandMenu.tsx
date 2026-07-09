import type { CSSProperties, PointerEvent } from "react";
import {
  Circle,
  CircleDashed,
  Copy,
  Crosshair,
  MoreHorizontal,
  Ruler,
  Trash2,
  Type,
  X,
} from "lucide-react";
import type { SpaceKind } from "../types";

interface CommandItem {
  id: string;
  label: string;
  Icon: typeof Type;
  onSelect: () => void;
}

interface SelectedCellCommandMenuProps {
  kind: SpaceKind;
  open: boolean;
  onToggle: () => void;
  onRename: () => void;
  onEditArea: () => void;
  onDuplicate: () => void;
  onConvertKind: () => void;
  onFocus: () => void;
  onDelete: () => void;
}

const COMMAND_ANGLES = [-92, -32, 28, 88, 148, 208];

export default function SelectedCellCommandMenu({
  kind,
  open,
  onToggle,
  onRename,
  onEditArea,
  onDuplicate,
  onConvertKind,
  onFocus,
  onDelete,
}: SelectedCellCommandMenuProps) {
  const ConvertIcon = kind === "void" ? Circle : CircleDashed;
  const convertLabel = kind === "void" ? "Convert to space" : "Convert to void";
  const commands: CommandItem[] = [
    { id: "rename", label: "Rename", Icon: Type, onSelect: onRename },
    { id: "area", label: "Edit area", Icon: Ruler, onSelect: onEditArea },
    { id: "duplicate", label: "Duplicate", Icon: Copy, onSelect: onDuplicate },
    { id: "convert", label: convertLabel, Icon: ConvertIcon, onSelect: onConvertKind },
    { id: "focus", label: "Focus", Icon: Crosshair, onSelect: onFocus },
    { id: "delete", label: "Delete", Icon: Trash2, onSelect: onDelete },
  ];

  const stopPointer = (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <span className="selection-command-wrap" onPointerDown={stopPointer}>
      <button
        type="button"
        className="selection-edit-chip selection-command-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
      >
        {open ? <X size={10} strokeWidth={1.8} /> : <MoreHorizontal size={11} strokeWidth={1.8} />}
        <span>{open ? "Close" : "Menu"}</span>
      </button>
      {open && (
        <span className="selection-command-menu glass" role="menu" aria-label="Selected nucleus commands">
          <span className="selection-command-core" aria-hidden="true">
            {kind === "void" ? "VD" : "NU"}
          </span>
          {commands.map(({ id, label, Icon, onSelect }, index) => (
            <button
              key={id}
              type="button"
              className="selection-command-button"
              role="menuitem"
              aria-label={label}
              title={label}
              data-command={id}
              style={{ "--cmd-angle": `${COMMAND_ANGLES[index]}deg` } as CSSProperties}
              onClick={onSelect}
            >
              <Icon size={13} strokeWidth={1.65} />
            </button>
          ))}
        </span>
      )}
    </span>
  );
}
