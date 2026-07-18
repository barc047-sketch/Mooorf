import { getAreaRange, getOrganismPalette, hexToRgb01 } from "../design/colorMapping";
import { resolveCellShadowGated } from "../canvas/cellShadow";
import { spacesToNuclei } from "../canvas/organismAdapter";
import { resolveOrganism } from "../canvas/organismProductionSettings";
import {
  drawOrganismCircleOverlay,
  projectCircleLayers,
  projectMembraneField,
  projectRuntimePresentation,
} from "../canvas/presentationLayers";
import { effectiveField, styleColors } from "../experiments/organism-lab/organism-controls";
import { MAX_NUCLEI } from "../experiments/organism-lab/organism-types";
import {
  createOrganismRenderer,
  type OrganismRenderFrame,
  type OrganismRenderer,
} from "../experiments/organism-lab/organism-shader";
import type { CanvasExportSnapshot, CaptureRequestOptions, CaptureResult } from "../canvas/exportCapture";
import { iconRegistry } from "../icons/iconRegistry";
import { drawSymbolPlacement, resolveSymbolTint } from "../icons/iconDrawing";
import {
  drawCellLabelLayout,
  getCellLabelLayout,
  selectRuntimeLabelLayout,
} from "../canvas/cellLabelDraw";
import { textStylePreset } from "../domain/presentation/editing";
import { resolveFlagAutoDirection } from "../domain/labels/resolveLayout";

const rgb01ToHex = (rgb: readonly number[]): string =>
  `#${rgb
    .slice(0, 3)
    .map((value) =>
      Math.round(Math.min(1, Math.max(0, value)) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;

const exportOverlayTokens = (theme: CanvasExportSnapshot["theme"]) =>
  theme === "night"
    ? { surface: "#151614", hairline: "#5b5d58" }
    : { surface: "#f5f6ee", hairline: "#a8aaa3" };

/** One short-lived authored-quality Organism renderer. It never reads or
 * mutates the mounted Canvas, preview owners, Governor, selection, or camera. */
export const renderDetachedOrganismExport = async (
  snapshot: CanvasExportSnapshot,
  options: CaptureRequestOptions,
  cssWidth: number,
  cssHeight: number,
): Promise<CaptureResult> => {
  const width = Math.max(1, Math.round(cssWidth));
  const height = Math.max(1, Math.round(cssHeight));
  const scale = options.scale;
  const renderSurface = document.createElement("canvas");
  let renderer: OrganismRenderer | null = null;
  try {
    renderer = createOrganismRenderer(renderSurface);
    if (!renderer) throw new Error("Organism export requires WebGL2.");
    renderer.resize(width, height, scale);
    renderer.resizeTarget(width, height, scale);
    renderer.setFilter("smooth");

    const settings = snapshot.settings;
    const visibleSpaces = snapshot.spaces.slice(0, MAX_NUCLEI);
    const areaRange = getAreaRange(visibleSpaces);
    const presentation = projectRuntimePresentation(visibleSpaces, settings, snapshot.theme);
    const cellColours = new Map(visibleSpaces.map((space) => [
      space.id,
      presentation.byId.get(space.id)?.cell.paint.colour ?? "#777a79",
    ]));
    const resolved = resolveOrganism(settings, true);
    const style = styleColors(settings.morphMode, snapshot.theme);
    const palette = getOrganismPalette(
      settings.paletteMode,
      snapshot.theme,
      { bodyHex: style.bodyHex, bgHex: style.bgHex },
      settings.organismPaletteId,
      {
        spaces: visibleSpaces,
        areaRange,
        nucleusPaletteId: settings.nucleusPaletteId,
        colorSource: settings.colorSource,
      },
    );
    const nuclei = spacesToNuclei(
      visibleSpaces,
      snapshot.camera,
      width,
      height,
      null,
      null,
      resolved.adapter,
      undefined,
      settings.paletteMode,
      settings.nucleusPaletteId,
      settings.colorSource,
      areaRange,
      cellColours,
    );
    const membraneActive = settings.blobOn
      && (presentation.membrane.visible || presentation.membraneEdge.visible);
    const field = effectiveField(resolved.params);
    const membraneField = projectMembraneField({
      membrane: presentation.membrane,
      paletteBodyHex: palette.bodyHex,
      paletteBodyBHex: palette.bodyBHex,
      membraneEdgeColour: presentation.membraneEdge.paint.colour,
      paletteBlend: palette.blend,
    });
    const nucleiBuffer = new Float32Array(MAX_NUCLEI * 4);
    const colourBuffer = new Float32Array(MAX_NUCLEI * 3);
    for (let index = 0; index < nuclei.length; index += 1) {
      const nucleus = nuclei[index]!;
      const offset = index * 4;
      nucleiBuffer[offset] = nucleus.fx;
      nucleiBuffer[offset + 1] = nucleus.fy;
      nucleiBuffer[offset + 2] = nucleus.r;
      nucleiBuffer[offset + 3] = nucleus.strength;
      if (nucleus.kind === "space") {
        const colour = hexToRgb01(nucleus.color);
        const colourOffset = index * 3;
        colourBuffer[colourOffset] = colour[0];
        colourBuffer[colourOffset + 1] = colour[1];
        colourBuffer[colourOffset + 2] = colour[2];
      }
    }
    const shadow = resolveCellShadowGated(settings.cellShadow, "high", snapshot.theme);
    const shadowColour = hexToRgb01(
      shadow.colorMode === "custom" ? shadow.color : snapshot.theme === "night" ? "#000000" : "#222222",
    );
    const frame: OrganismRenderFrame = {
      count: nuclei.length,
      nuclei: nucleiBuffer,
      nucleusColors: colourBuffer,
      mass: resolved.params.mass,
      iso: resolved.params.isoLevel,
      softness: resolved.params.edgeSoftness,
      tension: field.tension,
      bias: field.bias,
      pocketIso: resolved.params.pocketThreshold,
      pocketSoft: resolved.params.pocketSoftness,
      pocketAmount: style.pocketAmount,
      bodyColor: hexToRgb01(membraneField.bodyHex),
      bodyColorB: hexToRgb01(membraneField.bodyBHex),
      bgColor: palette.ground,
      accentColor: hexToRgb01(membraneField.accentHex),
      colorMix: membraneField.colorMix,
      spatialColorMix: membraneField.spatialColorMix,
      nucleusDots: 0,
      membraneOpacity: membraneActive ? presentation.membrane.paint.opacity : 0,
      membraneEdgeOpacity: membraneActive && presentation.membraneEdge.visible
        ? presentation.membraneEdge.paint.opacity
        : 0,
      membraneEdgeWidth: Math.max(0.5, presentation.membraneEdge.width * snapshot.camera.zoom),
      membraneEdgeSoftness: presentation.membraneEdge.softness,
      morphEnabled: membraneActive,
      shadowEnabled: shadow.enabled && shadow.includeInExport,
      shadowColor: shadowColour,
      shadowOpacity: shadow.opacity,
      shadowSoftness: shadow.softness / Math.max(1, Math.min(width, height) / 2),
      shadowOffset: [
        shadow.offsetX / Math.max(1, Math.min(width, height) / 2),
        -shadow.offsetY / Math.max(1, Math.min(width, height) / 2),
      ],
      shadowSpread: shadow.spread / Math.max(1, Math.min(width, height) / 2),
      fieldDebug: resolved.params.showFieldDebug,
      nucleiDebug: resolved.params.showNucleiDebug,
      nucleiDebugCenterDots: false,
    };

    renderer.render(frame);
    const output = document.createElement("canvas");
    output.width = Math.max(1, Math.round(width * scale));
    output.height = Math.max(1, Math.round(height * scale));
    const outputContext = output.getContext("2d");
    if (!outputContext) throw new Error("Could not create the export capture surface.");
    outputContext.drawImage(renderSurface, 0, 0, output.width, output.height);
    outputContext.save();
    outputContext.setTransform(scale, 0, 0, scale, 0, 0);
    const spacesById = new Map(visibleSpaces.map((space) => [space.id, space]));
    const placementsByTarget = new Map(
      settings.resources.iconPlacements.map((placement) => [
        placement.targetSpaceId,
        placement,
      ])
    );
    const centroid = snapshot.spaces.length
      ? snapshot.spaces.reduce(
          (sum, space) => ({
            x: sum.x + space.x / snapshot.spaces.length,
            y: sum.y + space.y / snapshot.spaces.length,
          }),
          { x: 0, y: 0 }
        )
      : null;
    const plainMode =
      !settings.blobOn ||
      !(presentation.membrane.visible || presentation.membraneEdge.visible);
    const canvasColor = rgb01ToHex(palette.ground);
    const tokens = exportOverlayTokens(snapshot.theme);
    const labelsVisible =
      options.includeLabels &&
      settings.organism.showLabels &&
      settings.annotationMode !== "hidden";

    for (const nucleus of nuclei) {
      const space = spacesById.get(nucleus.id);
      const appearance = presentation.byId.get(nucleus.id);
      if (!space || !appearance) continue;
      const isVoid = space.kind === "void";
      const backgroundColor = isVoid
        ? appearance.void.fill.colour
        : appearance.cell.paint.colour;
      const layers = projectCircleLayers(
        space,
        appearance,
        nucleus.screenR,
        snapshot.camera.zoom,
        "organism"
      );
      drawOrganismCircleOverlay(
        outputContext,
        nucleus.sx,
        nucleus.sy,
        layers,
        {
          spaceKind: isVoid ? "void" : "space",
          plainMode,
          backgroundColour: canvasColor,
          baseRadiusPx: nucleus.screenR,
        }
      );

      const placement = placementsByTarget.get(space.id);
      const definition = placement ? iconRegistry.get(placement.iconId) : null;
      if (placement && definition) {
        drawSymbolPlacement(outputContext, definition, placement, {
          x: nucleus.sx,
          y: nucleus.sy,
          radius: nucleus.screenR,
          zoom: snapshot.camera.zoom,
          tint: resolveSymbolTint(placement, {
            theme: snapshot.theme,
            backgroundColor,
            surfaceOpacity: isVoid
              ? appearance.void.fill.opacity
              : appearance.cell.paint.opacity,
            canvasColor,
            voidBackground: isVoid,
          }),
        });
      }

      if (!labelsVisible) continue;
      const text = appearance.text;
      const preset = textStylePreset(text.preset);
      const resolvedLabel = getCellLabelLayout(
        space,
        settings.presentationDefaults,
        {
          globalScaleMode: settings.labelScaleMode,
          textSize: text.size * preset.heading.scale,
          showName: settings.annotationDetail.showName,
          showArea: settings.annotationDetail.showArea,
          showMetadata:
            settings.annotationMode === "technical" &&
            settings.annotationDetail.showCategory,
          hasSymbol: Boolean(placement && definition),
          flagAutoDirection: resolveFlagAutoDirection(space, centroid),
        }
      );
      const runtimeLabel = selectRuntimeLabelLayout(resolvedLabel, {
        zoom: snapshot.camera.zoom,
        radiusWorld:
          nucleus.screenR / Math.max(snapshot.camera.zoom, 0.0001),
      });
      drawCellLabelLayout(outputContext, runtimeLabel, {
        sx: nucleus.sx,
        sy: nucleus.sy,
        screenRadius: nucleus.screenR,
        zoom: snapshot.camera.zoom,
        theme: snapshot.theme,
        backgroundColor,
        voidBackground: isVoid,
        legacyColour: {
          mode: text.colourMode === "custom" ? "custom" : "auto",
          colour:
            text.colourMode === "custom"
              ? text.colour
              : settings.labelCustomColour,
        },
        textShadow: settings.annotationDetail.textShadow,
        surfaceColor: tokens.surface,
        hairlineColor: tokens.hairline,
      });
    }
    outputContext.restore();
    return { canvas: output, cssWidth: width, cssHeight: height };
  } finally {
    renderer?.dispose();
  }
};
