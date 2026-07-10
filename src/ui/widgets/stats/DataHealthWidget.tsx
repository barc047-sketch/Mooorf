/* V7.1 Data Health — deterministic completeness and numeric reliability
   signals. It reuses current table/view and selection actions for remediation. */

import { useMemo } from "react";
import { useLab } from "../../../state/store";
import { selectDataHealth } from "../../../domain/stats/selectors";
import { formatCount, HealthSignal, InsightRow, MetricReadout } from "./primitives";

export default function DataHealthWidget() {
  const spaces = useLab((state) => state.spaces);
  const setView = useLab((state) => state.setView);
  const select = useLab((state) => state.select);
  const health = useMemo(() => selectDataHealth(spaces), [spaces]);
  const visibleSignals = health.signals.filter((signal) => signal.count > 0);

  const openTable = () => {
    if (health.firstAffectedId) select(health.firstAffectedId);
    setView("table");
  };

  return (
    <div className="pulse instrument-body pulse-health" data-health={health.status}>
      <div className="pulse-hero">
        <MetricReadout label="Data status" value={health.status.toUpperCase()} />
        <div className="pulse-side">
          <MetricReadout mini label="Issues" value={formatCount(health.totalIssueCount)} />
          <MetricReadout mini label="Affected" value={formatCount(health.affectedSpaceCount)} />
        </div>
      </div>

      {visibleSignals.length > 0 ? (
        <div className="pulse-health-list">
          {visibleSignals.map((signal) => (
            <HealthSignal
              key={signal.id}
              label={signal.label}
              detail={signal.detail}
              count={signal.count}
              severity={signal.severity}
            />
          ))}
        </div>
      ) : (
        <div className="pulse-health-clear">
          <span className="pulse-health-marker" aria-hidden="true" />
          <div>
            <span className="pulse-rank-name">{spaces.length ? "Program data is clear" : "No records to inspect"}</span>
            <span className="pulse-rank-meta">{spaces.length ? "No deterministic issues detected." : "Add spaces to begin the health pass."}</span>
          </div>
        </div>
      )}

      <div className="pulse-insights">
        <InsightRow k="Rule" v="Numeric blocks · metadata attends" />
      </div>
      <button type="button" className="instrument-action" onClick={openTable}>
        Open table
      </button>
    </div>
  );
}
