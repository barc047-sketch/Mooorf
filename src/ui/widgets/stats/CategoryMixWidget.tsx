/* V7.1 Category Mix — category-token distribution over additive program area.
   All values are derived from the stable spaces reference; no widget state. */

import { useMemo } from "react";
import { useLab } from "../../../state/store";
import { selectCategoryMix, type CategoryShare } from "../../../domain/stats/selectors";
import {
  formatCount,
  formatInt,
  MetricReadout,
  MicroDistribution,
  RankedMetricRow,
  type DistributionSegment,
} from "./primitives";

const VISIBLE_LIMIT = 6;

const aggregateCategories = (categories: readonly CategoryShare[]): DistributionSegment[] => {
  const visible = categories.slice(0, VISIBLE_LIMIT);
  const rest = categories.slice(VISIBLE_LIMIT);
  return rest.length === 0
    ? visible
    : [
        ...visible,
        {
          id: "other",
          label: `Other · ${rest.length}`,
          color: "var(--fog)",
          share: rest.reduce((sum, category) => sum + category.share, 0),
        },
      ];
};

export default function CategoryMixWidget() {
  const spaces = useLab((state) => state.spaces);
  const mix = useMemo(() => selectCategoryMix(spaces), [spaces]);
  const measurable = mix.categories.filter((category) => category.area > 0);
  const distribution = aggregateCategories(measurable);

  return (
    <div className="pulse instrument-body">
      <div className="pulse-hero">
        <MetricReadout label="Programmed area" value={formatInt(mix.programArea)} unit="m²" />
        <div className="pulse-side">
          <MetricReadout mini label="Spaces" value={formatCount(mix.spaceCount)} />
          <MetricReadout mini label="Voids" value={formatCount(mix.voidCount)} />
        </div>
      </div>

      <MicroDistribution
        label="Category field"
        detail={measurable.length ? `${measurable.length} active` : "No measurable area"}
        segments={distribution}
      />

      {measurable.length > 0 ? (
        <div className="pulse-ranking">
          {measurable.slice(0, VISIBLE_LIMIT).map((category, index) => (
            <RankedMetricRow
              key={category.id}
              rank={index + 1}
              label={category.label}
              meta={`${category.count} ${category.count === 1 ? "space" : "spaces"}`}
              value={`${formatInt(category.area)} m²`}
              share={category.share}
              color={category.color}
            />
          ))}
          {mix.categories.length > VISIBLE_LIMIT && (
            <RankedMetricRow
              label={`Other · ${mix.categories.length - VISIBLE_LIMIT}`}
              meta="Combined remaining categories"
              value={`${formatInt(mix.categories.slice(VISIBLE_LIMIT).reduce((sum, item) => sum + item.area, 0))} m²`}
              share={mix.categories.slice(VISIBLE_LIMIT).reduce((sum, item) => sum + item.share, 0)}
            />
          )}
        </div>
      ) : (
        <div className="pulse-empty instrument-empty">
          <span className="pulse-label">Awaiting measurable program</span>
          <p>{mix.spaceCount ? "Add positive areas to reveal the mix." : "Add a program space to begin."}</p>
        </div>
      )}
    </div>
  );
}
