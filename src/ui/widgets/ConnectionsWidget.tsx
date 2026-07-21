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
import { useLab } from "../../state/store";

const directionLabel = (direction: string) => direction
  .split("-")
  .map((part) => part.length === 1 ? part.toUpperCase() : `${part[0]?.toUpperCase()}${part.slice(1)}`)
  .join(" ");

export default function ConnectionsWidget() {
  const [typeId, setTypeId] = useState<ConnectionSemanticTypeId>("adjacency");
  const connections = useLab((state) => state.connections);
  const spaces = useLab((state) => state.spaces);
  const selectedCellIds = useLab((state) => state.selectedIds);
  const selectedConnectionIds = useLab((state) => state.selectedConnectionIds);
  const authoring = useLab((state) => state.connectionAuthoring);
  const beginConnectionAuthoring = useLab((state) => state.beginConnectionAuthoring);
  const connectSelectedCells = useLab((state) => state.connectSelectedCells);
  const cancelConnectionAuthoring = useLab((state) => state.cancelConnectionAuthoring);
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
  const rows = useMemo(() => connections.map((connection) => ({
    connection,
    sourceName: spaceById.get(connection.fromSpaceId)?.name ?? "Missing Cell",
    targetName: spaceById.get(connection.toSpaceId)?.name ?? "Missing Cell",
    semantic: resolveConnectionSemanticType(connection.semantic.typeId),
  })), [connections, spaceById]);

  const openInspectorFor = (id: string) => {
    selectConnection(id);
    openWidget("inspector");
  };

  return (
    <div className="connections-widget">
      <section className="m1-section connections-create" aria-labelledby="connections-create-title">
        <div className="m1-section-title">
          <h3 id="connections-create-title">Create Connection</h3>
          <span className="m1-state-badge" data-state={authoringActive ? "local-override" : "project-default"}>
            {authoringActive ? "Picking" : "Ready"}
          </span>
        </div>
        <div className="connections-type-grid" role="radiogroup" aria-label="Relationship type">
          {CONNECTION_SEMANTIC_TYPES.map((definition) => {
            const descriptionId = `connection-type-${definition.id}-description`;
            return (
              <button
                key={definition.id}
                type="button"
                role="radio"
                aria-checked={typeId === definition.id}
                aria-describedby={descriptionId}
                data-active={typeId === definition.id}
                disabled={authoringActive}
                onClick={() => setTypeId(definition.id)}
              >
                <span>{definition.name}</span>
                <small id={descriptionId}>{definition.description}</small>
              </button>
            );
          })}
        </div>
        <div className="connections-actions">
          <button
            type="button"
            className="m1-primary-btn"
            disabled={authoringActive}
            title="Choose source and target Cells on Canvas"
            onClick={() => beginConnectionAuthoring(typeId)}
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
          {authoringActive && (
            <button
              type="button"
              className="m1-btn connections-cancel"
              aria-label="Cancel Connection authoring"
              onClick={cancelConnectionAuthoring}
            >
              <X size={12} strokeWidth={1.7} /> Cancel
            </button>
          )}
        </div>
        <p className="connections-status" role="status" aria-live="polite">
          {authoring.message}
        </p>
      </section>

      <section className="m1-section connections-existing" aria-labelledby="connections-existing-title">
        <div className="m1-section-title">
          <h3 id="connections-existing-title">Existing Connections</h3>
          <span className="m1-state-badge">{rows.length}</span>
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
      </section>
    </div>
  );
}
