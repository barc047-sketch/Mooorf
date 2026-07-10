/* V7 spatial intelligence primitives — the shared presentation layer for the
   stats widget family (see docs/V7_SPATIAL_INTELLIGENCE_SYSTEM.md). These are
   deliberately small instrument parts, not a component library: readouts,
   micro distributions, and insight rows composed inside WidgetFrame bodies.
   Data colors come from selectors (category tokens); chrome stays neutral. */

import type { ReactNode } from "react";
import "./stats.css";

/* ——— metric formatting (single source for the family) ——— */

/** 2460.4 → "2,460" — whole m², tabular-ready. */
export const formatInt = (value: number): string =>
  Math.round(value).toLocaleString("en-US");

/** 0.678 → "68%" — whole-percent shares everywhere. */
export const formatShare = (share: number): string =>
  `${Math.round(Math.max(0, Math.min(1, share)) * 100)}%`;

/** Counts keep two digits ("02") so stacked readouts align like instruments. */
export const formatCount = (value: number): string =>
  String(Math.max(0, Math.round(value))).padStart(2, "0");

/* ——— MetricReadout — eyebrow label + tabular value (+ optional unit) ——— */

export function MetricReadout({
  label,
  value,
  unit,
  mini,
}: {
  label: string;
  value: string;
  unit?: string;
  /** compact side/stacked variant */
  mini?: boolean;
}) {
  return (
    <div className="pulse-readout" data-mini={mini ? "true" : undefined}>
      <span className="pulse-label">{label}</span>
      <span className="pulse-value">
        {value}
        {unit && <i>{unit}</i>}
      </span>
    </div>
  );
}

/* ——— MicroDistribution — hairline segmented band + optional legend ——— */

export interface DistributionSegment {
  id: string;
  label: string;
  color: string;
  /** 0..1 — segments with share 0 are skipped */
  share: number;
}

export function MicroDistribution({
  label,
  detail,
  segments,
  legend,
}: {
  label: string;
  /** right-aligned micro detail, e.g. dominant share or category count */
  detail?: string;
  segments: readonly DistributionSegment[];
  /** rows under the band — pass the (possibly aggregated) items to list */
  legend?: readonly DistributionSegment[];
}) {
  const visible = segments.filter((s) => s.share > 0);
  return (
    <div className="pulse-dist">
      <div className="pulse-dist-head">
        <span className="pulse-label">{label}</span>
        {detail && <span className="pulse-detail">{detail}</span>}
      </div>
      <div className="pulse-band" role="img" aria-label={label}>
        {visible.length === 0 ? (
          <i className="pulse-band-dormant" />
        ) : (
          visible.map((seg) => (
            <i
              key={seg.id}
              style={{ flexGrow: seg.share, background: seg.color }}
              title={`${seg.label} ${formatShare(seg.share)}`}
            />
          ))
        )}
      </div>
      {legend && legend.length > 0 && (
        <div className="pulse-legend">
          {legend.map((item) => (
            <span key={item.id} className="pulse-legend-row">
              <i className="pulse-dot" style={{ background: item.color }} />
              <span className="pulse-legend-name">{item.label}</span>
              <span className="pulse-legend-share">{formatShare(item.share)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ——— InsightRow — footer key/value line with tabular values ——— */

export function InsightRow({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="pulse-insight">
      <span className="pulse-label">{k}</span>
      <span className="pulse-insight-value">{v}</span>
    </div>
  );
}
