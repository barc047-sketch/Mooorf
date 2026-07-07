export type Theme = "day" | "night";

export type ViewMode = "canvas" | "table";

export type Privacy = "public" | "shared" | "private";

export type MorphMode =
  | "cellular-reverse"
  | "plain-black"
  | "plain-white"
  | "graphite"
  | "wine"
  | "auto";

export type AttachMode = "tight" | "soft" | "long";

export interface SpaceCell {
  id: string;
  name: string;
  area: number; // m²
  category: string;
  privacy: Privacy;
  color: string;
  x: number;
  y: number;
  born?: number; // Date.now() at creation — drives spawn stagger in renderer
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}
