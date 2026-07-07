# Typography

## Fonts

Observed font roles from the private study:

- Display/UI: Halyard Display, via Adobe Typekit on the original site.
- Serif accent: Literata.
- Mono/spec labels: DM Mono.

Redistribution decision:

- The original Typekit/Halyard files are not included here.
- Self-hosted font files from the private mirror are not copied to this public
  repo.
- Public demos use system-safe substitutes and CSS variables.

Suggested public fallback stack:

```css
:root {
  --font-display: "Figtree", "Avenir Next", "Segoe UI", sans-serif;
  --font-serif: "Literata", Georgia, serif;
  --font-mono: "DM Mono", "IBM Plex Mono", ui-monospace, monospace;
}
```

## Type Scale

- Huge product wordmark: very large uppercase sans, heavy but not black.
- Section headlines: compact sans, medium-to-semibold.
- Body/UI text: medium-weight sans, small and precise.
- Serif asides: warmer editorial lines, used sparingly.
- Spec/caption labels: uppercase mono with mild tracking.

## Usage Notes

The main trick is contrast of register:

- Sans wordmark says premium product.
- Mono labels say engineering artifact.
- Serif asides say editorial/luxury.
- Deadpan copy makes the technical presentation funny without looking cheap.

For recreations, do not substitute with generic Inter everywhere. The product
only feels designed when each text register has a job.
