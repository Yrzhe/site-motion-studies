# Recipe: Scroll Scene State Machine

Scroll does not fade elements in — it selects a **scene** and drives exactly
one action inside it. This is the core mechanism behind the whole Oryzo page
(https://oryzo.ai/): the same object stays on stage while each scroll span
reinterprets it.

## Contract

| Parameter | Type / Range | Default | Notes |
|---|---|---|---|
| `BEATS` | int ≥ 2 | 4 | number of scenes |
| track height | css length | `BEATS * 150vh` | one tall wrapper element |
| stage | css | `position: sticky; top: 0; height: 100vh` | pinned viewport inside the track |
| per-beat action | transform | slide / lift / rotate / scale | ONE property change per beat |

**Inputs:** window scroll position only.

**Outputs (recompute every scroll event):**

- `global` ∈ [0,1] — how far the track has scrolled
- `beat` ∈ {0..BEATS-1} — which scene owns the scroll
- `local` ∈ [0,1] — progress inside the current beat; drives the motion

**Invariants:**

- `local` restarts at 0 exactly when `beat` increments.
- Completed beats hold their END state (actions accumulate, they don't reset).
- The stage element itself never moves; only the object inside it.
- Scrolling backwards must replay everything in reverse (no one-shot flags).

## Mechanism

Self-contained — this is all the math there is:

```js
const r = track.getBoundingClientRect();
const global = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
const beat   = Math.min(BEATS - 1, Math.floor(global * BEATS));
const local  = Math.min(1, global * BEATS - beat);
```

The split is the lesson: `global` owns page travel, `local` owns the current
physical action. Driving an element from both at once is why scrollytelling
demos feel mushy.

To make completed beats hold their end state, build the transform as a chain
where earlier beats are written at their final value and only the current
beat uses `local` (see the transform list in `demo/index.html`).

## Build steps

1. One wrapper (`#track`) with `height: BEATS * 150vh`.
2. Inside it one stage, `position: sticky; top: 0; height: 100vh`.
3. Put your object in the stage center.
4. On scroll, compute `global / beat / local` with the snippet above.
5. Write a transform chain: beats before `beat` at end value, current beat
   interpolated by `local`.
6. Nothing else animates. No CSS keyframes, no easing on the scrub.

## Asset adaptation

- The object can be anything (logo, product photo, card). Only the transform
  chain touches it — swap the element, keep the math.
- Choose per-beat actions that read on YOUR object: flat artwork flips badly;
  photos scale well; wordmarks slide well.
- More beats = shorter scroll per beat. Keep each beat ≥ 120vh of track or
  actions feel rushed.

## Acceptance checks

| global | expected beat | expected local |
|---|---|---|
| 0.00 | 0 | 0.00 |
| 0.49 | 1 | 0.96 |
| 0.50 | 2 | 0.00 |
| 0.99 | 3 | 0.96 |

Machine-readable fixture (sample `global`, assert outputs; allow ±0.02 on
`local` for scroll rounding):

```json
{"driver":"scroll-progress","samples":[
  {"global":0.00,"expect":{"beat":0,"local":0.00}},
  {"global":0.50,"expect":{"beat":2,"local":0.00}},
  {"global":0.99,"expect":{"beat":3,"local":0.96}}
],"tolerance":{"local":0.02}}
```

Visual checklist:

- [ ] Scrolling down plays beat actions strictly one at a time.
- [ ] Scrolling back up reverses them exactly.
- [ ] The page never "jumps" — the stage stays pinned for the whole track.
- [ ] A readout of `global / beat / local` (temporary HUD) matches the table.

## Porting notes

- Safe to change: beat count, per-beat actions, track height, object, colors.
- Must not change: the `sticky` stage (a `fixed` stage breaks track exit),
  the floor/clamp math, local-only motion driving.
- In a real page the track sits between normal sections; the pin releases
  naturally at both ends because the stage is sticky, not fixed.
- Performance: transforms only (no layout properties); one scroll listener,
  `{passive: true}`.

## Demo

`demo/index.html` — single file, no dependencies. A black square, four beats
(slide / lift / rotate / scale), live `global / beat / local` readout.
Open it and scroll.
