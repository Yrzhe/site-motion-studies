# Oryzo Motion Study

Public motion and design study of https://oryzo.ai/.

This study is unaffiliated with the original site owner. It documents design
and implementation ideas for commentary and learning. Demos in this folder are
original implementations unless explicitly noted otherwise.

## What Is Interesting

Oryzo turns a cork coaster into a cinematic technical product launch. The page
works because the visual system treats an ordinary object as industrial
hardware and never breaks character.

The useful public lesson is not any single asset. It is the scene grammar:

- a fixed product stage
- an editorial left rail
- a scroll-owned sequence of scene beats
- a centered object/camera relationship
- mono labels that behave like measurement, not decoration
- deadpan copy that makes absurd claims feel premium

This public folder extracts those ideas without redistributing Oryzo's source,
fonts, 3D models, videos, images, or bundled runtime.

## Extracted Techniques

- Scene-owned scrolling: each section gets a local motion state instead of a
  generic fade/reveal.
- Product permanence: the object stays central while labels, formulas, color
  mode, and stage props change around it.
- Register contrast: display wordmark, mono spec labels, and serif editorial
  copy do different jobs.
- Technical comedy: claims such as lift, thermal handling, encryption, and
  backwards compatibility are presented with product-launch seriousness.
- Stage layering: DOM copy remains crisp while WebGL/media surfaces carry the
  cinematic product world.

## Media Preview

- `media/original-reference/oryzo-original-scroll-reference.mp4`: compressed
  original-site scroll reference used to see the page-level choreography.
- `media/original-reference/oryzo-hero-reference.jpg`: low-resolution reference
  still for the hero/thermal composition.
- `media/demo-recordings/scene-choreography.mp4`: recording of the public
  reconstruction demo.

## Demos

`demos/scene-choreography/` is the primary public reconstruction. It rebuilds
the page-level grammar with original CSS/JS:

- fixed left copy rail
- desk/pegboard product stage
- centered cup/coaster object
- scroll-owned beats for intro, lift, thermal, flip, and legacy
- HUD/formula overlays and measurement ticks

## Contents

- `teardown.md`: section and implementation decomposition.
- `design-system.md`: visual system notes.
- `typography.md`: font and type rhythm notes.
- `motion.md`: motion inventory and recreation notes.
- `interaction-map.md`: interaction states and responsive behavior.
- `asset-notes.md`: redistribution and replacement decisions.
- `media/`: compressed original reference media and original demo recording.
- `demos/`: original effect implementations.

## Public Safety

No original Oryzo bundles, fonts, source videos, images, models, splats, Rive
files, or raw crawl artifacts are included here. Original-site visuals are
compressed reference media for commentary, not reusable assets. See
`asset-notes.md`.
