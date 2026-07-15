import type { ArrangementPatternId } from "../types";
import type { ArrangementControlId, ArrangementPatternDefinition } from "./types";

const COMMON: readonly ArrangementControlId[] = [
  "spacing",
  "collision-margin",
  "rotation",
  "direction",
  "preserve-centre",
  "area-aware",
];
const RANDOM: readonly ArrangementControlId[] = [...COMMON, "seed"];
const dots = (...values: number[]): readonly { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];
  for (let index = 0; index < values.length; index += 2) points.push({ x: values[index], y: values[index + 1] });
  return points;
};
const pattern = (
  id: ArrangementPatternId,
  label: string,
  hint: string,
  category: ArrangementPatternDefinition["category"],
  miniature: readonly { x: number; y: number }[],
  controls: readonly ArrangementControlId[] = COMMON,
  deterministic = true,
): ArrangementPatternDefinition => ({ id, label, hint, category, miniature, controls, deterministic, workerCompatible: true, calculator: "engine" });

export const ARRANGEMENT_PATTERNS: readonly ArrangementPatternDefinition[] = [
  pattern("horizontal-line", "Horizontal Line", "Align Cells along one horizontal axis.", "basic", dots(10, 50, 30, 50, 50, 50, 70, 50, 90, 50)),
  pattern("vertical-line", "Vertical Line", "Align Cells along one vertical axis.", "basic", dots(50, 10, 50, 30, 50, 50, 50, 70, 50, 90)),
  pattern("diagonal-line", "Diagonal Line", "Align Cells along a rotated diagonal.", "basic", dots(15, 85, 32, 68, 50, 50, 68, 32, 85, 15)),
  pattern("grid", "Grid", "Fill a rectangular rows-and-columns field.", "basic", dots(25, 25, 50, 25, 75, 25, 25, 55, 50, 55, 75, 55, 25, 85, 50, 85, 75, 85), [...COMMON, "count"]),
  pattern("rows", "Rows", "Distribute Cells across an exact or automatic row count.", "basic", dots(18, 30, 40, 30, 62, 30, 84, 30, 18, 70, 40, 70, 62, 70, 84, 70), [...COMMON, "count"]),
  pattern("columns", "Columns", "Distribute Cells across an exact or automatic column count.", "basic", dots(30, 18, 30, 42, 30, 66, 30, 90, 70, 18, 70, 42, 70, 66, 70, 90), [...COMMON, "count"]),
  pattern("circle", "Circle", "Place Cells around a circular perimeter.", "geometric", dots(50, 12, 78, 24, 88, 50, 78, 76, 50, 88, 22, 76, 12, 50, 22, 24)),
  pattern("oval", "Oval / Ellipse", "Stretch a circular perimeter by aspect ratio.", "geometric", dots(50, 20, 84, 28, 94, 50, 84, 72, 50, 80, 16, 72, 6, 50, 16, 28), [...COMMON, "aspect-ratio"]),
  pattern("square-perimeter", "Square Perimeter", "Place Cells only on the square boundary.", "geometric", dots(15, 15, 50, 15, 85, 15, 85, 50, 85, 85, 50, 85, 15, 85, 15, 50)),
  pattern("rectangle-perimeter", "Rectangle Perimeter", "Place Cells around a rectangular boundary.", "geometric", dots(8, 24, 38, 24, 68, 24, 92, 24, 92, 76, 62, 76, 32, 76, 8, 76), [...COMMON, "aspect-ratio"]),
  pattern("cross", "Cross", "Build balanced horizontal and vertical arms.", "geometric", dots(50, 12, 50, 32, 12, 50, 32, 50, 50, 50, 68, 50, 88, 50, 50, 68, 50, 88), [...COMMON, "cross-arm-ratio"]),
  pattern("radial-spokes", "Radial Spokes", "Distribute Cells along rays from the centre.", "geometric", dots(50, 50, 50, 18, 72, 28, 82, 50, 72, 72, 50, 82, 28, 72, 18, 50, 28, 28)),
  pattern("concentric-rings", "Concentric Rings", "Arrange Cells over bounded nested rings.", "geometric", dots(50, 18, 78, 34, 78, 66, 50, 82, 22, 66, 22, 34, 50, 36, 64, 50, 50, 64, 36, 50), [...COMMON, "ring-count"]),
  pattern("golden-angle", "Golden Angle / Phyllotaxis", "A deterministic sunflower distribution.", "generative", dots(50, 50, 58, 38, 36, 42, 36, 64, 62, 68, 76, 44, 50, 22, 22, 32)),
  pattern("golden-spiral", "Golden Spiral / Fibonacci Spiral", "An expanding logarithmic golden spiral.", "generative", dots(50, 50, 55, 45, 59, 52, 52, 61, 39, 57, 35, 42, 50, 28, 72, 39, 76, 64), [...COMMON, "spiral-growth"]),
  pattern("archimedean-spiral", "Archimedean Spiral", "A constant-growth spiral with even turns.", "generative", dots(50, 50, 58, 45, 60, 56, 48, 65, 32, 55, 31, 36, 52, 22, 75, 35, 82, 62), [...COMMON, "spiral-growth"]),
  pattern("seeded-random", "Seeded Random", "Reproducible random placement from a numeric seed.", "generative", dots(18, 28, 42, 18, 76, 30, 26, 56, 58, 48, 86, 62, 42, 82, 70, 86), RANDOM),
  pattern("compact-pack", "Compact Pack", "Bounded deterministic close circle packing.", "packing", dots(50, 50, 33, 50, 67, 50, 42, 34, 58, 34, 42, 66, 58, 66, 24, 35, 76, 65)),
  pattern("relaxed-pack", "Relaxed Pack", "Bounded circle packing with more breathing room.", "packing", dots(50, 50, 27, 50, 73, 50, 39, 29, 61, 29, 39, 71, 61, 71, 18, 25, 82, 75)),
  pattern("organic", "Organic", "Soft golden-angle tissue scatter.", "organic", dots(50, 50, 60, 35, 35, 39, 32, 64, 61, 70, 78, 45)),
  pattern("random", "Random", "Fresh organic spread from the current seed.", "organic", dots(20, 25, 48, 16, 78, 35, 28, 58, 60, 52, 84, 72, 44, 86), RANDOM, false),
  pattern("core", "Core", "A dominant centre with close satellites.", "organic", dots(50, 50, 50, 22, 76, 34, 78, 64, 50, 80, 24, 64, 24, 34)),
  pattern("colony", "Colony", "Loose medium-density tissue.", "organic", dots(50, 50, 61, 33, 35, 37, 29, 61, 58, 72, 78, 52, 71, 79)),
  pattern("division", "Division", "Two bodies pulling apart.", "organic", dots(27, 50, 18, 33, 16, 68, 38, 68, 73, 50, 62, 32, 84, 34, 85, 69)),
  pattern("tendril", "Tendril", "A processional curved chain.", "organic", dots(10, 70, 24, 57, 39, 50, 55, 48, 70, 42, 84, 28, 94, 14)),
  pattern("orbit", "Orbit", "A support ring around a core Cell.", "organic", dots(50, 50, 50, 14, 80, 30, 84, 63, 60, 84, 26, 78, 14, 48, 28, 22)),
  pattern("asymmetry", "Asymmetry", "Weighted cluster with an escapee.", "organic", dots(35, 55, 25, 38, 48, 36, 52, 62, 30, 75, 65, 70, 88, 18)),
] as const;

const BY_ID = new Map(ARRANGEMENT_PATTERNS.map((definition) => [definition.id, definition]));
export const getArrangementPattern = (id: ArrangementPatternId): ArrangementPatternDefinition | undefined => BY_ID.get(id);
