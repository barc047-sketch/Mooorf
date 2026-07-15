import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLab } from "../state/store";
import type { AreaRange } from "../design/colorMapping";
import type { ColorSource, PaletteMode, Privacy, SpaceCell } from "../types";
import { areaToRadius } from "../lib/geometry";
import { getAreaRange, getNucleusColor } from "../design/colorMapping";
import {
  beginContentEdit,
  changeContentEdit,
  resolveContentEditBlur,
  resolveContentEditKey,
  type ContentEditResolution,
} from "../interaction/contentEditSession";
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
  "Void",
];

const MIN_AREA = 1;

// Area edits go through a local draft so the field can be cleared while
// typing without writing NaN into the store; only valid parses commit.
function AreaCell({ cell }: { cell: SpaceCell }) {
  const commitSpaceEdit = useLab((s) => s.commitSpaceEdit);
  const canonical = String(cell.area);
  const [draft, setDraft] = useState(canonical);
  const session = useRef(beginContentEdit(canonical));
  useEffect(() => {
    session.current = beginContentEdit(canonical);
    setDraft(canonical);
  }, [canonical]);

  const commit = (raw: string) => {
    const n = Number.parseFloat(raw);
    if (Number.isFinite(n)) commitSpaceEdit(cell.id, {
      name: cell.name,
      area: Math.max(MIN_AREA, n),
      body: cell.body ?? "",
    });
  };
  const apply = (result: ContentEditResolution) => {
    session.current = result.session;
    if (result.action.kind === "cancel") setDraft(result.action.value);
    if (result.action.kind === "commit") commit(result.action.value);
  };

  return (
    <Input
      type="number"
      min={MIN_AREA}
      className="h-7 w-24 tabular-nums"
      value={draft}
      onChange={(e) => {
        session.current = changeContentEdit(session.current, e.target.value);
        setDraft(session.current.draft);
      }}
      onBlur={() => apply(resolveContentEditBlur(session.current))}
      onKeyDown={(event) => {
        const result = resolveContentEditKey(session.current, { key: event.key });
        if (result.action.kind === "commit") event.preventDefault();
        apply(result);
        if (result.blur) event.currentTarget.blur();
      }}
      aria-label={`Area of ${cell.name}`}
    />
  );
}

function TextCell({ cell, field }: { cell: SpaceCell; field: "name" | "body" }) {
  const commitSpaceEdit = useLab((s) => s.commitSpaceEdit);
  const canonical = field === "name" ? cell.name : cell.body ?? "";
  const [draft, setDraft] = useState(canonical);
  const session = useRef(beginContentEdit(canonical));
  useEffect(() => {
    session.current = beginContentEdit(canonical);
    setDraft(canonical);
  }, [canonical]);

  const commit = (value: string) => commitSpaceEdit(cell.id, {
    name: field === "name" ? value : cell.name,
    area: cell.area,
    body: field === "body" ? value : cell.body ?? "",
  });
  const apply = (result: ContentEditResolution) => {
    session.current = result.session;
    if (result.action.kind === "cancel") setDraft(result.action.value);
    if (result.action.kind === "commit") commit(result.action.value);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const result = resolveContentEditKey(session.current, {
      key: event.key,
      shiftKey: event.shiftKey,
      multiline: field === "body",
    });
    if (result.action.kind === "commit") event.preventDefault();
    apply(result);
    if (result.blur) event.currentTarget.blur();
  };

  if (field === "body") {
    return (
      <textarea
        className="table-body-input"
        rows={2}
        value={draft}
        onChange={(event) => {
          session.current = changeContentEdit(session.current, event.target.value);
          setDraft(session.current.draft);
        }}
        onBlur={() => apply(resolveContentEditBlur(session.current))}
        onKeyDown={onKeyDown}
        aria-label={`Body of ${cell.name}`}
      />
    );
  }
  return (
    <Input
      className="h-7 w-40"
      value={draft}
      onChange={(event) => {
        session.current = changeContentEdit(session.current, event.target.value);
        setDraft(session.current.draft);
      }}
      onBlur={() => apply(resolveContentEditBlur(session.current))}
      onKeyDown={onKeyDown}
      aria-label="Space name"
    />
  );
}

function Row({
  cell,
  index,
  paletteMode,
  areaRange,
  nucleusPaletteId,
  colorSource,
}: {
  cell: SpaceCell;
  index: number;
  paletteMode: PaletteMode;
  areaRange: AreaRange;
  nucleusPaletteId: string;
  colorSource: ColorSource;
}) {
  const updateSpace = useLab((s) => s.updateSpace);
  const removeSpace = useLab((s) => s.removeSpace);
  const mappedColor = getNucleusColor(cell, paletteMode, areaRange, nucleusPaletteId, colorSource);
  const kind = cell.kind === "void" ? "void" : "space";

  return (
    <TableRow data-kind={kind}>
      <TableCell className="text-muted-foreground tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </TableCell>
      <TableCell>
        <span className="table-kind-chip" data-kind={kind}>
          {kind}
        </span>
      </TableCell>
      <TableCell>
        <TextCell cell={cell} field="name" />
      </TableCell>
      <TableCell>
        <AreaCell cell={cell} />
      </TableCell>
      <TableCell>
        <TextCell cell={cell} field="body" />
      </TableCell>
      <TableCell>
        <div className="table-category-cell">
          <span
            className="table-category-swatch"
            style={{ background: mappedColor.fill, borderColor: mappedColor.ring }}
            data-kind={kind}
            title={`${mappedColor.token.label} color`}
            aria-hidden="true"
          />
          <Select
            value={cell.category}
            onValueChange={(v) =>
              v && updateSpace(cell.id, { category: String(v) })
            }
          >
            <SelectTrigger size="sm" className="w-32">
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
        </div>
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
  const paletteMode = useLab((s) => s.settings.paletteMode);
  const nucleusPaletteId = useLab((s) => s.settings.nucleusPaletteId);
  const colorSource = useLab((s) => s.settings.colorSource);
  const areaRange = useMemo(() => getAreaRange(spaces), [spaces]);

  return (
    <div className="table-view h-full w-full overflow-y-auto px-6 pt-24 pb-40">
      <div className="mx-auto max-w-6xl">
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
                <TableHead className="w-16">type</TableHead>
                <TableHead>name</TableHead>
                <TableHead>area m²</TableHead>
                <TableHead>body</TableHead>
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
                <Row
                  key={cell.id}
                  cell={cell}
                  index={i}
                  paletteMode={paletteMode}
                  areaRange={areaRange}
                  nucleusPaletteId={nucleusPaletteId}
                  colorSource={colorSource}
                />
              ))}
              {spaces.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={11}
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
