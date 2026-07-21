// Sample ZONUERT project — "Meridian Community Hub", a small mixed civic
// program used to exercise the full V4.5B schema (floors, categories,
// privacy, Connections, flows) without being huge.

import { radiusFromArea, shortLabelFromName } from "./adapters";
import type {
  CategoryCode,
  Connection,
  ConnectionSemantic,
  ConnectionSemanticTypeId,
  FlowPath,
  SpaceNode,
  ZonuertProject,
} from "./types";
import { DEFAULT_CATEGORIES } from "./types";
import { createConnectionSemantic } from "../connections/model";

const CAT = new Map(DEFAULT_CATEGORIES.map((c) => [c.code, c]));

// Compact space factory — fills colour/gradient from the category definition,
// radius from area, short label from name.
const space = (
  id: string,
  floor_id: string,
  name: string,
  area: number,
  category: CategoryCode,
  privacy: SpaceNode["privacy"],
  x: number,
  y: number,
  extra?: Partial<SpaceNode>
): SpaceNode => {
  const cat = CAT.get(category)!;
  return {
    id,
    floor_id,
    name,
    short_label: shortLabelFromName(name),
    area,
    unit: "sqm",
    category,
    privacy,
    shape: "circle",
    color: cat.color,
    gradient_from: cat.color,
    gradient_to: cat.gradient_to,
    x,
    y,
    radius: radiusFromArea(area),
    locked: false,
    visible: true,
    ...extra,
  };
};

const spaces: SpaceNode[] = [
  // Basement (cluster lower on canvas)
  space("sp_b01", "fl_b1", "Parking", 900, "UTL", "P1", -220, 520),
  space("sp_b02", "fl_b1", "HVAC Plant Room", 120, "TEC", "P4", 160, 620),
  space("sp_b03", "fl_b1", "Electrical Room", 60, "TEC", "P4", 330, 560),
  space("sp_b04", "fl_b1", "Pump & Water Tanks", 80, "UTL", "P5", 420, 680),
  space("sp_b05", "fl_b1", "General Storage", 90, "STO", "P5", 40, 720),
  space("sp_b06", "fl_b1", "Staff Lockers", 40, "SER", "P5", -80, 640),

  // Ground floor (cluster centre)
  space("sp_g01", "fl_gf", "Entrance Lobby", 160, "PUB", "P0", 0, 0, { code: "GF-01" }),
  space("sp_g02", "fl_gf", "Reception", 40, "ADM", "P1", 140, -60, { code: "GF-02" }),
  space("sp_g03", "fl_gf", "Exhibition Gallery", 320, "PUB", "P0", -260, -80, { code: "GF-03" }),
  space("sp_g04", "fl_gf", "Café", 110, "FNB", "P0", 230, 120),
  space("sp_g05", "fl_gf", "Café Kitchen", 45, "SER", "P5", 360, 180),
  space("sp_g06", "fl_gf", "Retail Kiosk", 35, "RET", "P0", 120, 200),
  space("sp_g07", "fl_gf", "Public Toilets", 55, "SER", "P0", -140, 220),
  space("sp_g08", "fl_gf", "Courtyard", 260, "OUT", "P0", -420, 160),
  space("sp_g09", "fl_gf", "Fire Control Room", 25, "EMG", "P4", 300, -160),
  space("sp_g10", "fl_gf", "Core (Stairs + Lift)", 70, "CIR", "P0", 60, -200),

  // First floor (cluster upper)
  space("sp_f01", "fl_f1", "Library & Reading", 180, "EDU", "P1", -200, -480),
  space("sp_f02", "fl_f1", "Workshop Classrooms", 140, "EDU", "P1", 40, -560),
  space("sp_f03", "fl_f1", "Co-working Studio", 120, "SPR", "P2", 260, -480),
  space("sp_f04", "fl_f1", "Admin Offices", 90, "ADM", "P2", 420, -560),
  space("sp_f05", "fl_f1", "Meeting Rooms", 60, "SPB", "P1", 340, -360),
  space("sp_f06", "fl_f1", "First-Aid Room", 20, "HLT", "P1", 180, -640),
  space("sp_f07", "fl_f1", "Terrace Deck", 150, "OUT", "P0", -440, -560),
  space("sp_f08", "fl_f1", "Toilets (First)", 40, "SER", "P0", -60, -680),
];

const connection = (
  id: string,
  fromSpaceId: string,
  toSpaceId: string,
  typeId: ConnectionSemanticTypeId,
  semantic: Partial<Omit<ConnectionSemantic, "typeId">> = {},
): Connection => ({
  id,
  fromSpaceId,
  toSpaceId,
  enabled: true,
  semantic: createConnectionSemantic(typeId, semantic),
});

const connections: Connection[] = [
  connection("re_01", "sp_g01", "sp_g02", "adjacency", { notes: "Reception faces lobby" }),
  connection("re_02", "sp_g01", "sp_g03", "adjacency", { strength: "strong" }),
  connection("re_03", "sp_g04", "sp_g05", "shared-support", { notes: "Kitchen serves café" }),
  connection("re_04", "sp_g03", "sp_b02", "separation", { notes: "Gallery away from plant noise" }),
  connection("re_05", "sp_f01", "sp_g04", "separation", { notes: "Reading away from café noise" }),
  connection("re_06", "sp_b01", "sp_g01", "direct-access", { direction: "a-to-b", notes: "Parking reaches lobby via core" }),
  connection("re_07", "sp_f04", "sp_f05", "shared-support", { strength: "medium" }),
  connection("re_08", "sp_g05", "sp_b05", "shared-support", { notes: "Kitchen stock from storage" }),
  connection("re_09", "sp_g01", "sp_g08", "visual-access", { notes: "Lobby sees courtyard" }),
  connection("re_10", "sp_g09", "sp_g10", "separation", { priority: "critical", notes: "Keep fire control clear of core queue" }),
];

const flows: FlowPath[] = [
  {
    id: "fw_01",
    name: "Visitor arrival",
    flow_type: "visitor",
    start: "sp_b01",
    end: "sp_g03",
    via: ["sp_g10", "sp_g01"],
    intensity: 0.8,
    color: "#9b3b2e",
  },
  {
    id: "fw_02",
    name: "Service loop",
    flow_type: "service",
    start: "sp_b05",
    end: "sp_g05",
    via: ["sp_g10"],
    intensity: 0.4,
    color: "#6b7178",
  },
];

export const SAMPLE_PROJECT: ZonuertProject = {
  version: "1.0",
  created_at: "2026-07-06T00:00:00.000Z",
  updated_at: "2026-07-06T00:00:00.000Z",
  meta: {
    project_id: "zp_meridian_hub",
    project_name: "Meridian Community Hub",
    typology: "Community / cultural centre",
    location_country: "India",
    location_state: "Maharashtra",
    location_city: "Pune",
    authority: "PMC",
    site_area: 4800,
    site_area_unit: "sqm",
    total_built_up_area: 4200, // target, actuals via selectors
    floors_count: 3,
    road_width: 18,
    land_use: "Public / semi-public",
    notes: "Sample data for schema + selector verification only.",
  },
  floors: [
    { id: "fl_b1", name: "Basement", level: -1, elevation: -3.6, area_target: 1300, visible: true, locked: false },
    { id: "fl_gf", name: "Ground Floor", level: 0, elevation: 0, area_target: 1600, visible: true, locked: false },
    { id: "fl_f1", name: "First Floor", level: 1, elevation: 4.2, area_target: 1300, visible: true, locked: false },
  ],
  spaces,
  connections,
  flows,
  categories: DEFAULT_CATEGORIES,
};
