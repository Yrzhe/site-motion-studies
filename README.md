# Site Motion Studies

Curated website motion and design studies extracted from private Motion
Director experiments.

This repository is a public library of teardowns, patterns, and original demo
implementations. It is not a mirror of the studied websites.

## What This Repo Contains

- Design and motion teardowns written in our own words.
- Typography, layout, color, interaction, and choreography notes.
- Small cropped screenshots used for commentary, when needed.
- Original demos that recreate useful effects without copying the original
  site's source.
- Brand-neutral reusable patterns promoted from individual studies.

## What This Repo Does Not Contain

- Full mirrored website deployments.
- Original JS/CSS bundles copied from the studied sites.
- Original fonts, videos, images, logos, 3D models, or shader files unless
  their license explicitly allows redistribution.
- Full-page screenshot dumps.
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

## License

Original code and documentation in this repository are released under the MIT
License. Third-party sites, brands, screenshots, and referenced works remain
the property of their respective owners.
