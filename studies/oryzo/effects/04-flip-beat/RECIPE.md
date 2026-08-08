# Recipe: Flip Beat (Object Flips, Labels Stay Still)

A scroll-owned physical flip: the object rotates to show its underside while
every label around it stays perfectly still and serious. The deadpan
stillness is what sells the gesture. Original: Oryzo's "encryption" beat —
flipping the coaster is presented as a security feature with unchanged
premium UI.

## Contract

| Parameter | Type / Range | Default | Notes |
|---|---|---|---|
| `flipDeg` | deg | 180 | 0 → 180 across the beat |
| axis | X or Y | X | X = "show me the bottom" |
| `perspective` | px, 600–1400 | 900 | on the STAGE (parent), not the object |
| faces | 2 | TOP / BOTTOM | back face pre-rotated 180° |

**Inputs:** one local progress `p` ∈ [0,1].

**Outputs:** `container.style.transform = rotateX(p * 180deg)` — one line.

**Invariants:**

- Labels are **siblings** of the rotating container, never children.
- Both faces have `backface-visibility: hidden`; the back face is
  pre-rotated `rotateX(180deg)` inside a `transform-style: preserve-3d`
  container.
- Mapping `p → deg` is linear. Easing here makes it feel animated instead of
  scrubbed.
- Rotate the wrapper, never the faces.

## Mechanism

Structure:

```html
<div id="stage">            <!-- perspective: 900px -->
  <div id="disc">           <!-- transform-style: preserve-3d; rotateX(p*180deg) -->
    <div class="face front">TOP</div>     <!-- backface-visibility: hidden -->
    <div class="face back">BOTTOM</div>   <!-- same + pre-rotated rotateX(180deg) -->
  </div>
  <div id="label">…</div>   <!-- sibling: never rotates -->
</div>
```

Scroll → progress (self-contained):

```js
const r = track.getBoundingClientRect();
const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
disc.style.transform = `rotateX(${p * 180}deg)`;
```

## Build steps

1. Sticky stage in a tall track (~300vh), `perspective` on the stage.
2. Rotating container with `transform-style: preserve-3d`.
3. Two absolutely-stacked faces, both `backface-visibility: hidden`, back
   face pre-rotated 180°.
4. Labels as stage siblings.
5. One rotateX from `p`. Done.

## Asset adaptation

- Faces can be any same-sized content: images (product top/bottom), cards
  (front/back), panels. Keep both faces identical in size.
- Y-axis flip (`rotateY`) for card-turn semantics; X-axis for "show the
  underside".
- Thick objects: fake thickness with a mid-flip `box-shadow` or a thin edge
  element — real 3D depth needs WebGL, not this recipe.
- Photos: at `p≈0.5` the object is edge-on and vanishes for a frame — plan
  the surrounding copy so that moment reads as intentional.

## Acceptance checks

| p | rotateX | what you see |
|---|---|---|
| 0.0 | 0° | front face only |
| 0.5 | 90° | edge-on (neither face) |
| 1.0 | 180° | back face only, not mirrored |

Machine-readable fixture:

```json
{"driver":"scroll-progress","samples":[
  {"p":0.0,"expect":{"rotateXDeg":0}},
  {"p":0.5,"expect":{"rotateXDeg":90}},
  {"p":1.0,"expect":{"rotateXDeg":180}}
],"tolerance":{"deg":1}}
```

Visual checklist:

- [ ] Back face content reads correctly (not mirror-flipped) at p=1.
- [ ] Labels never move a pixel during the flip.
- [ ] Reversing scroll un-flips smoothly through the same edge-on moment.
- [ ] No double-image ghosting mid-flip (both backfaces hidden).

## Porting notes

- Safe to change: face content, axis, size, flip range (e.g. 0→360 for a
  full spin), trigger source.
- Must not change: perspective-on-parent, sibling labels, wrapper-rotation,
  linear scrub mapping.
- Combine with recipe 01: drive with a beat's `local` so the flip owns one
  scene of a longer sequence.

## Demo

`demo/index.html` — a disc with TOP/BOTTOM faces, one static label, live
angle readout.
