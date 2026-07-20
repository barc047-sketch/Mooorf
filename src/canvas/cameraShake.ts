import type { CameraShakeMode } from "../types";

/**
 * Ephemeral Organism camera-feedback spring. It is intentionally separate
 * from the canonical camera: callers apply the returned CSS/presentation
 * offset only, while project camera coordinates and exports remain unchanged.
 */

export interface CameraShakePreferences {
  cameraShakeMode: CameraShakeMode;
  cameraShakeIntensity: number;
  cameraShakeFrequency: number;
  cameraShakeDamping: number;
  cameraShakeDragInfluence: number;
  cameraShakeSettleDuration: number;
}

export interface ResolvedCameraShake {
  enabled: boolean;
  intensity: number;
  frequency: number;
  damping: number;
  dragInfluence: number;
  settleDuration: number;
}

export interface CameraShakeState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  elapsed: number;
  settleElapsed: number;
  active: boolean;
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const finite = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

/** Resolves the mode profile once per frame without allocating or mutating
 * authored settings. Reduced motion is a hard opt-out; Fast mode is strongly
 * reduced, never amplified. */
export const resolveCameraShake = (
  preferences: CameraShakePreferences,
  options: { reducedMotion: boolean; fastPerformance: boolean },
): ResolvedCameraShake => {
  if (preferences.cameraShakeMode === "off" || options.reducedMotion) {
    return { enabled: false, intensity: 0, frequency: 0, damping: 0, dragInfluence: 0, settleDuration: 0 };
  }
  const profile = preferences.cameraShakeMode === "soft"
    ? { intensity: 0.72, frequency: 8.5, damping: 9.5, dragInfluence: 0.32, settleDuration: 0.24 }
    : preferences.cameraShakeMode === "responsive"
      ? { intensity: 1.45, frequency: 11, damping: 10.5, dragInfluence: 0.68, settleDuration: 0.34 }
      : {
          intensity: finite(preferences.cameraShakeIntensity, 1),
          frequency: finite(preferences.cameraShakeFrequency, 10),
          damping: finite(preferences.cameraShakeDamping, 10),
          dragInfluence: finite(preferences.cameraShakeDragInfluence, 0.5),
          settleDuration: finite(preferences.cameraShakeSettleDuration, 0.3),
        };
  const performanceScale = options.fastPerformance ? 0.35 : 1;
  return {
    enabled: true,
    intensity: clamp(profile.intensity * performanceScale, 0, 5),
    frequency: clamp(profile.frequency, 2, 24),
    damping: clamp(profile.damping, 3, 30),
    dragInfluence: clamp(profile.dragInfluence * performanceScale, 0, 1.5),
    settleDuration: clamp(profile.settleDuration, 0.08, 1.2),
  };
};

export const createCameraShakeState = (): CameraShakeState => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  elapsed: 0,
  settleElapsed: 0,
  active: false,
});

export const resetCameraShake = (state: CameraShakeState): void => {
  state.x = 0;
  state.y = 0;
  state.vx = 0;
  state.vy = 0;
  state.elapsed = 0;
  state.settleElapsed = 0;
  state.active = false;
};

/** A selection pulse is deliberately tiny. Direction comes from the pointer
 * relative to the Cell, so it remains deterministic and avoids random drift. */
export const pulseCameraShake = (
  state: CameraShakeState,
  settings: ResolvedCameraShake,
  direction: { x: number; y: number } = { x: 1, y: 0 },
): void => {
  if (!settings.enabled) {
    resetCameraShake(state);
    return;
  }
  const length = Math.hypot(direction.x, direction.y) || 1;
  const impulse = settings.intensity * 22;
  state.vx += (direction.x / length) * impulse;
  state.vy += (direction.y / length) * impulse;
  state.settleElapsed = 0;
  state.active = true;
};

/** Drag feedback is bounded directional velocity, never a camera pan. */
export const nudgeCameraShakeForDrag = (
  state: CameraShakeState,
  settings: ResolvedCameraShake,
  delta: { x: number; y: number },
): void => {
  if (!settings.enabled || !state.active) return;
  const scale = settings.dragInfluence * settings.intensity * 0.55;
  state.vx = clamp(state.vx + clamp(delta.x, -18, 18) * scale, -90, 90);
  state.vy = clamp(state.vy + clamp(delta.y, -18, 18) * scale, -90, 90);
};

/** Advances a deterministic selected-state oscillator over a bounded spring.
 * Selection holds the subtle signal indefinitely; deselection alone starts
 * the authored short return-to-zero window. */
export const advanceCameraShake = (
  state: CameraShakeState,
  settings: ResolvedCameraShake,
  dt: number,
  context: { selected: boolean },
): boolean => {
  if (!settings.enabled) {
    resetCameraShake(state);
    return false;
  }
  const step = clamp(finite(dt, 0), 0, 0.05);
  if (context.selected) {
    state.active = true;
    state.elapsed += step;
    state.settleElapsed = 0;
  } else if (!state.active) {
    resetCameraShake(state);
    return false;
  } else {
    state.settleElapsed += step;
  }
  const holdAmplitude = context.selected ? settings.intensity * 0.28 : 0;
  const phase = state.elapsed * settings.frequency;
  const targetX = Math.sin(phase) * holdAmplitude;
  const targetY = Math.cos(phase * 0.73) * holdAmplitude * 0.72;
  const spring = settings.frequency * settings.frequency * 0.42;
  const drag = Math.exp(-settings.damping * step);
  state.vx = (state.vx + (targetX - state.x) * spring * step) * drag;
  state.vy = (state.vy + (targetY - state.y) * spring * step) * drag;
  state.x = clamp(state.x + state.vx * step, -settings.intensity * 4, settings.intensity * 4);
  state.y = clamp(state.y + state.vy * step, -settings.intensity * 4, settings.intensity * 4);
  if (
    !context.selected && (
      state.settleElapsed >= settings.settleDuration
    || (Math.abs(state.x) < 0.012 && Math.abs(state.y) < 0.012 && Math.abs(state.vx) < 0.08 && Math.abs(state.vy) < 0.08)
    )
  ) {
    resetCameraShake(state);
    return false;
  }
  return true;
};
