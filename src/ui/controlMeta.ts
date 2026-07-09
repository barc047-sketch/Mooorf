/* V6K — shared control metadata for the dock quick controls and the floating
   widgets. One source for labels/descriptions so quick switches and detail
   widgets never drift apart. */

import type {
  AnnotationMode,
  AttachMode,
  LabelPosition,
  LayoutPresetId,
  MorphMode,
  PaletteMode,
  SelectionDisplay,
} from "../types";

export const MORPH_DESCRIPTIONS: Record<MorphMode, string> = {
  "cellular-reverse": "Pocketed membrane · theme-inverting",
  "plain-black": "Solid ink silhouette",
  "plain-white": "Bone body on deep ground",
  graphite: "Quiet technical grey",
  wine: "Graph noir identity",
  auto: "Follows day / night",
};

export const MORPH_LABELS: Record<MorphMode, string> = {
  "cellular-reverse": "Cellular Reverse",
  "plain-black": "Plain Black",
  "plain-white": "Plain White",
  graphite: "Graphite",
  wine: "Wine",
  auto: "Auto",
};

export const PALETTE_DESCRIPTIONS: Record<PaletteMode, string> = {
  core: "Black bone · monochrome base",
  surreal: "Restrained spectral accents",
  architecture: "Category-tinted program",
  auto: "Adapts to style + theme",
};

export const PALETTE_LABELS: Record<PaletteMode, string> = {
  core: "Core",
  surreal: "Surreal",
  architecture: "Architecture",
  auto: "Auto",
};

export const ATTACH_HINTS: Record<AttachMode, string> = {
  tight: "Close fusion",
  soft: "Balanced membrane",
  long: "Connected reach",
  extreme: "Experimental far reach",
};

export const ATTACH_LABELS: Record<AttachMode, string> = {
  tight: "Tight",
  soft: "Soft",
  long: "Long",
  extreme: "Extreme",
};

export const MORPHS: readonly { id: MorphMode; label: string }[] = [
  { id: "cellular-reverse", label: "Cellular Reverse" },
  { id: "plain-black", label: "Plain Black" },
  { id: "plain-white", label: "Plain White" },
  { id: "graphite", label: "Graphite" },
  { id: "wine", label: "Wine" },
  { id: "auto", label: "Auto" },
];

export const PALETTE_MODES: readonly { id: PaletteMode; label: string }[] = [
  { id: "core", label: "Core" },
  { id: "surreal", label: "Surreal" },
  { id: "architecture", label: "Architecture" },
  { id: "auto", label: "Auto" },
];

export const ATTACHES: readonly { id: AttachMode; label: string }[] = [
  { id: "tight", label: "Tight" },
  { id: "soft", label: "Soft" },
  { id: "long", label: "Long" },
  { id: "extreme", label: "Extreme" },
];

export const ANNOTATIONS: readonly { id: AnnotationMode; label: string; desc: string }[] = [
  { id: "editorial", label: "Editorial", desc: "Boxless name + area" },
  { id: "pill", label: "Pill", desc: "Compact rounded label" },
  { id: "technical", label: "Technical", desc: "Name, area, category" },
  { id: "hidden", label: "Hidden", desc: "No canvas labels" },
];

export const LABEL_POSITIONS: readonly { id: LabelPosition; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "center", label: "Center" },
  { id: "above", label: "Above" },
  { id: "below", label: "Below" },
];

export const SELECTIONS: readonly { id: SelectionDisplay; label: string; desc: string }[] = [
  { id: "tight", label: "Tight", desc: "Small crisp default ring" },
  { id: "halo", label: "Halo", desc: "Soft medium focus halo" },
];

export const INFLUENCE_SELECTION: { id: SelectionDisplay; label: string; desc: string } = {
  id: "influence",
  label: "Influence",
  desc: "Large field / measurement circle",
};

export const LAYOUT_CODES: Record<LayoutPresetId, string> = {
  organic: "OG",
  random: "RA",
  core: "CO",
  colony: "CL",
  division: "DV",
  tendril: "TD",
  orbit: "OR",
  asymmetry: "AS",
};
