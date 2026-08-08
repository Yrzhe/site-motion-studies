# Site Motion Studies

**[yrzhe.github.io/site-motion-studies](https://yrzhe.github.io/site-motion-studies/)**
— browse the index and watch the demos run, no clone required.

Curated website motion and design studies extracted from private Motion
Director experiments.

This repository is a library of **rebuildable motion effects**. Every studied
site is decomposed into individual effects; each effect ships a self-contained
`RECIPE.md` (contract, mechanism, asset adaptation, acceptance checks) plus a
minimal single-file demo.

**Primary consumers are coding agents**: point your agent at this repo (start
with `AGENTS.md` / `llms.txt`) and it can rebuild any effect on your own site
with your own assets. It is not a mirror of the studied websites.

## What This Repo Contains

- Per-effect rebuild recipes (`RECIPE.md`) with contracts, mechanisms,
  asset-swap guidance, and acceptance checks.
- Minimal single-file demos, one effect each — gray page, one accent, live
  readout, no decoration.
- Design and motion teardowns written in our own words.
- Typography, layout, color, interaction, and choreography notes.
- Small cropped screenshots used for commentary, when needed.
- Compressed original-site reference stills or clips used to explain a
  technique.
- Brand-neutral reusable patterns promoted from individual studies.

## What This Repo Does Not Contain

- Full mirrored website deployments.
- Original JS/CSS bundles copied from the studied sites.
- Original fonts, videos, images, logos, 3D models, or shader files unless
  their license explicitly allows redistribution.
- Full-page screenshot dumps.
- Source-quality captures, raw crawl archives, or asset packs from the original
  website.
- Any claim of affiliation with the original site owners.

## Structure

```text
AGENTS.md            # how agents consume this repo
llms.txt             # index of studies and effects
studies/
  <site-slug>/
    README.md        # thesis + effects index
    manifest.json    # status + effects[] list
    effects/
      <nn-effect>/
        RECIPE.md    # contract / mechanism / asset adaptation / acceptance
        demo/
          index.html # minimal single-file reference
    teardown.md      # site-level notes (for humans)
    design-system.md
    typography.md
    motion.md
    interaction-map.md
    asset-notes.md
    references.md
    media/
      README.md
      original-reference/
    screenshots/
    snippets/
patterns/
  <pattern-slug>/
templates/
  study/
tools/
  check-study.mjs
```

## Study Status

Each study has a `manifest.json` with one of these statuses:

- `draft`: work in progress.
- `review`: ready for public-safety and quality review.
- `public`: reviewed and safe to share.
- `withdrawn`: kept for history but not recommended for public use.

## Safety Model

The private `motion-director` repository may contain complete research
archives. This public repository only promotes extracted ideas and original
implementations.

Before publishing a study, run:

```bash
node tools/check-study.mjs
```

## Study Standard

One site = many effects. A study is useful when a cold agent (or human) can
open any single effect folder and rebuild it:

- `README.md` gives the thesis and the effects index table.
- Each `effects/<nn-effect>/RECIPE.md` is **self-contained** (inline the
  scroll math; never "see effect 01") and has these sections: Contract /
  Mechanism / Build steps / Asset adaptation / Acceptance checks / Porting
  notes / Demo.
- Each `effects/<nn-effect>/demo/index.html` is a single file with no
  dependencies: gray page, one accent color, live readout, no decoration.
  It demonstrates exactly one effect.
- `media/original-reference/` may contain low-resolution, commentary-oriented
  stills or compressed scroll clips from the original site.
- `media/README.md` explains what public media exists, what stayed private,
  and why.

## License

Original code and documentation in this repository are released under the MIT
License. Third-party sites, brands, screenshots, and referenced works remain
the property of their respective owners.
