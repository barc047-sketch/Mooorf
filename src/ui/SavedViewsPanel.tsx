import { useState } from "react";
import { Check, Copy, Pencil, Play, Save, Trash2, X } from "lucide-react";
import { useLab, SAVED_VIEWS_LIMIT } from "../state/store";
import type { SavedCanvasSnapshot } from "../types";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  return sameDay ? `Today, ${timeFormatter.format(date)}` : dateFormatter.format(date);
}

function metaLabel(view: SavedCanvasSnapshot): string {
  return `${view.rendererMode === "organism" ? "ORG" : "CLS"} · ${view.paletteMode} · ${view.spaces.length}`;
}

export default function SavedViewsPanel({ embedded = false }: { embedded?: boolean }) {
  const savedViews = useLab((s) => s.savedViews);
  const saveCurrentView = useLab((s) => s.saveCurrentView);
  const loadSavedView = useLab((s) => s.loadSavedView);
  const renameSavedView = useLab((s) => s.renameSavedView);
  const deleteSavedView = useLab((s) => s.deleteSavedView);
  const duplicateSavedView = useLab((s) => s.duplicateSavedView);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const beginRename = (view: SavedCanvasSnapshot) => {
    setEditingId(view.id);
    setDraft(view.name);
  };

  const commitRename = () => {
    if (!editingId) return;
    renameSavedView(editingId, draft);
    setEditingId(null);
    setDraft("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setDraft("");
  };

  return (
    <div className="saved-panel" data-testid="saved-views-panel">
      {embedded ? (
        <span className="saved-count saved-count--embedded">
          {savedViews.length}/{SAVED_VIEWS_LIMIT} iterations
        </span>
      ) : (
        <header className="saved-head">
          <span>
            <span className="saved-eyebrow">ITERATIONS</span>
            <span className="saved-title">Saved Views</span>
          </span>
          <span className="saved-count">
            {savedViews.length}/{SAVED_VIEWS_LIMIT}
          </span>
        </header>
      )}

      <button type="button" className="saved-save" onClick={() => saveCurrentView()}>
        <Save size={13} strokeWidth={1.6} />
        <span>Save current</span>
      </button>

      <div className="saved-list">
        {savedViews.length === 0 && <p className="saved-empty">No saved iterations</p>}
        {savedViews.map((view) => (
          <article key={view.id} className="saved-item">
            <div className="saved-row-main">
              {editingId === view.id ? (
                <form
                  className="saved-rename"
                  onSubmit={(event) => {
                    event.preventDefault();
                    commitRename();
                  }}
                >
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    autoFocus
                    aria-label="Saved view name"
                  />
                  <button type="submit" aria-label="Confirm rename">
                    <Check size={12} strokeWidth={1.8} />
                  </button>
                  <button type="button" aria-label="Cancel rename" onClick={cancelRename}>
                    <X size={12} strokeWidth={1.8} />
                  </button>
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    className="saved-name"
                    title={`Load ${view.name}`}
                    onClick={() => loadSavedView(view.id)}
                  >
                    {view.name}
                  </button>
                  <span className="saved-time">{formatTimestamp(view.createdAt)}</span>
                </>
              )}
            </div>

            <div className="saved-row-meta">
              <span className="saved-meta">{metaLabel(view)}</span>
              <span className="saved-meta">{view.annotationMode}</span>
              <span className="saved-meta">{view.theme}</span>
            </div>

            <div className="saved-actions">
              <button type="button" className="saved-load" onClick={() => loadSavedView(view.id)}>
                <Play size={11} strokeWidth={1.8} />
                <span>Load</span>
              </button>
              <button type="button" title="Rename" aria-label="Rename" onClick={() => beginRename(view)}>
                <Pencil size={12} strokeWidth={1.7} />
              </button>
              <button
                type="button"
                title="Duplicate"
                aria-label="Duplicate"
                onClick={() => duplicateSavedView(view.id)}
              >
                <Copy size={12} strokeWidth={1.7} />
              </button>
              <button
                type="button"
                title="Delete"
                aria-label="Delete"
                onClick={() => deleteSavedView(view.id)}
              >
                <Trash2 size={12} strokeWidth={1.7} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
