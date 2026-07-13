import type { IconCategory, IconDefinition, IconTarget } from "./types";

const SPACE_TARGETS = Object.freeze(["space"] as const);
const LUCIDE_ATTRIBUTION_URL = "https://lucide.dev/license";

const lucideSymbol = (
  id: string,
  name: string,
  category: IconCategory,
  sourceKey: string,
  tags: readonly string[],
): IconDefinition => Object.freeze({
  id,
  name,
  category,
  sourceType: "lucide" as const,
  sourceKey,
  tags: Object.freeze([...tags]),
  accessibleLabel: `${name} symbol`,
  tooltip: name,
  defaultTint: "#171719",
  defaultBacking: "none" as const,
  origin: "lucide" as const,
  usage: "drawable-symbol" as const,
  validationStatus: "approved" as const,
  licence: "ISC",
  attribution: "Lucide Contributors",
  attributionUrl: LUCIDE_ATTRIBUTION_URL,
  requiresVisibleAttribution: false,
  builtIn: true,
  placeableTargets: SPACE_TARGETS,
  status: "active" as const,
});

export const BUILT_IN_ICONS: readonly IconDefinition[] = Object.freeze([
  lucideSymbol("icon:architecture:door", "Door", "architecture", "DoorOpen", ["entry", "opening", "access"]),
  lucideSymbol("icon:architecture:stairs", "Stairs", "architecture", "BetweenVerticalStart", ["level", "circulation", "vertical"]),
  lucideSymbol("icon:architecture:bedroom", "Bedroom", "architecture", "BedDouble", ["bed", "sleep", "residential"]),
  lucideSymbol("icon:architecture:kitchen", "Kitchen", "architecture", "CookingPot", ["cook", "food", "residential"]),
  lucideSymbol("icon:architecture:bathroom", "Bathroom", "architecture", "Bath", ["bath", "washroom", "wet area"]),
  lucideSymbol("icon:architecture:living", "Living Space", "architecture", "Sofa", ["sofa", "lounge", "residential"]),
  lucideSymbol("icon:architecture:lounge", "Lounge", "architecture", "Armchair", ["seating", "waiting", "rest"]),
  lucideSymbol("icon:architecture:building", "Building", "architecture", "Building2", ["office", "block", "structure"]),
  lucideSymbol("icon:architecture:warehouse", "Warehouse", "architecture", "Warehouse", ["storage", "industrial", "service"]),
  lucideSymbol("icon:architecture:parking", "Parking", "architecture", "CircleParking", ["car", "vehicle", "parking"]),
  lucideSymbol("icon:architecture:boundary", "Boundary", "architecture", "Fence", ["edge", "limit", "perimeter"]),
  lucideSymbol("icon:architecture:house", "House", "architecture", "House", ["home", "residential", "dwelling"]),
  lucideSymbol("icon:architecture:hotel", "Hotel", "architecture", "Hotel", ["hospitality", "guest", "stay"]),
  lucideSymbol("icon:architecture:school", "School", "architecture", "School", ["education", "learning", "campus"]),
  lucideSymbol("icon:architecture:healthcare", "Healthcare", "architecture", "Hospital", ["hospital", "clinic", "medical"]),
  lucideSymbol("icon:architecture:civic", "Civic Building", "architecture", "Landmark", ["public", "institution", "civic"]),

  lucideSymbol("icon:landscape:tree", "Tree", "landscape", "TreePine", ["plant", "outdoor", "pine"]),
  lucideSymbol("icon:landscape:trees", "Trees", "landscape", "Trees", ["grove", "forest", "planting"]),
  lucideSymbol("icon:landscape:leaf", "Leaf", "landscape", "Leaf", ["green", "foliage", "plant"]),
  lucideSymbol("icon:landscape:flower", "Flower", "landscape", "Flower2", ["garden", "planting", "bloom"]),
  lucideSymbol("icon:landscape:planting", "Planting", "landscape", "Sprout", ["seedling", "green", "growth"]),
  lucideSymbol("icon:landscape:water", "Water", "landscape", "WavesHorizontal", ["pond", "river", "water feature"]),
  lucideSymbol("icon:landscape:terrain", "Terrain", "landscape", "Mountain", ["topography", "ground", "contour"]),
  lucideSymbol("icon:landscape:snow-terrain", "Snow Terrain", "landscape", "MountainSnow", ["mountain", "cold", "topography"]),
  lucideSymbol("icon:landscape:shade", "Shade", "landscape", "Umbrella", ["canopy", "outdoor", "shelter"]),
  lucideSymbol("icon:landscape:sunlight", "Sunlight", "landscape", "Sun", ["sun", "daylight", "solar"]),

  lucideSymbol("icon:diagram:node", "Node", "diagram", "CircleDot", ["graph", "point", "vertex"]),
  lucideSymbol("icon:diagram:network", "Network", "diagram", "Network", ["graph", "connections", "system"]),
  lucideSymbol("icon:diagram:branch", "Branch", "diagram", "GitBranch", ["split", "decision", "fork"]),
  lucideSymbol("icon:diagram:workflow", "Workflow", "diagram", "Workflow", ["process", "flow", "sequence"]),
  lucideSymbol("icon:diagram:share", "Shared Link", "diagram", "Share2", ["share", "link", "connection"]),
  lucideSymbol("icon:diagram:waypoints", "Waypoints", "diagram", "Waypoints", ["path", "nodes", "route"]),
  lucideSymbol("icon:diagram:group", "Group", "diagram", "Boxes", ["cluster", "collection", "modules"]),
  lucideSymbol("icon:diagram:dashed-node", "Dashed Node", "diagram", "CircleDashed", ["optional", "future", "node"]),
  lucideSymbol("icon:diagram:dashed-frame", "Dashed Frame", "diagram", "SquareDashed", ["boundary", "frame", "selection"]),
  lucideSymbol("icon:diagram:shapes", "Shapes", "diagram", "Shapes", ["geometry", "diagram", "symbols"]),

  lucideSymbol("icon:annotation:north", "North", "annotation", "Navigation", ["direction", "north", "orientation"]),
  lucideSymbol("icon:annotation:measure", "Measure", "annotation", "Ruler", ["scale", "dimension", "length"]),
  lucideSymbol("icon:annotation:area-tag", "Area Tag", "annotation", "ScanText", ["area", "label", "data"]),
  lucideSymbol("icon:annotation:movement-arrow", "Movement Arrow", "annotation", "MoveRight", ["movement", "arrow", "flow"]),
  lucideSymbol("icon:annotation:section", "Section", "annotation", "Slice", ["cut", "section", "drawing"]),
  lucideSymbol("icon:annotation:view", "View", "annotation", "Eye", ["view", "sightline", "visibility"]),
  lucideSymbol("icon:annotation:compass", "Compass", "annotation", "Compass", ["orientation", "direction", "bearing"]),
  lucideSymbol("icon:annotation:target", "Target", "annotation", "Crosshair", ["focus", "target", "reference"]),

  lucideSymbol("icon:wayfinding:route", "Route", "wayfinding", "Route", ["movement", "path", "journey"]),
  lucideSymbol("icon:wayfinding:entry", "Entry", "wayfinding", "LogIn", ["entrance", "access", "in"]),
  lucideSymbol("icon:wayfinding:exit", "Exit", "wayfinding", "LogOut", ["egress", "leave", "out"]),
  lucideSymbol("icon:wayfinding:signpost", "Signpost", "wayfinding", "Signpost", ["sign", "direction", "guide"]),
  lucideSymbol("icon:wayfinding:location", "Location", "wayfinding", "MapPin", ["place", "pin", "destination"]),
  lucideSymbol("icon:wayfinding:up", "Direction Up", "wayfinding", "ArrowUp", ["up", "forward", "direction"]),
  lucideSymbol("icon:wayfinding:right", "Direction Right", "wayfinding", "ArrowRight", ["right", "forward", "direction"]),
  lucideSymbol("icon:wayfinding:walking", "Walking", "wayfinding", "Footprints", ["pedestrian", "path", "walk"]),

  lucideSymbol("icon:environmental:wind", "Wind", "environmental", "Wind", ["air", "breeze", "ventilation"]),
  lucideSymbol("icon:environmental:heat", "Heat", "environmental", "Flame", ["hot", "thermal", "fire"]),
  lucideSymbol("icon:environmental:cold", "Cold", "environmental", "Snowflake", ["cool", "winter", "thermal"]),
  lucideSymbol("icon:environmental:sun", "Sun", "environmental", "SunMedium", ["solar", "daylight", "orientation"]),
  lucideSymbol("icon:environmental:rain", "Rain", "environmental", "CloudRain", ["weather", "stormwater", "cloud"]),
  lucideSymbol("icon:environmental:droplets", "Water Droplets", "environmental", "Droplets", ["water", "humidity", "moisture"]),
  lucideSymbol("icon:environmental:heat-index", "Heat Index", "environmental", "ThermometerSun", ["temperature", "warm", "climate"]),
  lucideSymbol("icon:environmental:cold-index", "Cold Index", "environmental", "ThermometerSnowflake", ["temperature", "cool", "climate"]),

  lucideSymbol("icon:accessibility:access", "Accessible", "accessibility", "Accessibility", ["wheelchair", "access", "inclusive"]),
  lucideSymbol("icon:accessibility:person", "Person", "accessibility", "PersonStanding", ["human", "occupant", "standing"]),
  lucideSymbol("icon:accessibility:hearing", "Hearing", "accessibility", "Ear", ["audio", "sound", "hearing"]),
  lucideSymbol("icon:accessibility:assistance", "Assistance", "accessibility", "Hand", ["help", "support", "hand"]),
  lucideSymbol("icon:accessibility:family", "Family Facility", "accessibility", "Baby", ["baby", "family", "care"]),
  lucideSymbol("icon:accessibility:help", "Help Point", "accessibility", "CircleQuestionMark", ["help", "information", "assistance"]),

  lucideSymbol("icon:service:maintenance", "Maintenance", "service", "Wrench", ["repair", "tools", "facility"]),
  lucideSymbol("icon:service:mechanical", "Mechanical", "service", "Cog", ["plant", "machine", "equipment"]),
  lucideSymbol("icon:service:power", "Power", "service", "Zap", ["electric", "energy", "utility"]),
  lucideSymbol("icon:service:water", "Water Service", "service", "Droplet", ["plumbing", "water", "utility"]),
  lucideSymbol("icon:service:connectivity", "Connectivity", "service", "Wifi", ["network", "wireless", "data"]),
  lucideSymbol("icon:service:security", "Security", "service", "Shield", ["safe", "protection", "secure"]),
  lucideSymbol("icon:service:lighting", "Lighting", "service", "Lightbulb", ["light", "electrical", "illumination"]),
  lucideSymbol("icon:service:electrical", "Electrical", "service", "Plug", ["power", "socket", "utility"]),
  lucideSymbol("icon:service:cabling", "Cabling", "service", "Cable", ["wire", "data", "electrical"]),
  lucideSymbol("icon:service:ventilation", "Ventilation", "service", "Fan", ["air", "hvac", "mechanical"]),
  lucideSymbol("icon:service:emergency", "Emergency", "service", "Siren", ["alarm", "warning", "safety"]),
]);

export const ICON_ID_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  "icon:door": "icon:architecture:door",
  "icon:stairs": "icon:architecture:stairs",
  "icon:tree": "icon:landscape:tree",
  "icon:node": "icon:diagram:node",
  "icon:north": "icon:annotation:north",
  "icon:route": "icon:wayfinding:route",
});

const byId = new Map(BUILT_IN_ICONS.map((item) => [item.id, item]));
const resolveId = (id: string): string | null => {
  const canonicalId = ICON_ID_ALIASES[id] ?? id;
  return byId.has(canonicalId) ? canonicalId : null;
};

export const iconRegistry = Object.freeze({
  resolveId,
  get: (id: string): IconDefinition | null => {
    const canonicalId = resolveId(id);
    return canonicalId ? byId.get(canonicalId) ?? null : null;
  },
  list: (): readonly IconDefinition[] => BUILT_IN_ICONS,
  listByCategory: (category: IconCategory): readonly IconDefinition[] => BUILT_IN_ICONS.filter((item) => item.category === category),
  listByTarget: (target: IconTarget): readonly IconDefinition[] => BUILT_IN_ICONS.filter((item) => item.placeableTargets.includes(target)),
  search: (query: string): readonly IconDefinition[] => {
    const needle = query.trim().toLowerCase();
    return needle
      ? BUILT_IN_ICONS.filter((item) => `${item.name} ${item.accessibleLabel} ${item.tooltip} ${item.tags.join(" ")}`.toLowerCase().includes(needle))
      : BUILT_IN_ICONS;
  },
});
