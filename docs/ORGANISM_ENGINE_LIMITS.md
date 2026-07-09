# Organism Engine Limits

Status: V6L production note.

## Current Cap

The production WebGL organism renderer currently renders up to `MAX_NUCLEI = 96`.

This is a renderer input cap, not a product data cap:

- the Zustand store can hold more spaces;
- table data is not capped;
- saved views can preserve more spaces;
- layout/random presets keep operating on all spaces;
- WebGL labels/rendering only consume the first 96 spaces for the current shader path.

## Why A Cap Exists

The current shader receives nuclei through a uniform array:

```glsl
uniform vec4 uNuclei[MAX_NUCLEI];
```

Each nucleus is packed as:

```text
x, y, radius, signedStrength
```

Uniform arrays are simple and stable for this phase, but fragment shader uniform limits vary by GPU/browser. Raising the cap indefinitely would make shader compile/link failures more likely on lower-end devices.

## V6L Behavior

- Normal spaces use positive signed strength.
- Void nuclei use negative signed strength.
- The shader clamps signed contribution and final field values to avoid subtractive blow-ups.
- Multi-color organism behavior is limited to body A, body B, accent, ground, and blend uniforms.

## Future Route

For 100+ visible nuclei, replace the uniform array with a texture/data-buffer input path:

- pack nuclei into a float texture or storage-style data buffer;
- include per-nucleus kind/color/category metadata;
- keep the store and table unlimited;
- add density-aware label strategies separately.

Until that phase, the 96 rendered nuclei cap is the safe production limit.
