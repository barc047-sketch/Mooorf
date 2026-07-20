import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import {
  advanceCameraShake,
  createCameraShakeState,
  nudgeCameraShakeForDrag,
  pulseCameraShake,
  resolveCameraShake,
} from "./cameraShake";

const base = {
  cameraShakeMode: "custom" as const,
  cameraShakeIntensity: 1.2,
  cameraShakeFrequency: 10,
  cameraShakeDamping: 10,
  cameraShakeDragInfluence: 0.6,
  cameraShakeSettleDuration: 0.32,
};

const off = resolveCameraShake({ ...base, cameraShakeMode: "off" }, {
  reducedMotion: false,
  fastPerformance: false,
});
const idle = createCameraShakeState();
pulseCameraShake(idle, off);
assert.equal(idle.active, false, "Camera shake is exactly zero when Off");
assert.equal(advanceCameraShake(idle, off, 1 / 60, { selected: true }), false, "Off does not schedule feedback frames");

const reduced = resolveCameraShake(base, { reducedMotion: true, fastPerformance: false });
assert.equal(reduced.enabled, false, "prefers-reduced-motion disables camera shake");

const settings = resolveCameraShake(base, { reducedMotion: false, fastPerformance: false });
const shake = createCameraShakeState();
pulseCameraShake(shake, settings, { x: 5, y: -3 });
nudgeCameraShakeForDrag(shake, settings, { x: 22, y: -18 });
let sawOffset = false;
for (let frame = 0; frame < 90; frame += 1) {
  sawOffset = advanceCameraShake(shake, settings, 1 / 60, { selected: true }) || sawOffset;
}
assert.equal(sawOffset, true, "selection/drag feedback produces a bounded visual response");
assert.equal(shake.active, true, "selected-state feedback remains active beyond the old fixed settle duration");
assert.ok(
  Math.abs(shake.x) <= settings.intensity * 4 && Math.abs(shake.y) <= settings.intensity * 4,
  "drag feedback remains bounded while a Cell is selected",
);
let deselectStartedSettling = false;
for (let frame = 0; frame < 90; frame += 1) {
  deselectStartedSettling = advanceCameraShake(shake, settings, 1 / 60, { selected: false }) || deselectStartedSettling;
}
assert.equal(deselectStartedSettling, true, "deselect begins a damped settle instead of an immediate jump");
assert.deepEqual(
  { x: shake.x, y: shake.y, vx: shake.vx, vy: shake.vy, active: shake.active },
  { x: 0, y: 0, vx: 0, vy: 0, active: false },
  "camera shake settles exactly back to zero without drift",
);

const fast = resolveCameraShake(base, { reducedMotion: false, fastPerformance: true });
assert.ok(fast.intensity < settings.intensity, "Fast performance mode strongly reduces feedback");

const organismView = readFileSync(new URL("./OrganismCanvasView.tsx", import.meta.url), "utf8");
assert.match(organismView, /if \(!runtimeActive\) \{[\s\S]*?resetCameraShake\(cameraShake\)/, "Table/inactive lifecycle clears temporary shake");
assert.match(organismView, /advanceCameraShake\(cameraShake, cameraShakeSettings\(\), dt, \{ selected: selectedIdSet\.size > 0 \}\)/, "runtime derives persistent feedback from canonical selection only");
assert.match(organismView, /canvas\.style\.transform = transform/, "feedback uses a visual presentation transform");
assert.doesNotMatch(organismView, /setCamera\(\{[^}]*cameraShake/, "feedback never writes a second canonical camera");

console.log("Camera shake runtime contracts passed");
