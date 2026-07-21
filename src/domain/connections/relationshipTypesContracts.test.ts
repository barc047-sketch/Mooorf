import { strict as assert } from "node:assert";
import test from "node:test";
import type { Connection } from "../graph/types";

const connection = (id: string, typeId: string): Connection => ({
  id,
  fromSpaceId: "cell-a",
  toSpaceId: "cell-b",
  enabled: true,
  semantic: {
    typeId,
    requirement: "optional",
    direction: "none",
    strength: "medium",
    priority: "normal",
    notes: "",
  },
});

test("Relationship Type library keeps Custom and all factory identities stable", async () => {
  const types = await import("./relationshipTypes");
  const styles = await import("./styles");
  const library = types.getAllRelationshipTypes([], styles.createDefaultProjectConnectionStyles());

  assert.deepEqual(library.map((type) => type.id), [
    "custom",
    "adjacency",
    "direct-access",
    "visual-access",
    "shared-support",
    "circulation-flow",
    "separation",
  ]);
  assert.equal(types.resolveRelationshipType("missing", [], styles.createDefaultProjectConnectionStyles()).id, "custom");
  assert.equal(types.getRelationshipTypeMutationGuard(library[0]!, 0, "archive").allowed, false);
  assert.equal(types.getRelationshipTypeMutationGuard(library[0]!, 0, "delete").allowed, false);
});

test("project Relationship Types have stable IDs, resolve with factory types, and preserve archive integrity", async () => {
  const types = await import("./relationshipTypes");
  const styles = await import("./styles");
  const factoryStyles = styles.createDefaultProjectConnectionStyles();
  const created = types.createProjectRelationshipType({
    name: "Acoustic Separation",
    shortCode: "acs",
    description: "Keeps quiet and noisy spaces apart.",
  }, [], factoryStyles, 123456);
  const archived = { ...created, archived: true };

  assert.match(created.id, /^rt_/);
  assert.equal(created.shortCode, "ACS");
  assert.equal(types.resolveRelationshipType(created.id, [created], factoryStyles).name, "Acoustic Separation");
  assert.deepEqual(
    types.getSelectableRelationshipTypes([created, archived], factoryStyles).map((type) => type.id),
    ["custom", "adjacency", "direct-access", "visual-access", "shared-support", "circulation-flow", "separation", created.id],
  );
  assert.equal(types.resolveRelationshipType(archived.id, [archived], factoryStyles).archived, true);
});

test("Relationship Type usage uses the cached Connection index and blocks unsafe deletion", async () => {
  const types = await import("./relationshipTypes");
  const selectors = await import("./selectors");
  const styles = await import("./styles");
  const projectType = types.createProjectRelationshipType({ name: "Service Route", shortCode: "SRV" }, [], styles.createDefaultProjectConnectionStyles(), 42);
  const index = selectors.getConnectionIndex([connection("service", projectType.id), connection("custom", "custom")]);

  assert.equal(types.getRelationshipTypeUsageCount(index, projectType.id), 1);
  assert.equal(types.getRelationshipTypeMutationGuard(projectType, 1, "delete").allowed, false);
  assert.equal(types.getRelationshipTypeMutationGuard(projectType, 0, "delete").allowed, true);
});

test("project Relationship Types normalize missing project state and retain their visual inheritance", async () => {
  const types = await import("./relationshipTypes");
  const styles = await import("./styles");
  const factoryStyles = styles.createDefaultProjectConnectionStyles();
  assert.deepEqual(types.normalizeProjectRelationshipTypes(undefined, factoryStyles), []);

  const projectType = types.createProjectRelationshipType({
    name: "Emergency Access",
    shortCode: "EAC",
    visualDefaults: { appearance: { width: 3 } },
  }, [], factoryStyles, 9);
  const resolved = styles.resolveConnectionStyle(connection("emergency", projectType.id), factoryStyles, [projectType]);
  assert.equal(resolved.appearance.width, 3);
});

test("project snapshots retain project-created Relationship Types without rewriting Connections", async () => {
  const types = await import("./relationshipTypes");
  const { buildProjectSnapshot } = await import("../../export/projectSnapshot");
  const { currentSettingsForSnapshot } = await import("../../export/exportService");
  const settings = currentSettingsForSnapshot();
  const projectType = types.createProjectRelationshipType({ name: "Fire Escape", shortCode: "FIRE" }, [], settings.connectionStyles!, 17);
  const snapshot = buildProjectSnapshot({
    spaces: [],
    connections: [],
    camera: { x: 0, y: 0, zoom: 1 },
    theme: "night",
    settings: { ...settings, projectRelationshipTypes: [projectType] },
  }, "Relationship Type test");

  assert.deepEqual(snapshot.settings.projectRelationshipTypes?.map((type) => type.id), [projectType.id]);
});

test("Connection annotations inherit sparsely, normalize safely, and resolve without mutation", async () => {
  const annotations = await import("./annotations");
  const types = await import("./relationshipTypes");
  const styles = await import("./styles");
  const model = await import("./model");
  const { buildProjectSnapshot } = await import("../../export/projectSnapshot");
  const { currentSettingsForSnapshot } = await import("../../export/exportService");
  const { buildProjectEnvelope, parseProjectEnvelope } = await import("../../import/projectFiles");
  const factoryStyles = styles.createDefaultProjectConnectionStyles();
  const projectType = types.createProjectRelationshipType({
    name: "Primary Circulation",
    shortCode: "PC",
    annotationDefaults: {
      title: { source: "relationship-type" },
      body: { source: "custom", text: "Main public route." },
    },
  }, [], factoryStyles, 41);
  const customTitleType = types.createProjectRelationshipType({
    name: "Service Route",
    annotationDefaults: { title: { source: "custom", text: "Back of house" } },
  }, [projectType], factoryStyles, 42);
  const inherited = connection("inherited", projectType.id);
  const titleOverride = { ...inherited, annotation: { title: { source: "custom" as const, text: "Visitor Route" } } };
  const bodyOverride = { ...inherited, annotation: { body: { source: "custom" as const, text: "Gallery route" } } };
  const hidden = { ...inherited, annotation: { title: { source: "hidden" as const }, body: { source: "hidden" as const } } };

  assert.deepEqual(annotations.resolveConnectionAnnotation(connection("custom", "custom"), types.resolveRelationshipType("custom", [], factoryStyles)), {
    title: { source: "hidden", text: "", visible: false },
    body: { source: "hidden", text: "", visible: false },
  });
  assert.equal(annotations.resolveConnectionAnnotation(inherited, projectType).title.text, "Primary Circulation");
  assert.equal(annotations.resolveConnectionAnnotation(inherited, projectType).body.text, "Main public route.");
  assert.equal(annotations.resolveConnectionAnnotation(connection("custom-title", customTitleType.id), customTitleType).title.text, "Back of house");
  assert.deepEqual(annotations.resolveConnectionAnnotation(titleOverride, projectType).body, {
    source: "custom", text: "Main public route.", visible: true,
  });
  assert.equal(annotations.resolveConnectionAnnotation(bodyOverride, projectType).title.text, "Primary Circulation");
  assert.equal(annotations.resolveConnectionAnnotation(hidden, projectType).title.visible, false);
  assert.equal(annotations.resolveConnectionAnnotation(hidden, projectType).body.visible, false);
  assert.equal(annotations.clearConnectionAnnotationOverride(), undefined);

  const reclassified = { ...titleOverride, semantic: { ...titleOverride.semantic, typeId: "custom" } };
  assert.equal(annotations.resolveConnectionAnnotation(reclassified, types.resolveRelationshipType("custom", [], factoryStyles)).title.text, "Visitor Route");
  assert.equal(annotations.resolveConnectionAnnotation({ ...inherited, semantic: { ...inherited.semantic, typeId: "custom" } }, types.resolveRelationshipType("custom", [], factoryStyles)).title.visible, false);
  assert.doesNotThrow(() => annotations.resolveConnectionAnnotation(inherited, undefined));

  const normalized = model.normalizeConnectionCollection([{ ...bodyOverride, annotation: { body: { source: "custom", text: "  " } } }], new Set(["cell-a", "cell-b"]), factoryStyles, [projectType]);
  assert.equal(normalized[0]?.annotation?.body?.source, "hidden");
  assert.equal(model.cloneConnection(bodyOverride).annotation?.body?.text, "Gallery route");
  assert.equal(annotations.resolveConnectionAnnotation(inherited, projectType).body.text, "Main public route.");

  const settings = currentSettingsForSnapshot();
  const snapshot = buildProjectSnapshot({
    spaces: [
      { id: "cell-a", name: "A", body: "", kind: "space", area: 1, category: "Test", privacy: "public", color: "", x: 0, y: 0 },
      { id: "cell-b", name: "B", body: "", kind: "space", area: 1, category: "Test", privacy: "public", color: "", x: 1, y: 1 },
    ],
    connections: [bodyOverride],
    camera: { x: 0, y: 0, zoom: 1 },
    theme: "night",
    settings: { ...settings, projectRelationshipTypes: [projectType] },
  }, "Annotation persistence");
  const roundTrip = parseProjectEnvelope(JSON.stringify(buildProjectEnvelope(snapshot, [])));
  assert.deepEqual(roundTrip.snapshot.connections[0]?.annotation, bodyOverride.annotation);
});
