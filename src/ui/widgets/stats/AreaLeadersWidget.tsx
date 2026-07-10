/* V7.1 Area Leaders — selectable top-five ranking over valid additive spaces.
   Selection delegates to the existing store action; camera state is untouched. */

import { useMemo } from "react";
import { useLab } from "../../../state/store";
import { selectAreaLeaders } from "../../../domain/stats/selectors";
import { formatInt, MetricReadout, RankedMetricRow } from "./primitives";

export default function AreaLeadersWidget() {
  const spaces = useLab((state) => state.spaces);
  const selectedId = useLab((state) => state.selectedId);
  const select = useLab((state) => state.select);
  const ranking = useMemo(() => selectAreaLeaders(spaces, 5), [spaces]);

  return (
    <div className="pulse instrument-body">
      <div className="pulse-hero">
        <MetricReadout label="Programmed area" value={formatInt(ranking.programArea)} unit="m²" />
        <span className="instrument-context">Top 05 · voids excluded</span>
      </div>

      {ranking.leaders.length > 0 ? (
        <div className="pulse-ranking pulse-ranking--selectable">
          {ranking.leaders.map((leader, index) => (
            <RankedMetricRow
              key={leader.id}
              rank={index + 1}
              label={leader.name}
              meta={leader.categoryLabel}
              value={`${formatInt(leader.area)} m²`}
              share={leader.share}
              color={leader.categoryColor}
              selected={selectedId === leader.id}
              onClick={() => select(leader.id)}
            />
          ))}
        </div>
      ) : (
        <div className="pulse-empty instrument-empty">
          <span className="pulse-label">No valid leaders</span>
          <p>Add a program space with a positive area.</p>
          <span className="pulse-empty-hint">Void and invalid records are excluded from ranking.</span>
        </div>
      )}
    </div>
  );
}
