import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Copy,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  type TextAppearanceOverride,
  type TextStylePresetId,
} from "../../domain/presentation/types";
import {
  APPEARANCE_FAMILIES,
  appearanceFamilyDefinition,
  appearanceFamilyForTarget,
  inheritanceStateLabel,
  resolveFamilyInheritanceState,
  resolveInheritanceState,
  TEXT_STYLE_PRESETS,
} from "../../domain/presentation/editing";
import { cloneProjectPresentationDefaults } from "../../domain/presentation/validation";
import { useLab } from "../../state/store";
import type { SpaceCell } from "../../types";
import { getAreaRange, getNucleusColor } from "../../design/colorMapping";
import { ChipRow, SliderRow, SwitchRow } from "./controls";
import {
  beginContentEdit,
  changeContentEdit,
  resolveContentEditBlur,
  resolveContentEditKey,
  type ContentEditResolution,
} from "../../interaction/contentEditSession";
import SymbolInspectorPane from "./SymbolInspectorPane";
import LabelLayoutPane from "./LabelLayoutPane";
import { mergeCellLabelConfig } from "../../domain/labels/layoutContract";
import {
  clearConnectionAnnotationPlacementOverrides,
  mergeConnectionAnnotationPresentationOverride,
  resolveConnectionAnnotation,
} from "../../domain/connections/annotations";
import { getSelectableRelationshipTypes, resolveRelationshipType } from "../../domain/connections/relationshipTypes";
import { getPrimarySelectedConnection } from "../../domain/connections/selectors";
import {
  resolveConnectionStylePreview,
  resolveRelationshipTypeStylePreview,
} from "../../domain/connections/styles";
import type {
  ConnectionAnnotationOverride,
  ConnectionAnnotationPresentationOverride,
} from "../../domain/graph/types";
import {
  recordRelationshipTypeUse,
  RelationshipTypePicker,
  RelationshipTypeStylePreview,
} from "../RelationshipTypePicker";
import { ConnectionAnnotationContentControls } from "./ConnectionAnnotationControls";

type TabId = "content" | "appearance" | "symbol";

const common = <T,>(values: readonly T[]): { value: T | undefined; mixed: boolean } => {
  if (!values.length) return { value: undefined, mixed: false };
  const first = JSON.stringify(values[0]);
  return { value: values[0], mixed: values.some((value) => JSON.stringify(value) !== first) };
};

function ContentField({ label, field, spaces }: {
  label: string;
  field: "spaceCode" | "name" | "area" | "body";
  spaces: readonly SpaceCell[];
}) {
  const commitSpaceContent = useLab((state) => state.commitSpaceContent);
  const updateSpace = useLab((state) => state.updateSpace);
  const values = spaces.map((space) => field === "body" ? space.body ?? "" : space[field] ?? "");
  const shared = common(values);
  const canonical = shared.mixed ? "" : String(shared.value ?? "");
  const [draft, setDraft] = useState(canonical);
  const session = useRef(beginContentEdit(canonical));
  useEffect(() => {
    session.current = beginContentEdit(canonical);
    setDraft(canonical);
  }, [canonical, field]);

  const commit = (value: string) => {
    if (!spaces.length || (shared.mixed && value === "")) return;
    if (field === "spaceCode") {
      spaces.forEach((space) => updateSpace(space.id, { spaceCode: value }));
    } else if (field === "area") {
      const area = Number.parseFloat(value);
      if (Number.isFinite(area)) commitSpaceContent(spaces.map((space) => space.id), { area: Math.max(1, area) });
    } else {
      commitSpaceContent(spaces.map((space) => space.id), { [field]: value });
    }
  };
  const apply = (result: ContentEditResolution) => {
    session.current = result.session;
    if (result.action.kind === "cancel") setDraft(result.action.value);
    if (result.action.kind === "commit") commit(result.action.value);
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const result = resolveContentEditKey(session.current, {
      key: event.key,
      shiftKey: event.shiftKey,
      multiline: field === "body",
    });
    if (result.action.kind === "commit") event.preventDefault();
    apply(result);
    if (result.blur) event.currentTarget.blur();
  };
  const props = {
    value: draft,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      session.current = changeContentEdit(session.current, event.target.value);
      setDraft(session.current.draft);
    },
    onBlur: () => apply(resolveContentEditBlur(session.current)),
    onKeyDown: keyDown,
    placeholder: shared.mixed ? "Mixed" : undefined,
    "aria-label": label,
  };
  return (
    <label className="m1-field">
      <span>{label}{shared.mixed && <i>Mixed</i>}</span>
      {field === "body"
        ? <textarea {...props} rows={3} />
        : <input {...props} type={field === "area" ? "number" : "text"} min={field === "area" ? 1 : undefined} />}
    </label>
  );
}

function ConnectionPresentationNumberField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const parsed = Number.parseFloat(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    onCommit(Math.min(max, Math.max(min, parsed)));
  };
  return <label className="m1-field connection-placement-number">
    <span>{label}{suffix && <i>{suffix}</i>}</span>
    <input
      type="number"
      aria-label={label}
      value={draft}
      min={min}
      max={max}
      step={step}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setDraft(String(value));
          event.currentTarget.blur();
        } else if (event.key === "Enter") {
          event.preventDefault();
          commit();
          event.currentTarget.blur();
        }
      }}
    />
  </label>;
}

function ConnectionInspector({ connectionId }: { connectionId: string }) {
  const connection = useLab((state) => getPrimarySelectedConnection(state.connections, connectionId));
  const source = useLab((state) => state.spaces.find((space) => space.id === connection?.fromSpaceId));
  const target = useLab((state) => state.spaces.find((space) => space.id === connection?.toSpaceId));
  const updateConnectionSemantic = useLab((state) => state.updateConnectionSemantic);
  const updateConnectionAnnotation = useLab((state) => state.updateConnectionAnnotation);
  const updateConnectionAnnotationPresentation = useLab((state) => state.updateConnectionAnnotationPresentation);
  const reverseConnection = useLab((state) => state.reverseConnection);
  const deleteConnection = useLab((state) => state.deleteConnection);
  const openConnectionStyleEditor = useLab((state) => state.openConnectionStyleEditor);
  const projectRelationshipTypes = useLab((state) => state.settings.projectRelationshipTypes);
  const connectionStyles = useLab((state) => state.settings.connectionStyles);
  const connectionStylePreview = useLab((state) => state.connectionStyleEditorPreview);
  const theme = useLab((state) => state.theme);
  if (!connection) return <CellInspector />;

  const typeOptions = getSelectableRelationshipTypes(projectRelationshipTypes, connectionStyles).map((type) => ({
    ...type,
    visualDefaults: resolveRelationshipTypeStylePreview(type.id, type.visualDefaults, connectionStylePreview),
  }));
  const relationshipType = resolveRelationshipType(connection.semantic.typeId, projectRelationshipTypes, connectionStyles);
  const selectedTypeId = typeOptions.some((type) => type.id === connection.semantic.typeId)
    ? connection.semantic.typeId
    : "custom";
  const annotation = resolveConnectionAnnotation(connection, relationshipType);
  const style = resolveConnectionStylePreview(
    connection,
    connectionStyles,
    projectRelationshipTypes,
    connectionStylePreview,
  );
  const commitAnnotation = (patch: ConnectionAnnotationOverride) => {
    updateConnectionAnnotation(connection.id, { ...connection.annotation, ...patch });
  };
  const presentation = style.annotationPresentation;
  const commitPresentation = (patch: ConnectionAnnotationPresentationOverride) => {
    updateConnectionAnnotationPresentation(
      connection.id,
      mergeConnectionAnnotationPresentationOverride(connection.annotationPresentation, patch) ?? null,
    );
  };

  return (
    <div className="m1-inspector connection-inspector">
      <div className="m1-context">
        <span className="m1-signal" data-selected="true" />
        <div>
          <small>CONNECTION</small>
          <strong>{source?.name ?? "Missing Cell"} → {target?.name ?? "Missing Cell"}</strong>
        </div>
      </div>

      <div className="m1-pane">
        <section className="m1-section">
          <h3>TYPE</h3>
          <label className="m1-field">
            <span>Relationship Type</span>
            <RelationshipTypePicker
              direction="down"
              label="Relationship Type"
              options={typeOptions}
              value={selectedTypeId}
              onChange={(typeId) => {
                if (updateConnectionSemantic(connection.id, { typeId })) {
                  recordRelationshipTypeUse(typeId);
                }
              }}
            />
          </label>
        </section>

        <section className="m1-section">
          <h3>TEXT</h3>
          <ConnectionAnnotationContentControls
            annotation={annotation}
            relationshipTypeName={relationshipType.name}
            onChange={commitAnnotation}
          />
        </section>

        <details className="m1-section connection-placement-section">
          <summary><span>PLACEMENT</span><i>{connection.annotationPresentation ? "Local" : "Inherited"}</i></summary>
          <div className="connection-placement-body">
            <div className="connection-placement-control">
              <span>Path Position</span>
              <div className="connection-segmented-control" role="group" aria-label="Annotation path position">
                {([
                  ["Start", 0.25],
                  ["Center", 0.5],
                  ["End", 0.75],
                ] as const).map(([label, value]) => <button
                  key={label}
                  type="button"
                  data-active={Math.abs(presentation.placement.pathPosition - value) < 0.001 ? "true" : undefined}
                  aria-pressed={Math.abs(presentation.placement.pathPosition - value) < 0.001}
                  onClick={() => commitPresentation({ placement: { pathPosition: value } })}
                >{label}</button>)}
              </div>
            </div>
            <div className="connection-placement-control">
              <span>Side</span>
              <div className="connection-segmented-control" role="group" aria-label="Annotation side">
                {([
                  ["Auto", "auto"],
                  ["Side A", "a"],
                  ["Side B", "b"],
                ] as const).map(([label, value]) => <button
                  key={value}
                  type="button"
                  title={label}
                  data-active={presentation.placement.side === value ? "true" : undefined}
                  aria-pressed={presentation.placement.side === value}
                  onClick={() => commitPresentation({ placement: { side: value } })}
                >{value === "auto" ? <Sparkles size={10} /> : value === "a" ? <ArrowUp size={10} /> : <ArrowDown size={10} />}<span>{label}</span></button>)}
              </div>
            </div>
            <ConnectionPresentationNumberField
              label="Offset"
              value={presentation.placement.offset}
              min={0}
              max={120}
              suffix="px"
              onCommit={(offset) => commitPresentation({ placement: { offset } })}
            />
            <ConnectionPresentationNumberField
              label="Max Width"
              value={presentation.placement.maxWidth}
              min={100}
              max={360}
              suffix="px"
              onCommit={(maxWidth) => commitPresentation({ placement: { maxWidth } })}
            />
            <div className="connection-placement-control">
              <span>Alignment</span>
              <div className="connection-segmented-control" role="group" aria-label="Annotation alignment">
                {(["left", "center", "right"] as const).map((alignment) => {
                  const label = alignment === "left" ? "Align Left" : alignment === "center" ? "Align Center" : "Align Right";
                  const Icon = alignment === "left" ? AlignLeft : alignment === "center" ? AlignCenter : AlignRight;
                  return (
                    <button
                      key={alignment}
                      type="button"
                      title={label}
                      aria-label={label}
                      data-tooltip={label}
                      data-active={presentation.placement.alignment === alignment ? "true" : undefined}
                      aria-pressed={presentation.placement.alignment === alignment}
                      onClick={() => commitPresentation({ placement: { alignment } })}
                    >
                      <Icon size={16} strokeWidth={2.0} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="connection-placement-box-heading">BOX</div>
            <label className="m1-colour-row">
              <span>Background color</span>
              <input
                type="color"
                aria-label="Annotation background color"
                value={presentation.plate.backgroundColor === "auto"
                  ? theme === "night" ? "#16181b" : "#faf9f6"
                  : presentation.plate.backgroundColor}
                onChange={(event) => commitPresentation({ plate: { backgroundColor: event.target.value } })}
              />
            </label>
            <ConnectionPresentationNumberField
              label="Background opacity"
              value={Math.round(presentation.plate.backgroundOpacity * 100)}
              min={0}
              max={100}
              suffix="%"
              onCommit={(backgroundOpacity) => commitPresentation({ plate: { backgroundOpacity: backgroundOpacity / 100 } })}
            />
            <ConnectionPresentationNumberField
              label="Corner radius"
              value={presentation.plate.cornerRadius}
              min={0}
              max={24}
              suffix="px"
              onCommit={(cornerRadius) => commitPresentation({ plate: { cornerRadius } })}
            />
            <ConnectionPresentationNumberField
              label="Padding"
              value={(presentation.plate.paddingX + presentation.plate.paddingY) / 2}
              min={0}
              max={24}
              suffix="px"
              onCommit={(padding) => commitPresentation({ plate: { paddingX: padding, paddingY: padding } })}
            />
            <button
              type="button"
              className="m1-btn"
              onClick={() => updateConnectionAnnotationPresentation(
                connection.id,
                clearConnectionAnnotationPlacementOverrides(connection.annotationPresentation) ?? null,
              )}
            ><RotateCcw size={11} /> Reset Placement</button>
          </div>
        </details>

        <section className="m1-section">
          <h3>STYLE</h3>
          <RelationshipTypeStylePreview type={{
            id: connection.id,
            name: "Connection",
            visualDefaults: style,
          }} />
          <p className="connection-style-origin">{connection.visual ? "Custom appearance" : "Relationship Type"}</p>
          <button
            type="button"
            className="m1-btn"
            onClick={() => openConnectionStyleEditor({ context: "connection-override", connectionIds: [connection.id] })}
          ><SlidersHorizontal size={11} /> Edit Style</button>
        </section>

        <section className="m1-section">
          <div className="m1-action-grid">
            <button type="button" className="m1-btn" onClick={() => reverseConnection(connection.id)}><RotateCcw size={11} /> Reverse</button>
            <button type="button" className="m1-btn connection-delete" onClick={() => deleteConnection(connection.id)}><Trash2 size={11} /> Delete Connection</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ConnectionMultiInspector({ count }: { count: number }) {
  const connections = useLab((state) => state.connections);
  const selectedConnectionIds = useLab((state) => state.selectedConnectionIds);
  const projectRelationshipTypes = useLab((state) => state.settings.projectRelationshipTypes);
  const connectionStyles = useLab((state) => state.settings.connectionStyles);
  const connectionStylePreview = useLab((state) => state.connectionStyleEditorPreview);
  const updateSelectedConnectionTypes = useLab((state) => state.updateSelectedConnectionTypes);
  const openConnectionStyleEditor = useLab((state) => state.openConnectionStyleEditor);
  const deleteSelectedConnections = useLab((state) => state.deleteSelectedConnections);
  const selectedConnections = connections.filter((connection) => selectedConnectionIds.includes(connection.id));
  const typeOptions = getSelectableRelationshipTypes(projectRelationshipTypes, connectionStyles).map((type) => ({
    ...type,
    visualDefaults: resolveRelationshipTypeStylePreview(type.id, type.visualDefaults, connectionStylePreview),
  }));
  const selectedStyles = selectedConnections.map((connection) => resolveConnectionStylePreview(
    connection,
    connectionStyles,
    projectRelationshipTypes,
    connectionStylePreview,
  ));
  const typeSelection = common(selectedConnections.map((connection) => connection.semantic.typeId));
  const selectedTypeId = !typeSelection.mixed && typeOptions.some((type) => type.id === typeSelection.value)
    ? typeSelection.value ?? "custom"
    : "";
  return (
    <div className="m1-inspector connection-inspector">
      <div className="m1-context">
        <span className="m1-signal" data-selected="true" />
        <div>
          <small>CONNECTIONS</small>
          <strong>{count} Connections selected</strong>
        </div>
      </div>
      <div className="m1-pane">
        <section className="m1-section">
          <h3>TYPE</h3>
          <label className="m1-field">
            <span>Relationship Type</span>
            <RelationshipTypePicker
              direction="down"
              label="Relationship Type for selected Connections"
              options={typeOptions}
              value={selectedTypeId}
              placeholder={typeSelection.mixed ? "Mixed" : "Custom"}
              onChange={(typeId) => {
                if (updateSelectedConnectionTypes(typeId) > 0) {
                  recordRelationshipTypeUse(typeId);
                }
              }}
            />
          </label>
        </section>
        <section className="m1-section">
          <h3>STYLE</h3>
          <div className="connection-multi-style-previews">
            {selectedStyles.slice(0, 3).map((style, index) => <RelationshipTypeStylePreview
              key={selectedConnections[index]?.id}
              type={{
                id: selectedConnections[index]?.id ?? `selected-${index}`,
                name: `Selected Connection ${index + 1}`,
                visualDefaults: style,
              }}
            />)}
          </div>
          <p className="connection-style-origin">{selectedStyles.length > 1 ? "Mixed values remain independent until touched" : "Resolved style"}</p>
          <button
            type="button"
            className="m1-btn"
            onClick={() => openConnectionStyleEditor({
              context: "connection-override",
              connectionIds: [...selectedConnectionIds],
            })}
          ><SlidersHorizontal size={11} /> Edit Style</button>
        </section>
        <section className="m1-section">
          <p className="m1-empty-note">Type, Style Paste, and Delete apply to the complete selection.</p>
          <button
            type="button"
            className="m1-btn connection-delete"
            onClick={deleteSelectedConnections}
          >
            <Trash2 size={11} /> Delete {count} Connections
          </button>
        </section>
      </div>
    </div>
  );
}

function ConnectionModeInspector() {
  const typeId = useLab((state) => state.connectionModeTypeId);
  const projectRelationshipTypes = useLab((state) => state.settings.projectRelationshipTypes);
  const connectionStyles = useLab((state) => state.settings.connectionStyles);
  const connectionStylePreview = useLab((state) => state.connectionStyleEditorPreview);
  const relationshipType = resolveRelationshipType(typeId, projectRelationshipTypes, connectionStyles);
  const style = resolveRelationshipTypeStylePreview(
    relationshipType.id,
    relationshipType.visualDefaults,
    connectionStylePreview,
  );

  return (
    <div className="m1-inspector connection-inspector">
      <div className="m1-context">
        <span className="m1-signal" data-selected="true" />
        <div>
          <small>CONNECTION</small>
          <strong>Connection Mode Active</strong>
        </div>
      </div>
      <div className="m1-pane">
        <section className="m1-section">
          <p className="m1-empty-note">Draw from a Cell/port to create a Connection.</p>
        </section>
        <section className="m1-section">
          <h3>TYPE</h3>
          <RelationshipTypeStylePreview type={{
            ...relationshipType,
            visualDefaults: style,
          }} />
          <p className="connection-style-origin">{relationshipType.name}</p>
        </section>
      </div>
    </div>
  );
}

function CellInspector() {
  const [tab, setTab] = useState<TabId>("content");
  const spaces = useLab((state) => state.appearancePreview ?? state.spaces);
  const selectedIds = useLab((state) => state.selectedIds);
  const primarySelectedId = useLab((state) => state.primarySelectedId);
  const defaults = useLab((state) => state.presentationDefaultsPreview ?? state.settings.presentationDefaults);
  const activeTarget = useLab((state) => state.activeAppearanceTarget);
  const paletteMode = useLab((state) => state.settings.paletteMode);
  const nucleusPaletteId = useLab((state) => state.settings.nucleusPaletteId);
  const colorSource = useLab((state) => state.settings.colorSource);
  const clipboard = useLab((state) => state.styleClipboard);
  const setActiveTarget = useLab((state) => state.setActiveAppearanceTarget);
  const commitText = useLab((state) => state.commitTextAppearancePatch);
  const previewText = useLab((state) => state.previewTextAppearancePatch);
  const commitAppearancePreview = useLab((state) => state.commitAppearancePreview);
  const cancelAppearancePreview = useLab((state) => state.cancelAppearancePreview);
  const resetTarget = useLab((state) => state.resetAppearanceTarget);
  const resetFamily = useLab((state) => state.resetAppearanceFamily);
  const resetAll = useLab((state) => state.resetAllAppearance);
  const copyStyle = useLab((state) => state.copyStyle);
  const pasteStyle = useLab((state) => state.pasteStyle);
  const openWidget = useLab((state) => state.openWidget);
  const commitProjectDefaults = useLab((state) => state.commitProjectPresentationDefaults);
  const previewProjectDefaults = useLab((state) => state.previewProjectPresentationDefaults);
  const commitDefaultsPreview = useLab((state) => state.commitPresentationDefaultsPreview);
  const cancelDefaultsPreview = useLab((state) => state.cancelPresentationDefaultsPreview);
  const selected = useMemo(() => spaces.filter((space) => selectedIds.includes(space.id)), [selectedIds, spaces]);
  const contextLabel = selected.length === 0
    ? "Project Defaults"
    : selected.length === 1
      ? selected[0].name
      : `${selected.length} Cells`;
  const contextKind = selected.length > 1
    ? "MULTI SELECTION"
    : selected.length === 1
      ? selected[0].kind === "void" ? "VOID" : "CELL"
      : "SCOPE";
  const textValues = selected.length ? selected.map((space) => ({
    preset: space.appearance?.text?.preset ?? defaults.text.preset,
    size: space.appearance?.text?.size ?? defaults.text.size,
    colourMode: space.appearance?.text?.colourMode ?? defaults.text.colourMode,
    colour: space.appearance?.text?.colour ?? defaults.text.colour,
  })) : [defaults.text];
  const preset = common(textValues.map((value) => value.preset));
  const size = common(textValues.map((value) => value.size));
  const colourMode = common(textValues.map((value) => value.colourMode));
  const colour = common(textValues.map((value) => value.colour));
  const textState = selected.length ? resolveInheritanceState(selected.map((space) => space.appearance), "text") : "project-default";
  const activeFamily = appearanceFamilyForTarget(activeTarget);
  const familyDefinition = appearanceFamilyDefinition(activeFamily);
  const sharedProjectTarget = activeFamily === "membrane";
  const familyState = selected.length
    ? resolveFamilyInheritanceState(selected.map((space) => space.appearance), activeFamily)
    : "project-default";
  const inspectorState = tab === "content" ? textState : tab === "appearance" ? familyState : "project-default";
  const paletteReference = selected[0] ?? spaces.find((space) => space.kind !== "void");
  const projectColour = paletteReference
    ? getNucleusColor(paletteReference, paletteMode, getAreaRange(spaces), nucleusPaletteId, colorSource)
    : null;
  const textSwatches = [...new Set([
    defaults.text.colour,
    projectColour?.fill,
    projectColour?.ring,
    projectColour?.muted,
    "#171715",
    "#f7f6f2",
  ].filter((value): value is string => Boolean(value && /^#[0-9a-f]{6}$/i.test(value))))];

  const mergedTextDefaults = (patch: Partial<TextAppearanceOverride>) => {
    const next = cloneProjectPresentationDefaults(defaults);
    next.text = {
      ...next.text,
      ...patch,
      labels: patch.labels !== undefined
        ? mergeCellLabelConfig(next.text.labels, patch.labels) ?? {}
        : next.text.labels,
    };
    return next;
  };
  const applyText = (patch: Partial<TextAppearanceOverride>) => {
    if (selected.length) commitText(selectedIds, patch);
    else commitProjectDefaults(mergedTextDefaults(patch));
  };
  const previewTextSetting = (patch: Partial<TextAppearanceOverride>) => {
    if (selected.length) previewText(selectedIds, patch);
    else previewProjectDefaults(mergedTextDefaults(patch));
  };

  return (
    <div className="m1-inspector">
      <div className="m1-context">
        <span className="m1-signal" data-selected={selected.length ? "true" : "false"} />
        <div><small>{contextKind}</small><strong>{contextLabel}</strong></div>
        <span className="m1-state-badge" data-state={inspectorState}>{inheritanceStateLabel(inspectorState)}</span>
      </div>
      <div className="m1-tabs" role="tablist" aria-label="Inspector sections">
        {(["content", "appearance", "symbol"] as const).map((id) => <button key={id} type="button" role="tab" aria-selected={tab === id} data-active={tab === id} onClick={() => setTab(id)}>{id}</button>)}
      </div>

      {tab === "symbol" ? <SymbolInspectorPane /> : tab === "content" ? <div className="m1-pane" role="tabpanel">
        {selected.length ? <section className="m1-section">
          <h3>Architectural content</h3>
          <ContentField label="No." field="spaceCode" spaces={selected} />
          <ContentField label="Space Name" field="name" spaces={selected} />
          <ContentField label="Area · m²" field="area" spaces={selected} />
          <ContentField label="Body / subtext" field="body" spaces={selected} />
        </section> : <p className="m1-empty-note">Select one or more Cells to edit Name, Area and Body. Typography below edits Project Defaults.</p>}

        <section className="m1-section">
          <div className="m1-section-title"><h3>Text system</h3><span className="m1-state-badge" data-state={textState}>{inheritanceStateLabel(textState)}</span></div>
          <ChipRow options={TEXT_STYLE_PRESETS.map(({ id, label }) => ({ id, label }))} value={(preset.value ?? defaults.text.preset) as TextStylePresetId} onChange={(value) => applyText({ preset: value })} ariaLabel="Text Style preset" />
          {preset.mixed && <p className="m1-mixed-note">Text Style · Mixed</p>}
          <SliderRow label={`Text Size${size.mixed ? " · Mixed" : ""}`} value={size.value ?? defaults.text.size} min={0.65} max={1.8} step={0.05} fmt={(value) => `${Math.round(value * 100)}%`} onChange={(value) => previewTextSetting({ size: value })} onChangeEnd={selected.length ? commitAppearancePreview : commitDefaultsPreview} onChangeCancel={selected.length ? cancelAppearancePreview : cancelDefaultsPreview} />
          <SwitchRow label={colourMode.mixed ? "Auto Contrast · Mixed" : "Auto Contrast"} on={colourMode.value !== "custom"} onToggle={() => applyText({ colourMode: colourMode.value === "custom" ? "auto" : "custom" })} />
          <label className="m1-colour-row">
            <span>Text Colour{colour.mixed ? " · Mixed" : ""}</span>
            <input type="color" value={colour.value ?? defaults.text.colour} aria-label="Text Colour" disabled={colourMode.value !== "custom"} onChange={(event) => applyText({ colourMode: "custom", colour: event.target.value })} />
          </label>
          <div className="m1-swatch-row" aria-label="Current project palette text colours">
            {textSwatches.map((swatch) => <button key={swatch} type="button" title={swatch} aria-label={`Use text colour ${swatch}`} style={{ background: swatch }} data-active={colour.value === swatch} onClick={() => applyText({ colourMode: "custom", colour: swatch })} />)}
          </div>
          {selected.length > 0 && <button type="button" className="m1-link-btn" onClick={() => resetTarget(selectedIds, "text")}><RotateCcw size={11} /> Return text to Project Default</button>}
        </section>

        <LabelLayoutPane
          selected={selected}
          defaults={defaults}
          apply={(labels) => applyText({ labels })}
          preview={(labels) => previewTextSetting({ labels })}
          onPreviewEnd={selected.length ? commitAppearancePreview : commitDefaultsPreview}
          onPreviewCancel={selected.length ? cancelAppearancePreview : cancelDefaultsPreview}
          applyGlobal={(labels) => commitProjectDefaults(mergedTextDefaults({ labels }))}
          previewGlobal={(labels) => previewProjectDefaults(mergedTextDefaults({ labels }))}
          onGlobalPreviewEnd={commitDefaultsPreview}
          onGlobalPreviewCancel={cancelDefaultsPreview}
        />
      </div> : <div className="m1-pane" role="tabpanel">
        <section className="m1-section">
          <div className="m1-section-title"><h3>Appearance family</h3><span className="m1-state-badge" data-state={familyState}>{inheritanceStateLabel(familyState)}</span></div>
          <div className="m1-target-grid" role="radiogroup" aria-label="Appearance family">
            {APPEARANCE_FAMILIES.map((family) => <button key={family.id} type="button" role="radio" aria-checked={activeFamily === family.id} data-active={activeFamily === family.id} onClick={() => setActiveTarget(family.id)}><span className="m1-target-dot" data-target={family.id} />{family.label}</button>)}
          </div>
          <button type="button" className="m1-primary-btn" onClick={() => openWidget(familyDefinition.detailWidgetId)}><SlidersHorizontal size={12} /> Open {familyDefinition.label} Detail</button>
          {sharedProjectTarget && <p className="m1-compat-note">Membrane Field and Edge use Project Defaults for every Cell.</p>}
        </section>
        <section className="m1-section">
          <h3>Style actions</h3>
          <div className="m1-action-grid">
            <button type="button" className="m1-btn" disabled={!primarySelectedId} onClick={() => primarySelectedId && copyStyle(primarySelectedId)}><Copy size={11} /> Copy Style</button>
            <button type="button" className="m1-btn" disabled={!selected.length || !clipboard} onClick={() => pasteStyle(selectedIds)}><Sparkles size={11} /> Paste Style</button>
            <button type="button" className="m1-btn" disabled={!selected.length || sharedProjectTarget} onClick={() => resetFamily(selectedIds, activeFamily)}><RotateCcw size={11} /> {sharedProjectTarget ? "Shared Project Default" : "Reset Family"}</button>
            <button type="button" className="m1-btn" disabled={!selected.length} onClick={() => resetAll(selectedIds)}><RotateCcw size={11} /> Reset All Appearance</button>
          </div>
        </section>
        <p className="m1-empty-note">Selection is interaction state only. It is never copied, persisted or exported.</p>
      </div>}
    </div>
  );
}

export default function InspectorWidget() {
  const selectedConnectionIds = useLab((state) => state.selectedConnectionIds);
  const primarySelectedConnectionId = useLab((state) => state.primarySelectedConnectionId);
  const connectionModeActive = useLab((state) => state.connectionModeActive);
  if (selectedConnectionIds.length > 1) {
    return <ConnectionMultiInspector count={selectedConnectionIds.length} />;
  }
  const connectionId = primarySelectedConnectionId ?? selectedConnectionIds[0] ?? null;
  if (connectionId) return <ConnectionInspector connectionId={connectionId} />;
  if (connectionModeActive) return <ConnectionModeInspector />;
  return <CellInspector />;
}
