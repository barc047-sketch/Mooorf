import { getAreaRange, getNucleusColor } from "./colorMapping";
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

console.info("palette contracts passed");
