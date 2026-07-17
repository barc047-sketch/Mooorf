import "../types";

declare module "../types" {
  interface SpaceCell {
    /** Stable user-facing Space No.; independent from row order and internal ID. */
    spaceCode?: string;
  }
}
