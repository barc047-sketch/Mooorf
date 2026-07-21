import { useMemo, useState } from "react";
import { Check, Link2, X } from "lucide-react";
import {
  CONNECTION_SEMANTIC_TYPES,
  resolveConnectionSemanticType,
} from "../../domain/connections/registry";
import {
  isConnectionAuthoringActive,
  isValidConnectionEndpoint,
} from "../../domain/connections/model";
import type { ConnectionSemanticTypeId } from "../../domain/graph/types";
import {
  createDefaultConnectionFilterSpec,
  filterConnections,
} from "../../domain/connections/filters";
import { useLab } from "../../state/store";

const MANAGER_ROW_LIMIT = 120;

const directionLabel = (direction: string) => direction
  .split("-")
  .map((part) => part.length === 1 ? part.toUpperCase() : `${part[0]?.toUpperCase()}${part.slice(1)}`)
  .join(" ");

export default function ConnectionsWidget() {
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [requestedRowOffset, setRowOffset] = useState(0);
  const connections = useLab((state) => state.connections);
  const spaces = useLab((state) => state.spaces);
  const selectedCellIds = useLab((state) => state.selectedIds);
  const selectedConnectionIds = useLab((state) => state.selectedConnectionIds);
  const authoring = useLab((state) => state.connectionAuthoring);
  const connectionModeActive = useLab((state) => state.connectionModeActive);
  const typeId = useLab((state) => state.connectionModeTypeId);
  const setConnectionModeType = useLab((state) => state.setConnectionModeType);
  const enterConnectionMode = useLab((state) => state.enterConnectionMode);
  const chooseConnectionSource = useLab((state) => state.chooseConnectionSource);
  const completeConnectionAuthoring = useLab((state) => state.completeConnectionAuthoring);
  const connectSelectedCells = useLab((state) => state.connectSelectedCells);
  const cancelConnectionGesture = useLab((state) => state.cancelConnectionGesture);
  const selectConnection = useLab((state) => state.selectConnection);
  const openWidget = useLab((state) => state.openWidget);
  const authoringActive = isConnectionAuthoringActive(authoring);

  const spaceById = useMemo(
    () => new Map(spaces.map((space) => [space.id, space])),
    [spaces],
  );
  const selectedCells = useMemo(
    () => selectedCellIds.map((id) => spaceById.get(id)),
    [selectedCellIds, spaceById],
  );
  const canConnectSelected = selectedCells.length === 2 && selectedCells.every(isValidConnectionEndpoint);
  const filteredConnections = useMemo(() => filterConnections({
    connections,
    cellsById: new Map(spaces.map((space) => [space.id, {
      id: space.id,
      name: space.name,
      floorId: (space as typeof space & { floorId?: string }).floorId,
    }])),
    spec: createDefaultConnectionFilterSpec(),
  }), [connections, spaces]);
  const lastPageOffset = Math.max(0, Math.floor(Math.max(0, filteredConnections.length - 1) / MANAGER_ROW_LIMIT) * MANAGER_ROW_LIMIT);
  const rowOffset = Math.min(requestedRowOffset, lastPageOffset);
  const rows = useMemo(() => filteredConnections.slice(rowOffset, rowOffset + MANAGER_ROW_LIMIT).map((connection) => ({
    connection,
    sourceName: spaceById.get(connection.fromSpaceId)?.name ?? "Missing Cell",
    targetName: spaceById.get(connection.toSpaceId)?.name ?? "Missing Cell",
    semantic: resolveConnectionSemanticType(connection.semantic.typeId),
  })), [filteredConnections, rowOffset, spaceById]);
  const validSpaces = useMemo(() => spaces.filter(isValidConnectionEndpoint), [spaces]);
  const previousRows = Math.min(MANAGER_ROW_LIMIT, rowOffset);
  const remainingRows = Math.max(0, filteredConnections.length - rowOffset - MANAGER_ROW_LIMIT);

  const connectNativeEndpoints = () => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    enterConnectionMode(typeId);
    if (chooseConnectionSource(sourceId)) completeConnectionAuthoring(targetId);
  };

  const openInspectorFor = (id: string) => {
    selectConnection(id);
    openWidget("inspector");
  };

  return (
    <div className="connections-widget">
      <section className="m1-section connections-create" aria-labelledby="connections-create-title">
        <div className="m1-section-title">
          <h3 id="connections-create-title">Connections Manager</h3>
          <span className="m1-state-badge" data-state={connectionModeActive ? "local-override" : "project-default"}>
            {authoringActive ? "Picking" : connectionModeActive ? "Mode on" : "Ready"}
          </span>
        </div>
        <label className="connections-type-native">
          <span>Relationship type</span>
          <select
            value={typeId}
            onChange={(event) => setConnectionModeType(event.target.value as ConnectionSemanticTypeId)}
          >
            {CONNECTION_SEMANTIC_TYPES.map((definition) => (
              <option key={definition.id} value={definition.id}>{definition.name}</option>
            ))}
          </select>
        </label>
        <div className="connections-actions">
          <button
            type="button"
            className="m1-primary-btn"
            disabled={authoringActive}
            title="Choose source and target Cells on Canvas"
            onClick={() => enterConnectionMode(typeId)}
          >
            <Link2 size={12} strokeWidth={1.6} /> Connect Cells
          </button>
          <button
            type="button"
            className="m1-btn"
            disabled={!canConnectSelected || authoringActive}
            title={canConnectSelected ? "Connect the two selected Cells" : "Select exactly two non-Void Cells"}
            onClick={() => connectSelectedCells(typeId)}
          >
            <Check size={12} strokeWidth={1.7} /> Connect Selected
          </button>
          {connectionModeActive && authoringActive && (
            <button
              type="button"
              className="m1-btn connections-cancel"
              aria-label="Cancel Connection authoring"
              onClick={() => cancelConnectionGesture()}
            >
              <X size={12} strokeWidth={1.7} /> Cancel
            </button>
          )}
        </div>
        <div className="connections-native-fallback" aria-label="Accessible Connection endpoints">
          <label>
            Source Cell
            <select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
              <option value="">Choose source</option>
              {validSpaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}
            </select>
          </label>
          <label>
            Target Cell
            <select value={targetId} onChange={(event) => setTargetId(event.target.value)}>
              <option value="">Choose target</option>
              {validSpaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}
            </select>
          </label>
          <button
            type="button"
            className="m1-btn"
            disabled={!sourceId || !targetId || sourceId === targetId}
            onClick={connectNativeEndpoints}
          >
            Connect endpoints
          </button>
        </div>
        <p className="connections-status">
          {authoring.message}
        </p>
      </section>

      <section className="m1-section connections-existing" aria-labelledby="connections-existing-title">
        <div className="m1-section-title">
          <h3 id="connections-existing-title">Existing Connections</h3>
          <span className="m1-state-badge">{filteredConnections.length}</span>
        </div>
        <div className="connections-list" role="list" aria-label="Existing semantic Connections">
          {rows.length === 0 ? (
            <p className="m1-empty-note">No Connections yet. Choose a relationship type and connect two Cells.</p>
          ) : rows.map(({ connection, sourceName, targetName, semantic }) => (
            <div key={connection.id} role="listitem">
              <button
                type="button"
                className="connection-row"
                data-active={selectedConnectionIds.includes(connection.id)}
                aria-pressed={selectedConnectionIds.includes(connection.id)}
                onClick={() => openInspectorFor(connection.id)}
              >
                <span className="connection-row-endpoints">{sourceName} <i>→</i> {targetName}</span>
                <span className="connection-row-meta">
                  <b>{semantic.name}</b>
                  <i>{directionLabel(connection.semantic.direction)}</i>
                  <i>{connection.enabled ? "Enabled" : "Disabled"}</i>
                </span>
              </button>
            </div>
          ))}
        </div>
        {(previousRows > 0 || remainingRows > 0) && (
          <div className="connections-page-actions" aria-label="Connections pages">
            {previousRows > 0 && (
              <button
                type="button"
                className="m1-btn connections-show-more"
                onClick={() => setRowOffset(Math.max(0, rowOffset - MANAGER_ROW_LIMIT))}
              >
                Show previous {previousRows} Connections
              </button>
            )}
            {remainingRows > 0 && (
              <button
                type="button"
                className="m1-btn connections-show-more"
                onClick={() => setRowOffset(Math.min(lastPageOffset, rowOffset + MANAGER_ROW_LIMIT))}
              >
                Show next {Math.min(MANAGER_ROW_LIMIT, remainingRows)} Connections
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
