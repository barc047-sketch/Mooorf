import { resolveConnectionSemanticType } from "../../domain/connections/registry";
import { getPrimarySelectedConnection } from "../../domain/connections/selectors";
import { useLab } from "../../state/store";

export default function ConnectionStudioWidget() {
  const modeTypeId = useLab((state) => state.connectionModeTypeId);
  const selectedConnection = useLab((state) => getPrimarySelectedConnection(
    state.connections,
    state.primarySelectedConnectionId,
  ));
  const typeId = selectedConnection?.semantic.typeId ?? modeTypeId;
  const definition = resolveConnectionSemanticType(typeId);
  const scope = selectedConnection
    ? "This Connection"
    : `Type Default · ${definition.name}`;

  return (
    <div className="connection-studio-shell">
      <section className="m1-section" aria-labelledby="connection-studio-title">
        <div className="m1-section-title">
          <h3 id="connection-studio-title">Connection Studio</h3>
          <span className="m1-state-badge">Read only</span>
        </div>
        <p className="connection-studio-type">{definition.name}</p>
        <p className="connection-studio-scope"><span>Editing:</span> {scope}</p>
        <p className="m1-empty-note">
          Visual grammar controls arrive in the dedicated Studio task. This shell keeps scope explicit without changing project styles.
        </p>
      </section>
    </div>
  );
}
