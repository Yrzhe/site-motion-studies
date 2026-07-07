# Site Motion Studies

Curated website motion and design studies extracted from private Motion
Director experiments.

This repository is a public library of teardowns, patterns, and original demo
implementations. It is not a mirror of the studied websites.

## What This Repo Contains

- Design and motion teardowns written in our own words.
- Typography, layout, color, interaction, and choreography notes.
- Small cropped screenshots used for commentary, when needed.
- Compressed original-site reference stills or clips used to explain a
  technique.
- Original demos that recreate useful effects without copying the original
  site's source.
- Recordings of those original demos, so a reader can understand the motion
  without running local code.
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
studies/
  <site-slug>/
    README.md
    manifest.json
    teardown.md
    design-system.md
    typography.md
    motion.md
    interaction-map.md
    asset-notes.md
    references.md
    media/
      README.md
      original-reference/
      demo-recordings/
    demos/
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

Each study should be useful to someone who opens the folder cold:

- `README.md` gives the thesis, the key techniques, the media preview, and the
  available demos.
- `media/README.md` explains what public media exists, what stayed private, and
  why.
- `media/original-reference/` may contain low-resolution, commentary-oriented
  stills or compressed scroll clips from the original site.
- `media/demo-recordings/` may contain videos generated from our own demo code.
  These are safe to publish when `asset-notes.md` identifies them as original
  recordings.
- `demos/<demo-name>/README.md` must state the effect, the source files, how to
  run it, and the intended motion beats.

## License

Original code and documentation in this repository are released under the MIT
License. Third-party sites, brands, screenshots, and referenced works remain
the property of their respective owners.
