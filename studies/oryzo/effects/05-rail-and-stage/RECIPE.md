# Recipe: Editorial Rail + Product Stage

The page never rebuilds its layout. A fixed **left rail** carries the
changing claims; the **stage** keeps the object in exactly the same pixels
across every beat. That continuity is what reads as premium/industrial
instead of "landing page sections". Original: Oryzo's persistent left copy
rail + centered coaster through the whole scroll.

## Contract

| Parameter | Type / Range | Default | Notes |
|---|---|---|---|
| rail width | % of stage | 34% | 28–40% works |
| claims | list ≥ 2 | 3 | one short claim per beat |
| swap fade | ms | 250 | rail copy fade-out → swap → fade-in |
| stage change per beat | exactly ONE prop | accent color | never position/size |

**Inputs:** current beat (from scroll; math inlined below).

**Outputs:**

- rail: claim text + index swap (with fade)
- stage object: ONE property change (accent / prop / backdrop)

**Invariants:**

- The object's bounding box is **pixel-identical across all beats**.
- The rail container never moves; only its text content changes.
- One narrative surface: claims change ONLY in the rail, never floating over
  the stage.

## Mechanism

Layout: a sticky full-viewport stage split into `rail | stage`, inside a tall
track. Scroll → beat (self-contained):

```js
const r = track.getBoundingClientRect();
const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
const beat = Math.min(CLAIMS.length - 1, Math.floor(p * CLAIMS.length));
```

Rail swap on beat change (fade → replace → unfade):

```js
claim.classList.add('fade');                       // opacity 0, 250ms
setTimeout(() => {
  claim.textContent = CLAIMS[beat].t;
  obj.style.setProperty('--acc', CLAIMS[beat].acc); // the ONE stage change
  claim.classList.remove('fade');
}, 250);
```

## Build steps

1. Track (`claims × 150vh`) + sticky stage.
2. Stage = flex: rail (fixed width, border-right) + centered object area.
3. Rail holds an index (`01 / 03`) and a claim element with a `.fade` class
   transitioning opacity.
4. Compute beat on scroll; on change, fade-swap the rail and change one
   object property.
5. Nothing else. The object must not move.

## Asset adaptation

- Object: anything that survives being stared at for the whole scroll —
  product render, device photo, logo mark.
- The per-beat "one change" should suit the object: accent ring (abstract),
  prop swap next to it (physical), backdrop tint (photo).
- Claims: ≤ 8 words. The rail is an instrument panel, not a paragraph. Long
  copy goes below the claim in smaller muted text.
- RTL/mobile: rail collapses to a top bar (same swap logic), stage below.

## Acceptance checks

| p | beat | rail index |
|---|---|---|
| 0.00–0.32 | 0 | 01 / 03 |
| 0.34–0.65 | 1 | 02 / 03 |
| 0.67–1.00 | 2 | 03 / 03 |

Machine-readable fixture (claims are positional — remap indices to your
own copy):

```json
{"driver":"scroll-progress","samples":[
  {"p":0.00,"expect":{"beat":0}},
  {"p":0.50,"expect":{"beat":1}},
  {"p":1.00,"expect":{"beat":2}}
],"tolerance":{"geometry_px":1,"swap_settle_ms":550}}
```

Visual checklist:

- [ ] Screenshot beats 0 and 2: the object's position/size is identical
      within ≤1px (sticky-boundary browser rounding).
- [ ] Rail text never overlaps the stage; swap is a clean fade, no jump.
- [ ] Exactly one visible property changes on the object per beat.
- [ ] Scrolling backwards swaps claims back correctly.

## Porting notes

- Safe to change: rail side (left/right), width, claim count, fade timing,
  which single property changes.
- Must not change: object pixel-stability, single-surface narration.
- Combine with recipe 01 (beats), 03 (color modes as the one change), or 02
  (lift as one beat's action) — the rail stays the narrator in all cases.

## Demo

`demo/index.html` — rail with 3 claims, circle whose accent ring changes per
beat, live beat readout.
