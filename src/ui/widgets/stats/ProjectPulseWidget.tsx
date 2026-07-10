/* V7 flagship — Project Pulse. A floating spatial diagnostic instrument:
   every number is derived live from store-owned spaces through the pure
   selectors in src/domain/stats/selectors.ts. No metric state lives here.
   This widget is the production reference for the V7 stats family
   (docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md). */

import { useMemo } from "react";
import { useLab } from "../../../state/store";
import { computeSpatialPulse } from "../../../domain/stats/selectors";
import {
  formatCount,
  formatInt,
  formatShare,
  InsightRow,
  MetricReadout,
  MicroDistribution,
  type DistributionSegment,
} from "./primitives";

const LEGEND_LIMIT = 3;

/* neutral instrument tones for the openness band — privacy is a balance
   readout, not category data, so it stays in chrome color territory */
const OPEN_COLOR = "var(--chrome-accent)";
const PRIVATE_COLOR = "color-mix(in srgb, var(--ink) 58%, transparent)";

export default function ProjectPulseWidget() {
  const spaces = useLab((s) => s.spaces);
  const pulse = useMemo(() => computeSpatialPulse(spaces), [spaces]);

  if (spaces.length === 0) {
    return (
      <div className="pulse pulse-empty">
        <span className="pulse-label">Awaiting program</span>
        <p>No spaces yet.</p>
        <span className="pulse-empty-hint">
          Add a space from the dock — the instrument reads live program data.
        </span>
        <div className="pulse-band" aria-hidden="true">
          <i className="pulse-band-dormant" />
        </div>
      </div>
    );
  }

  const { programArea, spaceCount, voidCount, categories, dominant, privacy, largest } = pulse;

  const legendTop = categories.slice(0, LEGEND_LIMIT);
  const rest = categories.slice(LEGEND_LIMIT);
  const legend: DistributionSegment[] =
    rest.length > 0
      ? [
          ...legendTop,
          {
            id: "other",
            label: `Other · ${rest.length}`,
            color: "var(--fog)",
            share: rest.reduce((sum, c) => sum + c.share, 0),
          },
        ]
      : legendTop;

  const openness: DistributionSegment[] = [
    { id: "open", label: "Public / shared", color: OPEN_COLOR, share: privacy.openShare },
    { id: "private", label: "Private", color: PRIVATE_COLOR, share: privacy.share.private },
  ];

  return (
    <div className="pulse">
      <div className="pulse-hero">
        <MetricReadout label="Total program" value={formatInt(programArea)} unit="m²" />
        <div className="pulse-side">
          <MetricReadout mini label="Spaces" value={formatCount(spaceCount)} />
          <MetricReadout mini label="Voids" value={formatCount(voidCount)} />
        </div>
      </div>

      <MicroDistribution
        label="Program mix"
        detail={
          categories.length > 0
            ? `${categories.length} ${categories.length === 1 ? "category" : "categories"}`
            : "—"
        }
        segments={categories}
        legend={legend}
      />

      <MicroDistribution
        label="Openness"
        detail={programArea > 0 ? `${formatShare(privacy.openShare)} public / shared` : "—"}
        segments={openness}
      />

      <div className="pulse-insights">
        <InsightRow
          k="Largest"
          v={
            largest ? (
              <>
                {largest.name} · <b>{formatInt(largest.area)} m²</b>
              </>
            ) : (
              "—"
            )
          }
        />
        <InsightRow
          k="Dominant"
          v={dominant ? (
            <>
              {dominant.label} · <b>{formatShare(dominant.share)}</b>
            </>
          ) : (
            "—"
          )}
        />
      </div>
    </div>
  );
}
