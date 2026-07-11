import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FileSpreadsheet, FileText, FolderOpen, Upload } from "lucide-react";
import { toast } from "sonner";
import { useLab } from "../state/store";
import { applyConfigFile, applyProjectFile, applySpaceSchedule, restoreRecoverySnapshot } from "./projectTransfer";
import { readIntakeFile, type FileReview, type IntakeStatus } from "./fileIntake";
import { applyTableImport, parseWorksheetTable, type ColumnMapping, type TableImportMode } from "./tableImport";
import "./fileIntake.css";

export interface IntakeItem {
  id: string;
  file: File;
  status: IntakeStatus;
  progress?: number;
  review?: FileReview;
  error?: string;
}

interface FileIntakeContextValue {
  items: IntakeItem[];
  applyingId: string | null;
  browse: () => void;
  enqueue: (files: FileList | File[]) => void;
  remove: (id: string) => void;
  retry: (id: string) => void;
  selectSheet: (id: string, index: number) => void;
  remap: (id: string, mapping: ColumnMapping) => void;
  apply: (id: string, mode: TableImportMode) => void;
}

const FileIntakeContext = createContext<FileIntakeContextValue | null>(null);
let intakeCounter = 0;

export const useFileIntake = () => {
  const value = useContext(FileIntakeContext);
  if (!value) throw new Error("File intake must be used inside FileIntakeProvider.");
  return value;
};

export default function FileIntakeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<IntakeItem[]>([]);
  const itemsRef = useRef<IntakeItem[]>([]);
  const [dropActive, setDropActive] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const openWidget = useLab((state) => state.openWidget);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const update = useCallback((id: string, patch: Partial<IntakeItem>) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }, []);

  const process = useCallback(async (item: IntakeItem) => {
    update(item.id, { status: "reading", progress: 0, error: undefined, review: undefined });
    try {
      const review = await readIntakeFile(item.file, (progress) => update(item.id, progress));
      update(item.id, { status: "review", progress: 88, review });
    } catch (error) {
      update(item.id, { status: "failed", progress: undefined, error: error instanceof Error ? error.message : "File validation failed." });
    }
  }, [update]);

  const enqueue = useCallback((incoming: FileList | File[]) => {
    const files = Array.from(incoming);
    const room = Math.max(0, 5 - itemsRef.current.length);
    const accepted = files.slice(0, room).map((file) => ({ id: `intake-${Date.now().toString(36)}-${intakeCounter++}`, file, status: "queued" as const }));
    if (files.length > room) toast.error("File Intake accepts at most five queued files.");
    itemsRef.current = [...itemsRef.current, ...accepted];
    setItems(itemsRef.current);
    accepted.forEach((item) => void process(item));
    openWidget("import");
  }, [openWidget, process]);

  useEffect(() => {
    const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes("Files");
    const enter = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      dragDepth.current += 1;
      setDropActive(true);
    };
    const over = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };
    const leave = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDropActive(false);
    };
    const drop = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      dragDepth.current = 0;
      setDropActive(false);
      if (event.dataTransfer?.files.length) enqueue(event.dataTransfer.files);
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [enqueue]);

  const remove = useCallback((id: string) => setItems((current) => {
    const next = current.filter((item) => item.id !== id);
    itemsRef.current = next;
    return next;
  }), []);
  const retry = useCallback((id: string) => {
    const item = items.find((candidate) => candidate.id === id);
    if (item) void process({ ...item, status: "queued" });
  }, [items, process]);
  const selectSheet = useCallback((id: string, index: number) => {
    setItems((current) => current.map((item) => {
      if (item.id !== id || item.review?.kind !== "table") return item;
      const sheet = item.review.sheets[index];
      if (!sheet) return item;
      return { ...item, review: { ...item.review, selectedSheet: index, preview: sheet.preview, summary: `${item.review.sheets.length} sheets · ${sheet.preview.validCount} valid · ${sheet.preview.warningCount} warnings · ${sheet.preview.errorCount} errors` } };
    }));
  }, []);
  const remap = useCallback((id: string, mapping: ColumnMapping) => {
    setItems((current) => current.map((item) => {
      if (item.id !== id || item.review?.kind !== "table") return item;
      const review = item.review;
      const selectedSheet = review.selectedSheet;
      const sheet = review.sheets[selectedSheet];
      const preview = parseWorksheetTable(sheet.name, sheet.rows, mapping);
      const sheets = review.sheets.map((entry, index) => index === selectedSheet ? { ...entry, preview } : entry);
      return { ...item, review: { ...review, sheets, preview, summary: `${preview.validCount} valid · ${preview.warningCount} warnings · ${preview.errorCount} errors` } };
    }));
  }, []);
  const apply = useCallback((id: string, mode: TableImportMode) => {
    const item = items.find((candidate) => candidate.id === id);
    if (!item?.review || applyingId) return;
    if (item.review.kind === "project" && !window.confirm("Open this project? Your current project will be replaced. A recovery snapshot will be available through Undo.")) return;
    setApplyingId(id);
    update(id, { status: "applying", progress: 94 });
    try {
      const recovery = item.review.kind === "project"
        ? applyProjectFile(item.review.project)
        : item.review.kind === "config"
          ? applyConfigFile(item.review.config)
          : applySpaceSchedule(applyTableImport(useLab.getState().spaces, item.review.preview.rows, mode).spaces);
      update(id, { status: "complete", progress: 100 });
      toast.success("Import complete", { action: { label: "Undo", onClick: () => restoreRecoverySnapshot(recovery) } });
    } catch (error) {
      update(id, { status: "failed", progress: undefined, error: error instanceof Error ? error.message : "Import failed and the previous project was restored." });
    } finally {
      setApplyingId(null);
    }
  }, [applyingId, items, update]);

  const value = useMemo<FileIntakeContextValue>(() => ({ items, applyingId, browse: () => inputRef.current?.click(), enqueue, remove, retry, selectSheet, remap, apply }), [items, applyingId, enqueue, remove, retry, selectSheet, remap, apply]);

  return (
    <FileIntakeContext.Provider value={value}>
      {children}
      <input ref={inputRef} className="file-intake-input" type="file" multiple accept=".mooorf,.json,.csv,.xls,.xlsx" onChange={(event) => { if (event.target.files) enqueue(event.target.files); event.target.value = ""; }} />
      {dropActive && (
        <div className="file-drop-overlay" role="presentation">
          <div className="file-drop-card glass">
            <Upload size={24} strokeWidth={1.25} />
            <strong>Drop files to review</strong>
            <span><FolderOpen size={12} /> Project / Config</span>
            <span><FileSpreadsheet size={12} /> CSV / XLS / XLSX</span>
            <span><FileText size={12} /> Local processing only</span>
          </div>
        </div>
      )}
    </FileIntakeContext.Provider>
  );
}
