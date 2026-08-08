# Recipe: Measurement HUD Labels

Tiny mono labels that behave like **instrumentation, not decoration**: their
values are derived from the live state, only the active reading carries the
accent color, and the label grid itself never animates. This is how Oryzo
makes an ordinary object feel measured/over-engineered (lift ticks, thermal
values, circularity metrics).

## Contract

| Parameter | Type / Range | Default | Notes |
|---|---|---|---|
| ticks | int | 11 (0–100 by 10) | static grid, built once |
| value format | string | zero-padded `000` | fixed width = no layout shift |
| accent | 1 color | `#2563eb` | ONLY on the active tick/value |
| font | mono, 10–12px | ui-monospace | measurement register |

**Inputs:** the state being measured — any live number (progress, px offset,
percentage).

**Outputs, recomputed from state every frame:**

- readout text: `String(Math.round(p * 100)).padStart(3,'0')`
- active tick index: `Math.round(p * TICKS)` — exactly one `.on` at a time

**Invariants:**

- Values are **derived**, never hand-animated. If the value and the object
  ever disagree, the instrument illusion dies.
- The ruler/grid is static — ticks light up; they do not move.
- One accent. Everything inactive is gray. Accent everywhere = decoration.
- Fixed-width numerals (mono + zero-pad) so nothing jitters.

## Mechanism

Build the grid once, then per scroll frame derive both readings from the same
`p` that drives the motion (self-contained):

```js
const r = track.getBoundingClientRect();
const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));

obj.style.transform = `translateY(${-p * 120}px)`;          // the measured thing
val.textContent = String(Math.round(p * 100)).padStart(3,'0');
const active = Math.round(p * TICKS);
ticks.forEach((t, i) => t.classList.toggle('on', i === active));
```

Why it works: the eye checks whether the number matches the motion. Because
both come from the same `p`, they always match — that agreement is what
"measured" feels like.

## Build steps

1. Build a static tick column/row once (JS loop or markup).
2. Style: mono, 10–12px, gray; `.on` state = accent + bolder tick line.
3. Derive readout + active tick from the same progress driving your motion.
4. Zero-pad the readout to fixed width.
5. No transitions needed — discrete tick changes ARE the aesthetic.

## Asset adaptation

- Measure anything: elevation (lift), rotation deg (flip), temperature
  (color mode), scroll %, price, weight. Map your state to a 0–N scale.
- Units sell it: `mm`, `°`, `%`, `pt` in muted text after the value.
- Ruler orientation: vertical beside the object (elevation), horizontal
  below (progress), circular is possible but needs SVG.
- Multiple instruments are fine (Oryzo stacks them) but ONE accent color
  across all of them, and every value must derive from real state.
- Dark UI: gray→#666, accent stays saturated.

## Acceptance checks

| p | readout | active tick |
|---|---|---|
| 0.0 | 000 | 0 |
| 0.5 | 050 | 5 |
| 1.0 | 100 | 10 |

Machine-readable fixture:

```json
{"driver":"scroll-progress","samples":[
  {"p":0.0,"expect":{"readout":"000","activeTick":0}},
  {"p":0.5,"expect":{"readout":"050","activeTick":5}},
  {"p":1.0,"expect":{"readout":"100","activeTick":10}}
],"tolerance":{"tick":0}}
```

Visual checklist:

- [ ] The number always agrees with the object's actual position.
- [ ] Exactly one tick is accented at any moment.
- [ ] No layout shift while the number changes (fixed-width digits).
- [ ] The ruler itself never moves or fades.

## Porting notes

- Safe to change: scale, units, orientation, tick count, what is measured.
- Must not change: derived-from-state values, single accent, static grid.
- Combine with recipe 02 (measure the lift), 04 (measure the flip angle) or
  01 (show `beat / local` as instruments).

## Demo

`demo/index.html` — a rising circle, a static ruler whose ticks light up as
it passes them, live zero-padded readout.
