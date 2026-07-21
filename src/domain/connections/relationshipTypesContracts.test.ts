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
