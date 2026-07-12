import { ANNOTATION_DEFINITIONS, annotationRegistry } from "./annotationRegistry";

const ok = (value: unknown, message: string) => { if (!value) throw new Error(message); };
const equal = (actual: unknown, expected: unknown, message: string) => { if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`); };

equal(ANNOTATION_DEFINITIONS.length, 18, "all annotation definitions exist");
equal(new Set(ANNOTATION_DEFINITIONS.map((definition) => definition.id)).size, ANNOTATION_DEFINITIONS.length, "annotation ids are unique");
equal(new Set(ANNOTATION_DEFINITIONS.map((definition) => definition.defaultShortcut).filter(Boolean)).size, ANNOTATION_DEFINITIONS.filter((definition) => definition.defaultShortcut).length, "assigned shortcuts are unique");
for (const definition of ANNOTATION_DEFINITIONS) {
  equal(definition.status, "future", `${definition.id} is truthfully future`);
  ok(definition.supportedTargets.length > 0, `${definition.id} declares target compatibility`);
}
ok(annotationRegistry.listByCategory("direction").length >= 4, "direction annotations are discoverable");

console.info("annotation registry contracts passed");
