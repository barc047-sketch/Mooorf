import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
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
const DEFAULT_ROW_HEIGHT = 55;
const ROW_OVERSCAN = 8;
const MAX_MOUNTED_DATA_ROWS = 60;

type VirtualRowWindow = {
  startIndex: number;
  endIndex: number;
  topSpacerHeight: number;
  bottomSpacerHeight: number;
  mountedRowCount: number;
};

export function calculateVirtualRowWindow({
  rowCount,
  scrollTop,
  viewportHeight,
  rowHeight,
  overscan,
}: {
  rowCount: number;
  scrollTop: number;
  viewportHeight: number;
  rowHeight: number;
  overscan: number;
}): VirtualRowWindow {
  const safeRowCount = Math.max(0, Math.floor(rowCount));
  const safeRowHeight = rowHeight > 0 ? rowHeight : DEFAULT_ROW_HEIGHT;
  const safeScrollTop = Math.max(0, scrollTop);
  const safeViewportHeight = Math.max(0, viewportHeight);
  const safeOverscan = Math.max(0, Math.floor(overscan));
  const visibleStart = Math.min(safeRowCount, Math.floor(safeScrollTop / safeRowHeight));
  const visibleEnd = Math.min(
    safeRowCount,
    Math.max(visibleStart, Math.ceil((safeScrollTop + safeViewportHeight) / safeRowHeight)),
  );
  let startIndex = Math.max(0, visibleStart - safeOverscan);
  let endIndex = Math.min(safeRowCount, visibleEnd + safeOverscan);

  if (endIndex - startIndex > MAX_MOUNTED_DATA_ROWS) {
    startIndex = Math.max(0, Math.min(startIndex, safeRowCount - MAX_MOUNTED_DATA_ROWS));
    endIndex = Math.min(safeRowCount, startIndex + MAX_MOUNTED_DATA_ROWS);
  }

  return {
    startIndex,
    endIndex,
    topSpacerHeight: startIndex * safeRowHeight,
    bottomSpacerHeight: (safeRowCount - endIndex) * safeRowHeight,
    mountedRowCount: endIndex - startIndex,
  };
}

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
  measureRef,
}: {
  cell: SpaceCell;
  index: number;
  paletteMode: PaletteMode;
  areaRange: AreaRange;
  nucleusPaletteId: string;
  colorSource: ColorSource;
  measureRef?: (node: HTMLTableRowElement | null) => void;
}) {
  const updateSpace = useLab((s) => s.updateSpace);
  const removeSpace = useLab((s) => s.removeSpace);
  const mappedColor = getNucleusColor(cell, paletteMode, areaRange, nucleusPaletteId, colorSource);
  const kind = cell.kind === "void" ? "void" : "space";

  return (
    <TableRow
      ref={measureRef}
      data-kind={kind}
      data-table-row="true"
      data-row-index={index}
    >
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

function TableRowsSkeleton() {
  return (
    <TableBody data-table-rows-ready="false" aria-hidden="true">
      {Array.from({ length: 11 }, (_, row) => (
        <TableRow className="border-0" key={row}>
          <TableCell colSpan={11} className="p-0">
            <div className="table-skeleton__row">
              {Array.from({ length: 5 }, (_, column) => <span key={column} />)}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

function VirtualizedTableBody({
  scrollContainerRef,
}: {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}) {
  const spaces = useLab((s) => s.spaces);
  const paletteMode = useLab((s) => s.settings.paletteMode);
  const nucleusPaletteId = useLab((s) => s.settings.nucleusPaletteId);
  const colorSource = useLab((s) => s.settings.colorSource);
  const areaRange = useMemo(() => getAreaRange(spaces), [spaces]);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const measuredRowRef = useRef(false);
  const [rowHeight, setRowHeight] = useState(DEFAULT_ROW_HEIGHT);
  const [viewport, setViewport] = useState({
    scrollTop: 0,
    viewportHeight: 0,
    rowsTop: 0,
  });

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const measureViewport = () => {
      setViewport((current) => ({
        ...current,
        scrollTop: scrollContainer.scrollTop,
        viewportHeight: scrollContainer.clientHeight,
      }));
    };
    const handleScroll = () => {
      setViewport((current) => (
        current.scrollTop === scrollContainer.scrollTop
          ? current
          : { ...current, scrollTop: scrollContainer.scrollTop }
      ));
    };

    measureViewport();
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", measureViewport);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", measureViewport);
    };
  }, [scrollContainerRef]);

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const body = bodyRef.current;
    if (!scrollContainer || !body) return;
    const rowsTop = (
      body.getBoundingClientRect().top
      - scrollContainer.getBoundingClientRect().top
      + scrollContainer.scrollTop
    );
    setViewport((current) => (
      Math.abs(current.rowsTop - rowsTop) < 0.5
        ? current
        : { ...current, rowsTop }
    ));
  }, [rowHeight, scrollContainerRef, spaces.length]);

  const measureRow = useCallback((node: HTMLTableRowElement | null) => {
    if (!node || measuredRowRef.current) return;
    const measuredHeight = node.getBoundingClientRect().height;
    if (measuredHeight <= 0) return;
    measuredRowRef.current = true;
    setRowHeight(measuredHeight);
  }, []);

  const virtualWindow = useMemo(
    () => calculateVirtualRowWindow({
      rowCount: spaces.length,
      scrollTop: Math.max(0, viewport.scrollTop - viewport.rowsTop),
      viewportHeight: viewport.viewportHeight,
      rowHeight,
      overscan: ROW_OVERSCAN,
    }),
    [rowHeight, spaces.length, viewport.rowsTop, viewport.scrollTop, viewport.viewportHeight],
  );
  const visibleSpaces = spaces.slice(virtualWindow.startIndex, virtualWindow.endIndex);

  return (
    <TableBody
      ref={bodyRef}
      data-table-rows-ready="true"
      data-mounted-row-count={virtualWindow.mountedRowCount}
      data-total-row-count={spaces.length}
      data-row-height={rowHeight}
    >
      {virtualWindow.topSpacerHeight > 0 && (
        <tr
          aria-hidden="true"
          data-table-spacer="top"
          style={{ height: virtualWindow.topSpacerHeight }}
        >
          <td
            colSpan={11}
            style={{ height: virtualWindow.topSpacerHeight, padding: 0 }}
          />
        </tr>
      )}
      {visibleSpaces.map((cell, visibleIndex) => (
        <Row
          key={cell.id}
          cell={cell}
          index={virtualWindow.startIndex + visibleIndex}
          paletteMode={paletteMode}
          areaRange={areaRange}
          nucleusPaletteId={nucleusPaletteId}
          colorSource={colorSource}
          measureRef={visibleIndex === 0 ? measureRow : undefined}
        />
      ))}
      {virtualWindow.bottomSpacerHeight > 0 && (
        <tr
          aria-hidden="true"
          data-table-spacer="bottom"
          style={{ height: virtualWindow.bottomSpacerHeight }}
        >
          <td
            colSpan={11}
            style={{ height: virtualWindow.bottomSpacerHeight, padding: 0 }}
          />
        </tr>
      )}
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
  );
}

// Table view — same Zustand store as the canvas (no local copy of spaces),
// so every edit ripples to CanvasView automatically and switching views
// never resets spaces or camera.
export default function TableView() {
  const spaceCount = useLab((s) => s.spaces.length);
  const addSpace = useLab((s) => s.addSpace);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [rowsReady, setRowsReady] = useState(false);

  useEffect(() => {
    let rowsFrame: number | null = null;
    const shellFrame = requestAnimationFrame(() => {
      rowsFrame = requestAnimationFrame(() => {
        setRowsReady(true);
      });
    });
    return () => {
      cancelAnimationFrame(shellFrame);
      if (rowsFrame !== null) cancelAnimationFrame(rowsFrame);
    };
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="table-view h-full w-full overflow-y-auto px-6 pt-24 pb-40"
      data-table-stage={rowsReady ? "rows" : "shell"}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="eyebrow">PROGRAM</p>
            <p className="text-sm text-muted-foreground">
              {spaceCount} spaces · edits sync to canvas
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
            {rowsReady
              ? <VirtualizedTableBody scrollContainerRef={scrollContainerRef} />
              : <TableRowsSkeleton />}
          </Table>
        </div>
      </div>
    </div>
  );
}
