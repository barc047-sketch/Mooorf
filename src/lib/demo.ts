import type { Privacy } from "../types";

// Ceramic/editorial palette — muted objects on gallery cream.
export const CELL_PALETTE = [
  "#c9b8a3", // sand
  "#8a9b8e", // sage
  "#5b6e8c", // slate blue
  "#b56a4f", // terracotta
  "#4a0909", // oxblood
  "#2f2f2f", // charcoal
  "#d8c7b0", // bone clay
  "#7d6b5d", // umber
  "#9b3b2e", // iron red
  "#65727d", // fog blue
];

// Sample architecture program for demo cells.
export const DEMO_PROGRAM: {
  name: string;
  area: number;
  category: string;
  privacy: Privacy;
}[] = [
  { name: "Lobby", area: 120, category: "Public", privacy: "public" },
  { name: "Gallery", area: 200, category: "Public", privacy: "public" },
  { name: "Studio", area: 80, category: "Work", privacy: "shared" },
  { name: "Workshop", area: 150, category: "Work", privacy: "shared" },
  { name: "Café", area: 60, category: "Public", privacy: "public" },
  { name: "Library", area: 90, category: "Quiet", privacy: "shared" },
  { name: "Auditorium", area: 300, category: "Public", privacy: "public" },
  { name: "Courtyard", area: 180, category: "Outdoor", privacy: "public" },
  { name: "Archive", area: 45, category: "Quiet", privacy: "private" },
  { name: "Office", area: 70, category: "Work", privacy: "private" },
];
