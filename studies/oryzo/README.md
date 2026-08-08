# Oryzo Motion Study

Public motion and design study of https://oryzo.ai/.

This study is unaffiliated with the original site owner. It documents design
and implementation ideas for commentary and learning. All code in this folder
is original.

**If you are a coding agent:** each folder under `effects/` is a
self-contained rebuild recipe. Read that folder's `RECIPE.md`, follow its
Contract and Mechanism, swap in your own assets per Asset adaptation, and
verify with its Acceptance checks. You do not need any other file.

## What Is Interesting

Oryzo turns a cork coaster into a cinematic technical product launch. The
page works because the visual system treats an ordinary object as industrial
hardware and never breaks character. The useful lesson is not any single
asset — it is the scene grammar, decomposed below into rebuildable effects.

## Effects

| # | Effect | One line | Recipe |
|---|---|---|---|
| 01 | Scroll scene state machine | global scroll → beat index → local progress; each beat owns one action | `effects/01-scroll-scene-state/` |
| 02 | Object lift + shadow evidence | object rises, its anchored shadow shrinks/blurs/fades — physics, not UI | `effects/02-object-lift/` |
| 03 | Semantic color mode switch | one attribute swaps the whole palette; color = meaning | `effects/03-color-mode-switch/` |
| 04 | Flip beat | the object flips, the labels stay deadpan-still | `effects/04-flip-beat/` |
| 05 | Editorial rail + product stage | fixed rail narrates; the object never moves a pixel | `effects/05-rail-and-stage/` |
| 06 | Measurement HUD labels | mono labels derived from live state; one accent on the active tick | `effects/06-measurement-hud/` |

Every effect folder = `RECIPE.md` (contract, mechanism, asset adaptation,
acceptance checks, porting notes) + `demo/index.html` (minimal single-file
reference — gray page, one accent, live readout, no decoration).

## Site-Level Notes (for humans)

- `teardown.md`: section-by-section decomposition of the original page.
- `design-system.md`: visual system notes.
- `typography.md`: font and type rhythm notes.
- `motion.md`: motion inventory mapped to the effects above.
- `interaction-map.md`: interaction states and responsive behavior.
- `asset-notes.md`: redistribution and replacement decisions.
- `media/original-reference/`: compressed original-site reference media
  (commentary only).

## Public Safety

No original Oryzo bundles, fonts, source videos, images, models, splats, Rive
files, or raw crawl artifacts are included here. Original-site visuals are
compressed reference media for commentary, not reusable assets. See
`asset-notes.md`.
