import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  Archive,
  Clipboard,
  ChevronDown,
  ChevronRight,
  Copy,
  Crosshair,
  EyeOff,
  FileText,
  Maximize2,
  Monitor,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  SlidersHorizontal,
  Trash2,
  Type,
} from "lucide-react";
import type { Connection } from "../../domain/graph/types";
import {
  getAllRelationshipTypes,
  getRelationshipTypeMetadataError,
  getRelationshipTypeUsageCount,
  getSelectableRelationshipTypes,
  resolveRelationshipType,
  searchRelationshipTypes,
  type RelationshipTypeDefinition,
  type RelationshipTypeMetadataInput,
} from "../../domain/connections/relationshipTypes";
import { resolveConnectionAnnotation } from "../../domain/connections/annotations";
import {
  defaultConnectionFilterState,
  filterConnections,
  getConnectionIndex,
  orderedConnectionRange,
  type ConnectionFilterMetadata,
  type ConnectionFilterState,
} from "../../domain/connections/selectors";
import { resolveConnectionStylePreview, resolveRelationshipTypeStylePreview, type ResolvedConnectionStyle } from "../../domain/connections/styles";
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

const CONNECTION_ROW_HEIGHT = 64;
const CONNECTION_OVERSCAN = 8;

type ConnectionRowModel = {
  connection: Connection;
  sourceName: string;
  targetName: string;
  type: RelationshipTypeDefinition;
  style: ResolvedConnectionStyle;
  title: string;
  body: string;
  hasVisualOverride: boolean;
  hasAnnotationOverride: boolean;
};

function ConnectionManagementTab() {
  const connections = useLab((state) => state.connections);
  const spaces = useLab((state) => state.spaces);
  const projectRelationshipTypes = useLab((state) => state.settings.projectRelationshipTypes);
  const connectionStyles = useLab((state) => state.settings.connectionStyles);
  const connectionStylePreview = useLab((state) => state.connectionStyleEditorPreview);
  const selectedConnectionIds = useLab((state) => state.selectedConnectionIds);
  const selectConnection = useLab((state) => state.selectConnection);
  const locateConnection = useLab((state) => state.locateConnection);
  const clearConnectionSelection = useLab((state) => state.clearConnectionSelection);
  const updateSelectedConnectionTypes = useLab((state) => state.updateSelectedConnectionTypes);
  const deleteSelectedConnections = useLab((state) => state.deleteSelectedConnections);

  const [filters, setFilters] = useState<ConnectionFilterState>(defaultConnectionFilterState);
  const [scrollTop, setScrollTop] = useState(0);
  const [selectionAnchorConnectionId, setSelectionAnchorConnectionId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const selectedSet = useMemo(() => new Set(selectedConnectionIds), [selectedConnectionIds]);
  const typeLibrary = useMemo(
    () => getAllRelationshipTypes(projectRelationshipTypes, connectionStyles),
    [connectionStyles, projectRelationshipTypes],
  );
  const typeById = useMemo(
    () => new Map(typeLibrary.map((type) => [type.id, type] as const)),
    [typeLibrary],
  );
  const spaceById = useMemo(
    () => new Map(spaces.map((space) => [space.id, space] as const)),
    [spaces],
  );
  const rows = useMemo<ConnectionRowModel[]>(() => connections.map((connection) => {
    const type = typeById.get(connection.semantic.typeId)
      ?? resolveRelationshipType(connection.semantic.typeId, projectRelationshipTypes, connectionStyles);
    const annotation = resolveConnectionAnnotation(connection, type);
    const style = resolveConnectionStylePreview(connection, connectionStyles, projectRelationshipTypes, connectionStylePreview);
    return {
      connection,
      sourceName: spaceById.get(connection.fromSpaceId)?.name ?? "Missing Cell",
      targetName: spaceById.get(connection.toSpaceId)?.name ?? "Missing Cell",
      type,
      style,
      title: annotation.title.text,
      body: annotation.body.text,
      hasVisualOverride: Boolean(connection.visual && Object.keys(connection.visual).length > 0),
      hasAnnotationOverride: Boolean(connection.annotation && Object.keys(connection.annotation).length > 0),
    };
  }), [connectionStylePreview, connectionStyles, connections, projectRelationshipTypes, spaceById, typeById]);
  const rowById = useMemo(() => new Map(rows.map((row) => [row.connection.id, row] as const)), [rows]);
  const filteredConnections = useMemo(() => filterConnections(
    connections,
    filters,
    (connection): ConnectionFilterMetadata => {
      const row = rowById.get(connection.id);
      return row ? {
        sourceName: row.sourceName,
        targetName: row.targetName,
        typeName: row.type.name,
        typeCode: row.type.shortCode,
        title: row.title,
        body: row.body,
        hasVisualOverride: row.hasVisualOverride,
        hasAnnotationOverride: row.hasAnnotationOverride,
      } : {
        sourceName: "",
        targetName: "",
        typeName: "",
        typeCode: "",
        title: "",
        body: "",
        hasVisualOverride: false,
        hasAnnotationOverride: false,
      };
    },
  ), [connections, filters, rowById]);

  useEffect(() => {
    setScrollTop(0);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [filters]);

  const visibleStart = Math.max(0, Math.floor(scrollTop / CONNECTION_ROW_HEIGHT) - CONNECTION_OVERSCAN);
  const visibleEnd = Math.min(
    filteredConnections.length,
    Math.ceil((scrollTop + (listRef.current?.clientHeight ?? 420)) / CONNECTION_ROW_HEIGHT) + CONNECTION_OVERSCAN,
  );
  const visibleConnections = filteredConnections.slice(visibleStart, visibleEnd);
  const selectedVisibleCount = filteredConnections.reduce((count, connection) => count + (selectedSet.has(connection.id) ? 1 : 0), 0);
  const allVisibleSelected = filteredConnections.length > 0 && selectedVisibleCount === filteredConnections.length;
  const filteredConnectionIds = useMemo(() => filteredConnections.map((connection) => connection.id), [filteredConnections]);

  useEffect(() => {
    if (selectionAnchorConnectionId && !filteredConnectionIds.includes(selectionAnchorConnectionId)) {
      setSelectionAnchorConnectionId(null);
    }
  }, [filteredConnectionIds, selectionAnchorConnectionId]);

  const resetFilters = () => setFilters(defaultConnectionFilterState());
  const selectVisibleRange = (targetId: string) => {
    const range = orderedConnectionRange(filteredConnectionIds, selectionAnchorConnectionId, targetId);
    if (!range.length) return;
    selectConnection(range[0] ?? null);
    range.slice(1).forEach((id) => selectConnection(id, true));
  };
  const selectConnectionFromList = (id: string, event: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }) => {
    if (event.shiftKey && selectionAnchorConnectionId && filteredConnectionIds.includes(selectionAnchorConnectionId)) {
      selectVisibleRange(id);
      return;
    }
    selectConnection(id, event.metaKey || event.ctrlKey);
    setSelectionAnchorConnectionId(id);
  };
  const toggleVisibleSelection = () => {
    if (allVisibleSelected) {
      filteredConnections.forEach((connection) => {
        if (selectedSet.has(connection.id)) selectConnection(connection.id, true);
      });
      setSelectionAnchorConnectionId(null);
      return;
    }
    filteredConnections.forEach((connection) => {
      if (!selectedSet.has(connection.id)) selectConnection(connection.id, true);
    });
    setSelectionAnchorConnectionId(null);
  };
  const updateFilter = <K extends keyof ConnectionFilterState>(key: K, value: ConnectionFilterState[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <section
      className="relationship-manager-connections"
      role="tabpanel"
      aria-label="Connection management"
      tabIndex={0}
      onKeyDown={(event) => {
        const target = event.target as HTMLElement;
        const editable = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
        if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "a" && !editable) {
          event.preventDefault();
          clearConnectionSelection();
          filteredConnectionIds.forEach((id, index) => selectConnection(id, index > 0));
          setSelectionAnchorConnectionId(null);
        }
      }}
    >
      <div className="connection-management-search relationship-manager-search">
        <Search size={13} strokeWidth={1.5} />
        <input
          type="search"
          value={filters.query}
          aria-label="Search Connections"
          placeholder="Search Connections..."
          onChange={(event) => updateFilter("query", event.target.value)}
        />
        <span>{filteredConnections.length}</span>
      </div>
      <div className="connection-management-filters" aria-label="Connection filters">
        <label><span>Type</span><select aria-label="Filter by Relationship Type" value={filters.relationshipTypeId} onChange={(event) => updateFilter("relationshipTypeId", event.target.value)}>
          <option value="all">All</option>
          {typeLibrary.filter((type) => !type.archived).map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
        </select></label>
        <label><span>Active</span><select aria-label="Filter by Active state" value={filters.enabled} onChange={(event) => updateFilter("enabled", event.target.value as ConnectionFilterState["enabled"])}>
          <option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select></label>
        <label><span>Overrides</span><select aria-label="Filter by Connection overrides" value={filters.overrideMode} onChange={(event) => updateFilter("overrideMode", event.target.value as ConnectionFilterState["overrideMode"])}>
          <option value="all">All</option><option value="inherited">Inherited</option><option value="visual">Visual</option><option value="annotation">Annotation</option>
        </select></label>
        {(filters.query || filters.relationshipTypeId !== "all" || filters.enabled !== "all" || filters.overrideMode !== "all") && <button type="button" className="connection-filter-reset" onClick={resetFilters}>Reset</button>}
      </div>
      {selectedConnectionIds.length > 0 && <div className="connection-selection-toolbar" role="toolbar" aria-label="Selected Connection actions">
        <strong>{selectedConnectionIds.length} Connection{selectedConnectionIds.length === 1 ? "" : "s"} selected</strong>
        <RelationshipTypePicker
          direction="down"
          label="Change selected Connections Relationship Type"
          options={typeLibrary.filter((type) => !type.archived)}
          value={selectedConnectionIds.length === 1 ? rowById.get(selectedConnectionIds[0] ?? "")?.connection.semantic.typeId ?? "custom" : ""}
          placeholder="Change Type"
          onChange={(typeId) => { updateSelectedConnectionTypes(typeId); recordRelationshipTypeUse(typeId); }}
        />
        <button type="button" className="connection-delete-action" onClick={deleteSelectedConnections}><Trash2 size={12} /> Delete {selectedConnectionIds.length} Connection{selectedConnectionIds.length === 1 ? "" : "s"}</button>
      </div>}
      <div className="connection-list-toolbar">
        <label className="connection-select-all"><input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelection} aria-label="Select all visible Connections" /><span>Select all visible</span></label>
        <span>{connections.length} Connection{connections.length === 1 ? "" : "s"}{selectedVisibleCount > 0 ? ` · ${selectedVisibleCount} visible selected` : ""}</span>
      </div>
      <div
        ref={listRef}
        className="connection-management-list"
        role="list"
        aria-label="Canonical Connections"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        {filteredConnections.length > 0 && <div style={{ height: visibleStart * CONNECTION_ROW_HEIGHT, pointerEvents: "none" }} aria-hidden="true" />}
        {visibleConnections.map((connection) => {
          const row = rowById.get(connection.id)!;
          const selected = selectedSet.has(connection.id);
          return <article key={connection.id} role="listitem" className="connection-management-row" data-selected={selected ? "true" : undefined}>
            <input
              type="checkbox"
              checked={selected}
              aria-label={`Select ${row.sourceName} to ${row.targetName}`}
              onChange={() => undefined}
              onClick={(event) => { event.stopPropagation(); selectConnectionFromList(connection.id, event); }}
            />
            <button
              type="button"
              className="connection-management-row-main"
              onClick={(event) => selectConnectionFromList(connection.id, event)}
              aria-pressed={selected}
            >
              <span className="connection-management-route"><strong>{row.sourceName} → {row.targetName}</strong><small>{row.type.name}{!connection.enabled ? " · Inactive" : ""}</small></span>
              <RelationshipTypeStylePreview type={{ id: connection.id, name: row.type.name, visualDefaults: row.style }} />
              <span className="connection-management-indicators" aria-label="Connection overrides">
                {row.hasVisualOverride && <span title="Local visual style override" aria-label="Local visual style override"><SlidersHorizontal size={11} /></span>}
                {row.hasAnnotationOverride && connection.annotation?.title && <span title="Title override" aria-label="Title override"><Type size={11} /></span>}
                {row.hasAnnotationOverride && connection.annotation?.body && <span title="Body override" aria-label="Body override"><FileText size={11} /></span>}
                {!connection.enabled && <span title="Inactive Connection" aria-label="Inactive Connection"><EyeOff size={11} /></span>}
              </span>
            </button>
            <button type="button" className="connection-locate-action" title="Locate on Canvas" aria-label={`Locate ${row.sourceName} to ${row.targetName} on Canvas`} onClick={() => { selectConnection(connection.id); setSelectionAnchorConnectionId(connection.id); locateConnection(connection.id); }}><Crosshair size={13} /></button>
          </article>;
        })}
        {filteredConnections.length > 0 && <div style={{ height: Math.max(0, (filteredConnections.length - visibleEnd) * CONNECTION_ROW_HEIGHT), pointerEvents: "none" }} aria-hidden="true" />}
        {filteredConnections.length === 0 && <div className="connection-management-empty"><strong>{connections.length === 0 ? "No Connections yet." : "No Connections match these filters."}</strong><span>{connections.length === 0 ? "Use C or the Quick Rail to create one." : "Reset filters to restore the full list."}</span>{connections.length > 0 && <button type="button" className="m1-btn" onClick={resetFilters}>Reset filters</button>}</div>}
      </div>
    </section>
  );
}

export default function ConnectionsWidget() {
  const [tab, setTab] = useState<ManagerTab>("types");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
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
  const duplicateProjectRelationshipType = useLab((state) => state.duplicateProjectRelationshipType);
  const updateProjectRelationshipTypeMetadata = useLab((state) => state.updateProjectRelationshipTypeMetadata);
  const setProjectRelationshipTypeArchived = useLab((state) => state.setProjectRelationshipTypeArchived);
  const deleteProjectRelationshipType = useLab((state) => state.deleteProjectRelationshipType);
  const resetFactoryRelationshipTypeDefaults = useLab((state) => state.resetFactoryRelationshipTypeDefaults);
  const setConnectionVisualScaleMode = useLab((state) => state.setConnectionVisualScaleMode);
  const openConnectionStyleEditor = useLab((state) => state.openConnectionStyleEditor);
  const connectionStyleClipboard = useLab((state) => state.connectionStyleClipboard);
  const copyRelationshipTypeStyle = useLab((state) => state.copyRelationshipTypeStyle);
  const pasteConnectionStyleToRelationshipType = useLab((state) => state.pasteConnectionStyleToRelationshipType);

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

  const duplicateType = (type: RelationshipTypeDefinition) => {
    const id = duplicateProjectRelationshipType(type.id);
    if (!id) {
      setActionMessage("Relationship Type could not be duplicated.");
      return;
    }
    setSelectedTypeId(id);
    setExpandedId(id);
    setActionMessage("Relationship Type duplicated as a project type.");
  };

  const isEditableTypeTarget = (target: EventTarget | null): boolean => {
    const element = target as HTMLElement | null;
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || Boolean(element?.isContentEditable);
  };

  const handleTypesKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!selectedTypeId || isEditableTypeTarget(event.target)) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "c") {
      event.preventDefault();
      copyRelationshipTypeStyle(selectedTypeId);
      setActionMessage("Relationship Type style copied.");
    } else if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "v" && connectionStyleClipboard) {
      event.preventDefault();
      if (pasteConnectionStyleToRelationshipType(selectedTypeId)) setActionMessage("Relationship Type style pasted.");
    }
  };

  const renderRow = (type: RelationshipTypeDefinition) => {
    const usageCount = getRelationshipTypeUsageCount(connectionIndex, type.id);
    const expanded = expandedId === type.id;
    const selected = selectedTypeId === type.id;
    const editing = editor?.mode === "edit" && editor.typeId === type.id;
    const pendingHere = pending?.typeId === type.id;
    return (
      <article
        key={type.id}
        className="relationship-type-row"
        data-selected={selected ? "true" : undefined}
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
              setSelectedTypeId(type.id);
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
            onClick={() => {
              setSelectedTypeId(type.id);
              type.origin === "project" ? openEdit(type) : setExpandedId(expanded ? null : type.id);
            }}
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
              {selected && <>
                <button type="button" className="m1-btn" title="Duplicate Relationship Type" aria-label="Duplicate Relationship Type" onClick={() => duplicateType(type)}><Copy size={11} /> Duplicate</button>
                <button type="button" className="m1-btn" title="Copy Relationship Type style" aria-label="Copy Relationship Type style" onClick={() => { copyRelationshipTypeStyle(type.id); setActionMessage("Relationship Type style copied."); }}><Clipboard size={11} /> Copy Style</button>
                <button type="button" className="m1-btn" title="Paste visual style to Relationship Type" aria-label="Paste visual style to Relationship Type" disabled={!connectionStyleClipboard} onClick={() => { if (pasteConnectionStyleToRelationshipType(type.id)) setActionMessage("Relationship Type style pasted."); }}><Clipboard size={11} /> Paste Style</button>
              </>}
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

      {tab === "types" ? <section className="relationship-manager-types" role="tabpanel" aria-label="Relationship Types" data-connection-shortcut="ignore" tabIndex={0} onKeyDown={handleTypesKeyDown}>
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
      </section> : <ConnectionManagementTab />}
    </div>
  );
}
