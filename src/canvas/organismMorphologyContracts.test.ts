import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { SpaceCell } from "../types";
import { useLab } from "../state/store";
import { spacesToNuclei } from "./organismAdapter";
import {
  DEFAULT_ORGANISM_SETTINGS,
  normalizeOrganismSettings,
  resolveMembraneSamplingScale,
  resolveOrganism,
} from "./organismProductionSettings";
import { ORGANISM_FRAG } from "../experiments/organism-lab/organism-shader";
import { buildProjectSnapshot } from "../export/projectSnapshot";
import { buildConfigEnvelope, parseConfigEnvelope } from "../import/projectFiles";

const space: SpaceCell = {
  id: "morphology-space",
  name: "Morphology Space",
  kind: "space",
  area: 144,
  category: "Studio",
  privacy: "shared",
  color: "",
  x: 48,
  y: -20,
};

test("Organism morphology preferences migrate into bounded persisted defaults", () => {
  const migrated = normalizeOrganismSettings({
    preserveMorphology: false,
    lowZoomDetail: "simplified",
    minimumMorphologyDetail: -40,
    edgeStability: 8,
    cameraAwareMorph: true,
    cameraShakeMode: "custom",
    cameraShakeIntensity: 99,
    cameraShakeFrequency: -1,
    cameraShakeDamping: 100,
    cameraShakeDragInfluence: 99,
    cameraShakeSettleDuration: 99,
  });

  assert.equal(DEFAULT_ORGANISM_SETTINGS.preserveMorphology, true);
  assert.equal(migrated.preserveMorphology, false);
  assert.equal(migrated.lowZoomDetail, "simplified");
  assert.equal(migrated.minimumMorphologyDetail, 0.2);
  assert.equal(migrated.edgeStability, 1);
  assert.equal(migrated.cameraAwareMorph, false, "legacy zoom mutation is retired during migration");
  assert.equal(migrated.cameraShakeMode, "custom", "camera-feedback preference persists independently of camera state");
  assert.equal(migrated.cameraShakeIntensity, 5);
  assert.equal(migrated.cameraShakeFrequency, 2);
  assert.equal(migrated.cameraShakeDamping, 30);
  assert.equal(migrated.cameraShakeDragInfluence, 1.5);
  assert.equal(migrated.cameraShakeSettleDuration, 1.2);
});

test("camera zoom preserves normalized membrane topology while projecting the field", () => {
  const settings = useLab.getState().settings;
  const resolved = resolveOrganism({
    ...settings,
    organism: {
      ...settings.organism,
      preserveMorphology: false,
      cameraAwareMorph: true,
    },
  });
  const legacyAdapter = { ...resolved.adapter, cameraAwareMorph: true };
  const cells = [
    { ...space, id: "morphology-left", x: -48, y: -20 },
    { ...space, id: "morphology-right", x: 96, y: 32 },
  ];
  const near = spacesToNuclei(
    cells,
    { x: 0, y: 0, zoom: 0.25 },
    960,
    640,
    null,
    null,
    legacyAdapter,
  );
  const far = spacesToNuclei(
    cells,
    { x: 0, y: 0, zoom: 3.5 },
    960,
    640,
    null,
    null,
    legacyAdapter,
  );

  const normalizedDistance = (nuclei: typeof near) => {
    const [left, right] = nuclei;
    const distance = Math.hypot(right!.fx - left!.fx, right!.fy - left!.fy);
    return distance / ((left!.r + right!.r) / 2);
  };
  assert.equal(resolved.adapter.cameraAwareMorph, false, "resolver retires camera-aware morphing");
  assert.ok(
    Math.abs(normalizedDistance(near) - normalizedDistance(far)) < 1e-9,
    "camera zoom scales field centres and radii together, preserving fusion/reach topology",
  );
  assert.ok(far[0]!.r > near[0]!.r, "field radius follows the visible camera projection");
  assert.notEqual(near[0]!.sx, far[0]!.sx, "screen projection still reflects camera zoom");
});

test("membrane zoom preferences affect sampling only", () => {
  const settings = useLab.getState().settings;
  const lowDetail = resolveOrganism({
    ...settings,
    organism: {
      ...settings.organism,
      preserveMorphology: true,
      lowZoomDetail: "simplified",
      minimumMorphologyDetail: 0.6,
      edgeStability: 1,
    },
  });
  const noPreserve = {
    ...lowDetail.membraneDetail,
    preserveMorphology: false,
  };
  assert.equal(resolveMembraneSamplingScale(lowDetail.membraneDetail, 2), 1, "high zoom keeps full sampling density");
  assert.ok(resolveMembraneSamplingScale(lowDetail.membraneDetail, 0.25) < 1, "low zoom can reduce target sampling density");
  assert.ok(
    resolveMembraneSamplingScale(lowDetail.membraneDetail, 0.25) >= resolveMembraneSamplingScale(noPreserve, 0.25),
    "Preserve Morphology raises only a sampling floor",
  );
  assert.equal(
    lowDetail.params.edgeSoftness,
    resolveOrganism({
      ...settings,
      organism: { ...settings.organism, edgeStability: 0 },
    }).params.edgeSoftness,
    "edge stability never alters the membrane field contour",
  );
});

test("store writes normalized morphology preferences", () => {
  const initial = useLab.getState();
  try {
    useLab.getState().setOrganism({
      preserveMorphology: true,
      lowZoomDetail: "balanced",
      minimumMorphologyDetail: 0.74,
      edgeStability: 0.83,
      cameraAwareMorph: true,
    });
    const organism = useLab.getState().settings.organism;
    assert.equal(organism.preserveMorphology, true);
    assert.equal(organism.lowZoomDetail, "balanced");
    assert.equal(organism.minimumMorphologyDetail, 0.74);
    assert.equal(organism.edgeStability, 0.83);
    assert.equal(organism.cameraAwareMorph, false);
  } finally {
    useLab.setState(initial, true);
  }
});

test("configuration export and import retain normalized morphology preferences", () => {
  const state = useLab.getState();
  const snapshot = buildProjectSnapshot({
    spaces: [],
    camera: state.camera,
    theme: state.theme,
    settings: {
      ...state.settings,
      organism: {
        ...state.settings.organism,
        preserveMorphology: true,
        lowZoomDetail: "balanced",
        minimumMorphologyDetail: 0.68,
        edgeStability: 0.91,
        cameraAwareMorph: true,
        cameraShakeMode: "responsive",
        cameraShakeIntensity: 1.2,
        cameraShakeFrequency: 11,
        cameraShakeDamping: 10,
        cameraShakeDragInfluence: 0.7,
        cameraShakeSettleDuration: 0.34,
      },
    },
  }, "Morphology persistence", new Date("2026-07-21T00:00:00.000Z"));
  const parsed = parseConfigEnvelope(JSON.stringify(buildConfigEnvelope(snapshot)));

  assert.equal(parsed.settings.organism.preserveMorphology, true);
  assert.equal(parsed.settings.organism.lowZoomDetail, "balanced");
  assert.equal(parsed.settings.organism.minimumMorphologyDetail, 0.68);
  assert.equal(parsed.settings.organism.edgeStability, 0.91);
  assert.equal(parsed.settings.organism.cameraAwareMorph, false);
  assert.equal(parsed.settings.organism.cameraShakeMode, "responsive");
  assert.equal(parsed.settings.organism.cameraShakeDragInfluence, 0.7);
});

test("low-resolution shader AA uses target-to-visible sampling rather than raw target derivatives", () => {
  assert.match(ORGANISM_FRAG, /uniform float uTargetToVisibleSamplingScale/);
  assert.match(ORGANISM_FRAG, /float visibleSampleWidth\(float rawDerivative\)/);
  assert.match(ORGANISM_FRAG, /aa = visibleSampleWidth\(fwidth\(f\)\)/);
  assert.match(ORGANISM_FRAG, /visibleSampleWidth\(fwidth\(sf\)\)/);

  const rendererSource = readFileSync(
    new URL("../experiments/organism-lab/organism-shader.ts", import.meta.url),
    "utf8",
  );
  assert.match(rendererSource, /targetWidth \/ Math\.max\(1, gl\.drawingBufferWidth\)/);
  assert.match(rendererSource, /uTargetToVisibleSamplingScale/);
  const canvasSource = readFileSync(new URL("./OrganismCanvasView.tsx", import.meta.url), "utf8");
  assert.match(canvasSource, /resolveMembraneSamplingScale\(resolved\.membraneDetail, cam\.zoom\)/);
});
