import { useMemo, type KeyboardEvent, type ReactNode } from "react";
import type {
  ConnectionGeometryId,
  ConnectionLineCap,
  ConnectionLineJoin,
  ConnectionMarkerId,
  ConnectionStrokePatternId,
} from "../../domain/graph/types";
import {
  CONNECTION_GEOMETRY_IDS,
  CONNECTION_MARKER_IDS,
} from "../../domain/connections/registry";
import {
  CONNECTION_STROKE_PATTERNS,
  resolveConnectionStrokePattern,
} from "../../domain/connections/strokePatterns";
import { getAllRelationshipTypes } from "../../domain/connections/relationshipTypes";
import {
  resolveConnectionStylePreview,
  type ConnectionStylePatch,
} from "../../domain/connections/styles";
import { useLab } from "../../state/store";
import {
  connectionStyleEnterTargetKind,
  resolveConnectionStyleEnterAction,
} from "../../interaction/connectionShortcut";
import {
  ConnectionGeometrySpecimen,
  ConnectionLineCapSpecimen,
  ConnectionLineJoinSpecimen,
  ConnectionMarkerSpecimen,
  ConnectionStrokeSpecimen,
  RelationshipTypeStylePreview,
} from "../RelationshipTypePicker";
import { SliderRow, WidgetSection } from "./controls";

const titleCase = (value: string): string => value
  .split("-")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

const common = <T,>(values: readonly T[]): { value: T | undefined; mixed: boolean } => {
  if (!values.length) return { value: undefined, mixed: false };
  const first = JSON.stringify(values[0]);
  return { value: values[0], mixed: values.some((value) => JSON.stringify(value) !== first) };
};

function MixedSlider({
  fmt,
  label,
  max,
  min,
  onChange,
  step,
  values,
}: {
  fmt: (value: number) => string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  values: readonly number[];
}) {
  const shared = common(values);
  if (shared.mixed || shared.value === undefined) {
    return <label className="m1-field connection-mixed-number">
      <span>{label}<i>Mixed</i></span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        defaultValue=""
        placeholder="Mixed — enter a value"
        aria-label={`${label}, mixed values`}
        onChange={(event) => {
          const value = event.currentTarget.valueAsNumber;
          if (Number.isFinite(value)) onChange(value);
        }}
      />
    </label>;
  }
  return <SliderRow
    label={label}
    value={shared.value}
    min={min}
    max={max}
    step={step}
    fmt={fmt}
    onChange={onChange}
  />;
}

function VisualOption<T extends string>({
  active,
  label,
  onChoose,
  specimen,
  value,
}: {
  active: boolean;
  label: string;
  onChoose: (value: T) => void;
  specimen: ReactNode;
  value: T;
}) {
  return <button
    type="button"
    className="connection-visual-option"
    data-connection-style-control="true"
    data-active={active ? "true" : undefined}
    aria-pressed={active}
    aria-label={label}
    title={label}
    onClick={() => onChoose(value)}
  >
    {specimen}
    <span>{label}</span>
  </button>;
}

export default function ConnectionStudioWidget() {
  const target = useLab((state) => state.connectionStyleEditorTarget);
  const preview = useLab((state) => state.connectionStyleEditorPreview);
  const connections = useLab((state) => state.connections);
  const spaces = useLab((state) => state.spaces);
  const connectionStyles = useLab((state) => state.settings.connectionStyles);
  const projectRelationshipTypes = useLab((state) => state.settings.projectRelationshipTypes);
  const previewConnectionStyleEditor = useLab((state) => state.previewConnectionStyleEditor);
  const commitConnectionStyleEditor = useLab((state) => state.commitConnectionStyleEditor);
  const cancelConnectionStyleEditor = useLab((state) => state.cancelConnectionStyleEditor);
  const closeWidget = useLab((state) => state.closeWidget);

  const active = useMemo(() => {
    if (!target || !preview) return null;
    if (target.context === "relationship-type") {
      const type = getAllRelationshipTypes(projectRelationshipTypes, connectionStyles)
        .find((candidate) => candidate.id === target.typeId);
      if (!type || preview.context !== "relationship-type") return null;
      return {
        key: `relationship-type:${type.id}`,
        name: type.name,
        scope: "Relationship Type defaults",
        styles: [preview.style],
      };
    }
    if (preview.context !== "connection-override") return null;
    const targets = target.connectionIds
      .map((id) => connections.find((connection) => connection.id === id))
      .filter((connection): connection is NonNullable<typeof connection> => Boolean(connection));
    if (!targets.length) return null;
    const first = targets[0]!;
    const source = spaces.find((space) => space.id === first.fromSpaceId);
    const destination = spaces.find((space) => space.id === first.toSpaceId);
    return {
      key: `connection-override:${target.connectionIds.join(":")}`,
      name: targets.length === 1
        ? `${source?.name ?? "Missing Cell"} → ${destination?.name ?? "Missing Cell"}`
        : `${targets.length} Connections`,
      scope: targets.length === 1 ? "Connection override" : "Fixed multi-selection",
      styles: targets.map((connection) => resolveConnectionStylePreview(
        connection,
        connectionStyles,
        projectRelationshipTypes,
        preview,
      )),
    };
  }, [connectionStyles, connections, preview, projectRelationshipTypes, spaces, target]);

  if (!active || !target) {
    return <div className="connection-studio-shell">
      <section className="m1-section">
        <h3>Connection Style</h3>
        <p className="m1-empty-note">Choose Edit Style from a Relationship Type or selected Connections.</p>
      </section>
    </div>;
  }

  const styles = active.styles;
  const representative = styles[0]!;
  const geometry = common(styles.map((style) => style.geometryId));
  const stroke = common(styles.map((style) => style.strokePatternId));
  const lineCap = common(styles.map((style) => style.lineCap));
  const lineJoin = common(styles.map((style) => style.lineJoin));
  const startMarker = common(styles.map((style) => style.startMarkerId));
  const endMarker = common(styles.map((style) => style.endMarkerId));
  const colors = common(styles.map((style) => style.appearance.color));
  const patternScaleEnabled = styles.some((style) => resolveConnectionStrokePattern(style.strokePatternId).capabilities.scale);
  const patternAmplitudeEnabled = !stroke.mixed
    && stroke.value !== undefined
    && resolveConnectionStrokePattern(stroke.value).capabilities.amplitude;
  const markersEnabled = styles.some((style) => style.startMarkerId !== "none" || style.endMarkerId !== "none");
  const update = (patch: ConnectionStylePatch) => previewConnectionStyleEditor(patch);
  const apply = () => {
    commitConnectionStyleEditor();
    closeWidget("connection-studio");
  };
  const handleEnterApply = (event: KeyboardEvent<HTMLDivElement>) => {
    const openMenu = typeof document !== "undefined" && Boolean(document.querySelector(
      "[role='listbox'], [role='menu'], [data-radix-popper-content-wrapper]",
    ));
    if (resolveConnectionStyleEnterAction({
      key: event.key,
      defaultPrevented: event.defaultPrevented,
      isComposing: event.nativeEvent.isComposing,
      repeat: event.repeat,
      openMenu,
      targetKind: connectionStyleEnterTargetKind(event.target),
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
    }) !== "apply") return;
    event.preventDefault();
    event.stopPropagation();
    queueMicrotask(apply);
  };

  return <div className="connection-studio-shell" onKeyDown={handleEnterApply}>
    <section className="m1-section" aria-labelledby="connection-studio-title">
      <div className="m1-section-title">
        <h3 id="connection-studio-title">Connection Style</h3>
        <span className="m1-state-badge">Live draft</span>
      </div>
      <p className="connection-studio-type">{active.name}</p>
      <p className="connection-studio-scope"><span>Editing:</span> {active.scope}</p>
      <div className="connection-studio-previews">
        {styles.slice(0, 3).map((style, index) => <RelationshipTypeStylePreview
          key={`${active.key}:${index}`}
          type={{
            id: `${active.key}:${index}`,
            name: styles.length === 1 ? active.name : `Connection ${index + 1}`,
            visualDefaults: style,
          }}
        />)}
      </div>
      {styles.length > 1 && <p className="m1-empty-note">Mixed values remain independent. Only controls you touch will change.</p>}
    </section>

    <section className="m1-section">
      <div className="connection-control-heading"><h3>GEOMETRY</h3>{geometry.mixed && <span>Mixed</span>}</div>
      <div className="connection-visual-grid connection-visual-grid--geometry" role="group" aria-label="Connection geometry">
        {CONNECTION_GEOMETRY_IDS.map((id) => <VisualOption<ConnectionGeometryId>
          key={id}
          value={id}
          label={titleCase(id)}
          active={!geometry.mixed && geometry.value === id}
          onChoose={(geometryId) => update({ geometryId })}
          specimen={<ConnectionGeometrySpecimen geometryId={id} />}
        />)}
      </div>
      {styles.some((style) => style.geometryId === "curved") && <MixedSlider
        label="Curve"
        values={styles.map((style) => style.appearance.curve)}
        min={-2}
        max={2}
        step={0.05}
        fmt={(value) => value.toFixed(2)}
        onChange={(curve) => update({ appearance: { curve } })}
      />}
    </section>

    <section className="m1-section">
      <div className="connection-control-heading"><h3>STROKE</h3>{stroke.mixed && <span>Mixed</span>}</div>
      <div className="connection-visual-grid connection-visual-grid--stroke" role="group" aria-label="Stroke pattern">
        {CONNECTION_STROKE_PATTERNS.map((definition) => <VisualOption<ConnectionStrokePatternId>
          key={definition.id}
          value={definition.id}
          label={definition.name}
          active={!stroke.mixed && stroke.value === definition.id}
          onChoose={(strokePatternId) => update({ strokePatternId })}
          specimen={<ConnectionStrokeSpecimen style={{ ...representative, strokePatternId: definition.id }} />}
        />)}
      </div>
      <WidgetSection title="Line cap" hint={lineCap.mixed ? "Mixed" : "Endpoint finish"}>
        <div className="connection-cap-join-grid" role="group" aria-label="Line cap">
          {(["butt", "square", "round"] as const).map((value) => <VisualOption<ConnectionLineCap>
            key={value}
            value={value}
            label={`${titleCase(value)} line cap`}
            active={!lineCap.mixed && lineCap.value === value}
            onChoose={(nextLineCap) => update({ lineCap: nextLineCap })}
            specimen={<ConnectionLineCapSpecimen lineCap={value} />}
          />)}
        </div>
      </WidgetSection>
      <WidgetSection title="Line join" hint={lineJoin.mixed ? "Mixed" : "Corner finish"}>
        <div className="connection-cap-join-grid" role="group" aria-label="Line join">
          {(["miter", "bevel", "round"] as const).map((value) => <VisualOption<ConnectionLineJoin>
            key={value}
            value={value}
            label={`${titleCase(value)} line join`}
            active={!lineJoin.mixed && lineJoin.value === value}
            onChoose={(nextLineJoin) => update({ lineJoin: nextLineJoin })}
            specimen={<ConnectionLineJoinSpecimen lineJoin={value} />}
          />)}
        </div>
      </WidgetSection>
      <MixedSlider
        label="Width"
        values={styles.map((style) => style.appearance.width)}
        min={0.5}
        max={64}
        step={0.25}
        fmt={(value) => `${value.toFixed(2)} px`}
        onChange={(width) => update({ appearance: { width } })}
      />
      <MixedSlider
        label="Opacity"
        values={styles.map((style) => style.appearance.opacity)}
        min={0}
        max={1}
        step={0.01}
        fmt={(value) => `${Math.round(value * 100)}%`}
        onChange={(opacity) => update({ appearance: { opacity } })}
      />
      {colors.mixed ? <label className="m1-field connection-mixed-colour">
        <span>Color<i>Mixed</i></span>
        <input
          type="text"
          defaultValue=""
          placeholder="Mixed — enter #RRGGBB"
          aria-label="Connection color, mixed values"
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            const value = event.currentTarget.value.trim();
            if (/^#[0-9a-f]{6}$/i.test(value)) update({ appearance: { color: value } });
          }}
          onBlur={(event) => {
            const value = event.currentTarget.value.trim();
            if (/^#[0-9a-f]{6}$/i.test(value)) update({ appearance: { color: value } });
          }}
        />
      </label> : <label className="m1-colour-row">
        <span>Color</span>
        <input
          type="color"
          aria-label="Connection color"
          value={colors.value ?? representative.appearance.color}
          onChange={(event) => update({ appearance: { color: event.target.value } })}
        />
      </label>}
      {patternScaleEnabled && <MixedSlider
        label="Pattern scale"
        values={styles.map((style) => style.appearance.dashScale)}
        min={0.25}
        max={8}
        step={0.05}
        fmt={(value) => `${value.toFixed(2)}×`}
        onChange={(dashScale) => update({ appearance: { dashScale } })}
      />}
      {patternAmplitudeEnabled && <MixedSlider
        label="Pattern amplitude"
        values={styles.map((style) => style.appearance.patternAmplitude)}
        min={0.5}
        max={64}
        step={0.25}
        fmt={(value) => `${value.toFixed(2)} px`}
        onChange={(patternAmplitude) => update({ appearance: { patternAmplitude } })}
      />}
    </section>

    <section className="m1-section">
      <div className="connection-control-heading"><h3>MARKERS</h3>{(startMarker.mixed || endMarker.mixed) && <span>Mixed</span>}</div>
      <WidgetSection title="Start marker" hint={startMarker.mixed ? "Mixed" : "At source"}>
        <div className="connection-marker-grid" role="group" aria-label="Start marker">
          {CONNECTION_MARKER_IDS.map((id) => <VisualOption<ConnectionMarkerId>
            key={id}
            value={id}
            label={`${titleCase(id)} start marker`}
            active={!startMarker.mixed && startMarker.value === id}
            onChoose={(startMarkerId) => update({ startMarkerId })}
            specimen={<ConnectionMarkerSpecimen markerId={id} position="start" />}
          />)}
        </div>
      </WidgetSection>
      <WidgetSection title="End marker" hint={endMarker.mixed ? "Mixed" : "At destination"}>
        <div className="connection-marker-grid" role="group" aria-label="End marker">
          {CONNECTION_MARKER_IDS.map((id) => <VisualOption<ConnectionMarkerId>
            key={id}
            value={id}
            label={`${titleCase(id)} end marker`}
            active={!endMarker.mixed && endMarker.value === id}
            onChoose={(endMarkerId) => update({ endMarkerId })}
            specimen={<ConnectionMarkerSpecimen markerId={id} position="end" />}
          />)}
        </div>
      </WidgetSection>
      {markersEnabled && <WidgetSection title="Marker details" hint="Size and offset">
        <MixedSlider
          label="Marker size"
          values={styles.map((style) => style.appearance.markerSize)}
          min={2}
          max={64}
          step={0.5}
          fmt={(value) => `${value.toFixed(1)} px`}
          onChange={(markerSize) => update({ appearance: { markerSize } })}
        />
        <MixedSlider
          label="Marker offset"
          values={styles.map((style) => style.appearance.markerOffset)}
          min={-64}
          max={64}
          step={0.5}
          fmt={(value) => `${value.toFixed(1)} px`}
          onChange={(markerOffset) => update({ appearance: { markerOffset } })}
        />
      </WidgetSection>}
    </section>

    <section className="m1-section">
      <p className="m1-empty-note">Annotation appearance is deferred until the R4 annotation schema; this panel does not author Canvas annotations.</p>
      {target.context === "connection-override" && <button
        type="button"
        className="m1-btn"
        onClick={() => {
          commitConnectionStyleEditor(null);
          closeWidget("connection-studio");
        }}
      >Use Relationship Type Style{target.connectionIds.length > 1 ? "s" : ""}</button>}
      <div className="m1-action-grid">
        <button type="button" className="m1-btn" onClick={cancelConnectionStyleEditor}>Cancel</button>
        <button type="button" className="m1-primary-btn" onClick={apply}>
          Apply <span className="connection-apply-shortcut" aria-hidden="true">↵</span>
        </button>
      </div>
    </section>
  </div>;
}
