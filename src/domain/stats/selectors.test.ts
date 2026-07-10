import type { SpaceCell } from "../../types";
import {
  selectAreaLeaders,
  selectCategoryMix,
  selectDataHealth,
  selectPrivacyBalance,
} from "./selectors";

const assert = {
  equal(actual: unknown, expected: unknown, message = "values differ") {
    if (!Object.is(actual, expected)) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
  },
  deepEqual(actual: unknown, expected: unknown, message = "structures differ") {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(message);
  },
  ok(value: unknown, message = "expected truthy value") {
    if (!value) throw new Error(message);
  },
  match(value: string, pattern: RegExp, message = "pattern did not match") {
    if (!pattern.test(value)) throw new Error(message);
  },
};

const cell = (overrides: Partial<SpaceCell> & Pick<SpaceCell, "id">): SpaceCell => {
  const { id, ...rest } = overrides;
  return {
    id,
    name: "Room",
    area: 10,
    category: "Public",
    privacy: "public",
    color: "#777777",
    x: 0,
    y: 0,
    ...rest,
  };
};

const assertFiniteNumbers = (value: unknown): void => {
  if (typeof value === "number") {
    assert.ok(Number.isFinite(value), `expected finite number, received ${value}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(assertFiniteNumbers);
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach(assertFiniteNumbers);
  }
};

{
  const result = selectCategoryMix([
    cell({ id: "public", area: 100, category: "Public" }),
    cell({ id: "work", area: 50, category: "Work" }),
    cell({ id: "void", kind: "void", area: 900, category: "Void" }),
    cell({ id: "invalid", area: Number.NaN, category: "Service" }),
  ]);
  assert.equal(result.programArea, 150);
  assert.equal(result.spaceCount, 3);
  assert.equal(result.voidCount, 1);
  assert.deepEqual(
    result.categories.map(({ id, area }) => ({ id, area })),
    [
      { id: "public", area: 100 },
      { id: "admin", area: 50 },
      { id: "service", area: 0 },
    ]
  );
  assertFiniteNumbers(result);
}

{
  const result = selectPrivacyBalance([
    cell({ id: "public", area: 100, privacy: "public" }),
    cell({ id: "shared", area: 50, privacy: "shared" }),
    cell({ id: "unknown", area: 25, privacy: "mystery" as SpaceCell["privacy"] }),
    cell({ id: "void", kind: "void", area: 999, privacy: "private" }),
  ]);
  assert.equal(result.programArea, 175);
  assert.deepEqual(result.groups.map(({ id, area }) => ({ id, area })), [
    { id: "public", area: 100 },
    { id: "shared", area: 50 },
    { id: "private", area: 0 },
    { id: "unknown", area: 25 },
  ]);
  assert.equal(result.dominant?.id, "public");
  assert.equal(result.groups[3]?.share, 25 / 175);
  assertFiniteNumbers(result);
}

{
  const result = selectAreaLeaders([
    cell({ id: "one", name: "One", area: 100, category: "Public" }),
    cell({ id: "two", name: "Two", area: 50, category: "Admin" }),
    cell({ id: "invalid", area: Number.POSITIVE_INFINITY }),
    cell({ id: "void", kind: "void", area: 900 }),
  ]);
  assert.equal(result.programArea, 150);
  assert.deepEqual(result.leaders.map(({ id, share }) => ({ id, share })), [
    { id: "one", share: 2 / 3 },
    { id: "two", share: 1 / 3 },
  ]);
  assert.equal(result.leaders[0]?.categoryId, "public");
  assert.equal(result.leaders[1]?.categoryLabel, "Admin");
  assert.match(result.leaders[0]?.categoryColor ?? "", /^#[0-9a-f]{6}$/i);
  assertFiniteNumbers(result);
}

{
  const result = selectDataHealth([
    cell({ id: "blank", name: " ", area: 100, category: "", privacy: "public" }),
    cell({ id: "invalid", name: "Studio", area: 0, category: "Admin", privacy: "shared" }),
    cell({ id: "duplicate", name: " studio ", area: 50, category: "Admin", privacy: "mystery" as SpaceCell["privacy"] }),
    cell({ id: "void", name: "Void", kind: "void", area: Number.NaN }),
  ]);
  assert.equal(result.status, "blocking");
  assert.equal(result.totalIssueCount, 7);
  assert.equal(result.affectedSpaceCount, 4);
  assert.equal(result.firstAffectedId, "invalid");
  assert.deepEqual(
    Object.fromEntries(result.signals.map((signal) => [signal.id, signal.count])),
    {
      "invalid-area": 1,
      "invalid-void-area": 1,
      "missing-name": 1,
      uncategorized: 1,
      "unknown-privacy": 1,
      "duplicate-name": 2,
    }
  );
  assertFiniteNumbers(result);
}

{
  const clear = selectDataHealth([cell({ id: "clear", name: "Gallery", area: 20 })]);
  assert.equal(clear.status, "clear");
  assert.equal(clear.totalIssueCount, 0);
  assert.equal(clear.firstAffectedId, null);

  for (const spaces of [[], [cell({ id: "void", kind: "void", area: 500 })]]) {
    assertFiniteNumbers(selectCategoryMix(spaces));
    assertFiniteNumbers(selectPrivacyBalance(spaces));
    assertFiniteNumbers(selectAreaLeaders(spaces));
    assertFiniteNumbers(selectDataHealth(spaces));
  }
}

console.info("stats selector edge cases passed");
