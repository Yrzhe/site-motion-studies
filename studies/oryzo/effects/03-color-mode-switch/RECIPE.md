# Recipe: Semantic Color Mode Switch

The scene changes meaning by swapping its **entire palette at once** — layout
and object stay put, one attribute flips, everything re-colors in sync.
Original: Oryzo's thermal beat (purple/orange heat-cam) and legacy beat
(terracotta museum).

## Contract

| Parameter | Type / Range | Default | Notes |
|---|---|---|---|
| `MODES` | list of names | `normal, thermal, legacy` | first = rest state |
| per-mode variables | CSS custom props | `--bg --obj --label --accent` | ONE set, redefined per mode |
| transition | s | 0.6 | on the color properties, not the variables |
| trigger | beat entry | scroll third | snap, never lerp between palettes |

**Inputs:** current beat/section (from scroll or any state source).

**Outputs:** one attribute write: `stage.dataset.mode = MODES[i]`.

**Invariants:**

- Every colored element reads **only CSS variables** — one raw hex anywhere
  and that element will silently not switch.
- Mode changes are discrete (on beat entry). Continuous scroll-lerping
  between palettes destroys the "we are in a different mode now" read.
- Geometry never changes — color is the ONLY channel carrying the meaning.

## Mechanism

All palettes live in attribute-scoped variable blocks:

```css
#stage                     { --bg:#f4f4f4; --obj:#111;    --label:#666;    --accent:#2563eb }
#stage[data-mode="thermal"]{ --bg:#2a1636; --obj:#ff7a1a; --label:#caa6e8; --accent:#3be8ff }
#stage[data-mode="legacy"] { --bg:#b4522e; --obj:#2c1a12; --label:#f3d3b8; --accent:#ffe08a }
#stage { background:var(--bg); transition:background .6s }
```

JS does exactly one thing — pick the mode when scroll enters a beat
(scroll → progress math, self-contained):

```js
const r = track.getBoundingClientRect();
const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
const mode = MODES[Math.min(MODES.length - 1, Math.floor(p * MODES.length))];
if (stage.dataset.mode !== mode) stage.dataset.mode = mode;
```

Because every element declares `transition` on its color property, the single
attribute swap animates the whole scene together — no per-element JS.

## Build steps

1. Put all colors of the scene into variables on the stage element.
2. Re-declare the same variables under `[data-mode="X"]` selectors.
3. Add `transition` to each element's color properties (`background`, `color`,
   `fill`...).
4. On beat entry, set `data-mode`. That's the entire runtime.

## Asset adaptation

- Works with any number of variables — inventory every color in your scene
  first, variable-ize all of them, then design each mode as a complete row.
- Images/photos can join via `filter: hue-rotate()/sepia()` driven by the
  same attribute selector.
- Keep ~3–5 variables. If a mode needs 20 variables it's a redesign, not a
  mode.
- Accent discipline: one accent per mode; it should mean something
  (instrument, warning), not decorate.

## Acceptance checks

Mode names are **positional**: if you rename modes (allowed, see Porting
notes), remap this table's rows to your names in the same order.

| p | data-mode (1st / 2nd / 3rd mode) |
|---|---|
| 0.00–0.32 | normal (your 1st mode) |
| 0.34–0.65 | thermal (your 2nd mode) |
| 0.67–1.00 | legacy (your 3rd mode) |

Machine-readable fixture (indices instead of names, rename-proof; when
sampling COLORS, wait ≥ the declared transition duration first):

```json
{"driver":"scroll-progress","samples":[
  {"p":0.00,"expect":{"modeIndex":0}},
  {"p":0.50,"expect":{"modeIndex":1}},
  {"p":1.00,"expect":{"modeIndex":2}}
],"tolerance":{"settle_ms":600,"geometry_px":1}}
```

Visual checklist:

- [ ] One scroll boundary re-colors background, object AND labels together.
- [ ] Nothing moves or resizes during the switch.
- [ ] Transition is smooth but the STATES are discrete (no half-palettes
      while parked between boundaries).
- [ ] Grep test: raw hex may appear ONLY inside the mode variable blocks
      (the CSS `[data-mode=...]` declarations); zero hex on elements/markup.
- [ ] Geometry: object/frame rects identical across modes (≤1px tolerance
      for sticky-boundary browser rounding).

## Porting notes

- Safe to change: mode count/names, palettes, transition duration, trigger
  source (tabs/toggles work as well as scroll).
- Must not change: variables-only coloring, discrete switching.
- `transition` on properties, NOT on custom properties — animating variables
  themselves needs `@property` registration and is not portable.
- Combine with recipe 01: set `data-mode` on beat entry inside the state
  machine.

## Demo

`demo/index.html` — one circle + two labels, three modes, one attribute swap,
live mode readout.
