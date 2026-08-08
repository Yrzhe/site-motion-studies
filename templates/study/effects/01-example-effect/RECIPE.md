# Recipe: <Effect Name>

<One sentence: what the effect is and why it reads well.> Original:
<site + where it appears>.

## Contract

| Parameter | Type / Range | Default | Notes |
|---|---|---|---|
| TODO | | | |

**Inputs:** <scroll / hover / state — and the exact math source>.

**Outputs:** <every value the effect writes, with formulas>.

**Invariants:**

- <the rules that make the effect read correctly — a port must keep these>

## Mechanism

Self-contained — inline ALL math (never reference another effect folder):

```js
// the exact core code, runnable as-is
```

<One paragraph: why this works perceptually.>

## Build steps

1. TODO — numbered, 4–8 steps, no step depending on unstated context.

## Asset adaptation

- <how to swap the object / palette / copy>
- <rules for non-default shapes, dark backgrounds, photos vs CSS shapes>

## Acceptance checks

| progress | expected value(s) |
|---|---|
| 0.0 | TODO |
| 0.5 | TODO |
| 1.0 | TODO |

Machine-readable fixture (agents validate against this; keep expectations
positional/rename-proof where assets may be renamed):

```json
{"driver":"scroll-progress","samples":[
  {"p":0.0,"expect":{"TODO":0}},
  {"p":0.5,"expect":{"TODO":0}},
  {"p":1.0,"expect":{"TODO":0}}
],"tolerance":{"px":1}}
```

Visual checklist:

- [ ] TODO — observable pass/fail statements only.

## Porting notes

- Safe to change: TODO
- Must not change: TODO

## Demo

`demo/index.html` — single file, no dependencies: gray page, one accent,
live readout, no decoration. Demonstrates exactly this effect.
