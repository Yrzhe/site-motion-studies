# Recipe: Object Lift + Shadow Evidence

A scroll-driven "the product physically rises" moment. The object translates
up while its **shadow shrinks, blurs and fades** — the linked shadow is what
makes the lift read as physics instead of a CSS transition. Original: the
Oryzo "lift" feature beat (coaster raises the mug, with measurement ticks).

## Contract

| Parameter | Type / Range | Default | Notes |
|---|---|---|---|
| `liftPx` | px, 40–160 | 90 | how far the object rises |
| shadow scale | 1 → 0.45–0.65 | 1 → 0.55 | shrinks as object rises |
| shadow blur | px | 6 → 16 | softens as object rises |
| shadow opacity | 0–1 | 1 → 0.45 | fades as object rises |
| shadow size | — | width ≈ object width, height ≈ width × 0.22–0.28 | flat ellipse |

**Inputs:** one local progress `p` ∈ [0,1] (from a scroll track — math inlined
below — or from any other driver: hover, timeline, slider).

**Outputs, all driven by the SAME `p`, all linear:**

- object: `translateY(-p * liftPx)`
- shadow: `scale(1 - p * 0.45)`, `blur(6 + p * 10 px)`, `opacity(1 - p * 0.55)`

**Invariants:**

- Object and shadow are **separate elements**; the shadow does NOT follow the
  object — it stays anchored at the rest/contact position.
- One `p`, one easing (none). Two different easings desync and kill the
  physical read.
- Shadow is an ellipse (ground perspective), never a circle.

## Mechanism

Scroll → progress (self-contained):

```js
const r = track.getBoundingClientRect();               // track: tall wrapper
const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
```

Apply:

```js
obj.style.transform = `translateY(${-p * 90}px)`;
sh.style.transform  = `translateY(66px) scale(${1 - p * 0.45})`;  // 66px = rest offset under the object
sh.style.filter     = `blur(${6 + p * 10}px)`;
sh.style.opacity    = 1 - p * 0.55;
```

Why it works: rising alone looks like UI; a ground shadow that reacts
(smaller + softer + lighter = "further from the ground") is the physical
evidence the eye checks.

## Build steps

1. Sticky stage inside a tall track (`~300vh`), object centered.
2. Add a sibling ellipse under the object at its contact point.
3. Compute `p` on scroll with the snippet above.
4. Drive the four values from the same `p` (table above).
5. No transitions, no keyframes — `p` scrubs everything.

## Asset adaptation

- **Any object works** (shoe, headphone, phone, card). Shadow width = the
  object's visual footprint width; height ≈ width × 0.25.
- Irregular silhouettes (headphones): anchor the shadow under the lowest
  visual point, not the bounding-box center.
- Dark backgrounds: shadow = pure black at low opacity (0.5 → 0.2) — tinted
  shadows look like glow.
- Photos/PNGs: put the shadow behind via `z-index`, not `filter: drop-shadow`
  (drop-shadow moves with the object — breaks the anchor invariant).
- `liftPx` should stay under ~1.2 × object height or the object visually
  detaches from its shadow story.

## Acceptance checks

| p | object translateY | shadow scale | shadow blur | shadow opacity |
|---|---|---|---|---|
| 0.0 | 0px | 1.00 | 6px | 1.00 |
| 0.5 | -45px | 0.775 | 11px | 0.725 |
| 1.0 | -90px | 0.55 | 16px | 0.45 |

Machine-readable fixture:

```json
{"driver":"scroll-progress","samples":[
  {"p":0.0,"expect":{"objectY":0,"shadowScale":1.0,"shadowBlur":6,"shadowOpacity":1.0}},
  {"p":0.5,"expect":{"objectY":-45,"shadowScale":0.775,"shadowBlur":11,"shadowOpacity":0.725}},
  {"p":1.0,"expect":{"objectY":-90,"shadowScale":0.55,"shadowBlur":16,"shadowOpacity":0.45}}
],"tolerance":{"px":1,"ratio":0.01}}
```

Visual checklist:

- [ ] Shadow stays put on the ground while the object rises.
- [ ] Shadow gets smaller AND softer AND lighter — all three, in sync.
- [ ] Reversing the scroll lands the object back exactly on its shadow.
- [ ] Nothing else on the stage moves.

## Porting notes

- Safe to change: object, `liftPx`, shadow ranges, palette, trigger (can be
  hover or IntersectionObserver instead of scroll).
- Must not change: separate-element shadow, fixed anchor, single shared `p`.
- Combine with recipe 01 to make the lift one beat of a longer scene chain
  (drive it with that recipe's `local`, not `global`).

## Demo

`demo/index.html` — a circle, its shadow, one scroll track, live `p` and
offset readout.
