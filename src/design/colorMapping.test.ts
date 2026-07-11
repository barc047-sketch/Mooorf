import { getAreaRange, getNucleusColor } from "./colorMapping";
import { NUCLEUS_PALETTES } from "./palettes";
import type { SpaceCell } from "../types";

const equal = (actual: unknown, expected: unknown, message: string) => {
  if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
};
const ok = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};

const base: SpaceCell = {
  id: "space-a",
  name: "Studio",
  area: 80,
  category: "Work",
  privacy: "shared",
  color: "",
  x: 0,
  y: 0,
};
const range = getAreaRange([base]);

equal(getNucleusColor({ ...base, color: "#123456" }, "core", range, "architecture-warm").fill, "#123456", "explicit color wins");
equal(
  getNucleusColor(base, "core", range, "architecture-warm").fill,
  getNucleusColor(base, "core", range, "architecture-warm").fill,
  "palette mapping is deterministic"
);
ok(
  getNucleusColor(base, "core", range, "architecture-warm").fill !==
    getNucleusColor(base, "core", range, "architecture-cool").fill,
  "active palette changes existing non-explicit cells"
);
ok(
  getNucleusColor({ ...base, id: "a", category: "" }, "core", range, "architecture-warm").fill !==
    getNucleusColor({ ...base, id: "b", category: "" }, "core", range, "architecture-warm").fill,
  "stable id supplies deterministic fallback assignment"
);
equal(getNucleusColor({ ...base, kind: "void" }, "core", range, "architecture-warm").fill, "#070707", "voids stay subtractive by default");
equal(getNucleusColor({ ...base, kind: "void", color: "#445566" }, "core", range, "architecture-warm").fill, "#445566", "explicit void color is honored");

const aurora = NUCLEUS_PALETTES.find((palette) => palette.id === "editorial-aurora");
equal(aurora?.label, "Editorial Aurora", "Editorial Aurora is available");
equal(
  aurora?.shades.join(","),
  "#E0D0F3,#DEC1EF,#CBAFD4,#F5DECD,#F3CFB6,#E1BC92,#EFC981,#D3B7C1,#342D2B",
  "Editorial Aurora preserves the authored swatches"
);

const categoryA = getNucleusColor({ ...base, id: "a", category: "Public" }, "core", range, "editorial-aurora", "category");
const categoryB = getNucleusColor({ ...base, id: "b", category: "Public" }, "core", range, "editorial-aurora", "category");
const categoryC = getNucleusColor({ ...base, id: "c", category: "Service" }, "core", range, "editorial-aurora", "category");
equal(categoryA.fill, categoryB.fill, "same category has the same hue");
ok(categoryA.fill !== categoryC.fill, "different categories remain visibly distinct");
equal(getNucleusColor({ ...base, privacy: "public" }, "core", range, "editorial-aurora", "privacy").fill, "#e0d0f3", "public privacy mapping is exact");
equal(getNucleusColor({ ...base, privacy: "shared" }, "core", range, "editorial-aurora", "privacy").fill, "#f5decd", "shared privacy mapping is exact");
equal(getNucleusColor({ ...base, privacy: "private" }, "core", range, "editorial-aurora", "privacy").fill, "#e2b36b", "private privacy mapping is exact");
equal(
  getNucleusColor({ ...base, color: "   " }, "core", range, "editorial-aurora", "category").fill,
  getNucleusColor(base, "core", range, "editorial-aurora", "category").fill,
  "empty explicit colors do not override mapping"
);

console.info("palette contracts passed");
