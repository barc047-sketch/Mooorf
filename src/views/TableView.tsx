import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
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
import { applySpaceSchedule } from "../import/projectTransfer";
import { applyTableImport, type TablePreview } from "../import/tableImport";
import {
  TABLE_FILE_ACCEPT,
  canImportTablePreview,
  clearTableFileInput,
  downloadTableCsvTemplate,
  downloadTableTemplate,
  parseTableFile,
  type ParsedTableFile,
} from "../import/tableFileWorkflow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function filterTableSpaces(
  spaces: readonly SpaceCell[],
  query: string,
): readonly SpaceCell[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return spaces;
  return spaces.filter((space) => [
    space.id,
    space.spaceCode ?? "",
    space.name,
    space.body ?? "",
    space.category,
    space.privacy,
    space.kind ?? "space",
  ].some((value) => value.toLowerCase().includes(needle)));
}

function SpaceNoCell({ cell }: { cell: SpaceCell }) {
  const updateSpace = useLab((s) => s.updateSpace);
  const [draft, setDraft] = useState(cell.spaceCode ?? "");
  useEffect(() => setDraft(cell.spaceCode ?? ""), [cell.spaceCode]);
  return <Input className="h-7 w-16 tabular-nums" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => updateSpace(cell.id, { spaceCode: draft })} aria-label={`Space No. of ${cell.name}`} />;
}

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
        <SpaceNoCell cell={cell} />
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
          <TableCell colSpan={12} className="p-0">
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
  spaces,
  areaRange,
  emptyMessage,
}: {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  spaces: readonly SpaceCell[];
  areaRange: AreaRange;
  emptyMessage: string;
}) {
  const paletteMode = useLab((s) => s.settings.paletteMode);
  const nucleusPaletteId = useLab((s) => s.settings.nucleusPaletteId);
  const colorSource = useLab((s) => s.settings.colorSource);
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
            colSpan={12}
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
            colSpan={12}
            style={{ height: virtualWindow.bottomSpacerHeight, padding: 0 }}
          />
        </tr>
      )}
      {spaces.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={12}
            className="py-10 text-center text-muted-foreground"
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}

const sourceDataRowCount = (preview: TablePreview): number =>
  Math.max(0, preview.sourceRows.length - Math.max(0, preview.headerRow + 1));

const yieldForLoadingState = (): Promise<void> =>
  new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      channel.port2.close();
      resolve();
    };
    channel.port2.postMessage(undefined);
  });

function TableImportReview({
  file,
  replaceArmed,
  onCancel,
  onAdd,
  onRequestReplace,
  onConfirmReplace,
}: {
  file: ParsedTableFile;
  replaceArmed: boolean;
  onCancel: () => void;
  onAdd: () => void;
  onRequestReplace: () => void;
  onConfirmReplace: () => void;
}) {
  const { preview } = file;
  const canImport = canImportTablePreview(preview);
  const format = file.filename.split(".").pop()?.toUpperCase() || "TABLE";
  const sourceLabel = file.sheetName.toUpperCase() === format
    ? format
    : `${format} · ${file.sheetName}`;
  const diagnostics = preview.diagnostics.slice(0, 8);
  const diagnosticsByRow = new Map<number, "warning" | "error">();
  for (const diagnostic of preview.diagnostics) {
    const current = diagnosticsByRow.get(diagnostic.row);
    if (current !== "error") diagnosticsByRow.set(diagnostic.row, diagnostic.level);
  }
  const parsedSourceRows = new Set(preview.rows.map((row) => row.sourceRow));
  const sourceValue = (
    sourceRow: number,
    field: "spaceCode" | "name" | "area" | "category" | "privacy" | "kind",
  ): string => {
    const column = preview.mapping[field];
    if (column === undefined) return "—";
    const value = preview.sourceRows[sourceRow - 1]?.[column];
    const text = String(value ?? "").trim();
    return text || "—";
  };
  const reviewRows = [
    ...preview.rows.map((row) => ({
      sourceRow: row.sourceRow,
      spaceCode: row.spaceCode ?? "—",
      name: row.name,
      area: `${row.area} m²`,
      category: row.category,
      privacy: row.privacy,
      kind: row.kind,
      level: diagnosticsByRow.get(row.sourceRow),
    })),
    ...preview.diagnostics
      .filter(
        (diagnostic, index, items) =>
          diagnostic.level === "error"
          && !parsedSourceRows.has(diagnostic.row)
          && items.findIndex((item) => item.row === diagnostic.row) === index,
      )
      .map((diagnostic) => ({
        sourceRow: diagnostic.row,
        spaceCode: sourceValue(diagnostic.row, "spaceCode"),
        name: sourceValue(diagnostic.row, "name"),
        area: sourceValue(diagnostic.row, "area"),
        category: sourceValue(diagnostic.row, "category"),
        privacy: sourceValue(diagnostic.row, "privacy"),
        kind: sourceValue(diagnostic.row, "kind"),
        level: "error" as const,
      })),
  ].sort((left, right) => left.sourceRow - right.sourceRow);

  return (
    <>
      <DialogHeader className="table-import-review__header">
        <div className="table-import-review__file">
          <DialogTitle>{file.filename}</DialogTitle>
          <DialogDescription>
            {sourceLabel} · {sourceDataRowCount(preview)} source rows
          </DialogDescription>
        </div>
        <div className="table-import-review__counts">
          <span>{preview.validCount} valid</span>
          <span>{preview.warningCount} warnings</span>
          <span>{preview.errorCount} errors</span>
        </div>
      </DialogHeader>

      <div className="table-import-review__body">
        {preview.errorCount > 0 && (
          <div
            className="table-import-review__blocking"
            role="alert"
          >
            <AlertTriangle size={14} />
            Fix the listed errors and upload again.
          </div>
        )}

        <div className="table-import-review__preview" aria-label="First parsed rows">
          <table>
            <thead>
              <tr>
                <th>row</th>
                <th>No.</th>
                <th>name</th>
                <th>area</th>
                <th>category</th>
                <th>privacy</th>
                <th>kind</th>
              </tr>
            </thead>
            <tbody>
              {reviewRows.slice(0, 12).map((row) => (
                <tr
                  key={`${row.sourceRow}-${row.name}`}
                  data-level={row.level}
                >
                  <td>{row.sourceRow}</td>
                  <td>{row.spaceCode}</td>
                  <td>{row.name}</td>
                  <td>{row.area}</td>
                  <td>{row.category}</td>
                  <td>{row.privacy}</td>
                  <td>{row.kind}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {diagnostics.length > 0 && (
          <div className="table-import-review__diagnostics" aria-label="Import diagnostics">
            {diagnostics.map((diagnostic, index) => (
              <p
                key={`${diagnostic.row}-${diagnostic.level}-${index}`}
                data-level={diagnostic.level}
              >
                Row {diagnostic.row}: {diagnostic.message}
              </p>
            ))}
          </div>
        )}
      </div>

      <DialogFooter className="table-import-review__footer">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onAdd} disabled={!canImport}>
          Import spaces
        </Button>
        {!replaceArmed ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestReplace}
            disabled={!canImport}
          >
            Replace project spaces
          </Button>
        ) : (
          <div className="table-import-review__confirm">
            <span>
              This removes the current project spaces.
            </span>
            <Button variant="destructive" size="sm" onClick={onConfirmReplace}>
              Confirm replace
            </Button>
          </div>
        )}
      </DialogFooter>
    </>
  );
}

// Table view — same Zustand store as the canvas (no local copy of spaces),
// so every edit ripples to CanvasView automatically and switching views
// never resets spaces or camera.
export default function TableView() {
  const spaces = useLab((s) => s.spaces);
  const addSpace = useLab((s) => s.addSpace);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRequestRef = useRef(0);
  const dragDepthRef = useRef(0);
  const [rowsReady, setRowsReady] = useState(false);
  const [query, setQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [xlsxTemplateLoading, setXlsxTemplateLoading] = useState(false);
  const [csvTemplateLoading, setCsvTemplateLoading] = useState(false);
  const [loadingFilename, setLoadingFilename] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [reviewFile, setReviewFile] = useState<ParsedTableFile | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [replaceArmed, setReplaceArmed] = useState(false);
  const visibleSpaces = useMemo(
    () => filterTableSpaces(spaces, query),
    [query, spaces],
  );
  const areaRange = useMemo(() => getAreaRange(spaces), [spaces]);
  const searching = query.trim().length > 0;

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

  const handleDownloadXlsxTemplate = async () => {
    if (xlsxTemplateLoading) return;
    setXlsxTemplateLoading(true);
    try {
      await downloadTableTemplate();
      toast.success("XLSX template downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Template download failed.");
    } finally {
      setXlsxTemplateLoading(false);
    }
  };

  const handleDownloadCsvTemplate = async () => {
    if (csvTemplateLoading) return;
    setCsvTemplateLoading(true);
    try {
      await downloadTableCsvTemplate();
      toast.success("CSV template downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Template download failed.");
    } finally {
      setCsvTemplateLoading(false);
    }
  };

  const loadFile = async (file: File) => {
    const requestId = ++uploadRequestRef.current;
    setLoadingFilename(file.name);
    setUploadError(null);
    setReviewFile(null);
    setReviewOpen(false);
    setReplaceArmed(false);
    await yieldForLoadingState();

    try {
      const parsed = await parseTableFile(file);
      if (uploadRequestRef.current !== requestId) return;
      setReviewFile(parsed);
      setReviewOpen(true);
    } catch (error) {
      if (uploadRequestRef.current !== requestId) return;
      setUploadError(error instanceof Error ? error.message : "File validation failed.");
    } finally {
      if (uploadRequestRef.current === requestId) setLoadingFilename(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    clearTableFileInput(input);
    if (file) void loadFile(file);
  };

  const acceptsDrop = (event: DragEvent<HTMLElement>) =>
    Array.from(event.dataTransfer.types).includes("Files");

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!acceptsDrop(event)) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current += 1;
    setDragActive(true);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!acceptsDrop(event)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!acceptsDrop(event)) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (!acceptsDrop(event)) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) void loadFile(file);
  };

  const clearReview = () => {
    uploadRequestRef.current += 1;
    setLoadingFilename(null);
    setUploadError(null);
    setReviewFile(null);
    setReviewOpen(false);
    setReplaceArmed(false);
  };

  const closeReviewDialog = () => {
    setReviewOpen(false);
    setReplaceArmed(false);
  };

  const applyReviewedFile = (mode: "append" | "replace") => {
    if (!reviewFile || !canImportTablePreview(reviewFile.preview)) return;
    try {
      const result = applyTableImport(
        useLab.getState().spaces,
        reviewFile.preview.rows,
        mode,
      );
      applySpaceSchedule(result.spaces);
      toast.success(
        mode === "append"
          ? `Added ${result.added} spaces`
          : `Replaced with ${result.spaces.length} spaces`,
      );
      setReviewFile(null);
      setReviewOpen(false);
      setUploadError(null);
      setReplaceArmed(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed.");
    }
  };

  return (
    <div
      className="table-view"
      data-table-stage={rowsReady ? "rows" : "shell"}
    >
      <div className="table-workspace-layout">
        <section className="table-control-zone" data-table-control-zone="true">
          <div className="table-search">
            <Search size={16} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search spaces…"
              aria-label="Search spaces"
            />
            {searching && (
              <button
                type="button"
                className="table-search__clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="table-control-cards" data-table-card-row="true">
            <section
              className="table-upload-card"
              data-table-upload-card="true"
              data-drag-active={dragActive}
              data-state={reviewFile
                ? "review"
                : loadingFilename
                  ? "loading"
                  : uploadError
                    ? "error"
                    : "idle"}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="table-card__heading">
                <span className="table-card__icon" aria-hidden="true">
                  <FileSpreadsheet size={19} />
                </span>
                <div>
                  <h2>Upload space schedule</h2>
                  <p>CSV, XLSX or XLS</p>
                </div>
              </div>

            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept={TABLE_FILE_ACCEPT}
              onChange={handleFileChange}
            />

              {loadingFilename ? (
                <div className="table-upload-card__loading" role="status">
                  <LoaderCircle className="animate-spin" size={18} />
                  <span>Reading {loadingFilename}…</span>
                  <i />
                  <i />
                </div>
              ) : uploadError ? (
                <div className="table-upload-card__error" role="alert">
                  <span><AlertTriangle size={15} /> {uploadError}</span>
                  <div>
                    <Button variant="ghost" size="sm" onClick={clearReview}>
                      Dismiss
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose another
                    </Button>
                  </div>
                </div>
              ) : reviewFile ? (
                <div className="table-upload-card__ready">
                  <div>
                    <strong>{reviewFile.filename}</strong>
                    <span>
                      {reviewFile.preview.validCount} valid · {reviewFile.preview.warningCount} warnings · {reviewFile.preview.errorCount} errors
                    </span>
                  </div>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => setReviewOpen(true)}>
                      Review import
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose another
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="table-upload-card__idle">
                  <div>
                    <Upload size={22} aria-hidden="true" />
                    <p>Drag and drop a space schedule here</p>
                    <span>Files are parsed locally in your browser.</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose file
                  </Button>
                </div>
              )}

              {dragActive && (
                <div className="table-upload-card__drop" aria-hidden="true">
                  <Upload size={24} />
                  <strong>Drop to review</strong>
                </div>
              )}
            </section>

            <aside className="table-download-card" data-table-download-card="true">
              <div className="table-card__heading">
                <span className="table-card__icon" aria-hidden="true">
                  <Download size={18} />
                </span>
                <div>
                  <h2>Download template</h2>
                  <p>CSV or XLSX · stable No. column</p>
                </div>
              </div>
              <p className="table-download-card__copy">
                Name and Area are required. Optional fields are included.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadXlsxTemplate}
                  disabled={xlsxTemplateLoading}
                >
                  {xlsxTemplateLoading
                    ? <LoaderCircle className="animate-spin" />
                    : <Download />}
                  {xlsxTemplateLoading ? "Preparing…" : "Download XLSX"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCsvTemplate}
                  disabled={csvTemplateLoading}
                >
                  {csvTemplateLoading
                    ? <LoaderCircle className="animate-spin" />
                    : <Download />}
                  {csvTemplateLoading ? "Preparing…" : "Download CSV"}
                </Button>
              </div>
            </aside>
          </div>
        </section>

        <section className="table-zone" data-table-zone="true">
          <div className="table-zone__header">
            <div>
              <p className="eyebrow">PROGRAM / SPACE SCHEDULE</p>
              <p className="table-zone__count">
                {searching
                  ? `${visibleSpaces.length} / ${spaces.length} spaces`
                  : `${spaces.length} spaces`}
                {" · "}edits sync to canvas
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => addSpace()}>
              <Plus /> Add space
            </Button>
          </div>

          <div
            ref={scrollContainerRef}
            className="table-zone__scroll glass"
            data-table-scroll-container="true"
            data-visible-space-count={visibleSpaces.length}
            data-total-space-count={spaces.length}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">No.</TableHead>
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
                ? <VirtualizedTableBody
                    scrollContainerRef={scrollContainerRef}
                    spaces={visibleSpaces}
                    areaRange={areaRange}
                    emptyMessage={searching
                      ? "No spaces match this search."
                      : "No spaces yet — add one above."}
                  />
                : <TableRowsSkeleton />}
            </Table>
          </div>
        </section>
      </div>

      {reviewFile && (
        <Dialog
          open={Boolean(reviewFile && reviewOpen)}
          onOpenChange={(open) => {
            setReviewOpen(open);
            if (!open) setReplaceArmed(false);
          }}
        >
          <DialogContent className="table-import-dialog">
            <TableImportReview
              file={reviewFile}
              replaceArmed={replaceArmed}
              onCancel={closeReviewDialog}
              onAdd={() => applyReviewedFile("append")}
              onRequestReplace={() => setReplaceArmed(true)}
              onConfirmReplace={() => applyReviewedFile("replace")}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
