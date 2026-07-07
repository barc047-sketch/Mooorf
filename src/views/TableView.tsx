import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLab } from "../state/store";
import type { Privacy, SpaceCell } from "../types";
import { areaToRadius } from "../lib/geometry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PRIVACY_OPTIONS: Privacy[] = ["public", "shared", "private"];

// Existing demo palette categories + safe program extras.
const CATEGORY_OPTIONS = [
  "Public",
  "Work",
  "Quiet",
  "Outdoor",
  "Service",
  "Circulation",
  "Admin",
  "Utility",
  "Uncategorized",
];

const MIN_AREA = 1;

// Area edits go through a local draft so the field can be cleared while
// typing without writing NaN into the store; only valid parses commit.
function AreaCell({ cell }: { cell: SpaceCell }) {
  const updateSpace = useLab((s) => s.updateSpace);
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (raw: string) => {
    const n = Number.parseFloat(raw);
    if (Number.isFinite(n)) updateSpace(cell.id, { area: Math.max(MIN_AREA, n) });
  };

  return (
    <Input
      type="number"
      min={MIN_AREA}
      className="h-7 w-24 tabular-nums"
      value={draft ?? String(cell.area)}
      onChange={(e) => {
        setDraft(e.target.value);
        commit(e.target.value);
      }}
      onBlur={() => setDraft(null)}
      aria-label={`Area of ${cell.name}`}
    />
  );
}

function Row({ cell, index }: { cell: SpaceCell; index: number }) {
  const updateSpace = useLab((s) => s.updateSpace);
  const removeSpace = useLab((s) => s.removeSpace);

  return (
    <TableRow>
      <TableCell className="text-muted-foreground tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </TableCell>
      <TableCell>
        <Input
          className="h-7 w-40"
          value={cell.name}
          onChange={(e) => updateSpace(cell.id, { name: e.target.value })}
          aria-label="Space name"
        />
      </TableCell>
      <TableCell>
        <AreaCell cell={cell} />
      </TableCell>
      <TableCell>
        <Select
          value={cell.category}
          onValueChange={(v) =>
            v && updateSpace(cell.id, { category: String(v) })
          }
        >
          <SelectTrigger size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(CATEGORY_OPTIONS.includes(cell.category)
              ? CATEGORY_OPTIONS
              : [cell.category, ...CATEGORY_OPTIONS]
            ).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={cell.privacy}
          onValueChange={(v) =>
            v && updateSpace(cell.id, { privacy: v as Privacy })
          }
        >
          <SelectTrigger size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIVACY_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {Math.round(cell.x)}
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {Math.round(cell.y)}
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {Math.round(areaToRadius(cell.area))}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => removeSpace(cell.id)}
          aria-label={`Delete ${cell.name}`}
        >
          <Trash2 />
        </Button>
      </TableCell>
    </TableRow>
  );
}

// Table view — same Zustand store as the canvas (no local copy of spaces),
// so every edit ripples to CanvasView automatically and switching views
// never resets spaces or camera.
export default function TableView() {
  const spaces = useLab((s) => s.spaces);
  const addSpace = useLab((s) => s.addSpace);

  return (
    <div className="table-view h-full w-full overflow-y-auto px-6 pt-24 pb-40">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="eyebrow">PROGRAM</p>
            <p className="text-sm text-muted-foreground">
              {spaces.length} spaces · edits sync to canvas
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => addSpace()}>
            <Plus /> Add space
          </Button>
        </div>

        <div className="glass rounded-xl px-3 py-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>name</TableHead>
                <TableHead>area m²</TableHead>
                <TableHead>category</TableHead>
                <TableHead>privacy</TableHead>
                <TableHead className="w-14">x</TableHead>
                <TableHead className="w-14">y</TableHead>
                <TableHead className="w-14">r</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {spaces.map((cell, i) => (
                <Row key={cell.id} cell={cell} index={i} />
              ))}
              {spaces.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No spaces yet — add one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
