import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  projectRelationshipLegend,
  resolveRelationshipLegendSpecimenStyle,
} from "../../domain/connections/relationshipLegend";
import { getAllRelationshipTypes } from "../../domain/connections/relationshipTypes";
import { resolveRelationshipTypeStylePreview } from "../../domain/connections/styles";
import { useLab } from "../../state/store";
import { RelationshipTypeStylePreview } from "../RelationshipTypePicker";
import { resolveWidgetGrowthSize } from "./widgetLifecycle";

/** Output-only detached consumer. Configuration stays in Relationship Manager;
 * this frame subscribes directly so it remains live when Manager is closed. */
export default function RelationshipLegendWidget() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [bounds, setBounds] = useState({ width: 536, height: 340 });
  const connections = useLab((state) => state.connections);
  const projectRelationshipTypes = useLab((state) => state.settings.projectRelationshipTypes);
  const connectionStyles = useLab((state) => state.settings.connectionStyles);
  const connectionStylePreview = useLab((state) => state.connectionStyleEditorPreview);
  const config = useLab((state) => state.settings.connectionView.legend);

  const types = useMemo(
    () => getAllRelationshipTypes(projectRelationshipTypes, connectionStyles).map((type) => ({
      ...type,
      visualDefaults: resolveRelationshipTypeStylePreview(
        type.id,
        type.visualDefaults,
        connectionStylePreview,
      ),
    })),
    [connectionStylePreview, connectionStyles, projectRelationshipTypes],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const measure = () => {
      const style = window.getComputedStyle(canvas);
      const pixels = (value: string) => Number.parseFloat(value) || 0;
      const horizontalPadding = pixels(style.paddingLeft) + pixels(style.paddingRight);
      const verticalPadding = pixels(style.paddingTop) + pixels(style.paddingBottom);
      const next = {
        width: Math.max(0, Math.round(canvas.clientWidth - horizontalPadding)),
        height: Math.max(0, Math.round(canvas.clientHeight - verticalPadding)),
      };
      setBounds((current) =>
        current.width === next.width && current.height === next.height ? current : next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const projection = useMemo(() => projectRelationshipLegend({
    types,
    connections,
    config,
    bounds,
  }), [bounds, config, connections, types]);

  /* The resize floor must describe the shallowest readable composition at the
   * current width, not the current (possibly auto-grown) height. Giving the
   * projector no available rows lets Auto reflow across before CSS clamps a
   * vertical drag. */
  const minimumProjection = useMemo(() => projectRelationshipLegend({
    types,
    connections,
    config,
    bounds: { width: bounds.width, height: 0 },
  }), [bounds.width, config, connections, types]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.closest<HTMLElement>('.wframe[data-widget="relationship-legend"]');
    if (!frame) return;
    const controls = frame.querySelector<HTMLElement>(".wframe-frameless-controls");
    const borderHeight = Math.max(0, frame.offsetHeight - frame.clientHeight);
    const controlClearance = controls ? controls.offsetTop + controls.offsetHeight : 0;
    const minimumHeight = Math.ceil(Math.max(
      minimumProjection.layout.requiredHeight,
      controlClearance,
    ) + borderHeight);
    frame.style.setProperty("--relationship-legend-min-height", `${minimumHeight}px`);
  }, [minimumProjection.layout.requiredHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.closest<HTMLElement>('.wframe[data-widget="relationship-legend"]');
    if (!frame) return;
    const requiredWidth = projection.layout.requiredWidth + 28;
    const requiredHeight = projection.layout.requiredHeight + 16;
    const { width: nextWidth, height: nextHeight } = resolveWidgetGrowthSize({
      currentWidth: frame.offsetWidth,
      currentHeight: frame.offsetHeight,
      requiredWidth,
      requiredHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      minimumWidth: 260,
      minimumHeight: 0,
      horizontalMargin: 24,
      verticalMargin: 96,
    });
    if (nextWidth > frame.offsetWidth) frame.style.width = `${Math.ceil(nextWidth)}px`;
    if (nextHeight > frame.offsetHeight) frame.style.height = `${Math.ceil(nextHeight)}px`;
  }, [projection.layout.requiredHeight, projection.layout.requiredWidth]);

  return (
    <section className="relationship-legend-output" aria-label="Relationship Legend">
      <div
        ref={canvasRef}
        className="relationship-legend-canvas"
        data-density={config.density}
        data-layout={config.layoutMode}
        data-text-align={config.textAlign}
        data-text-placement-x={config.textPlacementX}
        data-text-placement-y={config.textPlacementY}
        data-fit-growth={projection.layout.requiredHeight > bounds.height
          || projection.layout.requiredWidth > bounds.width
          ? "true"
          : undefined}
        style={{
          "--relationship-legend-text-width": `${projection.layout.textWidth}px`,
        } as CSSProperties}
      >
        {projection.items.length > 0 ? <div
          className="relationship-legend-grid"
          role="list"
          aria-label="Active Relationship Types Legend"
          style={{
            gridTemplateColumns: `repeat(${projection.layout.columns}, ${projection.layout.itemWidth}px)`,
            gridAutoRows: `${projection.layout.itemHeight}px`,
            gap: projection.layout.gap,
            width: projection.layout.contentWidth,
          }}
        >
          {projection.items.map((item) => <article
            key={item.typeId}
            className="relationship-legend-item"
            role="listitem"
            aria-label={item.name}
            data-style={config.showStyle ? "true" : undefined}
            style={{
              gridColumn: item.column + 1,
              gridRow: item.row + 1,
            }}
          >
            {config.showStyle && <div className="relationship-legend-specimen">
              <RelationshipTypeStylePreview
                type={{
                  id: item.typeId,
                  name: item.name,
                  visualDefaults: resolveRelationshipLegendSpecimenStyle(
                    item.stylePreview,
                    config.specimenWeight,
                  ),
                }}
                lengthRange={[
                  projection.layout.specimenLengthMinimum,
                  projection.layout.specimenLengthMaximum,
                ]}
                previewMinimumStrokeWidth={config.specimenWeight === "legible" ? 1 : undefined}
                specimenHeight={20}
              />
            </div>}
            <div className="relationship-legend-copy">
              {config.showName && <strong>{item.name}</strong>}
              {config.showCode && <code>{item.code}</code>}
              {config.showDescription && <p>{item.description || "No description"}</p>}
            </div>
          </article>)}
        </div> : <div className="relationship-legend-empty">
          <strong>No Relationship Types in this scope.</strong>
          <span>{config.scope === "used-only"
            ? "Used Only derives from canonical Connections. Choose All Active to show the full library."
            : "The canonical active Relationship Type library is currently empty."}</span>
        </div>}
      </div>
    </section>
  );
}
