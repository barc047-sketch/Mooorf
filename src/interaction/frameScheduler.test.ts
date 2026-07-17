import { strict as assert } from "node:assert";
import test from "node:test";
import { createDemandFrameLoop } from "./frameScheduler.ts";

const harness = (render: (now: number) => boolean = () => false) => {
  let nextId = 0;
  const frames = new Map<number, (now: number) => void>();
  const cancelled: number[] = [];
  const loop = createDemandFrameLoop({
    schedule: (callback) => {
      const id = ++nextId;
      frames.set(id, callback);
      return id;
    },
    cancel: (id) => {
      cancelled.push(id);
      frames.delete(id);
    },
    render,
  });
  const runOnlyFrame = (now: number) => {
    assert.equal(frames.size, 1, "exactly one owned frame is scheduled");
    const [id, callback] = [...frames.entries()][0];
    frames.delete(id);
    callback(now);
    return id;
  };
  return { loop, frames, cancelled, runOnlyFrame };
};

test("pause cancels scheduled work and paused invalidations collapse", () => {
  const { loop, frames, cancelled, runOnlyFrame } = harness();
  loop.invalidate();
  assert.equal(frames.size, 1);
  loop.setPaused(true);
  assert.equal(loop.isPaused(), true);
  assert.deepEqual(cancelled, [1]);
  assert.equal(frames.size, 0);
  loop.invalidate();
  loop.invalidate();
  loop.invalidate();
  assert.equal(frames.size, 0);
  loop.setPaused(false);
  assert.equal(loop.isPaused(), false);
  assert.equal(frames.size, 1);
  loop.setPaused(false);
  assert.equal(frames.size, 1, "repeated resume does not duplicate preparation");
  runOnlyFrame(16);
  assert.equal(frames.size, 0);
});

test("continuous intent is dormant while paused and starts after preparation", () => {
  const rendered: number[] = [];
  const { loop, frames, runOnlyFrame } = harness((now) => {
    rendered.push(now);
    return false;
  });
  loop.setPaused(true);
  loop.setContinuous(true);
  loop.setContinuous(false);
  assert.equal(frames.size, 0);
  loop.setPaused(false);
  assert.equal(frames.size, 0, "latest false intent replaces paused continuous work");
  loop.setPaused(true);
  loop.setContinuous(true);
  assert.equal(frames.size, 0);
  loop.setPaused(false);
  assert.equal(frames.size, 1);
  assert.deepEqual(rendered, []);
  runOnlyFrame(20);
  assert.deepEqual(rendered, [20]);
  assert.equal(frames.size, 1, "continuous follow-up starts after preparation");
  loop.setContinuous(false);
  runOnlyFrame(36);
  assert.equal(frames.size, 0);
});

test("pausing an already scheduled continuous frame remembers its intent", () => {
  const { loop, frames, cancelled, runOnlyFrame } = harness();
  loop.setContinuous(true);
  assert.equal(frames.size, 1);
  loop.setPaused(true);
  assert.deepEqual(cancelled, [1]);
  assert.equal(frames.size, 0);
  loop.setPaused(false);
  assert.equal(frames.size, 1, "resume schedules one preparation frame");
  runOnlyFrame(40);
  assert.equal(frames.size, 1, "continuous work follows successful preparation");
  loop.setContinuous(false);
  runOnlyFrame(56);
  assert.equal(frames.size, 0);
});

test("repause prevents preparation and the next resume retries once", () => {
  const { loop, frames, cancelled, runOnlyFrame } = harness();
  loop.setPaused(true);
  loop.invalidate();
  loop.setPaused(false);
  assert.equal(frames.size, 1);
  loop.setPaused(true);
  assert.equal(frames.size, 0);
  assert.deepEqual(cancelled, [1]);
  loop.setPaused(false);
  assert.equal(frames.size, 1);
  runOnlyFrame(48);
  assert.equal(frames.size, 0);
});

test("a thrown preparation retains retry work without automatic follow-up", () => {
  let attempts = 0;
  const { loop, frames, runOnlyFrame } = harness(() => {
    attempts += 1;
    if (attempts === 1) throw new Error("preparation failed");
    return false;
  });
  loop.setPaused(true);
  loop.invalidate();
  loop.setPaused(false);
  assert.doesNotThrow(() => runOnlyFrame(64));
  assert.equal(frames.size, 0, "failure does not create a continuous retry loop");
  loop.invalidate();
  assert.equal(frames.size, 1, "explicit invalidation retries retained work");
  runOnlyFrame(80);
  assert.equal(attempts, 2);
  assert.equal(frames.size, 0);
});

test("cancel is terminal and isPaused reports only reversible pause", () => {
  const { loop, frames, cancelled } = harness();
  loop.invalidate();
  loop.setPaused(true);
  assert.deepEqual(cancelled, [1]);
  loop.cancel();
  assert.equal(loop.isPaused(), false);
  loop.invalidate();
  loop.setContinuous(true);
  loop.setPaused(false);
  loop.setPaused(true);
  assert.equal(frames.size, 0);
  loop.cancel();
  assert.equal(frames.size, 0);
});
