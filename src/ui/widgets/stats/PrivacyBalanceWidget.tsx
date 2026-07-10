/* V7.1 Privacy Balance — normalized privacy evidence without compliance or
   quality thresholds. Voids are counted separately and never inflate area. */

import { useMemo } from "react";
import { useLab } from "../../../state/store";
import { selectPrivacyBalance } from "../../../domain/stats/selectors";
import {
  formatCount,
  formatInt,
  formatShare,
  InsightRow,
  MetricReadout,
  MicroDistribution,
  RankedMetricRow,
} from "./primitives";

const PRIVACY_TONES: Record<string, string> = {
  public: "color-mix(in srgb, var(--ink) 78%, transparent)",
  shared: "color-mix(in srgb, var(--ink) 56%, transparent)",
  private: "color-mix(in srgb, var(--ink) 36%, transparent)",
  unknown: "color-mix(in srgb, var(--fog) 44%, transparent)",
};

export default function PrivacyBalanceWidget() {
  const spaces = useLab((state) => state.spaces);
  const balance = useMemo(() => selectPrivacyBalance(spaces), [spaces]);
  const visible = balance.groups.filter((group) => group.area > 0 || group.count > 0);

  return (
    <div className="pulse instrument-body">
      <div className="pulse-hero">
        <MetricReadout label="Programmed area" value={formatInt(balance.programArea)} unit="m²" />
        <MetricReadout mini label="Voids excluded" value={formatCount(balance.voidCount)} />
      </div>

      <MicroDistribution
        label="Privacy balance"
        detail={balance.dominant ? `${balance.dominant.label} ${formatShare(balance.dominant.share)}` : "No measurable area"}
        segments={balance.groups.map((group) => ({
          id: group.id,
          label: group.label,
          share: group.share,
          color: PRIVACY_TONES[group.id],
        }))}
      />

      {visible.length > 0 ? (
        <div className="pulse-ranking">
          {visible.map((group, index) => (
            <RankedMetricRow
              key={group.id}
              rank={index + 1}
              label={group.label}
              meta={`${group.count} ${group.count === 1 ? "space" : "spaces"}`}
              value={`${formatInt(group.area)} m²`}
              share={group.share}
              color={PRIVACY_TONES[group.id]}
            />
          ))}
        </div>
      ) : (
        <div className="pulse-empty instrument-empty">
          <span className="pulse-label">Awaiting privacy data</span>
          <p>Add a program space with a positive area.</p>
        </div>
      )}

      <div className="pulse-insights">
        <InsightRow k="Dominant" v={balance.dominant ? `${balance.dominant.label} · ${formatShare(balance.dominant.share)}` : "—"} />
        <InsightRow k="Service program" v={balance.serviceArea > 0 ? `${formatInt(balance.serviceArea)} m² · ${formatShare(balance.serviceShare)}` : "—"} />
      </div>
    </div>
  );
}
