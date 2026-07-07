/* V6E Organism Lab — authored presets.
   Field units (shorter viewport axis = [-1, 1]). Each preset is a starting
   arrangement, not a keyframe: the field renders it procedurally and every
   nucleus stays draggable afterward. */

import type { OrganismPreset } from "./organism-types";

export const ORGANISM_PRESETS: OrganismPreset[] = [
  {
    id: "core",
    label: "Core",
    hint: "one dominant mass, satellites in reach",
    specs: [
      { x: 0, y: 0.02, r: 0.44 },
      { x: -0.62, y: 0.34, r: 0.17 },
      { x: 0.55, y: 0.45, r: 0.14 },
      { x: 0.66, y: -0.28, r: 0.19 },
      { x: -0.5, y: -0.42, r: 0.12 },
      { x: 0.05, y: 0.66, r: 0.1 },
    ],
    params: { style: "cellular-reverse", attachment: "soft" },
  },
  {
    id: "colony",
    label: "Colony",
    hint: "many medium nuclei, loose tissue",
    specs: [
      { x: -0.55, y: 0.5, r: 0.16 },
      { x: -0.18, y: 0.56, r: 0.18 },
      { x: 0.3, y: 0.52, r: 0.15 },
      { x: 0.62, y: 0.35, r: 0.13 },
      { x: -0.62, y: 0.05, r: 0.2 },
      { x: -0.2, y: 0.02, r: 0.26 },
      { x: 0.28, y: 0.08, r: 0.22 },
      { x: 0.6, y: -0.15, r: 0.14 },
      { x: -0.4, y: -0.45, r: 0.17 },
      { x: 0.1, y: -0.5, r: 0.19 },
      { x: 0.5, y: -0.52, r: 0.12 },
    ],
    params: { style: "plain-black", attachment: "soft", breathing: 0.42 },
  },
  {
    id: "division",
    label: "Division",
    hint: "mitosis — two bodies pulling apart",
    specs: [
      { x: -0.45, y: 0, r: 0.34 },
      { x: 0.45, y: 0.02, r: 0.3 },
      { x: -0.2, y: 0.06, r: 0.09 },
      { x: -0.05, y: 0.01, r: 0.1 },
      { x: 0.12, y: -0.04, r: 0.08 },
    ],
    params: {
      style: "plain-black",
      attachment: "long",
      breathing: 0.48,
      drift: 0.18,
      globalOffset: 1.05,
    },
  },
  {
    id: "tendril",
    label: "Tendril",
    hint: "mass reaching out through a thinning chain",
    specs: [
      { x: -0.5, y: -0.35, r: 0.3 },
      { x: -0.25, y: -0.12, r: 0.12 },
      { x: -0.05, y: 0.08, r: 0.1 },
      { x: 0.13, y: 0.26, r: 0.088 },
      { x: 0.3, y: 0.42, r: 0.078 },
      { x: 0.46, y: 0.55, r: 0.07 },
      { x: 0.6, y: 0.66, r: 0.062 },
      { x: 0.74, y: 0.76, r: 0.05 },
    ],
    params: {
      style: "plain-black",
      attachment: "long",
      connectionBias: 0.42,
      drift: 0.3,
      radiusMin: 0.04,
    },
  },
  {
    id: "void",
    label: "Void",
    hint: "membrane with carved negative pockets",
    specs: [
      { x: 0.05, y: 0, r: 0.5 },
      { x: -0.55, y: 0.3, r: 0.2 },
      { x: 0.5, y: 0.42, r: 0.17 },
      { x: -0.35, y: -0.45, r: 0.15 },
      { x: 0.48, y: -0.38, r: 0.13 },
      { x: 0.22, y: 0.18, r: 0.16, polarity: -1, strength: 1.15 },
      { x: -0.15, y: -0.1, r: 0.12, polarity: -1 },
    ],
    params: {
      style: "cellular-reverse",
      attachment: "soft",
      pocketThreshold: 6.5,
    },
  },
  {
    id: "orbit",
    label: "Orbit",
    hint: "nucleus with an electron ring",
    specs: [
      { x: 0, y: 0, r: 0.36 },
      { x: 0.62, y: 0, r: 0.11 },
      { x: 0.31, y: 0.537, r: 0.13 },
      { x: -0.31, y: 0.537, r: 0.1 },
      { x: -0.62, y: 0, r: 0.12 },
      { x: -0.31, y: -0.537, r: 0.1 },
      { x: 0.31, y: -0.537, r: 0.13 },
    ],
    params: {
      style: "auto",
      attachment: "tight",
      drift: 0.35,
      wobble: 0.2,
      phaseVariation: 1,
    },
  },
  {
    id: "asymmetry",
    label: "Asymmetry",
    hint: "weight thrown to one side, one escapee",
    specs: [
      { x: -0.3, y: 0.1, r: 0.4 },
      { x: 0.35, y: 0.3, r: 0.22 },
      { x: 0.55, y: 0.05, r: 0.18 },
      { x: 0.3, y: -0.2, r: 0.15 },
      { x: 0.78, y: 0.62, r: 0.09 },
      { x: -0.6, y: -0.5, r: 0.11 },
    ],
    params: { style: "graphite", attachment: "soft", sizeVariation: 0.8 },
  },
];

export function presetById(id: string): OrganismPreset {
  return ORGANISM_PRESETS.find((p) => p.id === id) ?? ORGANISM_PRESETS[0];
}
