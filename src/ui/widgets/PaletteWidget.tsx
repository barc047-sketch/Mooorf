/* V6K palette widget — the premium color home. Two swatch systems:
   nucleus palettes (curated 10-step family ramps tinting the category
   mapping) and organism palettes (membrane/body + ground sets feeding the
   shader uniforms; gradient blends stay UI-complete placeholders until the
   multi-color shader phase). */

import { useLab } from "../../state/store";
import {
  NUCLEUS_PALETTE_AUTO_ID,
  NUCLEUS_PALETTES,
  ORGANISM_PALETTE_MODE_ID,
  ORGANISM_PALETTES,
} from "../../design/palettes";
import { CATEGORY_TOKENS, getCategoryColor } from "../../design/colorMapping";
import { PALETTE_DESCRIPTIONS, PALETTE_MODES } from "../controlMeta";
import { ChoiceRow, WidgetSection } from "./controls";

export default function PaletteWidget() {
  const paletteMode = useLab((s) => s.settings.paletteMode);
  const nucleusPaletteId = useLab((s) => s.settings.nucleusPaletteId);
  const organismPaletteId = useLab((s) => s.settings.organismPaletteId);
  const setSettings = useLab((s) => s.setSettings);

  return (
    <>
      <WidgetSection title="Mode" hint="semantic base" defaultOpen>
        {PALETTE_MODES.map((p) => (
          <ChoiceRow
            key={p.id}
            active={paletteMode === p.id}
            name={p.label}
            desc={PALETTE_DESCRIPTIONS[p.id]}
            swatch={<span className="palette-swatch" data-palette={p.id} />}
            onClick={() => setSettings({ paletteMode: p.id })}
          />
        ))}
      </WidgetSection>

      <WidgetSection title="Nucleus Palette" hint="space families" defaultOpen>
        <button
          type="button"
          className="pal-family"
          data-active={nucleusPaletteId === NUCLEUS_PALETTE_AUTO_ID}
          onClick={() => setSettings({ nucleusPaletteId: NUCLEUS_PALETTE_AUTO_ID })}
        >
          <span className="pal-family-meta">
            <span className="pal-name">Auto</span>
            <span className="pal-use">Category mapping owns color</span>
          </span>
          <span className="pal-ramp pal-ramp--auto" aria-hidden="true">
            {CATEGORY_TOKENS.slice(0, 8).map((t) => (
              <i key={t.id} style={{ background: t.base }} />
            ))}
          </span>
        </button>
        {NUCLEUS_PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            className="pal-family"
            data-active={nucleusPaletteId === p.id}
            title={p.use}
            onClick={() => setSettings({ nucleusPaletteId: p.id })}
          >
            <span className="pal-family-meta">
              <span className="pal-name">{p.label}</span>
              <span className="pal-use">{p.use}</span>
            </span>
            <span className="pal-ramp" aria-hidden="true">
              {p.shades.map((shade) => (
                <i key={shade} style={{ background: shade }} />
              ))}
            </span>
          </button>
        ))}
        <button type="button" className="pal-custom" disabled>
          Custom palette — coming later
        </button>
      </WidgetSection>

      <WidgetSection title="Organism Palette" hint="membrane + ground" defaultOpen>
        <button
          type="button"
          className="pal-family"
          data-active={organismPaletteId === ORGANISM_PALETTE_MODE_ID}
          onClick={() => setSettings({ organismPaletteId: ORGANISM_PALETTE_MODE_ID })}
        >
          <span className="pal-family-meta">
            <span className="pal-name">Style Default</span>
            <span className="pal-use">Derived from style + mode</span>
          </span>
          <span className="pal-ramp" aria-hidden="true">
            <i style={{ background: "#131313" }} />
            <i style={{ background: "#f5f6ee" }} />
            <i style={{ background: "#8f1424" }} />
          </span>
        </button>
        <div className="pal-organism-grid">
          {ORGANISM_PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              className="pal-chip"
              data-active={organismPaletteId === p.id}
              disabled={!p.ready}
              title={p.use}
              onClick={() => setSettings({ organismPaletteId: p.id })}
            >
              <span
                className="pal-chip-preview"
                style={{ background: `linear-gradient(135deg, ${p.preview.join(", ")})` }}
              />
              <span className="pal-chip-name">
                {p.label}
                {!p.ready && <i>soon</i>}
              </span>
            </button>
          ))}
        </div>
        <p className="org-attach-hint">
          Gradient / category blends are staged for the multi-color shader phase.
        </p>
      </WidgetSection>

      <WidgetSection title="Program Mapping" hint="live tokens">
        <div className="category-map-grid">
          {CATEGORY_TOKENS.map((token) => {
            const mapped = getCategoryColor(
              token.label,
              "shared",
              140,
              paletteMode,
              { min: 20, max: 300 },
              nucleusPaletteId
            );
            return (
              <span key={token.id} className="category-token" title={token.aliases.join(", ")}>
                <i style={{ background: mapped.fill, borderColor: mapped.ring }} />
                <span>{token.label}</span>
              </span>
            );
          })}
        </div>
      </WidgetSection>
    </>
  );
}
