import { strict as assert } from "node:assert";
import test from "node:test";

type VirtualRowWindow = {
  startIndex: number;
  endIndex: number;
  topSpacerHeight: number;
  bottomSpacerHeight: number;
  mountedRowCount: number;
};

type WindowCalculator = (input: {
  rowCount: number;
  scrollTop: number;
  viewportHeight: number;
  rowHeight: number;
  overscan: number;
}) => VirtualRowWindow;

test("virtual row window stays bounded for 300 and 500 rows and preserves scroll height", async () => {
  const tableModule = await import("./TableView");
  const calculateVirtualRowWindow = (
    tableModule as unknown as { calculateVirtualRowWindow?: WindowCalculator }
  ).calculateVirtualRowWindow;

  assert.equal(
    typeof calculateVirtualRowWindow,
    "function",
    "TableView must export its production virtual-row calculation",
  );

  const rowHeight = 64;
  const viewportHeight = 720;
  const overscan = 8;
  const atTop = calculateVirtualRowWindow!({
    rowCount: 300,
    scrollTop: 0,
    viewportHeight,
    rowHeight,
    overscan,
  });
  const atMiddle = calculateVirtualRowWindow!({
    rowCount: 300,
    scrollTop: 150 * rowHeight,
    viewportHeight,
    rowHeight,
    overscan,
  });
  const atEnd = calculateVirtualRowWindow!({
    rowCount: 500,
    scrollTop: 500 * rowHeight - viewportHeight,
    viewportHeight,
    rowHeight,
    overscan,
  });

  for (const [rowCount, window] of [
    [300, atTop],
    [300, atMiddle],
    [500, atEnd],
  ] as const) {
    assert.ok(window.mountedRowCount <= 32, `${rowCount} rows remain bounded`);
    assert.equal(window.mountedRowCount, window.endIndex - window.startIndex);
    assert.equal(
      window.topSpacerHeight
        + window.mountedRowCount * rowHeight
        + window.bottomSpacerHeight,
      rowCount * rowHeight,
      `${rowCount} rows preserve the full scroll range`,
    );
  }

  assert.ok(atMiddle.startIndex > atTop.startIndex, "scrolling advances the visible row window");
  assert.equal(atTop.topSpacerHeight, 0);
  assert.equal(atEnd.endIndex, 500);
  assert.equal(atEnd.bottomSpacerHeight, 0);
});
