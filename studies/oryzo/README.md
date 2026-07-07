# Oryzo Motion Study

Public motion and design study of https://oryzo.ai/.

This study is unaffiliated with the original site owner. It documents design
and implementation ideas for commentary and learning. Demos in this folder are
original implementations unless explicitly noted otherwise.

## What Is Interesting

Oryzo turns a humble cork coaster into a cinematic technical product launch.
The craft is not in a single component. It is the combination of premium
deadpan copy, engineering-diagram framing, warm editorial typography, long-form
WebGL scrollytelling, and a sequence of intentionally overqualified product
features.

The private study found two useful layers:

- The original site is a static Astro deployment with a heavy WebGL runtime and
  many model/texture/video assets. That full mirror is kept private.
- The reusable public value is the system: blueprint frames, mono specification
  labels, scroll-addressed product scenes, HUD overlays, and a product narrative
  that treats every tiny feature as if it were industrial R&D.

This public folder extracts those ideas without redistributing Oryzo's source,
fonts, 3D models, videos, images, or bundled runtime.

## Extracted Techniques

- Full-page pinned scrollytelling with scene ownership per section.
- Giant product wordmark paired with tiny technical mono labels.
- Dashed engineering frames that make a small object feel measured and
  expensive.
- Warm near-black stage with cream type and restrained cyan HUD accents.
- Editorial serif asides for human warmth inside a technical presentation.
- Scroll-controlled product movement rather than generic reveal animations.
- Deadpan feature escalation: wearable, secure, backwards compatible, social,
  and contact beats for a simple coaster.

## Original Demo

`demos/blueprint-product-frame/` is a brand-neutral recreation of the Oryzo
presentation language: a circular product placeholder, dashed blueprint frame,
spec labels, side model tab, and a scroll progress HUD. It is original CSS/JS
and contains no Oryzo assets.

## Contents

- `teardown.md`: section and implementation decomposition.
- `design-system.md`: visual system notes.
- `typography.md`: font and type rhythm notes.
- `motion.md`: motion inventory and recreation notes.
- `interaction-map.md`: interaction states and responsive behavior.
- `asset-notes.md`: redistribution and replacement decisions.
- `demos/`: original effect implementations.

## Public Safety

No original Oryzo bundles, fonts, videos, images, models, splats, Rive files,
or screenshots are included here. See `asset-notes.md`.
