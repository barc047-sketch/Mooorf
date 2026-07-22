import { useMemo, useState, type FormEvent } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Monitor,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  getAllRelationshipTypes,
  getRelationshipTypeMetadataError,
  getRelationshipTypeUsageCount,
  getSelectableRelationshipTypes,
  searchRelationshipTypes,
  type RelationshipTypeDefinition,
  type RelationshipTypeMetadataInput,
} from "../../domain/connections/relationshipTypes";
import { getConnectionIndex } from "../../domain/connections/selectors";
import { resolveRelationshipTypeStylePreview } from "../../domain/connections/styles";
import { useLab } from "../../state/store";
import {
  recordRelationshipTypeUse,
  RelationshipTypePicker,
  RelationshipTypeStylePreview,
} from "../RelationshipTypePicker";

type ManagerTab = "types" | "connections";
type RelationshipTypeOperation = "archive" | "delete";

type MetadataEditorState = {
  mode: "create" | "edit";
  typeId?: string;
  draft: RelationshipTypeMetadataInput;
};

const EMPTY_DRAFT: RelationshipTypeMetadataInput = {
  name: "",
  shortCode: "",
  description: "",
};

const usageLabel = (count: number): string => `${count} ${count === 1 ? "use" : "uses"}`;

function RelationshipTypeMetadataEditor({
  editor,
  error,
  onCancel,
  onChange,
  onSubmit,
}: {
  editor: MetadataEditorState;
  error: string | null;
  onCancel: () => void;
  onChange: (draft: RelationshipTypeMetadataInput) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form className="relationship-type-editor" onSubmit={onSubmit}>
      <div className="relationship-type-editor-grid">
        <label>
          <span>Name</span>
          <input
            autoFocus
            maxLength={120}
            required
            value={editor.draft.name}
            onChange={(event) => onChange({ ...editor.draft, name: event.target.value })}
          />
        </label>
        <label>
          <span>Code</span>
          <input
            maxLength={12}
            required
            value={editor.draft.shortCode ?? ""}
            onChange={(event) => onChange({
              ...editor.draft,
              shortCode: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12),
            })}
          />
        </label>
      </div>
      <label>
        <span>Description <i>optional</i></span>
        <textarea
          maxLength={1_200}
          rows={2}
          value={editor.draft.description ?? ""}
          onChange={(event) => onChange({ ...editor.draft, description: event.target.value })}
        />
      </label>
      {error && <p className="relationship-manager-error" role="alert">{error}</p>}
      <div className="relationship-type-editor-actions">
        <button type="button" className="m1-btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="m1-primary-btn">
          {editor.mode === "create" ? "Create" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

export default function ConnectionsWidget() {
  const [tab, setTab] = useState<ManagerTab>("types");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editor, setEditor] = useState<MetadataEditorState | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ typeId: string; operation: RelationshipTypeOperation } | null>(null);
  const [reassignToTypeId, setReassignToTypeId] = useState("custom");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const connections = useLab((state) => state.connections);
  const projectRelationshipTypes = useLab((state) => state.settings.projectRelationshipTypes);
  const connectionStyles = useLab((state) => state.settings.connectionStyles);
  const connectionStylePreview = useLab((state) => state.connectionStyleEditorPreview);
  const connectionVisualScaleMode = useLab((state) => state.settings.connectionView.visualScaleMode);
  const createProjectRelationshipType = useLab((state) => state.createProjectRelationshipType);
  const updateProjectRelationshipTypeMetadata = useLab((state) => state.updateProjectRelationshipTypeMetadata);
  const setProjectRelationshipTypeArchived = useLab((state) => state.setProjectRelationshipTypeArchived);
  const deleteProjectRelationshipType = useLab((state) => state.deleteProjectRelationshipType);
  const resetFactoryRelationshipTypeDefaults = useLab((state) => state.resetFactoryRelationshipTypeDefaults);
  const setConnectionVisualScaleMode = useLab((state) => state.setConnectionVisualScaleMode);
  const openConnectionStyleEditor = useLab((state) => state.openConnectionStyleEditor);

  const connectionIndex = useMemo(() => getConnectionIndex(connections), [connections]);
  const allTypes = useMemo(
    () => getAllRelationshipTypes(projectRelationshipTypes, connectionStyles).map((type) => ({
      ...type,
      visualDefaults: resolveRelationshipTypeStylePreview(type.id, type.visualDefaults, connectionStylePreview),
    })),
    [projectRelationshipTypes, connectionStyles, connectionStylePreview],
  );
  const activeTypes = useMemo(
    () => searchRelationshipTypes(allTypes.filter((type) => !type.archived), query),
    [allTypes, query],
  );
  const archivedTypes = useMemo(
    () => searchRelationshipTypes(allTypes.filter((type) => type.origin === "project" && type.archived), query),
    [allTypes, query],
  );
  const reassignOptions = useMemo(
    () => getSelectableRelationshipTypes(projectRelationshipTypes, connectionStyles)
      .map((type) => ({
        ...type,
        visualDefaults: resolveRelationshipTypeStylePreview(type.id, type.visualDefaults, connectionStylePreview),
      }))
      .filter((type) => type.id !== pending?.typeId),
    [connectionStylePreview, connectionStyles, pending?.typeId, projectRelationshipTypes],
  );

  const openCreate = () => {
    setEditor({ mode: "create", draft: { ...EMPTY_DRAFT } });
    setEditorError(null);
    setPending(null);
  };

  const openEdit = (type: RelationshipTypeDefinition) => {
    if (type.origin !== "project") return;
    setExpandedId(type.id);
    setEditor({
      mode: "edit",
      typeId: type.id,
      draft: { name: type.name, shortCode: type.shortCode, description: type.description },
    });
    setEditorError(null);
    setPending(null);
  };

  const submitMetadata = (event: FormEvent) => {
    event.preventDefault();
    if (!editor) return;
    const error = getRelationshipTypeMetadataError(
      editor.draft,
      projectRelationshipTypes,
      editor.mode === "edit" ? editor.typeId : undefined,
    );
    if (error) {
      setEditorError(error);
      return;
    }
    if (editor.mode === "create") {
      const id = createProjectRelationshipType(editor.draft);
      if (!id) {
        setEditorError("Relationship Type could not be created.");
        return;
      }
      setExpandedId(id);
      setActionMessage("Project Relationship Type created.");
    } else if (!editor.typeId || !updateProjectRelationshipTypeMetadata(editor.typeId, editor.draft)) {
      setEditorError("Relationship Type could not be updated.");
      return;
    } else {
      setActionMessage("Relationship Type metadata updated.");
    }
    setEditor(null);
    setEditorError(null);
  };

  const openRetirement = (typeId: string, operation: RelationshipTypeOperation) => {
    setExpandedId(typeId);
    setPending({ typeId, operation });
    setReassignToTypeId("custom");
    setEditor(null);
    setActionMessage(null);
  };

  const confirmRetirement = (type: RelationshipTypeDefinition, usageCount: number) => {
    if (!pending || pending.typeId !== type.id) return;
    const targetId = usageCount > 0 ? reassignToTypeId : undefined;
    const changed = pending.operation === "archive"
      ? setProjectRelationshipTypeArchived(type.id, true, targetId)
      : deleteProjectRelationshipType(type.id, targetId);
    if (!changed) {
      setActionMessage("This change could not be applied safely. Choose another reassignment target.");
      return;
    }
    if (targetId) recordRelationshipTypeUse(targetId);
    setPending(null);
    setExpandedId(null);
    setActionMessage(pending.operation === "archive" ? "Project Relationship Type archived." : "Project Relationship Type deleted.");
  };

  const renderRow = (type: RelationshipTypeDefinition) => {
    const usageCount = getRelationshipTypeUsageCount(connectionIndex, type.id);
    const expanded = expandedId === type.id;
    const editing = editor?.mode === "edit" && editor.typeId === type.id;
    const pendingHere = pending?.typeId === type.id;
    return (
      <article
        key={type.id}
        className="relationship-type-row"
        data-expanded={expanded ? "true" : undefined}
        data-archived={type.archived ? "true" : undefined}
        role="listitem"
      >
        <div className="relationship-type-row-main">
          <button
            type="button"
            className="relationship-type-disclosure"
            aria-expanded={expanded}
            onClick={() => {
              setExpandedId(expanded ? null : type.id);
              setEditor(null);
              setPending(null);
            }}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <span>
              <strong>{type.name}</strong>
              <small>{type.origin === "factory" ? "Factory" : type.archived ? "Project · Archived" : "Project"}</small>
            </span>
          </button>
          <RelationshipTypeStylePreview type={type} />
          <span className="relationship-type-usage">{usageLabel(usageCount)}</span>
          <button
            type="button"
            className="relationship-type-edit-action"
            onClick={() => type.origin === "project" ? openEdit(type) : setExpandedId(expanded ? null : type.id)}
          >
            {type.origin === "project" ? <Pencil size={11} /> : null}
            {type.origin === "project" ? "Edit" : "Details"}
          </button>
        </div>
        {expanded && <div className="relationship-type-row-details">
          {editing && editor ? <RelationshipTypeMetadataEditor
            editor={editor}
            error={editorError}
            onCancel={() => { setEditor(null); setEditorError(null); }}
            onChange={(draft) => { setEditor({ ...editor, draft }); setEditorError(null); }}
            onSubmit={submitMetadata}
          /> : <>
            <dl>
              <div><dt>Display name</dt><dd>{type.name}</dd></div>
              <div><dt>Code</dt><dd>{type.shortCode}</dd></div>
              <div><dt>Source</dt><dd>{type.origin === "factory" ? "Factory" : "Project"}</dd></div>
              <div><dt>Usage</dt><dd>{usageLabel(usageCount)}</dd></div>
              <div className="relationship-type-description"><dt>Description</dt><dd>{type.description || "No description"}</dd></div>
            </dl>
            {type.id === "custom" && <p className="relationship-type-protection">Custom is permanent, always available, and cannot be archived or deleted.</p>}
            {type.origin === "factory" && type.id !== "custom" && <p className="relationship-type-protection">Factory identity is protected. Visual defaults can be reset from Manager settings.</p>}
            <div className="relationship-type-row-actions">
              <button
                type="button"
                className="m1-btn"
                onClick={() => openConnectionStyleEditor({ context: "relationship-type", typeId: type.id })}
              ><Settings2 size={11} /> Edit Style</button>
            </div>
            {type.origin === "project" && !pendingHere && <div className="relationship-type-row-actions">
              {type.archived ? <button type="button" className="m1-btn" onClick={() => {
                if (setProjectRelationshipTypeArchived(type.id, false)) {
                  setActionMessage("Project Relationship Type restored.");
                  setExpandedId(null);
                }
              }}><RotateCcw size={11} /> Restore</button> : <button type="button" className="m1-btn" onClick={() => openRetirement(type.id, "archive")}><Archive size={11} /> Archive</button>}
              <button type="button" className="m1-btn relationship-type-delete" onClick={() => openRetirement(type.id, "delete")}><Trash2 size={11} /> Delete</button>
            </div>}
          </>}
          {pendingHere && <div className="relationship-type-retirement">
            <strong>{usageCount > 0
              ? `${usageLabel(usageCount)} currently use “${type.name}”.`
              : `${pending.operation === "archive" ? "Archive" : "Delete"} “${type.name}”?`}</strong>
            {usageCount > 0 && <label>
              <span>Reassign to</span>
              <RelationshipTypePicker
                direction="down"
                label="Reassign Connections to Relationship Type"
                options={reassignOptions}
                value={reassignToTypeId}
                onChange={setReassignToTypeId}
              />
            </label>}
            {actionMessage && <p className="relationship-manager-error" role="alert">{actionMessage}</p>}
            <div>
              <button type="button" className="m1-btn" onClick={() => { setPending(null); setActionMessage(null); }}>Cancel</button>
              <button type="button" className="m1-primary-btn" onClick={() => confirmRetirement(type, usageCount)}>
                {usageCount > 0 ? `Reassign & ${pending.operation === "archive" ? "Archive" : "Delete"}` : pending.operation === "archive" ? "Archive" : "Delete"}
              </button>
            </div>
          </div>}
        </div>}
      </article>
    );
  };

  return (
    <div className="connections-widget relationship-manager">
      <div className="relationship-manager-toolbar">
        <div className="relationship-manager-tabs" role="tablist" aria-label="Relationship Manager sections">
          <button type="button" role="tab" aria-selected={tab === "types"} data-active={tab === "types"} onClick={() => setTab("types")}>TYPES</button>
          <button type="button" role="tab" aria-selected={tab === "connections"} data-active={tab === "connections"} onClick={() => setTab("connections")}>CONNECTIONS</button>
        </div>
        <div className="relationship-manager-settings">
          <button
            type="button"
            className="relationship-manager-settings-trigger"
            aria-label="Relationship Manager settings"
            aria-expanded={settingsOpen}
            title="Relationship Manager settings"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <Settings2 size={14} strokeWidth={1.5} />
          </button>
          {settingsOpen && <div className="relationship-manager-settings-menu">
            <strong className="connection-settings-title">CONNECTION SETTINGS</strong>
            <section className="connection-visual-scale-setting" aria-labelledby="connection-visual-scale-label">
              <span id="connection-visual-scale-label">VISUAL SCALE</span>
              <div className="connection-visual-scale-options" role="radiogroup" aria-label="Connection visual scale">
                <button
                  type="button"
                  role="radio"
                  aria-checked={connectionVisualScaleMode === "screen"}
                  data-active={connectionVisualScaleMode === "screen" ? "true" : undefined}
                  title="Keep Connection strokes, patterns and markers fixed in screen pixels"
                  onClick={() => setConnectionVisualScaleMode("screen")}
                >
                  <Monitor size={12} strokeWidth={1.5} />
                  <span>Fixed on Screen</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={connectionVisualScaleMode === "canvas"}
                  data-active={connectionVisualScaleMode === "canvas" ? "true" : undefined}
                  title="Scale Connection strokes, patterns and markers with Canvas zoom"
                  onClick={() => setConnectionVisualScaleMode("canvas")}
                >
                  <Maximize2 size={12} strokeWidth={1.5} />
                  <span>Scale with Canvas</span>
                </button>
              </div>
            </section>
            <button type="button" onClick={() => {
              const changed = resetFactoryRelationshipTypeDefaults();
              setActionMessage(changed ? "Factory Relationship Type defaults restored." : "Factory defaults are already current.");
              setSettingsOpen(false);
            }}><RotateCcw size={11} /> Reset Factory Defaults</button>
          </div>}
        </div>
      </div>

      {actionMessage && !pending && <p className="relationship-manager-status" role="status">{actionMessage}</p>}

      {tab === "types" ? <section className="relationship-manager-types" role="tabpanel" aria-label="Relationship Types">
        <div className="relationship-manager-search">
          <Search size={13} strokeWidth={1.5} />
          <input
            type="search"
            value={query}
            aria-label="Search Relationship Types"
            placeholder="Search name, code or description"
            onChange={(event) => setQuery(event.target.value)}
          />
          <span>{activeTypes.length}</span>
        </div>
        <div className="relationship-type-list" role="list" aria-label="Relationship Type Library">
          {activeTypes.map(renderRow)}
          {activeTypes.length === 0 && <p className="relationship-manager-empty">No Relationship Types match “{query}”.</p>}
          <button type="button" className="relationship-type-add" onClick={openCreate}><Plus size={13} /> Add Relationship Type</button>
          {editor?.mode === "create" && <RelationshipTypeMetadataEditor
            editor={editor}
            error={editorError}
            onCancel={() => { setEditor(null); setEditorError(null); }}
            onChange={(draft) => { setEditor({ ...editor, draft }); setEditorError(null); }}
            onSubmit={submitMetadata}
          />}
          {archivedTypes.length > 0 && <>
            <button type="button" className="relationship-type-archived-toggle" aria-expanded={showArchived} onClick={() => setShowArchived((shown) => !shown)}>
              {showArchived ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Archived project types <span>{archivedTypes.length}</span>
            </button>
            {showArchived && archivedTypes.map(renderRow)}
          </>}
        </div>
      </section> : <section className="relationship-manager-placeholder" role="tabpanel" aria-label="Connection management">
        <div>
          <span>CONNECTIONS</span>
          <h2>Connection management</h2>
          <p>Connection management arrives in the next stage.</p>
          <small>Search, filtering and bulk editing arrive in the next stage.</small>
        </div>
      </section>}
    </div>
  );
}
